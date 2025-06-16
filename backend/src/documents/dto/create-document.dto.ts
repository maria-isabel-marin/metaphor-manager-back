import { IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateDocumentDto {
  @IsString() title: string;
  @IsString() type: string;
  @IsString() language: string;
  @IsOptional() @IsString() notes?: string;
}
