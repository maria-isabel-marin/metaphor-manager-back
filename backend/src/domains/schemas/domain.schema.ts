import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DomainDocument = Domain & Document;

@Schema({ collection: 'domains' , timestamps: true })
export class Domain {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, enum: ['source', 'target', 'both'] })
  type: 'source' | 'target' | 'both';
}

export const DomainSchema = SchemaFactory.createForClass(Domain);
