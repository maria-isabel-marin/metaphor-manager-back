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
  UploadedFile,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get('project/:projectId')
  async findByProject(@Param('projectId') projectId: string, @Req() req: any) {
    return this.service.findByProject(projectId, {
      _id: req.user._id.toString(),
      email: req.user.email,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, {
      _id: req.user._id.toString(),
      email: req.user.email,
    });
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() dto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const userId = req.user._id.toString();
    return this.service.create(
      {
        ...dto,
        owner: userId,
        file,
      },
      {
        _id: userId,
        email: req.user.email,
      },
    );
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const document = await this.service.findOne(id, {
      _id: req.user._id.toString(),
      email: req.user.email,
    });

    if (document.createdBy.toString() !== req.user._id.toString()) {
      throw new ForbiddenException('You cannot edit this document');
    }

    return this.service.update(id, dto, file, {
      _id: req.user._id.toString(),
      email: req.user.email,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const document = await this.service.findOne(id, {
      _id: req.user._id.toString(),
      email: req.user.email,
    });

    if (document.createdBy.toString() !== req.user._id.toString()) {
      throw new ForbiddenException('You cannot delete this document');
    }

    await this.service.remove(id, {
      _id: req.user._id.toString(),
      email: req.user.email,
    });
    return { success: true };
  }

  /** Upload an Excel of annotated metaphors */
  @Post(':id/annotations')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.originalname.match(/\.(xlsx|xls)$/i)) {
          return cb(
            new BadRequestException('Only .xlsx or .xls files allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadAnnotations(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    return this.service.uploadAnnotations(
      id,
      req.user._id.toString(),
      file.buffer,
      {
        _id: req.user._id.toString(),
        email: req.user.email,
      },
    );
  }
}
