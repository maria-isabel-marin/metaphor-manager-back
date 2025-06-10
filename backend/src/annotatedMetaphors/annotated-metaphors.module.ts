// File: src/annotatedMetaphors/annotated-metaphors.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnnotatedMetaphorsService } from './annotated-metaphors.service';
import { AnnotatedMetaphorsController } from './annotated-metaphors.controller';
import {
  AnnotatedMetaphor,
  AnnotatedMetaphorSchema,
} from './schemas/annotated-metaphor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnnotatedMetaphor.name, schema: AnnotatedMetaphorSchema },
    ]),
  ],
  controllers: [AnnotatedMetaphorsController],
  providers: [AnnotatedMetaphorsService],
  exports: [AnnotatedMetaphorsService],
})
export class AnnotatedMetaphorsModule {}
