// File: src/domainRelations/domain-relations.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DomainRelationsService } from './domain-relations.service';
import { DomainRelationsController } from './domain-relations.controller';
import {
  DomainRelation,
  DomainRelationSchema,
} from './schemas/domain-relation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DomainRelation.name, schema: DomainRelationSchema },
    ]),
  ],
  controllers: [DomainRelationsController],
  providers: [DomainRelationsService],
  exports: [DomainRelationsService],
})
export class DomainRelationsModule {}
