// File: src/domains/domains.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DomainsService } from './domains.service';
import { DomainsController } from './domains.controller';
import { Domain, DomainSchema } from './schemas/domain.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Domain.name, schema: DomainSchema }]),
  ],
  controllers: [DomainsController],
  providers: [DomainsService],
  exports: [DomainsService],
})
export class DomainsModule {}
