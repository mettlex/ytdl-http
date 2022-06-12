import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import {
  AppService,
  GetHomeReturnType,
} from "./app.service";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule =
      await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
          }),
          ThrottlerModule.forRoot({
            ttl: 60,
            limit: 5,
          }),
        ],
        controllers: [AppController],
        providers: [AppService],
      }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it("should return json object with success true", () => {
      expect(
        appController.getRoot(),
      ).toMatchObject<GetHomeReturnType>({ success: true });
    });
  });
});
