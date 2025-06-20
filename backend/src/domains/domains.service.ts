// File: src/domains/domains.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Domain, DomainDocument } from './schemas/domain.schema';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';

@Injectable()
export class DomainsService {
  constructor(
    @InjectModel(Domain.name)
    private readonly domainModel: Model<DomainDocument>,
  ) {}

  async findOrCreate(
    name: string,
    type: 'source' | 'target',
  ): Promise<{ domain: DomainDocument; isNew: boolean }> {
    const filter = { name, type };
    const existing = await this.domainModel.findOne(filter).exec();
    if (existing) return { domain: existing, isNew: false };
    try {
      const created = new this.domainModel(filter);
      const saved = await created.save();
      return { domain: saved, isNew: true };
    } catch (e: any) {
      // In case of unique conflict (race), re-fetch
      if (e.code === 11000) {
        const refetched = await this.domainModel.findOne(filter).exec();
        return { domain: refetched!, isNew: false };
      }
      throw e;
    }
  }

  async create(dto: CreateDomainDto): Promise<Domain> {
    const created = new this.domainModel(dto);
    return created.save();
  }

  async findAll(): Promise<Domain[]> {
    return this.domainModel.find().exec();
  }

  async findOne(id: string): Promise<Domain> {
    const domain = await this.domainModel.findById(id).exec();
    if (!domain) {
      throw new NotFoundException(`Domain with id ${id} not found`);
    }
    return domain;
  }

  async update(id: string, dto: UpdateDomainDto): Promise<Domain> {
    const updated = await this.domainModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Domain with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.domainModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Domain with id ${id} not found`);
    }
  }
}
