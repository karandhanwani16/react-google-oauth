import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }); // Enable CORS
  app.setGlobalPrefix('api');
  await app.listen(3000);
  console.log('Server is running on port http://localhost:3000/api/');
}
bootstrap();
