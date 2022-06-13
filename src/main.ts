import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import fastifyHelmet from "fastify-helmet";
import { getCache } from "./utils/cache";
import { differenceInMinutes } from "date-fns";

async function bootstrap() {
  const app =
    await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({ logger: true }),
    );

  await app.register(fastifyHelmet, {
    hidePoweredBy: true,
  });

  app.enableCors();

  await app.listen(process.env.PORT || 9123);
}

bootstrap();

const interval = setInterval(() => {
  const cache = getCache();

  for (const [key, item] of Object.entries(cache)) {
    const now = new Date();

    if (item && item.createdAt) {
      if (differenceInMinutes(now, item.createdAt) > 5) {
        cache[key] = undefined;
      }
    }
  }
}, 3000);

process.on("beforeExit", () => {
  clearInterval(interval);
});

process.on("SIGINT", () => {
  clearInterval(interval);
});
