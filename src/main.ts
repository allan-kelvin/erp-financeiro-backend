import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: 'http://localhost:4200', // Permita apenas a origem do seu frontend Angular
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos HTTP permitidos
    credentials: true, // Permite o envio de cookies de autenticação, se houver
  });

  // Configurar pipes de validação globais (já deve estar no seu código)
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Transforma automaticamente os payloads para as classes DTO
    whitelist: true, // Remove propriedades que não estão definidas nos DTOs
    forbidNonWhitelisted: true, // Lança um erro se propriedades não permitidas forem enviadas
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
