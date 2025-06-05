import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { DocumentsModule } from './documents/documents.module';
import { AnnotatedMetaphorsModule } from './annotatedMetaphors/annotated-metaphors.module';
import { DomainsModule } from './domains/domains.module';
import { DomainRelationsModule } from './domainRelations/domain-relations.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    UsersModule,
    ProjectsModule,
    DocumentsModule,
    AnnotatedMetaphorsModule,
    DomainsModule,
    DomainRelationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
