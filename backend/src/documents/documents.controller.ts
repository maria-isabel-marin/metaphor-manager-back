// backend/src/documents/documents.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('projects/:projectId/documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get()
  findByProject(@Param('projectId') projectId: string) {
    return this.service.findByProject(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'filePdf', maxCount: 1 },
        { name: 'fileTxt', maxCount: 1 },
      ],
      {
        storage: multer.memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
      },
    ),
  )
  create(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Body() dto: CreateDocumentDto,
    @UploadedFiles()
    files: {
      filePdf?: Express.Multer.File[];
      fileTxt?: Express.Multer.File[];
    },
  ) {
    return this.service.create({
      ...dto,
      projectId,
      owner: req.user._id,
      pdf: files.filePdf?.[0],
      txt: files.fileTxt?.[0],
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
