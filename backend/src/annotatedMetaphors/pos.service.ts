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

  async findOrCreate(name: string): Promise<{ pos: POSDocument; isNew: boolean }> {
    let pos = await this.posModel.findOne({ name }).exec();
    if (pos) return { pos, isNew: false };
    try {
      pos = new this.posModel({ name });
      const saved = await pos.save();
      return { pos: saved, isNew: true };
    } catch (e: any) {
      if (e.code === 11000) {
        const refetched = await this.posModel.findOne({ name }).exec();
        return { pos: refetched!, isNew: false };
      }
      throw e;
    }
  }

  async findAll(): Promise<POSDocument[]> {
    return await this.posModel.find().sort({ name: 1 }).exec();
  }
}
