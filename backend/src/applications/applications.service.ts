import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { fromBuffer as fileTypeFromBuffer } from 'file-type';
import {
  Application,
  Document as DocumentModel,
  Prisma,
} from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDataDto } from './dto/update-application-data.dto';
import {
  isKnownType,
  requirementsFor,
  requiredTypesFor,
} from './document-requirements';

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type ApplicationWithDocuments = Application & { documents: DocumentModel[] };

@Injectable()
export class ApplicationsService {
  private readonly uploadsRoot = join(process.cwd(), 'uploads');

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateApplicationDto) {
    const application = await this.prisma.application.create({
      data: { userId, service: dto.service, country: dto.country },
    });
    return this.toResponse({ ...application, documents: [] });
  }

  async findOne(userId: string, id: string) {
    const application = await this.getOwned(userId, id);
    return this.toResponse(application);
  }

  async findAllForUser(userId: string) {
    const applications = await this.prisma.application.findMany({
      where: { userId },
      include: { documents: true },
      orderBy: { createdAt: 'desc' },
    });
    return applications.map((application) => this.toResponse(application));
  }

  async updateData(userId: string, id: string, dto: UpdateApplicationDataDto) {
    const application = await this.getOwned(userId, id);
    const updated = await this.prisma.application.update({
      where: { id },
      data: dto as Prisma.ApplicationUpdateInput,
    });
    return this.toResponse({ ...updated, documents: application.documents });
  }

  async uploadDocument(
    userId: string,
    applicationId: string,
    type: string,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier reçu.');
    }

    const application = await this.getOwned(userId, applicationId);

    if (!isKnownType(application.service, application.country, type)) {
      throw new BadRequestException(
        `Type de document inconnu pour ce service : ${type}.`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        'Le fichier dépasse la taille maximale de 10 Mo.',
      );
    }

    const detected = await fileTypeFromBuffer(file.buffer);
    if (!detected || !ALLOWED_MIME_TYPES.includes(detected.mime)) {
      throw new BadRequestException(
        'Format de fichier non supporté. Formats acceptés : PDF, JPG, PNG.',
      );
    }

    const dir = join(this.uploadsRoot, applicationId);
    await fs.mkdir(dir, { recursive: true });

    const storedName = `${randomUUID()}-${type}.${detected.ext}`;
    await fs.writeFile(join(dir, storedName), file.buffer);

    const existing = application.documents.find((d) => d.type === type);
    if (existing) {
      await fs.rm(join(dir, existing.storedName), { force: true });
    }

    const document = await this.prisma.document.upsert({
      where: { applicationId_type: { applicationId, type } },
      create: {
        applicationId,
        type,
        originalName: file.originalname,
        storedName,
        mimeType: detected.mime,
        size: file.size,
        status: 'UPLOADED',
      },
      update: {
        originalName: file.originalname,
        storedName,
        mimeType: detected.mime,
        size: file.size,
        status: 'UPLOADED',
      },
    });

    return this.toDocumentResponse(document);
  }

  async deleteDocument(
    userId: string,
    applicationId: string,
    documentId: string,
  ) {
    const application = await this.getOwned(userId, applicationId);
    const document = application.documents.find((d) => d.id === documentId);
    if (!document) {
      throw new NotFoundException('Document introuvable.');
    }

    await fs.rm(join(this.uploadsRoot, applicationId, document.storedName), {
      force: true,
    });
    await this.prisma.document.delete({ where: { id: documentId } });

    return { success: true };
  }

  async getFile(userId: string, applicationId: string, documentId: string) {
    const application = await this.getOwned(userId, applicationId);
    const document = application.documents.find((d) => d.id === documentId);
    if (!document) {
      throw new NotFoundException('Document introuvable.');
    }

    return {
      path: join(this.uploadsRoot, applicationId, document.storedName),
      mimeType: document.mimeType,
      originalName: document.originalName,
    };
  }

  async submit(userId: string, applicationId: string) {
    const application = await this.getOwned(userId, applicationId);
    const required = requiredTypesFor(application.service, application.country);
    const uploaded = new Set(
      application.documents
        .filter((d) => d.status === 'UPLOADED')
        .map((d) => d.type),
    );
    const missing = required.filter((type) => !uploaded.has(type));

    if (missing.length > 0) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Des documents obligatoires sont manquants.',
        missing,
      });
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'SUBMITTED' },
    });

    return this.toResponse({ ...updated, documents: application.documents });
  }

  private async getOwned(
    userId: string,
    id: string,
  ): Promise<ApplicationWithDocuments> {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { documents: true },
    });
    if (!application) {
      throw new NotFoundException('Demande introuvable.');
    }
    if (application.userId !== userId) {
      throw new ForbiddenException();
    }
    return application;
  }

  private toDocumentResponse(document: DocumentModel) {
    return {
      id: document.id,
      type: document.type,
      originalName: document.originalName,
      mimeType: document.mimeType,
      size: document.size,
      status: document.status,
      createdAt: document.createdAt,
    };
  }

  private toResponse(application: ApplicationWithDocuments) {
    return {
      id: application.id,
      service: application.service,
      country: application.country,
      status: application.status,
      personal: application.personal,
      passport: application.passport,
      languages: application.languages,
      education: application.education,
      trainings: application.trainings,
      experience: application.experience,
      objective: application.objective,
      requirements: requirementsFor(application.service, application.country),
      documents: application.documents.map((d) => this.toDocumentResponse(d)),
    };
  }
}
