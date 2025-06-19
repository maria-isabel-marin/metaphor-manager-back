// backend/src/documents/documents.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as XLSX from 'xlsx';

import { Storage } from '@google-cloud/storage';
import { DomainsService } from '../domains/domains.service';
import { ActionLogService } from '../common/services/action-log.service';
import { ActionType, EntityType } from '../common/schemas/action-log.schema';

import { DocumentModel, DocumentDocument } from './schemas/document.schema';
import {
  AnnotatedMetaphor,
  AnnotatedMetaphorDocument,
} from '../annotatedMetaphors/schemas/annotated-metaphor.schema';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

interface RequestUser {
  _id: string;
  email: string;
}

@Injectable()
export class DocumentsService {
  private storage = new Storage();
  private bucketName = process.env.GCS_BUCKET!;

  constructor(
    @InjectModel(DocumentModel.name)
    private readonly docModel: Model<DocumentDocument>,
    @InjectModel(AnnotatedMetaphor.name)
    private readonly amModel: Model<AnnotatedMetaphorDocument>,
    private readonly domainsService: DomainsService,
    private readonly actionLogService: ActionLogService,
  ) {}

  /** 1) List all documents under a project, returning signed URLs */
  async findByProject(projectId: string, user: RequestUser): Promise<any[]> {
    const docs = await this.docModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .exec();

    const bucket = this.storage.bucket(this.bucketName);

    // Log the read action for each document
    await Promise.all(
      docs.map(doc =>
        this.actionLogService.logAction({
          action: ActionType.READ,
          entityType: EntityType.DOCUMENT,
          entityId: (doc._id as Types.ObjectId).toString(),
          userId: user._id,
          userEmail: user.email,
          details: { title: doc.title, projectId },
        })
      )
    );

    return Promise.all(
      docs.map(async (doc) => {
        const obj = doc.toObject() as any;

        if (obj.gcsPathPdf) {
          const file = bucket.file(obj.gcsPathPdf);
          const [pdfUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000, // 1 hour
          });
          obj.filePdfUrl = pdfUrl;
        }

        if (obj.gcsPathTxt) {
          const file = bucket.file(obj.gcsPathTxt);
          const [txtUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000,
          });
          obj.fileTxtUrl = txtUrl;
        }

        return obj;
      }),
    );
  }

  /** 2) Retrieve a single document */
  async findOne(id: string, user: RequestUser): Promise<DocumentModel> {
    const doc = await this.docModel.findById(id).exec();
    if (!doc) throw new NotFoundException(`Document ${id} not found`);

    // Log the read action
    await this.actionLogService.logAction({
      action: ActionType.READ,
      entityType: EntityType.DOCUMENT,
      entityId: (doc._id as Types.ObjectId).toString(),
      userId: user._id,
      userEmail: user.email,
      details: { title: doc.title },
    });

    return doc;
  }

  /** 3) Create and upload files to GCS */
  async create(
    data: CreateDocumentDto & {
      projectId: string;
      owner: string;
      pdf?: Express.Multer.File;
      txt?: Express.Multer.File;
    },
    user: RequestUser,
  ): Promise<DocumentModel> {
    const bucket = this.storage.bucket(this.bucketName);
    let gcsPathPdf: string | null = null;
    let gcsPathTxt: string | null = null;

    if (data.pdf) {
      gcsPathPdf = `documents/pdf-${Date.now()}-${data.pdf.originalname}`;
      await bucket
        .file(gcsPathPdf)
        .save(data.pdf.buffer, { contentType: data.pdf.mimetype });
    }

    if (data.txt) {
      gcsPathTxt = `documents/txt-${Date.now()}-${data.txt.originalname}`;
      await bucket
        .file(gcsPathTxt)
        .save(data.txt.buffer, { contentType: data.txt.mimetype });
    }

    const created = await new this.docModel({
      ...data,
      projectId: new Types.ObjectId(data.projectId),
      createdBy: new Types.ObjectId(data.owner),
      gcsPathPdf,
      gcsPathTxt,
    }).save();

    // Log the create action
    await this.actionLogService.logAction({
      action: ActionType.CREATE,
      entityType: EntityType.DOCUMENT,
      entityId: (created._id as Types.ObjectId).toString(),
      userId: user._id,
      userEmail: user.email,
      details: { title: created.title, projectId: data.projectId },
    });

    return created;
  }

  /** 4) Update metadata */
  async update(id: string, dto: UpdateDocumentDto, user: RequestUser): Promise<DocumentModel> {
    const updated = await this.docModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Document ${id} not found`);

    // Log the update action
    await this.actionLogService.logAction({
      action: ActionType.UPDATE,
      entityType: EntityType.DOCUMENT,
      entityId: (updated._id as Types.ObjectId).toString(),
      userId: user._id,
      userEmail: user.email,
      details: { title: updated.title, changes: dto },
    });

    return updated;
  }

  /** 5) Delete a document record (files remain in bucket) */
  async remove(id: string, user: RequestUser): Promise<void> {
    // 1) Fetch the doc to know its GCS paths
    const doc = await this.docModel.findById(id).exec();
    if (!doc) throw new NotFoundException(`Document ${id} not found`);

    // Log the delete action before deleting
    await this.actionLogService.logAction({
      action: ActionType.DELETE,
      entityType: EntityType.DOCUMENT,
      entityId: (doc._id as Types.ObjectId).toString(),
      userId: user._id,
      userEmail: user.email,
      details: { title: doc.title },
    });

    const bucket = this.storage.bucket(this.bucketName);

    // 2) Delete PDF if exists
    if (doc.gcsPathPdf) {
      await bucket.file(doc.gcsPathPdf).delete().catch(() => {
        console.warn(`Could not delete PDF ${doc.gcsPathPdf}`);
      });
    }

    // 3) Delete TXT if exists
    if (doc.gcsPathTxt) {
      await bucket.file(doc.gcsPathTxt).delete().catch(() => {
        console.warn(`Could not delete TXT ${doc.gcsPathTxt}`);
      });
    }

    // 4) Remove document record from Mongo
    const res = await this.docModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException(`Document ${id} not found`);
  }

  async uploadAnnotations(
    documentId: string,
    userId: string,
    buffer: Buffer,
    user: RequestUser,
  ): Promise<{ inserted: number }> {
    // 1) Load workbook & first sheet
    const workbook  = XLSX.read(buffer,   { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: '',       // fill missing cells with empty string
      raw:   false,     // coerce to strings
    });

    let inserted = 0;

    for (const row of rows) {
      // 2) Destructure exactly your headers:
      const {
        customId,
        section,
        subsection,
        subsubsection,
        page,
        expression,
        context,
        triggerWord,
        lemma,
        contextualMeaning,
        literalMeaning,
        conceptualMetaphor,
        sourceDomain,
        targetDomain,
        ontologicalMappings,
        epistemicMappings,
        noveltyType,
        comments,
        functionType,
      } = row;

      // 3) Skip if no expression or no domains
      if (!expression || !sourceDomain || !targetDomain) {
        continue;
      }

      // 4) Upsert source/target domains
      const src = await this.domainsService.findOrCreate(
        sourceDomain,
        'source',
      );
      const tgt = await this.domainsService.findOrCreate(
        targetDomain,
        'target',
      );

      // 5) Build new AnnotatedMetaphor document
      const am = new this.amModel({
        customId:           customId?.toString()       || new Types.ObjectId().toHexString(),
        documentId:         new Types.ObjectId(documentId),
        expression:         expression.toString(),
        section:            section?.toString()        || 'undefined',
        subsection:         subsection?.toString()     || undefined,
        subsubsection:      subsubsection?.toString()  || undefined,
        page:               Number(page)               || 0,
        triggerWord:        triggerWord?.toString()    || 'unknown_word',
        lemma:              lemma?.toString()          || 'unknown_lemma',
        context:            context?.toString()        || 'undefined',
        literalMeaning:     literalMeaning?.toString() || 'undefined',
        contextualMeaning:  contextualMeaning?.toString() || 'undefined',
        sourceDomain:       src._id,
        targetDomain:       tgt._id,
        conceptualMetaphor: conceptualMetaphor?.toString() || '',
        ontologicalMappings: String(ontologicalMappings || '')
          .split(';')
          .map(s => s.trim())
          .filter(Boolean),
        epistemicMappings:   String(epistemicMappings || '')
          .split(';')
          .map(s => s.trim())
          .filter(Boolean),
        noveltyType:        (noveltyType as any)        || 'conventional',
        functionType:       (functionType as any)       || 'structural',
        status:             'under_review',
        comments:           Array.isArray(comments)
          ? comments.map((c: any) => c.toString())
          : String(comments || '').split(';').map((c: string) => c.trim()).filter(Boolean),
        createdBy:          new Types.ObjectId(userId),
      });

      // 6) Save, counting successes
      try {
        await am.save();
        inserted++;
      } catch {
        // skip duplicates/validation errors
      }
    }

    // Log the action
    await this.actionLogService.logAction({
      action: ActionType.CREATE,
      entityType: EntityType.ANNOTATION,
      entityId: documentId, // Using document ID as entity ID
      userId: user._id,
      userEmail: user.email,
      details: { documentId, insertedCount: inserted },
    });

    return { inserted };
  }
}
