import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Throttle } from "@nestjs/throttler";
import {
  AppService,
  GetHomeReturnType,
  GetYoutubeLinkInfoReqBody,
} from "./app.service";
import { ThrottlerBehindProxyGuard } from "./throttler-behind-proxy.guard";
import { sanitizeUrl } from "./utils/sanitize-url";
import got from "got";
import { FastifyReply, FastifyRequest } from "fastify";
import { getCacheItem, setCachItem } from "./utils/cache";

@UseGuards(ThrottlerBehindProxyGuard)
@Throttle(50, 60)
@UseGuards(AuthGuard("basic"))
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/")
  getRoot(): GetHomeReturnType {
    return this.appService.getRoot();
  }

  @Throttle(15, 60)
  @Header("content-type", "application/json")
  @Post("/youtube/link-info")
  async getYoutubeLinkInfo(
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

    if (getCacheItem(url)) {
      setCachItem(url, getCacheItem(url));
      return getCacheItem(url);
    }

    const result = await this.appService.getYoutubeLinkInfo(
      url,
    );

    if (result) {
      setCachItem(url, JSON.stringify(result));
    }

    return result;
  }

  @Get("/p/*")
  async proxy(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const url = decodeURIComponent(
      req.url.replace("/p/", ""),
    );

    if (!url) {
      return res.status(400).send("");
    }

    const stream = got.stream(url, {
      headers: {
        range: req.headers.range,
      },
    });

    stream.on("error", (error) => {
      console.log("stream error", error);
      res.sent = true;
    });

    res.send(stream);
  }

  @Throttle(15, 60)
  @Header("content-type", "application/json")
  @Post("/youtube/search")
  async searchYoutube(@Req() req: FastifyRequest) {
    const body = req.body as {
      query?: string;
      limit?: number;
    };
    const query = body?.query;

    if (!query) {
      throw new BadRequestException({
        success: false,
        message: "query property required in request body",
      });
    }

    const limit =
      typeof body?.limit === "number" &&
      body?.limit > 0 &&
      body?.limit < 50
        ? body?.limit
        : 25;

    const key = JSON.stringify({ query, limit });

    if (getCacheItem(key)) {
      setCachItem(key, getCacheItem(key));
      return getCacheItem(key);
    }

    if (
      typeof query !== "string" ||
      query.length < 1 ||
      query.length > 300
    ) {
      throw new BadRequestException({
        success: false,
        message: "malformed query in request body",
      });
    }

    const result = await this.appService.searchYoutube(
      query,
      limit,
    );

    if (result && result.length) {
      setCachItem(key, JSON.stringify(result));
    }

    return result;
  }
}
