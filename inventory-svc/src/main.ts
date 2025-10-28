import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LokiLogger } from './lib/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new LokiLogger(),
  });
  await app.listen(process.env.PORT ?? 4002);
}
bootstrap();
