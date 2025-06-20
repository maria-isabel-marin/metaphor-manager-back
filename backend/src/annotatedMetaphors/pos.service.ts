import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { POS, POSDocument } from './schemas/pos.schema';

@Injectable()
export class POSService {
  constructor(
    @InjectModel(POS.name)
    private readonly posModel: Model<POSDocument>,
  ) {}

  async findOrCreate(name: string): Promise<POSDocument> {
    let pos = await this.posModel.findOne({ name }).exec();
    if (pos) return pos;
    try {
      pos = new this.posModel({ name });
      return await pos.save();
    } catch (e: any) {
      if (e.code === 11000) {
        return (await this.posModel.findOne({ name }).exec())!;
      }
      throw e;
    }
  }

  async findAll(): Promise<POSDocument[]> {
    return await this.posModel.find().sort({ name: 1 }).exec();
  }
} 