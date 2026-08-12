import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

export type TargetLang = 'de' | 'fr' | 'ar' | 'en';

const LANGUAGE_NAMES: Record<TargetLang, string> = {
  de: 'German',
  fr: 'French',
  ar: 'Arabic',
  en: 'English',
};

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

function hashFor(text: string, targetLang: string): string {
  return createHash('sha256').update(`${targetLang}::${text}`).digest('hex');
}

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /** Translate a single piece of text, using the cache. Throws on hard API failure. */
  async translate(text: string, targetLang: TargetLang): Promise<string> {
    const trimmed = text?.trim();
    if (!trimmed) return '';

    const hash = hashFor(trimmed, targetLang);
    const cached = await this.prisma.translationCache.findUnique({
      where: { hash },
    });
    if (cached) return cached.translatedText;

    const [translated] = await this.callGroqBatch([trimmed], targetLang);
    await this.storeCache(hash, targetLang, trimmed, translated);
    return translated;
  }

  /** Same as translate(), but never throws — falls back to the original text on failure. */
  async translateSafe(text: string, targetLang: TargetLang): Promise<string> {
    try {
      return await this.translate(text, targetLang);
    } catch (err) {
      this.logger.warn(`Translation failed, falling back to source text: ${(err as Error).message}`);
      return text;
    }
  }

  /**
   * Translate many texts at once. Cache hits are resolved individually; cache misses
   * are batched into a single Groq call to keep admin pages fast. Order-preserving.
   */
  async translateMany(texts: string[], targetLang: TargetLang): Promise<string[]> {
    const entries = texts.map((text) => ({
      text: text?.trim() ?? '',
      hash: hashFor(text?.trim() ?? '', targetLang),
    }));

    const nonEmptyHashes = [...new Set(entries.filter((e) => e.text).map((e) => e.hash))];
    const cached = nonEmptyHashes.length
      ? await this.prisma.translationCache.findMany({
          where: { hash: { in: nonEmptyHashes } },
        })
      : [];
    const cacheMap = new Map(cached.map((c) => [c.hash, c.translatedText]));

    const missing = entries.filter((e) => e.text && !cacheMap.has(e.hash));
    const uniqueMissingTexts = [...new Set(missing.map((e) => e.text))];

    if (uniqueMissingTexts.length > 0) {
      try {
        const translations = await this.callGroqBatch(uniqueMissingTexts, targetLang);
        await Promise.all(
          uniqueMissingTexts.map((text, i) =>
            this.storeCache(hashFor(text, targetLang), targetLang, text, translations[i] ?? text)
          )
        );
        uniqueMissingTexts.forEach((text, i) => {
          cacheMap.set(hashFor(text, targetLang), translations[i] ?? text);
        });
      } catch (err) {
        this.logger.warn(`Batch translation failed, falling back to source text: ${(err as Error).message}`);
      }
    }

    return entries.map((e) => (e.text ? cacheMap.get(e.hash) ?? e.text : ''));
  }

  private async storeCache(
    hash: string,
    targetLang: string,
    sourceText: string,
    translatedText: string
  ) {
    try {
      await this.prisma.translationCache.upsert({
        where: { hash },
        create: { hash, targetLang, sourceText, translatedText },
        update: { translatedText },
      });
    } catch (err) {
      this.logger.warn(`Failed to persist translation cache entry: ${(err as Error).message}`);
    }
  }

  private async callGroqBatch(texts: string[], targetLang: TargetLang): Promise<string[]> {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }
    const model = this.config.get<string>('GROQ_MODEL') ?? 'llama-3.3-70b-versatile';
    const languageName = LANGUAGE_NAMES[targetLang];

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: `You are a precise translation engine. You will receive a JSON array of strings. Translate each string into ${languageName}. Respond with ONLY a valid JSON array of strings, same length and order, no commentary, no markdown code fences.`,
          },
          { role: 'user', content: JSON.stringify(texts) },
        ],
      }),
    });

    if (!res.ok) {
      // Never include headers/body of the request (would leak the key) in the log.
      throw new Error(`Groq API responded with status ${res.status}`);
    }

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = body.choices?.[0]?.message?.content ?? '[]';
    const cleaned = content.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length === texts.length) {
        return parsed.map((v) => String(v));
      }
      throw new Error('Unexpected translation response shape');
    } catch {
      throw new Error('Failed to parse Groq translation response');
    }
  }
}
