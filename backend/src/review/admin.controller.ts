import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminListQueryDto } from './dto/admin-list-query.dto';
import { SectionReviewDto } from './dto/section-review.dto';
import { ReviewService } from './review.service';

interface AuthedRequest {
  user: { userId: string };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('applications')
  list(@Query() query: AdminListQueryDto) {
    return this.reviewService.listForAdmin(query);
  }

  @Get('applications/:id')
  detail(@Param('id') id: string) {
    return this.reviewService.getDetailForAdmin(id);
  }

  @Post('applications/:id/sections/:section/review')
  review(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Param('section') section: string,
    @Body() dto: SectionReviewDto,
  ) {
    return this.reviewService.reviewSection(req.user.userId, id, section, dto);
  }

  @Post('applications/:id/finalize')
  finalize(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.reviewService.finalizeDossier(req.user.userId, id);
  }

  @Get('applications/:id/documents/:documentId/extract')
  extract(@Param('id') id: string, @Param('documentId') documentId: string) {
    return this.reviewService.extractDocument(id, documentId);
  }

  @Get('applications/:id/documents/:documentId/file')
  async getFile(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @Res() res: Response,
  ) {
    const file = await this.reviewService.getFile(id, documentId);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(file.originalName)}"`,
    );
    res.sendFile(file.path);
  }
}
