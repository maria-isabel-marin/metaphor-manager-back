import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type POSDocument = POS & Document;

@Schema({ collection: 'pos', timestamps: true })
export class POS {
  @Prop({ required: true, unique: true })
  name: string;
}

export const POSSchema = SchemaFactory.createForClass(POS); 