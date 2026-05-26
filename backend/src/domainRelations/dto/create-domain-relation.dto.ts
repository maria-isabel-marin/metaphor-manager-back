// File: src/domainRelations/dto/create-domain-relation.dto.ts

import { IsMongoId, IsEnum } from 'class-validator';

export const RelationTypes = [
  'hypernym',
  'hyponym',
  'co-hyponym',
  'meronym',
  'holonym',
  'syntagmatic',
] as const;

export class CreateDomainRelationDto {
  @IsMongoId()
  domainA: string;

  @IsMongoId()
  domainB: string;

  @IsEnum(RelationTypes)
  relationType: (typeof RelationTypes)[number];
}
