import fetch from "node-fetch";
import { botcynx } from "..";

interface HastebinRes {
  key: string;
}

export class HasteUtils {
  private static urls: string[] = [
    "https://hst.sh",
    "https://hasteb.in",
    "https://hastebin.com",
    "https://mystb.in",
    "https://haste.clicksminuteper.net",
    "https://paste.pythondiscord.com",
    "https://haste.unbelievaboat.com",
  ]

  static async post(content: string) {
    for (const url of this.urls) {
      try {
        const res: HastebinRes = await (
          await fetch(`${url}/documents`, {
            method: "POST",
            body: content,
            headers: {
              "user-agent": botcynx.getUserAgent()
            }
          })
        ).json();

        return `${url}/${res.key}`;
      } catch (e) {
        continue;
      }
    }
    return null;
  }

  static isHaste(word: string) {
    for (const url of this.urls) {
     let linkRegex = new RegExp(`.*${url}.*`, "gi");
     if (linkRegex.test(word)) return true;
    }

    return false;
  }
}
