import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActionLogDocument = ActionLog & Document;

export enum ActionType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum EntityType {
  PROJECT = 'PROJECT',
  DOCUMENT = 'DOCUMENT',
  ANNOTATION = 'ANNOTATION',
}

@Schema({ timestamps: true })
export class ActionLog {
  @Prop({ required: true, type: String, enum: ActionType })
  action: ActionType;

  @Prop({ required: true, type: String, enum: EntityType })
  entityType: EntityType;

  @Prop({ required: true, type: Types.ObjectId })
  entityId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ type: Object })
  details?: Record<string, any>;
}

export const ActionLogSchema = SchemaFactory.createForClass(ActionLog);
