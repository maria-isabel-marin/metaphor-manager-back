import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('projects/:projectId/documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.service.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'filePdf', maxCount: 1 },
      { name: 'fileTxt', maxCount: 1 },
    ]),
  )
  create(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Body() dto: CreateDocumentDto,
    @UploadedFiles() files: {
      filePdf?: Express.Multer.File[];
      fileTxt?: Express.Multer.File[];
    },
  ) {
    const pdf = files.filePdf?.[0]?.path || '';
    const txt = files.fileTxt?.[0]?.path || '';
    return this.service.create({
      ...dto,
      projectId,
      filePdf: pdf,
      fileTxt: txt,
      owner: req.user._id,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
