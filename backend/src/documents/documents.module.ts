// backend/src/documents/documents.module.ts

import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MulterModule } from '@nestjs/platform-express'
import { DocumentsController } from './documents.controller'
import { DocumentsService } from './documents.service'
import * as multer from 'multer'

import {
  DocumentModel,
  DocumentSchema,
} from './schemas/document.schema'

import {
  AnnotatedMetaphor,
  AnnotatedMetaphorSchema,
} from  '../annotatedMetaphors/schemas/annotated-metaphor.schema'
import { AnnotatedMetaphorsService } from '../annotatedMetaphors/annotated-metaphors.service'

import { DomainsModule } from '../domains/domains.module'

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

    // Multer (in-memory) so you can parse Excel uploads in your controller
    MulterModule.register({
       storage: multer.memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 }, // e.g. 20 MB
    }),
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    // register the new service you'll call from your controller
    AnnotatedMetaphorsService,
  ],
})
export class DocumentsModule {}
