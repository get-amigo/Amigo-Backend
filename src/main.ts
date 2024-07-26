import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser.default());
  app.enableCors({
    origin: [process.env.CLIENT_URL, "http://localhost:3000", "https://5520-2409-40e3-3144-dece-38f6-f04c-e502-a9c0.ngrok-free.app"],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
