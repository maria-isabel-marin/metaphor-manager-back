// File: src/projects/dto/create-project.dto.ts

import { IsString, IsMongoId, IsEmail, IsOptional, IsArray } from 'class-validator';

export class CreateProjectDto {
  @IsString() name: string;
  @IsString() description: string;
  @IsEmail() contactEmail: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  reviewerEmails?: string[];
}
