import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UsersService } from '../users/users.service';
import { User, UserDocument } from '../users/schemas/user.schema';

interface UserWithId {
  _id: Types.ObjectId;
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    private readonly usersService: UsersService,
  ) {}

  /** Crea un proyecto vinculando owner y reviewers como ObjectId */
  async create(dto: CreateProjectDto & { owner: string }): Promise<Project> {
    // Buscar los usuarios por email para los reviewers
    let reviewerIds: Types.ObjectId[] = [];
    if (dto.reviewerEmails?.length) {
      const reviewers = await Promise.all(
        dto.reviewerEmails.map(async email => {
          const user = await this.usersService.findByEmail(email);
          if (!user) throw new NotFoundException(`User with email ${email} not found`);
          return user;
        })
      ) as UserWithId[];
      reviewerIds = reviewers.map(user => user._id);
    }

    const created = new this.projectModel({
      ...dto,
      owner: new Types.ObjectId(dto.owner),
      reviewers: reviewerIds,
    });
    return created.save();
  }

  /** Lista proyectos donde el usuario es owner o reviewer */
  async findAll(userId: string): Promise<{ owned: Project[], reviewing: Project[] }> {
    const userObjectId = new Types.ObjectId(userId);
    
    const [owned, reviewing] = await Promise.all([
      this.projectModel.find({ owner: userObjectId })
        .populate('owner', 'email name')
        .populate('reviewers', 'email name')
        .exec(),
      this.projectModel.find({ reviewers: userObjectId })
        .populate('owner', 'email name')
        .populate('reviewers', 'email name')
        .exec()
    ]);

    return { owned, reviewing };
  }

  /** Busca un proyecto por ID, lanza 404 si no existe */
  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel
      .findById(id)
      .populate('owner', 'email name')
      .populate('reviewers', 'email name')
      .exec();
      
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
    const updateData: any = { ...dto };

    // Si hay emails de reviewers, convertirlos a IDs
    if (dto.reviewerEmails?.length) {
      const reviewers = await Promise.all(
        dto.reviewerEmails.map(async email => {
          const user = await this.usersService.findByEmail(email);
          if (!user) throw new NotFoundException(`User with email ${email} not found`);
          return user;
        })
      ) as UserWithId[];
      updateData.reviewers = reviewers.map(user => user._id);
    }

    const updated = await this.projectModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('owner', 'email name')
      .populate('reviewers', 'email name')
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
