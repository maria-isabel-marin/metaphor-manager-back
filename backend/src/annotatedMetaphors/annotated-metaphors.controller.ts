// File: src/annotatedMetaphors/annotated-metaphors.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  Res,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AnnotatedMetaphorsService } from './annotated-metaphors.service';
import { CreateAnnotatedMetaphorDto } from './dto/create-annotated-metaphor.dto';
import { UpdateAnnotatedMetaphorDto } from './dto/update-annotated-metaphor.dto';
import { Response } from 'express';

@Controller('annotated-metaphors')
export class AnnotatedMetaphorsController {
  constructor(
    private readonly service: AnnotatedMetaphorsService,
  ) {}

  @Post('bulk-import')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(200)
  async bulkImport(
    @UploadedFile() file: Express.Multer.File,
    @Body('createdBy') createdBy: string,
  ) {
    return this.service.bulkImportFromExcel(file, createdBy);
  }

  @Get('document/:documentId')
  async findByDocument(
    @Param('documentId') documentId: string,
  ) {
    return this.service.findByDocument(documentId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAnnotatedMetaphorDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    return this.service.approve(id);
  }

  @Patch(':id/to-edit')
  async markAsToEdit(@Param('id') id: string) {
    return this.service.markAsToEdit(id);
  }

  @Patch(':id/discard')
  async discard(@Param('id') id: string) {
    return this.service.discard(id);
  }

  @Patch(':id/metonymy')
  async markAsMetonymy(@Param('id') id: string) {
    return this.service.markAsMetonymy(id);
  }

  @Get('document/:documentId/export')
  async export(
    @Param('documentId') documentId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.service.exportToExcel(documentId);
    res
      .set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="metaphors_${documentId}.xlsx"`,
      })
      .send(buffer);
  }
}
