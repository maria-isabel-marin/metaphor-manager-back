// backend/src/documents/dto/update-document.dto.ts
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdateDocumentDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() language?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsEnum(['draft', 'published']) status?: 'draft' | 'published';
}
