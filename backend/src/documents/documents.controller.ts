// File: src/documents/documents.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Post()
  create(@Body() dto: CreateDocumentDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    if (projectId) {
      return this.service.findByProject(projectId);
    }
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
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
