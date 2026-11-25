import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import express from 'express';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Inventaris Lab Robotik API')
    .setDescription(
      'Dokumentasi REST API & Interactive Test Client untuk Sistem Penyimpanan Barang Lab Robotik (Divisi AUV, ROV, KRSTI, KKI).',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Masukkan accessToken hasil dari POST /auth/login',
      },
      'jwt',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Scalar API Reference (Modern UI + Interactive Test Client) di /docs
  app.use(
    '/docs',
    apiReference({
      content: document,
      theme: 'kepler',
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
