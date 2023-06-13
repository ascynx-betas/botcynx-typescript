import { Collection } from "discord.js";
import fetch from "node-fetch";
import { botcynx } from "..";
import { coolPeople } from "./coolPeople";

type GithubFileResponse = {
  [key: string]: {
    filename: string;
    type: string;
    language: string;
    raw_url: string;
    size: number;
    truncated: boolean;
    content: string;
  };
};

/**
 * @param {string} link provide a github gist api link
 */
export const gistJSONPull = async (link: string) => {
  return fetch(link, {
    headers: { "user-agent": botcynx.getUserAgent() },
  }).then(async (body) => {
    if (!body.ok) return new Error(body.status + body.statusText);
    const text = await body.text();
    const json = JSON.parse(text);

    const files: GithubFileResponse = json.files;
    let contents: Collection<string, string> = new Collection();
    Object.keys(files).forEach((keyFile) => {
      let content = files[keyFile].content;
      let json = JSON.parse(content);

      contents.set(files[keyFile].filename, json); //set name as the file name and the content as the content of the file
    });

    return contents;
  });
};

/**
 * @param {string} link provide a github gist api link
 */
export const updateCoolPeople = async (link: string) => {
  return fetch(link, {
    headers: { "user-agent": botcynx.getUserAgent() },
  }).then(async (body) => {
    if (!body.ok) return new Error(body.status + body.statusText);
    const text = await body.text();
    const json = JSON.parse(text);

    const files: GithubFileResponse = json.files;
    const file = files[Object.keys(files)[0]];
    const content = file.content;
    let coolPeople: coolPeople = JSON.parse(content);
    return coolPeople;
  });
};
