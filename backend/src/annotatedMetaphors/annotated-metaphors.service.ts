// File: src/annotatedMetaphors/annotated-metaphors.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AnnotatedMetaphor, AnnotatedMetaphorDocument } from './schemas/annotated-metaphor.schema';
import { CreateAnnotatedMetaphorDto } from './dto/create-annotated-metaphor.dto';
import { UpdateAnnotatedMetaphorDto } from './dto/update-annotated-metaphor.dto';
import * as ExcelJS from 'exceljs';

export interface ExportOptions {
  status?: string;
  noveltyType?: string;
  search?: string;
}

@Injectable()
export class AnnotatedMetaphorsService {
  constructor(
    @InjectModel(AnnotatedMetaphor.name)
    private readonly metaphorModel: Model<AnnotatedMetaphorDocument>,
  ) { }

  async bulkImportFromExcel(
    file: Express.Multer.File,
    createdBy: string,
  ): Promise<AnnotatedMetaphor[]> {
    // Aquí usarías exceljs o similar para parsear file.buffer
    // y luego mapear cada fila a CreateAnnotatedMetaphorDto,
    // asignar createdBy y status='under_review', y hacer insertMany.
    throw new Error('bulkImportFromExcel not implemented');
  }

  async findByDocument(documentId: string): Promise<AnnotatedMetaphor[]> {
    return this.metaphorModel
      .find({ documentId: new Types.ObjectId(documentId) })
      .sort({ createdAt: 1 })
      .exec();
  }

  async findOne(id: string): Promise<AnnotatedMetaphor> {
    const doc = await this.metaphorModel.findById(id).exec();
    if (!doc) throw new NotFoundException(`Metaphor ${id} not found`);
    return doc;
  }

  async update(
    id: string,
    dto: UpdateAnnotatedMetaphorDto,
  ): Promise<AnnotatedMetaphor> {
    const updated = await this.metaphorModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Metaphor ${id} not found`);
    return updated;
  }

  async changeStatus(
    id: string,
    status:
      | 'approved'
      | 'to_edit'
      | 'discarded'
      | 'metonymy',
  ): Promise<AnnotatedMetaphor> {
    const updated = await this.metaphorModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Metaphor ${id} not found`);
    return updated;
  }

  async approve(id: string): Promise<AnnotatedMetaphor> {
    return this.changeStatus(id, 'approved');
  }

  async markAsToEdit(id: string): Promise<AnnotatedMetaphor> {
    return this.changeStatus(id, 'to_edit');
  }

  async discard(id: string): Promise<AnnotatedMetaphor> {
    return this.changeStatus(id, 'discarded');
  }

  async markAsMetonymy(id: string): Promise<AnnotatedMetaphor> {
    return this.changeStatus(id, 'metonymy');
  }

  async exportToExcel(
    documentId: string,
    options: ExportOptions = {}
  ): Promise<Buffer> {
    // Fetch all matching rows (no pagination)
    const { data: metaphors } = await this.findAll(documentId, {
      status: options.status,
      noveltyType: options.noveltyType,
      search: options.search,
      page: undefined,
      limit: undefined,
    });

    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('Metaphors');

    // Headers
    sheet.columns = [
      { header: 'Custom ID', key: 'customId', width: 20 },
      { header: 'Expression', key: 'expression', width: 40 },
      { header: 'Trigger Word', key: 'triggerWord', width: 20 },
      { header: 'Lemma', key: 'lemma', width: 20 },
      { header: 'Novelty Type', key: 'noveltyType', width: 20 },
      { header: 'Function Type', key: 'functionType', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      // …add more as needed
    ];

    // Rows
    metaphors.forEach(m => {
      sheet.addRow({
        customId: m.customId,
        expression: m.expression,
        triggerWord: m.triggerWord,
        lemma: m.lemma,
        noveltyType: m.noveltyType,
        functionType: m.functionType,
        status: m.status,
      });
    });

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /** list + paging/filter/sort */
  async findAll(
    documentId: string,
    filter: {
      status?: string;
      noveltyType?: string;
      search?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortDir?: 'asc' | 'desc';
    },
  ) {
    console.log('[Service:findAll] documentId=', documentId, 'filter=', filter);
    const q: any = { documentId: new Types.ObjectId(documentId) };
    if (filter.status) q.status = filter.status;
    if (filter.noveltyType) q.noveltyType = filter.noveltyType;
    if (filter.search) {
      const re = new RegExp(filter.search, 'i');
      q.$or = [
        { expression: re },
        { customId: re },
        { triggerWord: re },
        { contextualMeaning: re },
      ];
    }

    const page = filter.page || 1;
    const limit = filter.limit || 25;
    const sort: any = {};
    if (filter.sortBy) sort[filter.sortBy] = filter.sortDir === 'desc' ? -1 : 1;

    const [data, total] = await Promise.all([
  this.metaphorModel
    .find(q)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('sourceDomain', 'name')  // only bring back the `name` field
    .populate('targetDomain', 'name')
    .lean()
    .exec(),
  this.metaphorModel.countDocuments(q).exec(),
]);

    return { data, total, page, limit };
  }

  /** update one (in-place edits) */
  async updateOne(
    id: string,
    updates: Partial<Omit<AnnotatedMetaphor, 'createdBy' | 'documentId'>>,
  ) {
    const updated = await this.metaphorModel
      .findByIdAndUpdate(id, updates, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`AnnotatedMetaphor ${id} not found`);
    return updated;
  }

  /** bulk state change */
  async bulkUpdate(
    ids: string[],
    updates: { status?: string; comments?: string[] },
  ) {
    const res = await this.metaphorModel.updateMany(
      { _id: { $in: ids.map(id => new Types.ObjectId(id)) } },
      { $set: updates },
    );
    return {
      matched: res.matchedCount ?? 0,
      modified: res.modifiedCount ?? 0,
    };
  }

}
