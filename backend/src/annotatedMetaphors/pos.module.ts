import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { POS, POSSchema } from './schemas/pos.schema';
import { POSService } from './pos.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: POS.name, schema: POSSchema }])],
  providers: [POSService],
  exports: [POSService],
})
export class PosModule {} 