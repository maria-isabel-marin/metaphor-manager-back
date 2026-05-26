// File: src/app.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

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

    // 2) Rate limiting - más permisivo en desarrollo
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get('NODE_ENV') === 'production';
        return [
          {
            ttl: isProduction ? 60000 : 1000, // 1 min en prod, 1 seg en dev
            limit: isProduction ? 100 : 1000, // 100 requests/min en prod, 1000 en dev
          },
        ];
      },
    }),

    // 3) Conecta a Mongo usando async factory que lee ConfigService
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

    // 4) El resto de módulos de tu app
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
