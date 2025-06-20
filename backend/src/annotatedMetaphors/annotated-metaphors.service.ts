// File: src/annotatedMetaphors/annotated-metaphors.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AnnotatedMetaphor, AnnotatedMetaphorDocument } from './schemas/annotated-metaphor.schema';
import { CreateAnnotatedMetaphorDto } from './dto/create-annotated-metaphor.dto';
import { UpdateAnnotatedMetaphorDto } from './dto/update-annotated-metaphor.dto';
import * as ExcelJS from 'exceljs';
import { DomainsService } from '../domains/domains.service';
import { POSService } from './pos.service';

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
    private readonly domainsService: DomainsService,
    private readonly posService: POSService,
  ) { }

  async bulkImportFromExcel(
    file: Express.Multer.File,
    documentId: string,
    createdBy: string,
  ): Promise<any> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);
    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      throw new BadRequestException('No worksheet found in the Excel file.');
    }

    const headers = worksheet.getRow(1).values as string[];
    // Normalize headers: trim, remove spaces, and lowercase
    const normalizedHeaders = headers.map(h => h ? h.trim().replace(/\s/g, '').toLowerCase() : '');
    
    const requiredFields = ['customid', 'expression', 'conceptualmetaphor', 'sourcedomain', 'targetdomain'];
    for (const field of requiredFields) {
      if (!normalizedHeaders.includes(field)) {
        throw new BadRequestException(`Missing required column in Excel file: ${field}`);
      }
    }

    const metaphorsToCreate: any[] = [];
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const rowData: { [key: string]: any } = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = normalizedHeaders[colNumber];
        if (header) {
          rowData[header] = cell.value?.toString() || '';
        }
      });
      rowData.rowNum = i; // Keep track of original row number
      metaphorsToCreate.push(rowData);
    }
    
    const results = {
      created: [] as AnnotatedMetaphorDocument[],
      errors: [] as { row: number, customId: string, error: string }[],
    };

    for (const data of metaphorsToCreate) {
      try {
        const sourceDomain = await this.domainsService.findOrCreate(data.sourcedomain, 'source');
        const targetDomain = await this.domainsService.findOrCreate(data.targetdomain, 'target');
        
        const metaphorData: any = {
          documentId: new Types.ObjectId(documentId),
          createdBy: new Types.ObjectId(createdBy),
          customId: data.customid,
          expression: data.expression,
          conceptualMetaphor: data.conceptualmetaphor,
          sourceDomain: sourceDomain._id,
          targetDomain: targetDomain._id,
          status: 'under_review',
        };
        
        if (data.pos) {
          const pos = await this.posService.findOrCreate(data.pos);
          metaphorData.pos = pos._id;
        }
        if (data.order) metaphorData.order = String(data.order);
        if (data.page) metaphorData.page = String(data.page);
        if (data.section) metaphorData.section = data.section;
        if (data.subsection) metaphorData.subsection = data.subsection;
        if (data.subsection3) metaphorData.subsection3 = data.subsection3;
        if (data.subsection4) metaphorData.subsection4 = data.subsection4;
        if (data.subsection5) metaphorData.subsection5 = data.subsection5;
        if (data.triggerword) metaphorData.triggerWord = data.triggerword;
        if (data.triggerwordloc) metaphorData.triggerWordLoc = data.triggerwordloc;
        if (data.lemma) metaphorData.lemma = data.lemma;
        if (data.context) metaphorData.context = data.context;
        if (data.literalmeaning) metaphorData.literalMeaning = data.literalmeaning;
        if (data.contextualmeaning) metaphorData.contextualMeaning = data.contextualmeaning;
        if (data.ontologicalmappings) metaphorData.ontologicalMappings = data.ontologicalmappings.split(';');
        if (data.epistemicmappings) metaphorData.epistemicMappings = data.epistemicmappings.split(';');
        if (data.noveltytype) metaphorData.noveltyType = data.noveltytype;
        if (data.functiontype) metaphorData.functionType = data.functiontype;
        if (data.comments) metaphorData.comments = data.comments.split(';');
        
        const created = await this.metaphorModel.create(metaphorData);
        results.created.push(created);

      } catch (error: any) {
        let errorMessage = 'Unknown error';
        if (error.code === 11000) {
          errorMessage = `Duplicate key error. The customId '${data.customid}' likely already exists.`;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        results.errors.push({ row: data.rowNum, customId: data.customid || 'N/A', error: errorMessage });
      }
    }

    return results;
  }

  async findByDocument(documentId: string): Promise<AnnotatedMetaphor[]> {
    return this.metaphorModel
      .find({ documentId: new Types.ObjectId(documentId) })
      .sort({ createdAt: 1 })
      .populate('sourceDomain', 'name')
      .populate('targetDomain', 'name')
      .populate('pos', 'name')
      .lean()
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
    .populate('pos', 'name')
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
    userId: string
  ) {
    // Get the current state
    const current = await this.metaphorModel.findById(id).exec();
    if (!current) throw new NotFoundException(`AnnotatedMetaphor ${id} not found`);

    // Track changes
    const changes: Record<string, { before: any; after: any }> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'updates') continue; // Skip the updates field itself
      if (JSON.stringify(current[key]) !== JSON.stringify(value)) {
        changes[key] = {
          before: current[key],
          after: value
        };
      }
    }

    // If there are changes, add to updates array
    if (Object.keys(changes).length > 0) {
      const update = {
        metadata: {
          timestamp: new Date(),
          user: userId
        },
        changes
      };

      updates['$push'] = { updates: update };
    }

    const updated = await this.metaphorModel
      .findByIdAndUpdate(id, updates, { new: true })
      .exec();
    
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
