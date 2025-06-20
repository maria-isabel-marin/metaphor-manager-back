// File: src/annotatedMetaphors/annotated-metaphors.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnnotatedMetaphorsController } from './annotated-metaphors.controller';
import { AnnotatedMetaphorsService } from './annotated-metaphors.service';
import {
  AnnotatedMetaphor,
  AnnotatedMetaphorSchema,
} from './schemas/annotated-metaphor.schema';
import { Domain, DomainSchema } from '../domains/schemas/domain.schema';
import { DomainsService } from '../domains/domains.service';
import { PosModule } from './pos.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnnotatedMetaphor.name, schema: AnnotatedMetaphorSchema },
      { name: Domain.name, schema: DomainSchema },
    ]),
    PosModule,
  ],
  controllers: [AnnotatedMetaphorsController],
  providers: [AnnotatedMetaphorsService, DomainsService],
})
export class AnnotatedMetaphorsModule {}
