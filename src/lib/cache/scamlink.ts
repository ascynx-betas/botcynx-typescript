import { isLink } from "../personal-modules/testFor";
import { RepoLink } from "./cache";
import { JsonCache } from "./cache";

//! ALL OF THE LINKS IN THERE AREN'T NECESSARELY SCAM LINKS
export const scamLinks = new JsonCache(
  new RepoLink("ascynx", "botcynx-data", "scamlinks.json")
);

export function hasScamLink(message: string) {
  let hasScamLink: boolean = false;
  let words = message.split(" ");
  words = words.filter((w) => isLink(w));

  for (const scam in scamLinks.data) {
    const scamRegExp = new RegExp(`.*${scamLinks.data[scam]}.*`, "gi");

    if (
      words.some((word) =>
        [...new Set([...safe, ...ignore])].some((safe) =>
          new RegExp(`.*${safe}.*`, "gi").test(word)
        )
      )
    )
      return (hasScamLink = false);

    if (words.some((word) => scamRegExp.test(word))) {
      return (hasScamLink = true);
    }
  }

  return hasScamLink;
}

export function contains(content: string, searchItem: string) {
  const regex = new RegExp(`.*${searchItem}.*`, "gi");
  return regex.test(content);
}

export const safe = [
  "discord.gift",
  "discord.com",
  "ptb.discord.com",
  "canary.discord.com",
  "steamcommunity.com",
]; //checks those in automod;

export const ignore = [
  "discord.gift",
  "discord.com",
  "ptb.discord.com",
  "canary.discord.com",
  "steamcommunity.com",
  "safety.discord.com",
  "support-dev.discord.com",
  "support.discord.com",
  "blog.discord.com",
  "media.discordapp.net",
  "discord.gg",
  "cdn.discordapp.com",
  "media.discordapp.com",
]; //ignores those in automod if found
