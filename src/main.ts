import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
// import { AllExceptionsFilter } from './infrastructure/utils/error.handler';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //exception handler
  //class-validator
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }))
  //cors setup
  app.enableCors(
    {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      credentials: true,
    }
  )
  //cookie parser
  app.use(cookieParser());
  //swagger config
  const config = new DocumentBuilder()
  .setTitle('Doctor-Patient API')
  .setDescription("API for managing Doctor & Patient")
  .setVersion("1.0.0")
  .addTag('doctor')
  .addTag('patient')
  .addTag('auth')
  .build()
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📚 Swagger documentation available at http://localhost:${port}/api`);
}
bootstrap();
