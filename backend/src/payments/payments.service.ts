import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_APPLICATION_FEE_CENTS = 2000;

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(
      this.config.getOrThrow<string>('STRIPE_SECRET_KEY'),
    );
  }

  async createCheckoutSession(userId: string, applicationId: string) {
    const application = await this.getOwned(userId, applicationId);
    if (application.paymentStatus === 'PAID') {
      throw new BadRequestException(
        'Les frais de dossier ont déjà été réglés.',
      );
    }

    const amountCents = Number(
      this.config.get<string>('STRIPE_APPLICATION_FEE_CENTS') ??
        DEFAULT_APPLICATION_FEE_CENTS,
    );
    const appUrl = (
      this.config.get<string>('APP_URL') ?? 'http://localhost:5173'
    ).replace(/\/+$/, '');
    const returnUrl = `${appUrl}/apply/${application.service.toLowerCase()}?id=${applicationId}&country=${application.country}`;

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: amountCents,
            product_data: { name: 'Frais de dossier — AFAAQ CONNECT' },
          },
        },
      ],
      client_reference_id: applicationId,
      metadata: { applicationId, userId },
      success_url: `${returnUrl}&payment=success`,
      cancel_url: `${returnUrl}&payment=cancel`,
    });

    if (!session.url) {
      throw new BadRequestException(
        'Impossible de créer la session de paiement.',
      );
    }

    await this.prisma.application.update({
      where: { id: applicationId },
      data: { stripeSessionId: session.id },
    });

    return { url: session.url };
  }

  constructEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.config.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  }

  async handleEvent(event: Stripe.Event) {
    if (event.type !== 'checkout.session.completed') return;

    const session = event.data.object;
    const applicationId =
      session.client_reference_id ?? session.metadata?.applicationId;
    if (!applicationId) {
      this.logger.warn(
        `checkout.session.completed without applicationId (session ${session.id})`,
      );
      return;
    }

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;

    // Only mark the application matching the exact session we issued as paid — guards
    // against a replayed or unrelated webhook event flipping the wrong application.
    const result = await this.prisma.application.updateMany({
      where: { id: applicationId, stripeSessionId: session.id },
      data: {
        paymentStatus: 'PAID',
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntentId,
      },
    });

    if (result.count === 0) {
      this.logger.warn(
        `checkout.session.completed for session ${session.id} did not match application ${applicationId}`,
      );
    }
  }

  private async getOwned(userId: string, id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });
    if (!application) {
      throw new NotFoundException('Demande introuvable.');
    }
    if (application.userId !== userId) {
      throw new ForbiddenException();
    }
    return application;
  }
}
