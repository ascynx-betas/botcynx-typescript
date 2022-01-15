import { EmbedFieldData } from "discord.js";
import fetch from "node-fetch";
import {
  senitherProfile,
  senitherProfiles,
  senitherProfileSingular,
} from "../typings/ApiInterface";
const key = process.env.hypixelapikey;

const getProfiles = async function (uuid: string) {
  const url = `https://hypixel-api.senither.com/v1/profiles/${uuid}`;
  const options = {
    headers: {
      Authorization: `${key}`,
    },
  };

  //GET request
  return fetch(url, options).then(async (body) => {
    let data: string = await body.text();
    let result: senitherProfiles = JSON.parse(data);
    return result;
  });
};

const getFatterProfile = async function (uuid: string) {
  const url = `https://hypixel-api.senither.com/v1/profiles/${uuid}/weight`;
  const options = {
    headers: {
      Authorization: `${key}`,
    },
  };

  //GET request
  return fetch(url, options).then(async (body) => {
    let data: string = await body.text();
    let result: senitherProfileSingular = JSON.parse(data);
    return result;
  });
};

const getSpecifiedProfile = async function (uuid: string, profile: string) {
  const url = `https://hypixel-api.senither.com/v1/profiles/${uuid}/${profile}`;
  const options = {
    headers: {
      Authorization: `${key}`,
    },
  };

  //GET request
  return fetch(url, options).then(async (body) => {
    let data: string = await body.text();
    let result: senitherProfileSingular = JSON.parse(data);
    return result;
  });
};

const extractWeight = async function (data: senitherProfileSingular) {
  const dataprofile = data.data;
  //profile informations
  if (!dataprofile || dataprofile.skills?.apiEnabled == false) return null;

  const profilename = dataprofile.name;
  const skillweight = (dataprofile.skills?.weight || 0);
  const skilloweight = (dataprofile.skills?.weight_overflow || 0);
  const slayerweight = (dataprofile.slayers?.weight || 0);
  const slayeroweight = (dataprofile.slayers?.weight_overflow || 0);
  const dungeonweight = (dataprofile.dungeons?.weight || 0);
  const dungeonoweight = (dataprofile.dungeons?.weight_overflow || 0);

  //calculations
  const fdungeonweight = dungeonweight + dungeonoweight;
  const fullskillweight = skillweight + skilloweight;
  const fullslayerweight = slayerweight + slayeroweight;
  const fullweight = fdungeonweight + fullskillweight + fullslayerweight;

  //rounded calculations
  const rskill = Math.round(skillweight * 10) / 10;
  const roskill = Math.round(skilloweight * 10) / 10;
  const rslayer = Math.round(slayerweight * 10) / 10;
  const roslayer = Math.round(slayeroweight * 10) / 10;
  const rdungeon = Math.round(dungeonweight * 10) / 10;
  const rodungeon = Math.round(dungeonoweight * 10) / 10;
  const rfskill = Math.round(fullskillweight * 10) / 10;
  const rfslayer = Math.round(fullslayerweight * 10) / 10;
  const rfdungeon = Math.round(fdungeonweight * 10) / 10;
  const frf = Math.round(fullweight);
  const rf = Math.round(fullweight * 10) / 10;
  let gamestage: string;
  if (frf <= 2000) {
    gamestage = "early game";
  } else if (frf >= 2000 && frf <= 7000) {
    gamestage = "mid game";
  } else if (frf >= 7000 && frf <= 13000) {
    gamestage = "late game";
  } else if (frf >= 15000 && frf <= 30000) {
    gamestage = "end game";
  } else if (frf >= 30000) {
    gamestage = "Mammoth";
  } else {
    gamestage = null;
  }
  let embedFields: EmbedFieldData[] = [];
    embedFields.push({name: "Total weight:", value: `${rf}`});
    embedFields.push({name: "<:catacombs:914860327978532874> Dungeon weight", value: `\`\`${rfdungeon}\`\`(\`\`${rdungeon}\`\`/\`\`${rodungeon}\`\` overflow)`});
    embedFields.push({name: "<:beheaded:914859571351269447> Slayer weight:", value: `\`\`${rfslayer}\`\`(\`\`${rslayer}\`\`/\`\`${roslayer}\`\` overflow)`});
    embedFields.push({name: `<:skill:914859774187814932> Skill weight`, value: `\`\`${rfskill}\`\`(\`\`${rskill}\`\`/\`\`${roskill}\`\` overflow)`});

  let result = { embedFields: embedFields, profilename: profilename, gamestage: gamestage };
  return result;
};

export { getProfiles, getFatterProfile, getSpecifiedProfile, extractWeight };
