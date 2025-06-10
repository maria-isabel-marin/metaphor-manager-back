// File: src/documents/dto/create-document.dto.ts

import { IsString, IsMongoId, IsEnum, IsOptional } from 'class-validator';

export class CreateDocumentDto {
  @IsMongoId()
  projectId: string;

  @IsString()
  title: string;

  @IsString()
  type: string;

  @IsString()
  language: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsEnum(['draft', 'published'])
  @IsOptional()
  status?: 'draft' | 'published';

  @IsString()
  filePdf: string;

  @IsString()
  fileTxt: string;
}
