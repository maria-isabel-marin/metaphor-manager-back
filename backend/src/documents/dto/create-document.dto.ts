// backend/src/documents/dto/create-document.dto.ts
import { IsString, IsOptional, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsMongoId()
  projectId: string;
}
