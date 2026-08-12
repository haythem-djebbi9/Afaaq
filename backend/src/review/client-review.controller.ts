import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewService } from './review.service';

interface AuthedRequest {
  user: { userId: string };
}

@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ClientReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get(':id/review')
  getReview(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.reviewService.getClientReview(req.user.userId, id);
  }

  @Post(':id/sections/:section/resubmit')
  resubmit(@Req() req: AuthedRequest, @Param('id') id: string, @Param('section') section: string) {
    return this.reviewService.resubmitSection(req.user.userId, id, section);
  }
}
