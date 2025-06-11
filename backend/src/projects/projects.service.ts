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

  /** Crea un proyecto vinculando owner como ObjectId */
  async create(dto: CreateProjectDto & { owner: string }): Promise<Project> {
    const created = new this.projectModel({
      ...dto,
      owner: new Types.ObjectId(dto.owner),
    });
    return created.save();
  }

  /** Lista proyectos filtrados por owner */
  async findAll(ownerId: string): Promise<Project[]> {
    const ownerObjectId = new Types.ObjectId(ownerId);
    return this.projectModel.find({ owner: ownerObjectId }).exec();
  }

  /** Busca un proyecto por ID, lanza 404 si no existe */
  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }
    return project;
  }

  /** Actualiza un proyecto por ID, lanza 404 si no existe */
  async update(
    id: string,
    dto: UpdateProjectDto,
  ): Promise<Project> {
    const updated = await this.projectModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }
    return updated;
  }

  /** Elimina un proyecto por ID */
  async remove(id: string): Promise<void> {
    const result = await this.projectModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }
  }
}
