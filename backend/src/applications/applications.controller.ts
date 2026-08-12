import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDataDto } from './dto/update-application-data.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

const uploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
};

interface AuthedRequest {
  user: { userId: string };
}

@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@Req() req: AuthedRequest, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Req() req: AuthedRequest) {
    return this.applicationsService.findAllForUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.applicationsService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  updateData(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDataDto,
  ) {
    return this.applicationsService.updateData(req.user.userId, id, dto);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  uploadDocument(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: UploadDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.applicationsService.uploadDocument(
      req.user.userId,
      id,
      dto.type,
      file,
    );
  }

  @Put(':id/documents/:documentId')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  replaceDocument(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: UploadDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.applicationsService.uploadDocument(
      req.user.userId,
      id,
      dto.type,
      file,
    );
  }

  @Delete(':id/documents/:documentId')
  deleteDocument(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Param('documentId') documentId: string,
  ) {
    return this.applicationsService.deleteDocument(
      req.user.userId,
      id,
      documentId,
    );
  }

  @Get(':id/documents/:documentId/file')
  async getFile(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @Res() res: Response,
  ) {
    const file = await this.applicationsService.getFile(
      req.user.userId,
      id,
      documentId,
    );
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(file.originalName)}"`,
    );
    res.sendFile(file.path);
  }

  @Post(':id/submit')
  submit(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.applicationsService.submit(req.user.userId, id);
  }
}
