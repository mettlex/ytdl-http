import { Injectable } from "@nestjs/common";
import { execSync } from "child_process";

export interface GetHomeReturnType {
  success: true;
}

export interface GetYoutubeLinkInfoReqBody {
  url?: string;
}

export type YoutubeLinkInfo =
  typeof import("./data/samples/youtube-link-info.json");

@Injectable()
export class AppService {
  getRoot(): GetHomeReturnType {
    return {
      success: true,
    };
  }

  async getYoutubeLinkInfo(
    url: string,
  ): Promise<YoutubeLinkInfo> {
    return JSON.parse(
      execSync(
        `${process.env.YOUTUBE_DL_BIN_PATH} -j ${url}`,
      ).toString(),
    );
  }
}
