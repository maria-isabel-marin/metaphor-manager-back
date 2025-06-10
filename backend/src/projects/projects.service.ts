// File: src/projects/projects.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const created = new this.projectModel({
      ...dto,
      owner: new Types.ObjectId(dto.owner),
    });
    return created.save();
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel.find().exec();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }
    return project;
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
  ): Promise<Project> {
    if (dto.owner) {
      dto.owner = new Types.ObjectId(dto.owner) as any;
    }
    const updated = await this.projectModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }
  }
}
