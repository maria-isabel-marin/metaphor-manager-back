import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DomainDocument = Domain & Document;

@Schema({
  collection: 'domains',
  timestamps: true,
})
export class Domain {
  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    enum: ['source', 'target'],
  })
  type: 'source' | 'target';
}

export const DomainSchema = SchemaFactory.createForClass(Domain);

// Índice compuesto para garantizar unicidad en la combinación name + type
DomainSchema.index({ name: 1, type: 1 }, { unique: true });
