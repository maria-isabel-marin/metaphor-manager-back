// backend/src/documents/schemas/document.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { HydratedDocument } from 'mongoose';

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

  @Prop({ default: 'draft' })
  status: 'draft' | 'published';

  @Prop()
  notes?: string;

  @Prop()
  gcsPath?: string;

  @Prop()
  fileType?: string;

  // Legacy fields for migration compatibility
  @Prop()
  gcsPathPdf?: string;

  @Prop()
  gcsPathTxt?: string;
}

export type DocumentDocument = HydratedDocument<DocumentModel>;
export const DocumentSchema = SchemaFactory.createForClass(DocumentModel);
