// File: src/annotatedMetaphors/dto/create-annotated-metaphor.dto.ts

import {
  IsString,
  IsMongoId,
  IsEnum,
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreateAnnotatedMetaphorDto {
  @IsString()
  @IsOptional()
  customId?: string;

  @IsMongoId()
  @IsOptional()
  documentId?: string;

  @IsString()
  @IsOptional()
  expression?: string;

  @IsString()
  @IsOptional()
  section?: string;

  @IsString()
  @IsOptional()
  subsection?: string;

  @IsString()
  @IsOptional()
  subsection3?: string;

  @IsString()
  @IsOptional()
  subsection4?: string;
  
  @IsString()
  @IsOptional()
  subsection5?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  order?: string;

  @IsString()
  @IsOptional()
  triggerWord?: string;
  
  @IsString()
  @IsOptional()
  triggerWordLoc?: string;

  @IsString()
  @IsOptional()
  lemma?: string;

  @IsMongoId()
  @IsOptional()
  pos?: string;

  @IsString()
  @IsOptional()
  context?: string;

  @IsString()
  @IsOptional()
  literalMeaning?: string;

  @IsString()
  @IsOptional()
  contextualMeaning?: string;

  @IsMongoId()
  @IsOptional()
  sourceDomain?: string;

  @IsMongoId()
  @IsOptional()
  targetDomain?: string;

  @IsString()
  @IsOptional()
  conceptualMetaphor?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ontologicalMappings?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  epistemicMappings?: string[];

  @IsEnum(['novel/creative', 'conventional', 'lexicalized', 'fossilized'])
  @IsOptional()
  noveltyType?: 'novel/creative' | 'conventional' | 'lexicalized' | 'fossilized';

  @IsEnum(['structural', 'ontological', 'orientational'])
  @IsOptional()
  functionType?: 'structural' | 'ontological' | 'orientational';

  @IsEnum(['under_review', 'approved', 'to_edit', 'discarded', 'metonymy'])
  @IsOptional()
  status?: 'under_review' | 'approved' | 'to_edit' | 'discarded' | 'metonymy';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  comments?: string[];

  @IsMongoId()
  @IsOptional()
  createdBy?: string;
}
