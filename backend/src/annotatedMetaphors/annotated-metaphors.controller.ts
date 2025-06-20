// backend/src/annotatedMetaphors/annotated-metaphors.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpCode,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor }              from '@nestjs/platform-express';
import * as multer                      from 'multer';
import { Response, Request }            from 'express';
import { JwtAuthGuard }                 from '../auth/guards/jwt-auth.guard';
import { AnnotatedMetaphorsService }    from './annotated-metaphors.service';

interface JwtRequest extends Request {
  user: { _id: string;  /*…other JWT claims…*/ }
}

@Controller('projects/:projectId/documents/:docId/annotations')
@UseGuards(JwtAuthGuard)
export class AnnotatedMetaphorsController {
  constructor(private readonly svc: AnnotatedMetaphorsService) {}

  /** 1) List with filters, paging & sorting */
  @Get()
  list(
    @Param('docId') docId: string,
    @Query('status')      status?: string,
    @Query('noveltyType') noveltyType?: string,
    @Query('search')      search?: string,
    @Query('page')        page?: string,
    @Query('limit')       limit?: string,
    @Query('sortBy')      sortBy?: string,
    @Query('sortDir')     sortDir?: 'asc'|'desc',
  ) {
    console.log('[Controller:list] docId=', docId, 'page=', page);
    return this.svc.findAll(docId, {
      status,
      noveltyType,
      search,
      page: typeof page === 'string' && page.trim() !== '' ? parseInt(page, 10) : undefined,
      limit: typeof limit === 'string' && limit.trim() !== '' ? parseInt(limit, 10) : undefined,
      sortBy,
      sortDir,
    });
  }

  /** 7) Export current filter to Excel */
  @Get('export')
  async export(
    @Param('docId') docId: string,
    @Res() res: Response,
    @Query('status')      status?: string,
    @Query('noveltyType') noveltyType?: string,
    @Query('search')      search?: string,
    
  ) {
    console.log('[Controller:export] docId=', docId, 'status=', status);
    const buffer = await this.svc.exportToExcel(docId, { status, noveltyType, search });
    res
      .set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="annotations_${docId}.xlsx"`,
      })
      .send(buffer);
  }

  /** 2) Retrieve single annotation */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  /** 3) In-place edit any fields (editor only) */
  @Patch(':id')
  updateOne(
    @Param('id') id: string,
    @Body() updates: any /* ideally a DTO for partial updates */,
    @Req() req: JwtRequest,
  ) {
    return this.svc.updateOne(id, updates, req.user._id);
  }

  /** 4) Quick state-transitions */
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Req() req: JwtRequest) {
    return this.svc.updateOne(id, { status: 'approved' }, req.user._id);
  }

  @Patch(':id/to-edit')
  markAsToEdit(@Param('id') id: string, @Req() req: JwtRequest) {
    return this.svc.updateOne(id, { status: 'to_edit' }, req.user._id);
  }

  @Patch(':id/discard')
  discard(@Param('id') id: string, @Req() req: JwtRequest) {
    return this.svc.updateOne(id, { status: 'discarded' }, req.user._id);
  }

  @Patch(':id/metonymy')
  markAsMetonymy(@Param('id') id: string, @Req() req: JwtRequest) {
    return this.svc.updateOne(id, { status: 'metonymy' }, req.user._id);
  }

  /** 5) Bulk state change (editor only) */
  @Post('bulk-update')
  bulk(
    @Body('ids')     ids: string[],
    @Body('updates') updates: any,
  ) {
    console.log('[Controller:bulkImport] ids=', ids);
    return this.svc.bulkUpdate(ids, updates);
  }

  /** 6) Bulk Excel import */
  @Post('bulk-import')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (_req, file, cb) => {
      if (!/\.(xlsx|xls)$/i.test(file.originalname)) {
        return cb(new BadRequestException('Only .xlsx/.xls allowed'), false);
      }
      cb(null, true);
    },
  }))
  @HttpCode(200)
  async bulkImport(
    @Param('docId') docId: string,
    @Req()        req: JwtRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // req.user._id comes from JwtAuthGuard
    console.log('[Controller:bulkImport] user=', req.user._id, 'file.originalname=', file.originalname);
    return this.svc.bulkImportFromExcel(file, docId, req.user._id);
  }

  /** 8) Get all POS entries */
  @Get('pos/all')
  getAllPOS() {
    return this.svc.getAllPOS();
  }

  
}
