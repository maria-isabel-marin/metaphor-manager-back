import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UsersService } from '../users/users.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ActionLogService } from '../common/services/action-log.service';
import { ActionType, EntityType } from '../common/schemas/action-log.schema';

interface UserWithId {
  _id: Types.ObjectId;
}

interface RequestUser {
  _id: string;
  email: string;
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    private readonly usersService: UsersService,
    private readonly actionLogService: ActionLogService,
  ) {}

  /** Crea un proyecto vinculando owner y reviewers como ObjectId */
  async create(dto: CreateProjectDto & { owner: string }, user: RequestUser): Promise<Project> {
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

    const created = await new this.projectModel({
      ...dto,
      owner: new Types.ObjectId(dto.owner),
      reviewers: reviewerIds,
    }).save();

    // Log the create action
    await this.actionLogService.logAction({
      action: ActionType.CREATE,
      entityType: EntityType.PROJECT,
      entityId: (created._id as Types.ObjectId).toString(),
      userId: user._id,
      userEmail: user.email,
      details: { name: created.name },
    });

    return created;
  }

  /** Lista proyectos donde el usuario es owner o reviewer */
  async findAll(userId: string, user: RequestUser): Promise<{ owned: Project[], reviewing: Project[] }> {
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

    // Log the read action for each project
    await Promise.all([
      ...owned.map(project => 
        this.actionLogService.logAction({
          action: ActionType.READ,
          entityType: EntityType.PROJECT,
          entityId: (project._id as Types.ObjectId).toString(),
          userId: user._id,
          userEmail: user.email,
          details: { name: project.name, as: 'owner' },
        })
      ),
      ...reviewing.map(project =>
        this.actionLogService.logAction({
          action: ActionType.READ,
          entityType: EntityType.PROJECT,
          entityId: (project._id as Types.ObjectId).toString(),
          userId: user._id,
          userEmail: user.email,
          details: { name: project.name, as: 'reviewer' },
        })
      )
    ]);

    return { owned, reviewing };
  }

  /** Busca un proyecto por ID, lanza 404 si no existe */
  async findOne(id: string, user: RequestUser): Promise<Project> {
    const project = await this.projectModel
      .findById(id)
      .populate('owner', 'email name')
      .populate('reviewers', 'email name')
      .exec();
      
    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    // Log the read action
    await this.actionLogService.logAction({
      action: ActionType.READ,
      entityType: EntityType.PROJECT,
      entityId: (project._id as Types.ObjectId).toString(),
      userId: user._id,
      userEmail: user.email,
      details: { name: project.name },
    });

    return project;
  }

  /** Actualiza un proyecto por ID, lanza 404 si no existe */
  async update(
    id: string,
    dto: UpdateProjectDto,
    user: RequestUser,
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

    // Log the update action
    await this.actionLogService.logAction({
      action: ActionType.UPDATE,
      entityType: EntityType.PROJECT,
      entityId: (updated._id as Types.ObjectId).toString(),
      userId: user._id,
      userEmail: user.email,
      details: { name: updated.name, changes: dto },
    });

    return updated;
  }

  /** Elimina un proyecto por ID */
  async remove(id: string, user: RequestUser): Promise<void> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    // Log the delete action before deleting
    await this.actionLogService.logAction({
      action: ActionType.DELETE,
      entityType: EntityType.PROJECT,
      entityId: (project._id as Types.ObjectId).toString(),
      userId: user._id,
      userEmail: user.email,
      details: { name: project.name },
    });

    await project.deleteOne();
  }
}
