import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import express from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // CORS Configuration
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || [];
  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // OpenAPI / Scalar Configuration
  const config = new DocumentBuilder()
    .setTitle('Alfred Notification Service')
    .setDescription('The Notification Service API description')
    .setVersion('1.0')
    .addTag('templates')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    jsonDocumentUrl: '/swagger/swagger-json',
  });

  app.use(
    '/docs',
    apiReference({
      theme: 'purple',
      url: '/swagger/swagger-json',
    }),
  );

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.init();

  const httpPort = process.env.PORT || 8300;
  http.createServer(server).listen(httpPort);
  logger.log(`HTTP Server running on port ${httpPort}`);

  const mtlsEnabled = process.env.MTLS_ENABLED === 'true';
  if (mtlsEnabled) {
    const httpsPort = process.env.MTLS_HTTPS_PORT || 8301;
    const serverCertPath = process.env.MTLS_SERVER_CERT_PATH;
    const serverKeyPath = process.env.MTLS_SERVER_KEY_PATH; // If using separated key/cert
    const caCertPath = process.env.MTLS_CA_CERT_PATH;

    // Handle PFX or Key/Cert pair implementation
    const httpsOptions: https.ServerOptions = {
      requestCert: true,
      rejectUnauthorized: true,
    };

    try {
      if (serverCertPath && serverCertPath.endsWith('.pfx')) {
        httpsOptions.pfx = fs.readFileSync(serverCertPath);
        httpsOptions.passphrase = process.env.MTLS_SERVER_CERT_PASSWORD;
      } else if (serverCertPath && serverKeyPath) {
        httpsOptions.cert = fs.readFileSync(serverCertPath);
        httpsOptions.key = fs.readFileSync(serverKeyPath);
      } else {
        throw new Error('Missing Certificate Configuration');
      }

      if (caCertPath) {
        httpsOptions.ca = fs.readFileSync(caCertPath);
      }

      https.createServer(httpsOptions, server).listen(httpsPort);
      logger.log(`mTLS HTTPS Server running on port ${httpsPort}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to start mTLS Server: ${errorMessage}`);
    }
  }
}

void bootstrap();
