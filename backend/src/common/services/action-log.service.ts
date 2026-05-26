import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ActionLog,
  ActionLogDocument,
  ActionType,
  EntityType,
} from '../schemas/action-log.schema';

interface LogActionParams {
  action: ActionType;
  entityType: EntityType;
  entityId: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  userEmail: string;
  details?: Record<string, any>;
}

@Injectable()
export class ActionLogService {
  constructor(
    @InjectModel(ActionLog.name)
    private actionLogModel: Model<ActionLogDocument>,
  ) {}

  async logAction({
    action,
    entityType,
    entityId,
    userId,
    userEmail,
    details,
  }: LogActionParams): Promise<ActionLog> {
    const log = new this.actionLogModel({
      action,
      entityType,
      entityId: new Types.ObjectId(entityId),
      userId: new Types.ObjectId(userId),
      userEmail,
      details,
    });

    return log.save();
  }

  async getEntityLogs(
    entityType: EntityType,
    entityId: string,
  ): Promise<ActionLog[]> {
    return this.actionLogModel
      .find({
        entityType,
        entityId: new Types.ObjectId(entityId),
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getUserLogs(userId: string): Promise<ActionLog[]> {
    return this.actionLogModel
      .find({
        userId: new Types.ObjectId(userId),
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}
