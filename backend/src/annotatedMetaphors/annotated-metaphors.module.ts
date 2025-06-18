// File: src/annotatedMetaphors/annotated-metaphors.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnnotatedMetaphorsService } from './annotated-metaphors.service';
import { AnnotatedMetaphorsController } from './annotated-metaphors.controller';
import {
  AnnotatedMetaphor,
  AnnotatedMetaphorSchema,
} from './schemas/annotated-metaphor.schema';
import { DomainsModule } from '../domains/domains.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnnotatedMetaphor.name, schema: AnnotatedMetaphorSchema },
    ]),
    DomainsModule,
  ],
  controllers: [AnnotatedMetaphorsController],
  providers: [AnnotatedMetaphorsService],
  exports: [AnnotatedMetaphorsService],
})
export class AnnotatedMetaphorsModule {}
