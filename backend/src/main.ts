import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para tu frontend
  app.enableCors({
    origin: 'http://localhost:3001',  // o ['http://localhost:3001'] si quieres más de un origen
    credentials: true,
  })

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
