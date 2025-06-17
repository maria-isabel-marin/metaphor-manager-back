// backend/src/documents/documents.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Storage } from '@google-cloud/storage';
import { DocumentModel, DocumentDocument } from './schemas/document.schema';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  private storage = new Storage();
  private bucketName = process.env.GCS_BUCKET!;

  constructor(
    @InjectModel(DocumentModel.name)
    private readonly docModel: Model<DocumentDocument>,
  ) {}

  /** 1) List all documents under a project, returning signed URLs */
  async findByProject(projectId: string): Promise<any[]> {
    const docs = await this.docModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .exec();

    const bucket = this.storage.bucket(this.bucketName);

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
  async findOne(id: string): Promise<DocumentModel> {
    const doc = await this.docModel.findById(id).exec();
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
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

    const created = new this.docModel({
      ...data,
      projectId: new Types.ObjectId(data.projectId),
      createdBy: new Types.ObjectId(data.owner),
      gcsPathPdf,
      gcsPathTxt,
    });

    return created.save();
  }

  /** 4) Update metadata */
  async update(id: string, dto: UpdateDocumentDto): Promise<DocumentModel> {
    const updated = await this.docModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Document ${id} not found`);
    return updated;
  }

  /** 5) Delete a document record (files remain in bucket) */
  
  async remove(id: string): Promise<void> {
    // 1) Fetch the doc to know its GCS paths
    const doc = await this.docModel.findById(id).exec();
    if (!doc) throw new NotFoundException(`Document ${id} not found`);

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
}
