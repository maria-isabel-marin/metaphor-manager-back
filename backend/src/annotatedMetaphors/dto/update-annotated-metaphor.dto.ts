// File: src/annotatedMetaphors/dto/update-annotated-metaphor.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateAnnotatedMetaphorDto } from './create-annotated-metaphor.dto';

export class UpdateAnnotatedMetaphorDto extends PartialType(
  CreateAnnotatedMetaphorDto,
) {}
