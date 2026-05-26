// File: src/domains/dto/create-domain.dto.ts

import { IsString, IsEnum } from 'class-validator';

export const DomainTypes = ['source', 'target', 'both'] as const;

export class CreateDomainDto {
  @IsString()
  name: string;

  @IsEnum(DomainTypes)
  type: (typeof DomainTypes)[number];
}
