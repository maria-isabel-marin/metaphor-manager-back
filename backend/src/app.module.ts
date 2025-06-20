// File: src/app.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { DocumentsModule } from './documents/documents.module';
import { AnnotatedMetaphorsModule } from './annotatedMetaphors/annotated-metaphors.module';
import { DomainsModule } from './domains/domains.module';
import { DomainRelationsModule } from './domainRelations/domain-relations.module';
import { CommonModule } from './common/common.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 1) Carga .env antes de cualquier otra cosa
    ConfigModule.forRoot({ isGlobal: true }),

    // 2) Conecta a Mongo usando async factory que lee ConfigService
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // importar el módulo global de config
      inject: [ConfigService], // inyectar ConfigService
      useFactory: (cfg: ConfigService): MongooseModuleOptions => {
        const uri = cfg.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error('Environment variable MONGODB_URI must be set');
        }
        return { uri };
      },
    }),

    // 3) El resto de módulos de tu app
    CommonModule,
    UsersModule,
    AuthModule,
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
