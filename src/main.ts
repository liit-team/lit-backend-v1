import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, LogLevel } from '@nestjs/common';
import { CustomLoggerService } from './common/logger/logger.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import expressBasicAuth from 'express-basic-auth';

async function bootstrap() {
  // const logger = new Logger('Bootstrap');

  // const debugMode = process.env.debug === 'true';
  // const logLevels: LogLevel[] = debugMode
  //   ? ['log', 'error', 'warn', 'debug', 'verbose']
  //   : ['log', 'error', 'warn'];

  const app = await NestFactory.create(AppModule, {});
  app.use(
    ['/docs'],
    expressBasicAuth({
      challenge: true,
      users: {
        [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Swagger Docs')
    .setDescription('Swagger API description')
    .setVersion('1.0.0')
    .addTag('swagger')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        in: 'header',
      },
      'token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.useGlobalPipes(new ValidationPipe());

  const port = 3000;
  await app.listen(port);
}
bootstrap();
