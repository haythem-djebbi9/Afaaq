import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { join } from 'node:path';
import { requirementsFor } from '../applications/document-requirements';
import { buildFormConfig } from '../form-config/form-config.data';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { TranslationService } from '../translation/translation.service';
import { computeCompletion } from './completion';
import { DocumentExtractionService } from './document-extraction.service';
import { AdminListQueryDto } from './dto/admin-list-query.dto';
import { SectionReviewDto } from './dto/section-review.dto';
import { deriveDossierStatus } from './review-status';
import { isReviewSection, REVIEW_SECTIONS } from './sections';
import { collectTranslatableEntries } from './translatable-fields';

@Injectable()
export class ReviewService {
  private readonly uploadsRoot = join(process.cwd(), 'uploads');

  constructor(
    private readonly prisma: PrismaService,
    private readonly translation: TranslationService,
    private readonly extraction: DocumentExtractionService,
    private readonly notifications: NotificationsService,
  ) {}

  async listForAdmin(query: AdminListQueryDto) {
    const applications = await this.prisma.application.findMany({
      where: {
        // Draft dossiers are invisible to admins — submission itself is gated on
        // payment (applications.service.ts submit()), so this also keeps unpaid
        // dossiers out of the admin queue.
        status: 'SUBMITTED',
        ...(query.country ? { country: query.country } : {}),
        ...(query.service ? { service: query.service } : {}),
        ...(query.search
          ? { user: { fullName: { contains: query.search, mode: 'insensitive' } } }
          : {}),
        ...(query.dateFrom || query.dateTo
          ? {
              createdAt: {
                ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
                ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
              },
            }
          : {}),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        documents: true,
        sectionReviews: true,
        dossierReview: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows = applications.map((app) => {
      const requirements = requirementsFor(app.service, app.country);
      const uploadedTypes = new Set(
        app.documents.filter((d) => d.status === 'UPLOADED').map((d) => d.type),
      );
      return {
        id: app.id,
        fullName: app.user.fullName,
        email: app.user.email,
        service: app.service,
        country: app.country,
        status: app.status,
        reviewStatus: deriveDossierStatus(app.sectionReviews, app.dossierReview),
        completion: computeCompletion(app, requirements, uploadedTypes),
        createdAt: app.createdAt,
      };
    });

    return query.status ? rows.filter((r) => r.reviewStatus === query.status) : rows;
  }

  async getDetailForAdmin(applicationId: string) {
    const application = await this.getWithRelationsOrThrow(applicationId);
    const config = buildFormConfig(application.service, application.country);
    const stepData = {
      personal: application.personal,
      passport: application.passport,
      languages: application.languages,
      education: application.education,
      trainings: application.trainings,
      experience: application.experience,
      objective: application.objective,
    };

    const entries = collectTranslatableEntries(config, stepData);
    const translatedValues = await this.translation.translateMany(
      entries.map((e) => e.value),
      'de',
    );
    const translations: Record<string, string> = {};
    entries.forEach((e, i) => {
      translations[e.path] = translatedValues[i];
    });

    return {
      id: application.id,
      service: application.service,
      country: application.country,
      status: application.status,
      user: application.user,
      config,
      stepData,
      translations,
      requirements: requirementsFor(application.service, application.country),
      documents: application.documents.map((d) => ({
        id: d.id,
        type: d.type,
        originalName: d.originalName,
        mimeType: d.mimeType,
        size: d.size,
        status: d.status,
        createdAt: d.createdAt,
      })),
      sectionReviews: application.sectionReviews,
      dossierReview: application.dossierReview,
    };
  }

  async reviewSection(
    adminUserId: string,
    applicationId: string,
    section: string,
    dto: SectionReviewDto,
  ) {
    if (!isReviewSection(section)) {
      throw new BadRequestException('Section inconnue.');
    }
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) {
      throw new NotFoundException('Dossier introuvable.');
    }

    const remark = dto.remark?.trim() || null;
    let remarkFr: string | null = null;
    let remarkAr: string | null = null;
    if (remark) {
      [remarkFr, remarkAr] = await Promise.all([
        this.translation.translateSafe(remark, 'fr'),
        this.translation.translateSafe(remark, 'ar'),
      ]);
    }

    const review = await this.prisma.sectionReview.upsert({
      where: { applicationId_section: { applicationId, section } },
      create: {
        applicationId,
        section,
        status: dto.status,
        remark,
        remarkFr,
        remarkAr,
        reviewerId: adminUserId,
      },
      update: {
        status: dto.status,
        remark,
        remarkFr,
        remarkAr,
        reviewerId: adminUserId,
      },
    });

    await this.notifications.create(
      application.userId,
      dto.status === 'NEEDS_CORRECTION' ? 'notif.sectionNeedsCorrection' : 'notif.sectionApproved',
      {
        link: `/mon-dossier?application=${applicationId}`,
        meta: { section, applicationId },
      },
    );

    return review;
  }

  async finalizeDossier(adminUserId: string, applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { sectionReviews: true },
    });
    if (!application) {
      throw new NotFoundException('Dossier introuvable.');
    }

    const reviewedMap = new Map(application.sectionReviews.map((r) => [r.section, r.status]));
    const notApproved = REVIEW_SECTIONS.filter((s) => reviewedMap.get(s) !== 'APPROVED');
    if (notApproved.length > 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Toutes les sections doivent être approuvées avant de valider le dossier.',
        sections: notApproved,
      });
    }

    const dossierReview = await this.prisma.dossierReview.upsert({
      where: { applicationId },
      create: {
        applicationId,
        status: 'VALIDATED',
        reviewerId: adminUserId,
        decidedAt: new Date(),
      },
      update: { status: 'VALIDATED', reviewerId: adminUserId, decidedAt: new Date() },
    });

    await this.notifications.create(application.userId, 'notif.dossierValidated', {
      link: `/mon-dossier?application=${applicationId}`,
      meta: { applicationId },
    });

    return dossierReview;
  }

  async extractDocument(applicationId: string, documentId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, applicationId },
    });
    if (!document) {
      throw new NotFoundException('Document introuvable.');
    }

    let text = document.extractedText;
    if (text == null) {
      const filePath = join(this.uploadsRoot, applicationId, document.storedName);
      text = await this.extraction.extractText(filePath, document.mimeType);
      await this.prisma.document.update({
        where: { id: documentId },
        data: { extractedText: text },
      });
    }

    const translatedDe = text.trim() ? await this.translation.translateSafe(text, 'de') : '';
    return { original: text, translatedDe };
  }

  async getClientReview(userId: string, applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { sectionReviews: true, dossierReview: true },
    });
    if (!application) {
      throw new NotFoundException('Dossier introuvable.');
    }
    if (application.userId !== userId) {
      throw new ForbiddenException();
    }
    return { sections: application.sectionReviews, dossier: application.dossierReview };
  }

  async resubmitSection(userId: string, applicationId: string, section: string) {
    if (!isReviewSection(section)) {
      throw new BadRequestException('Section inconnue.');
    }
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) {
      throw new NotFoundException('Dossier introuvable.');
    }
    if (application.userId !== userId) {
      throw new ForbiddenException();
    }

    await this.prisma.sectionReview.updateMany({
      where: { applicationId, section, status: 'NEEDS_CORRECTION' },
      data: { status: 'PENDING' },
    });
    return { success: true };
  }

  private async getWithRelationsOrThrow(applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        documents: true,
        sectionReviews: true,
        dossierReview: true,
      },
    });
    if (!application || application.status !== 'SUBMITTED') {
      throw new NotFoundException('Dossier introuvable.');
    }
    return application;
  }
}
