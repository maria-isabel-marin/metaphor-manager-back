import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod } from '@nestjs/common';
import mongoose from 'mongoose';

mongoose.set('debug', true);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS desde variable de entorno
  const corsOrigin = process.env.CORS || 'http://localhost:3001';
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.setGlobalPrefix('api', {
    exclude: [{ path: 'auth/(.*)', method: RequestMethod.ALL }],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
