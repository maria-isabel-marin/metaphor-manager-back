// File: src/domainRelations/dto/update-domain-relation.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateDomainRelationDto } from './create-domain-relation.dto';

export class UpdateDomainRelationDto extends PartialType(
  CreateDomainRelationDto,
) {}
