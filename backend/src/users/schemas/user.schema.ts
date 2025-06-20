import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  // Campo opcional para asociar la cuenta de Google
  @Prop({ unique: true, sparse: true })
  googleId?: string;

  // URL del avatar proporcionado por Google (opcional)
  @Prop()
  avatar?: string;

  @Prop({ required: true, enum: ['editor', 'reviewer'] })
  role: 'editor' | 'reviewer';

  @Prop({ type: Object, default: {} })
  columnPreferences: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);
