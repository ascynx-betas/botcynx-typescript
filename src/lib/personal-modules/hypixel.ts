import { Collection } from "discord.js";
import fetch from "node-fetch";
import {
  key,
  player,
  Profile,
  skyblockProfiles,
  status,
} from "../../typings/Hypixel";
const key = process.env.hypixelapikey;
/**
 *
 * @param {string} uuid
 */
const getPlayerByUuid = async function (uuid: string) {
  let Url = "https://api.hypixel.net/player?key=" + key + "&uuid=" + uuid;

  //GET request
  return fetch(Url).then(async (body) => {
    let data: player = await body.json();
    return data;
  });
};
/**
 *
 * @param {string} uuid
 */
const getStatus = async function (uuid: string) {
  let Url = "http://api.hypixel.net/status?key=" + key + "&uuid=" + uuid;

  //GET request
  return fetch(Url).then(async (body) => {
    let data: status = await body.json();
    return data;
  });
};
const getKeyInfo = async function () {
  let Url = "https://api.hypixel.net/key?key=" + key;

  //GET request
  return fetch(Url).then(async (body) => {
    let data: key = await body.json();
    return data;
  });
};
/**
 * @param  {String} uuid
 * @returns {Collection<string, Profile>} Profiles
 */
const getProfiles = async function (uuid: string) {
  let Url = `https://api.hypixel.net/skyblock/profiles?key=${key}&uuid=${uuid}`;

  //GET request
  return fetch(Url).then(async (body) => {
    let data: skyblockProfiles = await body.json();

    if (!data.success) return null;

    let Profiles: Collection<string, Profile> = new Collection();
    data?.profiles?.forEach((profile) =>
      Profiles.set(profile.cute_name, profile)
    );
    return Profiles;
  });
};

export { getPlayerByUuid, getStatus, getKeyInfo, getProfiles };
