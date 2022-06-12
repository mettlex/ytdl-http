import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { fastifyHelmet } from "fastify-helmet";

async function bootstrap() {
  const app =
    await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({ logger: true }),
    );

  await app.register(fastifyHelmet);

  app.enableCors();

  await app.listen(process.env.PORT || 9123);
}

bootstrap();
