import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActionLog, ActionLogSchema } from './schemas/action-log.schema';
import { ActionLogService } from './services/action-log.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActionLog.name, schema: ActionLogSchema },
    ]),
  ],
  providers: [ActionLogService],
  exports: [ActionLogService],
})
export class CommonModule {}
