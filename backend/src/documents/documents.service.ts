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
    private readonly docModel: Model<DocumentDocument>,
  ) {}

  // 1) List all docs under a project
  async findAll(projectId: string): Promise<DocumentModel[]> {
    return this.docModel.find({ projectId }).exec();
  }

  // 2) Get one doc by its ID
  async findOne(id: string): Promise<DocumentModel> {
    const doc = await this.docModel.findById(id).exec();
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
    return doc;
  }

  // 3) Create a new doc under project
  async create(data: CreateDocumentDto & {
    projectId: string;
    filePdf: string;
    fileTxt: string;
    owner: string;
  }): Promise<DocumentModel> {
    const created = new this.docModel({
      ...data,
      projectId: new Types.ObjectId(data.projectId),
      createdBy: new Types.ObjectId(data.owner),
    });
    return created.save();
  }

  // 4) Update an existing doc
  async update(id: string, dto: UpdateDocumentDto): Promise<DocumentModel> {
    const updated = await this.docModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Document ${id} not found`);
    return updated;
  }

  // 5) Delete a document
  async remove(id: string): Promise<void> {
    const res = await this.docModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException(`Document ${id} not found`);
  }
}
