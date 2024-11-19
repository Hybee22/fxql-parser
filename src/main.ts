import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configuration } from './config/configuration';

const { apiPrefix } = configuration();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('/' + apiPrefix)

  const config = new DocumentBuilder()
    .setTitle('FXQL API')
    .setDescription('API for parsing and managing FXQL statements')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();
