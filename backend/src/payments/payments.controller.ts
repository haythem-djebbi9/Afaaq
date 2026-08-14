import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';

interface AuthedRequest {
  user: { userId: string };
}

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('applications/:id/checkout-session')
  createCheckoutSession(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.paymentsService.createCheckoutSession(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('applications/:id/sync-payment')
  syncPaymentStatus(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.paymentsService.syncPaymentStatus(req.user.userId, id);
  }

  // Public endpoint called by Stripe — authenticated via webhook signature, not a JWT.
  @Post('payments/webhook')
  @HttpCode(200)
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    if (!req.rawBody || !signature) {
      throw new BadRequestException('Invalid webhook payload.');
    }
    const event = this.paymentsService.constructEvent(req.rawBody, signature);
    await this.paymentsService.handleEvent(event);
    return { received: true };
  }
}
