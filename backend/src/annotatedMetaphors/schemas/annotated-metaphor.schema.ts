import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

interface MetadataUpdate {
  timestamp: Date;
  user: string;
}

interface FieldChange {
  before: any;
  after: any;
}

interface Update {
  metadata: MetadataUpdate;
  changes: Record<string, FieldChange>;
}

export type AnnotatedMetaphorDocument = AnnotatedMetaphor & Document;

@Schema({ collection: 'annotated_metaphors', timestamps: true })
export class AnnotatedMetaphor {
  @Prop({ required: true, unique: true })
  customId: string;

  @Prop({ type: Types.ObjectId, ref: 'DocumentModel', required: true })
  documentId: Types.ObjectId;

  @Prop({ required: true })
  expression: string;

  // Campos de ubicación separados (antes "location")
  @Prop({ type: String, required: true, default: 'undefined' })
  section: string;

  @Prop({ type: String })
  subsection?: string; // Opcional (no requerido)

  @Prop({ type: String })
  subsection3?: string;

  @Prop({ type: String })
  subsection4?: string;

  @Prop({ type: String })
  subsection5?: string;

  @Prop({ type: String, required: false })
  subsubsection?: string;

  @Prop({ type: String, required: true, default: '0' })
  page: string;

  @Prop({ type: String })
  order?: string;

  @Prop({ required: true, default: 'unknow_word' })
  triggerWord: string;

  @Prop({ type: String })
  triggerWordLoc?: string;

  @Prop({ required: true, default: 'unknow_lemma' })
  lemma: string;

  @Prop({ type: Types.ObjectId, ref: 'POS' })
  pos?: Types.ObjectId;

  @Prop({ required: true, default: 'undefined' })
  context: string;

  @Prop({ required: true, default: 'undefined' })
  literalMeaning: string;

  @Prop({ required: true, default: 'undefined' })
  contextualMeaning: string;

  @Prop({ type: Types.ObjectId, ref: 'Domain', required: true })
  sourceDomain: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Domain', required: true })
  targetDomain: Types.ObjectId;

  @Prop({ required: true })
  conceptualMetaphor: string;

  @Prop([String])
  ontologicalMappings: string[];

  @Prop([String])
  epistemicMappings: string[];

  @Prop({
    required: true,
    enum: ['novel/creative', 'conventional', 'lexicalized', 'fossilized'],
    default: 'conventional',
  })
  noveltyType: 'novel/creative' | 'conventional' | 'lexicalized' | 'fossilized';

  @Prop({
    required: true,
    enum: ['structural', 'ontological', 'orientational'],
    default: 'structural',
  })
  functionType: 'structural' | 'ontological' | 'orientational';

  @Prop({
    required: true,
    enum: ['under_review', 'approved', 'to_edit', 'discarded', 'metonymy'],
    default: 'under_review',
  })
  status: 'under_review' | 'approved' | 'to_edit' | 'discarded' | 'metonymy';

  @Prop([String])
  comments: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({
    type: [
      {
        metadata: {
          timestamp: { type: Date, required: true },
          user: { type: String, required: true },
        },
        changes: {
          type: Map,
          of: {
            before: MongooseSchema.Types.Mixed,
            after: MongooseSchema.Types.Mixed,
          },
        },
      },
    ],
    default: [],
  })
  updates: Update[];
}

export const AnnotatedMetaphorSchema =
  SchemaFactory.createForClass(AnnotatedMetaphor);
