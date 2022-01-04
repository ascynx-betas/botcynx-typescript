import fetch from "node-fetch";
import { profile, uuid } from "../typings/ApiInterface";

const getUuidbyUsername = async function (username: string) {
  username = username.toUpperCase();
  let Url = `https://api.mojang.com/users/profiles/minecraft/${username}`;

  //GET request
  return fetch(Url).then(async (body) => {
    let data: any = await body.text();
    if (typeof data === "undefined" || !data) return null;
    let result: uuid = JSON.parse(data);
    return result;
  });
};

const getProfilebyUuid = async function (uuid: string) {
  let Url = `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`;

  //GET request
  return fetch(Url).then(async (body) => {
    let data: any = await body.text();
    if (typeof data === "undefined" || !data) return null;
    let result: profile = JSON.parse(data);
    return result;
  });
};

export { getProfilebyUuid, getUuidbyUsername };
