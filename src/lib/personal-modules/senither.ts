import { APIEmbedField } from "discord.js";
import {
  senitherProfiles,
  senitherProfileSingular,
} from "../../typings/ApiInterface";
import { Senither } from "../SenitherUtils";

const getProfiles = async function (uuid: string): Promise<senitherProfiles> {
  const data = await Senither.getProfiles(uuid);

  if (data) {
    return data;
  }

  return null;
};

const getFatterProfile = async function (uuid: string): Promise<senitherProfileSingular> {
  const data = await Senither.getProfiles(uuid);

  if (data) {
    data.data.sort((a, b) => 
      (b.weight + b.weight_overflow) - (a.weight + a.weight_overflow)
    );
    return  {
      status: data.status,
      data: data.data[0]
    };
  }

  return null;
};


const getSpecifiedProfile = async function (uuid: string, profile: string): Promise<senitherProfileSingular> {
  const data = await Senither.getProfiles(uuid);

  if (data) {
    const filtered = data.data.find((E) => E.name.toLowerCase().trim() == profile.toLowerCase().trim());

    if (filtered) {
      return {
        status: data.status,
        data: filtered
      }
    }
  }

  return null;
};

const extractWeight = async function (data: senitherProfileSingular) {
  const dataprofile = data.data;
  //profile informations
  if (!dataprofile || dataprofile.skills?.apiEnabled == false) return null;

  const profilename = dataprofile.name;
  const skillweight = dataprofile.skills?.weight || 0;
  const skillOverflowWeight = dataprofile.skills?.weight_overflow || 0;
  const slayerweight = dataprofile.slayers?.weight || 0;
  const slayerOverflowWeight = dataprofile.slayers?.weight_overflow || 0;
  const dungeonweight = dataprofile.dungeons?.weight || 0;
  const dungeonOverflowWeight = dataprofile.dungeons?.weight_overflow || 0;

  //calculations
  const fdungeonweight = dungeonweight + dungeonOverflowWeight;
  const fullskillweight = skillweight + skillOverflowWeight;
  const fullslayerweight = slayerweight + slayerOverflowWeight;
  const fullweight = fdungeonweight + fullskillweight + fullslayerweight;

  //rounded calculations
  const rskill = Math.round(skillweight * 10) / 10;
  const roundedOverflowSkillWeight = Math.round(skillOverflowWeight * 10) / 10;
  const rslayer = Math.round(slayerweight * 10) / 10;
  const roundedOverflowSlayerWeight = Math.round(slayerOverflowWeight * 10) / 10;
  const rdungeon = Math.round(dungeonweight * 10) / 10;
  const roundedOverflowDungeonWeight = Math.round(dungeonOverflowWeight * 10) / 10;
  const rfskill = Math.round(fullskillweight * 10) / 10;
  const rfslayer = Math.round(fullslayerweight * 10) / 10;
  const rfdungeon = Math.round(fdungeonweight * 10) / 10;
  const fullRoundedWeight = Math.round(fullweight * 10) / 10;
  let gamestage: string;
  const stages: {name: string, min: number}[] = [
    {name: "early game", min: 0},
    {name: "mid game", min: 2000},
    {name: "late game", min: 7000},
    {name: "end game", min: 15000},
    {name: "Mammoth", min: 30000}
  ];

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];

    if (fullRoundedWeight < stage.min) {
      break;
    }
    gamestage = stage.name;
  }
  if (!gamestage) {
    gamestage = "unknown";
  }

  let embedFields: APIEmbedField[] = [];
  embedFields.push({ name: "Total weight:", value: `${fullRoundedWeight}` });
  embedFields.push({
    name: "<:catacombs:914860327978532874> Dungeon weight",
    value: `\`\`${rfdungeon}\`\`(\`\`${rdungeon}\`\`/\`\`${roundedOverflowDungeonWeight}\`\` overflow)`,
  });
  embedFields.push({
    name: "<:beheaded:914859571351269447> Slayer weight:",
    value: `\`\`${rfslayer}\`\`(\`\`${rslayer}\`\`/\`\`${roundedOverflowSlayerWeight}\`\` overflow)`,
  });
  embedFields.push({
    name: `<:skill:914859774187814932> Skill weight`,
    value: `\`\`${rfskill}\`\`(\`\`${rskill}\`\`/\`\`${roundedOverflowSkillWeight}\`\` overflow)`,
  });

  let result = {
    embedFields: embedFields,
    profilename: profilename,
    gamestage: gamestage,
  };
  return result;
};

export { getProfiles, getFatterProfile, getSpecifiedProfile, extractWeight };
