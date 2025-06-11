// File: src/projects/dto/create-project.dto.ts

import { IsString, IsMongoId, IsEmail, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @IsString() name: string;
  @IsString() description: string;
  @IsEmail() contactEmail: string;
  @IsOptional() @IsString() notes?: string;
}
