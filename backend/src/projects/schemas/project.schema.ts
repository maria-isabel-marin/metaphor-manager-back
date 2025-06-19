import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ collection: 'projects' , timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  reviewers: Types.ObjectId[];

  @Prop({ required: true })
  contactEmail: string;

  @Prop()
  notes: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
