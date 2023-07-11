import fetch from "node-fetch";
import { botcynx } from "../..";
import { profile, uuid } from "../../typings/ApiInterface";
import { Collection } from "discord.js";

const nameToUUIDMap = new Collection<string, string>();

const getNameUUIDMap = () => {
  return nameToUUIDMap.clone();
}

const getUuidbyUsername = async function (username: string) {
  username = username.toLowerCase().trim();
  if (nameToUUIDMap.has(username)) {
    return nameToUUIDMap.get(username);
  }

  let uriComponent = encodeURIComponent(username);
  let Url = `https://api.mojang.com/users/profiles/minecraft/${uriComponent}`;

  //GET request
  return fetch(Url, { headers: { "user-agent": botcynx.getUserAgent() } }).then(
    async (body) => {
      let data: any = await body.text();
      if (typeof data === "undefined" || !data) return null;
      let result: uuid = JSON.parse(data);
      return result.id;
    }
  );
};

const getProfilebyUuid = async function (uuid: string) {
  uuid = uuid.toLowerCase().trim();

  let Url = `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`;

  //GET request
  return fetch(Url, { headers: { "user-agent": botcynx.getUserAgent() } }).then(
    async (body) => {
      let data: any = await body.text();
      if (typeof data === "undefined" || !data) return null;
      let result: profile = JSON.parse(data);
      return result;
    }
  );
};

const getUsername = async (uuid: string): Promise<string> => {
  if (nameToUUIDMap.some((v) => v == uuid)) {
    return nameToUUIDMap.filter((v) => v === uuid).firstKey();
  }
  return (await getProfilebyUuid(uuid)).name;
};

export { getProfilebyUuid, getUuidbyUsername, getUsername, getNameUUIDMap };
