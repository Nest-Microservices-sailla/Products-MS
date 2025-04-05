import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        //host: '0.0.0.0',
        port: envs.port,
      },
    }
  )

  const logger = new Logger('Server-Info')

  //app.enableCors()

  //app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  ),

  await app.listen();
  logger.log(`Products Microservices running on port ${envs.port}`);
}
bootstrap();
