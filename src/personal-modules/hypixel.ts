import fetch from 'node-fetch';
import { key, player, skyblockProfiles, status } from '../typings/Hypixel';
const key = process.env.hypixelapikey;
/**
 * 
 * @param {string} uuid
 */
const getPlayerByUuid = async function (uuid: string) {
    let Url = "https://api.hypixel.net/player?key=" + key + "&uuid=" + uuid;

    //GET request
    return fetch(Url).then(async (body) => {
        let data: any = await body.text();
        let result: player = JSON.parse(data);
        return result;

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
        let data: any = await body.text();
        let result: status = JSON.parse(data);
        return result;

    });

};
const getKeyInfo = async function () {
    let Url = "https://api.hypixel.net/key?key=" + key;

    //GET request
    return fetch(Url).then(async (body) => {
        let data: any = await body.text();
        let result: key = JSON.parse(data);
        return result;

    });

};
/**
 * @param  {String} uuid
 */
const getProfiles = async function (uuid: string) {
    let Url = `https://api.hypixel.net/skyblock/profiles?key=${key}&uuid=${uuid}`;

    //GET request
    return fetch(Url).then(async (body) => {
        let data: any = await body.text();
        let result: skyblockProfiles = JSON.parse(data);
        return result;

    });
};
export { getPlayerByUuid, getStatus, getKeyInfo, getProfiles };