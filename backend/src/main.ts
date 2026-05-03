import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
  const port = process.env.PORT ?? 3001;

  app.enableCors({ origin: frontendUrl });
  app.setGlobalPrefix("api");

  await app.listen(port);
}

void bootstrap();
