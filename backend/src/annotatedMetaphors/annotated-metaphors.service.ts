// File: src/annotatedMetaphors/annotated-metaphors.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AnnotatedMetaphor, AnnotatedMetaphorDocument } from './schemas/annotated-metaphor.schema';
import { CreateAnnotatedMetaphorDto } from './dto/create-annotated-metaphor.dto';
import { UpdateAnnotatedMetaphorDto } from './dto/update-annotated-metaphor.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class AnnotatedMetaphorsService {
  constructor(
    @InjectModel(AnnotatedMetaphor.name)
    private readonly metaphorModel: Model<AnnotatedMetaphorDocument>,
  ) {}

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

  async exportToExcel(documentId: string): Promise<Buffer> {
    const metaphors = await this.findByDocument(documentId);
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('Metaphors');
    // Cabeceras
    sheet.columns = [
      { header: 'Custom ID', key: 'customId', width: 15 },
      { header: 'Expression', key: 'expression', width: 30 },
      { header: 'Trigger Word', key: 'triggerWord', width: 20 },
      { header: 'Lemma', key: 'lemma', width: 15 },
      { header: 'Novelty Type', key: 'noveltyType', width: 15 },
      { header: 'Function Type', key: 'functionType', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      // … agrega más columnas según necesidad
    ];
    // Filas
    metaphors.forEach((m) => {
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
    const arrayBuffer = await wb.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }
}
