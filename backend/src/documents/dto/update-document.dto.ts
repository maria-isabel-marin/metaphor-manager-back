// backend/src/documents/dto/update-document.dto.ts
import { IsOptional, IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateDocumentDto {
  @IsOptional() @IsString() @IsNotEmpty() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() @IsNotEmpty() type?: string;
  @IsOptional() @IsString() @IsNotEmpty() language?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsEnum(['draft', 'published']) status?: 'draft' | 'published';
}
