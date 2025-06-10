// File: src/documents/documents.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DocumentModel, DocumentDocument } from './schemas/document.schema';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentModel.name)
    private readonly documentModel: Model<DocumentDocument>,
  ) {}

  async create(dto: CreateDocumentDto): Promise<DocumentModel> {
    const created = new this.documentModel(dto);
    return created.save();
  }

  async findAll(): Promise<DocumentModel[]> {
    return this.documentModel.find().exec();
  }

  async findByProject(projectId: string): Promise<DocumentModel[]> {
    return this.documentModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .exec();
  }

  async findOne(id: string): Promise<DocumentModel> {
    const doc = await this.documentModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }
    return doc;
  }

  async update(
    id: string,
    dto: UpdateDocumentDto,
  ): Promise<DocumentModel> {
    const updated = await this.documentModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.documentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }
  }
}
