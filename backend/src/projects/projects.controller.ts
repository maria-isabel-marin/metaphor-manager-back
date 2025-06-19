import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard) // Protege todas las rutas con JWT
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  /** Crea un proyecto, inyectando el owner desde el JWT */
  @Post()
  async create(@Req() req: any, @Body() dto: CreateProjectDto) {
    const ownerId = req.user._id.toString();
    return this.service.create({ ...dto, owner: ownerId }, {
      _id: ownerId,
      email: req.user.email,
    });
  }

  /** Lista los proyectos donde el usuario es owner o reviewer */
  @Get()
  async findAll(@Req() req: any) {
    const userId = req.user._id.toString();
    console.log(`Fetching projects for user: ${userId}`);
    if (!userId) {
      throw new NotFoundException('User not found in request');
    }
    return this.service.findAll(userId, {
      _id: userId,
      email: req.user.email,
    });
  }

  /** Obtiene un proyecto por ID, si es propietario o reviewer */
  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const project = await this.service.findOne(id, {
      _id: req.user._id.toString(),
      email: req.user.email,
    });
    const userId = req.user._id.toString();
    
    if (project.owner.toString() !== userId && 
        !project.reviewers?.some(reviewer => reviewer.toString() === userId)) {
      throw new ForbiddenException('You do not have access to this project');
    }
    return project;
  }

  /** Actualiza un proyecto existente, solo si es propietario */
  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const project = await this.service.findOne(id, {
      _id: req.user._id.toString(),
      email: req.user.email,
    });
    if (project.owner._id.toString() !== req.user._id.toString()) {
      throw new ForbiddenException('You cannot edit this project');
    }
    return this.service.update(id, dto, {
      _id: req.user._id.toString(),
      email: req.user.email,
    });
  }

  /** Elimina un proyecto, solo si es propietario */
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const project = await this.service.findOne(id, {
      _id: req.user._id.toString(),
      email: req.user.email,
    });
    if (project.owner._id.toString() !== req.user._id.toString()) {
      throw new ForbiddenException('You cannot delete this project');
    }
    await this.service.remove(id, {
      _id: req.user._id.toString(),
      email: req.user.email,
    });
    return { success: true };
  }
}
