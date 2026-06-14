import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { getCorsOrigins } from "./common/cors";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: getCorsOrigins(),
  });
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 3003);
  await app.listen(port);
}

void bootstrap();
