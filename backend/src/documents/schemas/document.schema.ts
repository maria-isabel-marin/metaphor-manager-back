// backend/src/documents/schemas/document.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, Types } from 'mongoose';

@Schema({ collection: 'documents', timestamps: true })
export class DocumentModel {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  language: string;

  @Prop()
  notes?: string;

  @Prop()
  gcsPathPdf?: string;

  @Prop()
  gcsPathTxt?: string;

  @Prop({ required: true, enum: ['draft', 'published'], default: 'draft' })
  status: 'draft' | 'published';
}

export type DocumentDocument = DocumentModel & MongooseDocument;
export const DocumentSchema = SchemaFactory.createForClass(DocumentModel);


