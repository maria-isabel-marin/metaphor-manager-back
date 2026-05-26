// File: src/domainRelations/domain-relations.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DomainRelation,
  DomainRelationDocument,
} from './schemas/domain-relation.schema';
import { CreateDomainRelationDto } from './dto/create-domain-relation.dto';
import { UpdateDomainRelationDto } from './dto/update-domain-relation.dto';

@Injectable()
export class DomainRelationsService {
  constructor(
    @InjectModel(DomainRelation.name)
    private readonly relationModel: Model<DomainRelationDocument>,
  ) {}

  async create(dto: CreateDomainRelationDto): Promise<DomainRelation> {
    const created = new this.relationModel(dto);
    return created.save();
  }

  async findAll(): Promise<DomainRelation[]> {
    return this.relationModel.find().exec();
  }

  async findOne(id: string): Promise<DomainRelation> {
    const rel = await this.relationModel.findById(id).exec();
    if (!rel) {
      throw new NotFoundException(`Relation ${id} not found`);
    }
    return rel;
  }

  async update(
    id: string,
    dto: UpdateDomainRelationDto,
  ): Promise<DomainRelation> {
    const updated = await this.relationModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Relation ${id} not found`);
    }

    return updated;
  }

  async deactivate(id: string): Promise<DomainRelation> {
    const updated = await this.relationModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Relation ${id} not found`);
    }

    return updated;
  }

  async activate(id: string): Promise<DomainRelation> {
    const updated = await this.relationModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Relation ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.relationModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Relation ${id} not found`);
    }
  }

  async bulkUpdate(
    ids: string[],
    dto: UpdateDomainRelationDto,
  ): Promise<DomainRelation[]> {
    await this.relationModel.updateMany(
      { _id: { $in: ids } },
      { $set: dto },
    );

    return this.relationModel.find({ _id: { $in: ids } }).exec();
  }

  async bulkDeactivate(ids: string[]): Promise<DomainRelation[]> {
    await this.relationModel.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive: false } },
    );

    return this.relationModel.find({ _id: { $in: ids } }).exec();
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await this.relationModel.deleteMany({ _id: { $in: ids } }).exec();
  }
}
