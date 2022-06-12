import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import {
  AppService,
  GetHomeReturnType,
  GetYoutubeLinkInfoReqBody,
} from "./app.service";
import { ThrottlerBehindProxyGuard } from "./throttler-behind-proxy.guard";
import { sanitizeUrl } from "./utils/sanitize-url";

@UseGuards(ThrottlerBehindProxyGuard)
@Throttle(
  parseInt(process.env.GLOBAL_RATE_LIMIT || "50"),
  parseInt(process.env.GLOBAL_RATE_LIMIT_TTL || "60"),
)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/")
  getRoot(): GetHomeReturnType {
    return this.appService.getRoot();
  }

  @Throttle(
    parseInt(process.env.YOUTUBE_LINK_INFO_RATE_LIMIT),
    parseInt(process.env.YOUTUBE_LINK_INFO_RATE_LIMIT_TTL),
  )
  @HttpCode(200)
  @Header("content-type", "application/json")
  @Post("/youtube/link-info")
  getYoutubeLinkInfo(
    @Body()
    body: GetYoutubeLinkInfoReqBody,
  ) {
    if (!body?.url) {
      throw new BadRequestException({
        success: false,
        message: "url property required in request body",
      });
    }

    if (
      typeof body.url !== "string" ||
      !body.url.startsWith("https://")
    ) {
      throw new BadRequestException({
        success: false,
        message: "malformed url in request body",
      });
    }

    const url = sanitizeUrl(body.url);

    return this.appService.getYoutubeLinkInfo(url);
  }
}
