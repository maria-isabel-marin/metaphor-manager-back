import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnnotatedMetaphorDocument = AnnotatedMetaphor & Document;

@Schema({ collection: 'annotated_metaphors', timestamps: true })
export class AnnotatedMetaphor {
  @Prop({ required: true, unique: true })
  customId: string;

  @Prop({ type: Types.ObjectId, ref: 'DocumentModel', required: true })
  documentId: Types.ObjectId;

  @Prop({ required: true })
  expression: string;

  @Prop({
    type: {
      section: { type: String },
      subsection: { type: String },
      page: { type: String },
    },
    required: true,
  })
  location: {
    section: string;
    subsection: string;
    page: string;
  };

  @Prop({ required: true })
  triggerWord: string;

  @Prop({ required: true })
  lemma: string;

  @Prop({ required: true })
  context: string;

  @Prop({ required: true })
  literalMeaning: string;

  @Prop({ required: true })
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
  })
  noveltyType: 'novel/creative' | 'conventional' | 'lexicalized' | 'fossilized';

  @Prop({
    required: true,
    enum: ['structural', 'ontological', 'orientational'],
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
}

export const AnnotatedMetaphorSchema =
  SchemaFactory.createForClass(AnnotatedMetaphor);
