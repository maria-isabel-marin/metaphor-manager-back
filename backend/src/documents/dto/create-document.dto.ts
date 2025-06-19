// backend/src/documents/dto/create-document.dto.ts
import { IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  type: string;

  @IsString()
  language: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsMongoId()
  projectId: string;
}
