import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');
  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? ['https://www.heronanalytica.com', 'https://heronanalytica.com']
      : ['http://localhost:3000'];

  app.enableCors({
    origin: (
      origin: string,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      console.log('CORS origin:', origin);
      console.log('allowedOriginsn:', allowedOrigins);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
