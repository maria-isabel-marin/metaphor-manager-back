import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod } from '@nestjs/common';
import mongoose from 'mongoose';
import helmet from 'helmet';
import * as compression from 'compression';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Escribir credenciales de Google Cloud a un archivo temporal si la variable existe
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const dir = os.tmpdir();
  const filePath = path.join(dir, 'google-credentials.json');
  fs.writeFileSync(filePath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = filePath;
}

// Solo habilitar debug en desarrollo
if (process.env.NODE_ENV !== 'production') {
  mongoose.set('debug', true);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de seguridad y optimización
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Helmet para headers de seguridad (siempre activo)
  app.use(helmet());
  
  // Compresión (solo en producción para no afectar desarrollo)
  if (isProduction) {
    app.use(compression());
  }

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
