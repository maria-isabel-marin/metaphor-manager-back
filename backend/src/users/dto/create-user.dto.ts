// src/users/dto/create-user.dto.ts
import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsEnum(['editor', 'reviewer']) role: 'editor' | 'reviewer';

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
