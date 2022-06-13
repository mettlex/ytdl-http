import { Injectable } from "@nestjs/common";
import { execSync } from "child_process";
import * as ytsr from "ytsr";
import { checkYtDomainVaild } from "./utils/check-yt-domain";

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
  async searchYoutube(query: string, limit = 10) {
    const highestLimit = limit + 20;

    const searchResults = await ytsr(query);

    const items = [];

    for (let i = 0; i < searchResults.items.length; i++) {
      const item = searchResults.items[i];

      if (item.type === "video") {
        items.push(item);
      }

      if (items.length === Math.min(limit, highestLimit)) {
        break;
      }
    }

    return items;
  }

  getRoot(): GetHomeReturnType {
    return {
      success: true,
    };
  }

  async getYoutubeLinkInfo(
    url: string,
  ): Promise<YoutubeLinkInfo | null> {
    const vaild = checkYtDomainVaild(url);

    if (!vaild) {
      return null;
    }

    const parsed: YoutubeLinkInfo = JSON.parse(
      execSync(
        `${process.env.YOUTUBE_DL_BIN_PATH} -j ${url}`,
      ).toString(),
    );

    for (let i = 0; i < parsed.formats.length; i++) {
      parsed.formats[i].url = `/p/${encodeURIComponent(
        parsed.formats[i].url,
      )}`;
    }

    for (
      let i = 0;
      i < parsed.requested_formats.length;
      i++
    ) {
      parsed.requested_formats[
        i
      ].url = `/p/${encodeURIComponent(
        parsed.requested_formats[i].url,
      )}`;
    }

    return parsed;
  }
}
