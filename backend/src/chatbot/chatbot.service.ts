import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { requirementsFor } from '../applications/document-requirements';
import { computeCompletion } from '../review/completion';
import { deriveDossierStatus } from '../review/review-status';
import { PrismaService } from '../prisma/prisma.service';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const HISTORY_LIMIT = 20;
const FALLBACK_REPLY =
  "Désolé, une erreur technique m'empêche de répondre pour le moment. Merci de réessayer, ou de contacter le support Afaaq si le problème persiste.";

const STATUS_LABELS: Record<string, string> = {
  pending: 'en attente de revue',
  approved: 'validé',
  needs_correction: 'corrections requises',
};

const SYSTEM_PROMPT_BASE = `Tu es l'assistant virtuel officiel du portail AFAAQ CONNECT.

À PROPOS D'AFAAQ CONNECT :
AFAAQ CONNECT accompagne des candidats tunisiens dans leurs démarches vers 4 pays : Allemagne, Autriche, Italie et France, sur 4 services : demande de visa, formation, emploi et reconnaissance de diplômes.

PROCESSUS TYPE D'UNE CANDIDATURE :
1. Création du dossier (choix du service et du pays)
2. Remplissage des informations : état civil, passeport, langues parlées, éducation, formations, expérience professionnelle, objectif
3. Téléversement des documents requis (copie de passeport, photo, diplômes, certificats de langue, CV, preuve de fonds, etc. — la liste exacte dépend du service et du pays choisis)
4. Soumission du dossier
5. Revue par l'équipe AFAAQ, section par section (le candidat peut être invité à corriger une section)
6. Validation finale du dossier une fois toutes les sections approuvées

TON : professionnel, chaleureux et rassurant. Réponds TOUJOURS dans la langue utilisée par le candidat dans son dernier message (français, arabe ou allemand ; utilise l'anglais uniquement si le candidat écrit en anglais).

RÈGLES STRICTES :
- Ne donne JAMAIS de conseil juridique ou légal formel sur l'immigration (droit d'asile, litiges, recours, éligibilité légale précise à un titre de séjour). Pour ces sujets, invite poliment le candidat à contacter le support humain Afaaq.
- Si une question sort du cadre du portail (litige, question juridique précise, sujet sans rapport avec la candidature), redirige poliment vers le support humain Afaaq plutôt que d'improviser une réponse.
- Utilise UNIQUEMENT les informations de dossier fournies ci-dessous pour répondre aux questions du type « où en est mon dossier ? ». N'invente jamais de statut, de document ou de délai.
- Reste concis et actionnable.`;

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async getHistory(userId: string) {
    const items = await this.prisma.chatbotMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: HISTORY_LIMIT,
    });
    return { items };
  }

  async streamReply(userId: string, message: string, res: Response): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    await this.prisma.chatbotMessage.create({
      data: { userId, role: 'USER', content: message },
    });

    const history = await this.prisma.chatbotMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_LIMIT,
    });

    const systemPrompt = await this.buildSystemPrompt(userId, user.fullName);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.reverse().map((m) => ({
        role: m.role === 'USER' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    let fullReply = '';
    try {
      fullReply = await this.streamGroqCompletion(messages, res);
    } catch (err) {
      this.logger.warn(`Chatbot completion failed: ${(err as Error).message}`);
      if (!res.headersSent) res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.write(FALLBACK_REPLY);
      fullReply = FALLBACK_REPLY;
    } finally {
      res.end();
    }

    if (fullReply) {
      await this.prisma.chatbotMessage.create({
        data: { userId, role: 'ASSISTANT', content: fullReply },
      });
    }
  }

  private async buildSystemPrompt(userId: string, fullName: string): Promise<string> {
    const application = await this.prisma.application.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { documents: true, sectionReviews: true, dossierReview: true },
    });

    if (!application) {
      return `${SYSTEM_PROMPT_BASE}\n\nDOSSIER DU CANDIDAT (${fullName}) :\nCe candidat n'a encore créé aucun dossier de candidature.`;
    }

    const requirements = requirementsFor(application.service, application.country);
    const uploadedTypes = new Set(
      application.documents.filter((d) => d.status === 'UPLOADED').map((d) => d.type),
    );
    const missing = requirements.filter((r) => r.required && !uploadedTypes.has(r.type));
    const completion = computeCompletion(application, requirements, uploadedTypes);
    const reviewStatus = deriveDossierStatus(application.sectionReviews, application.dossierReview);
    const sectionsNeedingCorrection = application.sectionReviews
      .filter((s) => s.status === 'NEEDS_CORRECTION')
      .map((s) => s.section);

    const lines = [
      `Service demandé : ${application.service}`,
      `Pays visé : ${application.country}`,
      `Statut du dossier : ${application.status === 'SUBMITTED' ? 'soumis' : 'brouillon (non soumis)'}`,
      `Progression estimée du remplissage : ${completion}%`,
      `Statut de la revue Afaaq : ${STATUS_LABELS[reviewStatus] ?? reviewStatus}`,
      missing.length > 0
        ? `Documents obligatoires manquants : ${missing.map((m) => m.type).join(', ')}`
        : 'Tous les documents obligatoires ont été téléversés.',
      sectionsNeedingCorrection.length > 0
        ? `Sections nécessitant une correction : ${sectionsNeedingCorrection.join(', ')}`
        : null,
    ].filter(Boolean);

    return `${SYSTEM_PROMPT_BASE}\n\nDOSSIER ACTUEL DU CANDIDAT (${fullName}) :\n${lines.join('\n')}`;
  }

  private async streamGroqCompletion(
    messages: { role: string; content: string }[],
    res: Response,
  ): Promise<string> {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }
    const model = this.config.get<string>('GROQ_MODEL') ?? 'llama-3.3-70b-versatile';

    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, temperature: 0.4, stream: true, messages }),
    });

    if (!groqRes.ok || !groqRes.body) {
      throw new Error(`Groq API responded with status ${groqRes.status}`);
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');

    let fullReply = '';
    let buffer = '';
    const decoder = new TextDecoder();

    for await (const chunk of groqRes.body as unknown as AsyncIterable<Uint8Array>) {
      buffer += decoder.decode(chunk, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() ?? '';

      for (const event of events) {
        const line = event.trim();
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') continue;

        try {
          const parsed = JSON.parse(payload) as {
            choices?: { delta?: { content?: string } }[];
          };
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullReply += delta;
            res.write(delta);
          }
        } catch {
          // ignore malformed SSE fragments
        }
      }
    }

    return fullReply;
  }
}
