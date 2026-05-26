// backend/src/documents/documents.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import * as multer from 'multer';

import { DocumentModel, DocumentSchema } from './schemas/document.schema';

import {
  AnnotatedMetaphor,
  AnnotatedMetaphorSchema,
} from '../annotatedMetaphors/schemas/annotated-metaphor.schema';
import { AnnotatedMetaphorsService } from '../annotatedMetaphors/annotated-metaphors.service';

import { DomainsModule } from '../domains/domains.module';
import { CommonModule } from '../common/common.module';
import { PosModule } from '../annotatedMetaphors/pos.module';

@Module({
  imports: [
    // your existing Document model
    MongooseModule.forFeature([
      { name: DocumentModel.name, schema: DocumentSchema },
    ]),

    // new AnnotatedMetaphor model
    MongooseModule.forFeature([
      { name: AnnotatedMetaphor.name, schema: AnnotatedMetaphorSchema },
    ]),

    // DomainsModule to lookup/create domains by name
    DomainsModule,

    // CommonModule for ActionLogService
    CommonModule,

    // Multer (in-memory) so you can parse Excel uploads in your controller
    MulterModule.register({
      storage: multer.memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 }, // e.g. 20 MB
    }),

    // Import PosModule para que POSService esté disponible
    PosModule,
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    // register the new service you'll call from your controller
    AnnotatedMetaphorsService,
  ],
})
export class DocumentsModule {}
