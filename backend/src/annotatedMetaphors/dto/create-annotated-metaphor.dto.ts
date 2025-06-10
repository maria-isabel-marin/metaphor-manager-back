// File: src/annotatedMetaphors/dto/create-annotated-metaphor.dto.ts

import {
  IsString,
  IsMongoId,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LocationDto {
  @IsString()
  section: string;

  @IsString()
  subsection: string;

  @IsString()
  page: string;
}

export class CreateAnnotatedMetaphorDto {
  @IsString()
  customId: string;

  @IsMongoId()
  documentId: string;

  @IsString()
  expression: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsString()
  triggerWord: string;

  @IsString()
  lemma: string;

  @IsString()
  context: string;

  @IsString()
  literalMeaning: string;

  @IsString()
  contextualMeaning: string;

  @IsMongoId()
  sourceDomain: string;

  @IsMongoId()
  targetDomain: string;

  @IsString()
  conceptualMetaphor: string;

  @IsArray()
  @IsString({ each: true })
  ontologicalMappings: string[];

  @IsArray()
  @IsString({ each: true })
  epistemicMappings: string[];

  @IsEnum(['novel/creative', 'conventional', 'lexicalized', 'fossilized'])
  noveltyType: 'novel/creative' | 'conventional' | 'lexicalized' | 'fossilized';

  @IsEnum(['structural', 'ontological', 'orientational'])
  functionType: 'structural' | 'ontological' | 'orientational';
}
