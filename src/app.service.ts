import { Injectable } from "@nestjs/common";
import { execSync } from "child_process";
import * as ytsr from "ytsr";
import got from "got";
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

    let searchResults: ytsr.Result;

    if (process.env.YOUTUBE_DATA_API_KEY) {
      try {
        const url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=${limit}&order=relevance&q=${query}&safeSearch=none&type=video&regionCode=US&alt=json&key=${process.env.YOUTUBE_DATA_API_KEY}`;

        const response = await got.get(url);

        searchResults = JSON.parse(response.body);
      } catch (error) {
        console.log(error);
      }
    }

    if (!searchResults) {
      searchResults = await ytsr(query);
      const items: ytsr.Item[] = [];

      for (let i = 0; i < searchResults.items.length; i++) {
        const item = searchResults.items[i];

        if (item.type === "video") {
          items.push(item);
        }

        if (
          items.length === Math.min(limit, highestLimit)
        ) {
          break;
        }
      }

      return items;
    }

    return searchResults;
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
