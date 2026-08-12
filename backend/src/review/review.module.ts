import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { TranslationModule } from '../translation/translation.module';
import { AdminController } from './admin.controller';
import { ClientReviewController } from './client-review.controller';
import { DocumentExtractionService } from './document-extraction.service';
import { ReviewService } from './review.service';

@Module({
  imports: [TranslationModule, NotificationsModule],
  controllers: [AdminController, ClientReviewController],
  providers: [ReviewService, DocumentExtractionService],
})
export class ReviewModule {}
