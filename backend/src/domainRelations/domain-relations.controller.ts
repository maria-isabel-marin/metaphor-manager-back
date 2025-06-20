// File: src/domainRelations/domain-relations.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { DomainRelationsService } from './domain-relations.service';
import { CreateDomainRelationDto } from './dto/create-domain-relation.dto';
import { UpdateDomainRelationDto } from './dto/update-domain-relation.dto';

@Controller('domain-relations')
export class DomainRelationsController {
  constructor(private readonly service: DomainRelationsService) {}

  @Post()
  create(@Body() dto: CreateDomainRelationDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDomainRelationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
