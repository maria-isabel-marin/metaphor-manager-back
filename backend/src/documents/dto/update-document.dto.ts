import { IsOptional, IsString, IsEnum } from 'class-validator';

export type DocumentStatus = 'draft' | 'published';

export class UpdateDocumentDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() language?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsEnum(['draft', 'published']) status?: DocumentStatus;
}
