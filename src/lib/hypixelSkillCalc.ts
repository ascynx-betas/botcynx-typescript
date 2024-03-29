import { ProfileMember } from "../typings/Hypixel";

export const runeCraftingSkillExp = [50, 100, 125, 160, 200, 250, 315, 400, 500, 625, 785, 1000, 1250, 1600, 2000, 2465, 3125, 4000, 5000, 6200, 7800, 9800, 12200, 15300, 19050];

export const defaultSkillRequiredExp = [
  50,
  125,
  200,
  300,
  500,
  750,
  1000,
  1500,
  2000,
  3500,
  5000,
  7500,
  10000,
  15000,
  20000,
  30000,
  50000,
  75000,
  100000,
  200000,
  300000,
  400000,
  500000,
  600000,
  700000,
  800000,
  900000,
  1000000,
  1100000,
  1200000,
  1300000,
  1400000,
  1500000,
  1600000,
  1700000,
  1800000,
  1900000,
  2000000,
  2100000,
  2200000,
  2300000,
  2400000,
  2500000,
  2600000,
  2750000,
  2900000,
  3100000,
  3400000,
  3700000,
  4000000,
  4300000,
  4600000,
  4900000,
  5200000,
  5500000,
  5800000,
  6100000,
  6400000,
  6700000,
  7000000,
];

export const basedskillRequiredExp: { [key: number]: number } = {
  1: 50,
  2: 125,
  3: 200,
  4: 300,
  5: 500,
  6: 750,
  7: 1000,
  8: 1500,
  9: 2000,
  10: 3500,
  11: 5000,
  12: 7500,
  13: 10000,
  14: 15000,
  15: 20000,
  16: 30000,
  17: 50000,
  18: 75000,
  19: 100000,
  20: 200000,
  21: 300000,
  22: 400000,
  23: 500000,
  24: 600000,
  25: 700000,
  26: 800000,
  27: 900000,
  28: 1000000,
  29: 1100000,
  30: 1200000,
  31: 1300000,
  32: 1400000,
  33: 1500000,
  34: 1600000,
  35: 1700000,
  36: 1800000,
  37: 1900000,
  38: 2000000,
  39: 2100000,
  40: 2200000,
  41: 2300000,
  42: 2400000,
  43: 2500000,
  44: 2600000,
  45: 2750000,
  46: 2900000,
  47: 3100000,
  48: 3400000,
  49: 3700000,
  50: 4000000,
  51: 4300000,
  52: 4600000,
  53: 4900000,
  54: 5200000,
  55: 5500000,
  56: 5800000,
  57: 6100000,
  58: 6400000,
  59: 6700000,
  60: 7000000,
};

export const calculateSkillLevel = (experience: number, experienceGroup: number[], maxLevel: number) => {
  let level = 0;

  for (let toRemove of experienceGroup) {
    experience -= toRemove;
    if (experience < 0) {
      return Math.min(level + (1 - (experience * -1) / toRemove), maxLevel);
    }
    level++
  }

  return Math.min(level, maxLevel);
}

export const skillLevelCalculator = (
  exp: number,
  level: number = 0,
  type: "based" | "dungeoneering" = "based"
) => {
  //recursive gaming
  let xp =
    type == "based"
      ? exp - basedskillRequiredExp[level + 1]
      : exp - dungeonSkillRequiredExp[level + 1];
  xp = xp > 0 ? xp : 0;

  return xp > 0 ? skillLevelCalculator(xp, level + 1, type) : level;
};

export const skillAverageCalculator = (profile: ProfileMember) => {
  let skill_alchemy = skillLevelCalculator(profile?.experience_skill_alchemy);
  let skill_mining = skillLevelCalculator(profile?.experience_skill_mining);
  let skill_enchanting = skillLevelCalculator(
    profile?.experience_skill_enchanting
  );
  let skill_farming = skillLevelCalculator(profile?.experience_skill_farming);
  let skill_fishing = skillLevelCalculator(profile?.experience_skill_fishing);
  let skill_foraging = skillLevelCalculator(profile?.experience_skill_foraging);
  let skill_taming = skillLevelCalculator(profile?.experience_skill_taming);
  let skill_combat = skillLevelCalculator(profile?.experience_skill_combat);
  let skill_carp = skillLevelCalculator(profile?.experience_skill_carpentry);

  let average =
    (skill_alchemy +
      skill_mining +
      skill_enchanting +
      skill_farming +
      skill_fishing +
      skill_foraging +
      skill_taming +
      skill_combat +
      skill_carp) /
    9;

  return average;
};

export const dungeonSkillRequiredExp: { [key: number]: number } = {
  1: 50,
  2: 75,
  3: 110,
  4: 160,
  5: 230,
  6: 330,
  7: 470,
  8: 670,
  9: 950,
  10: 1340,
  11: 1890,
  12: 2665,
  13: 3760,
  14: 5260,
  15: 7380,
  16: 10300,
  17: 14400,
  18: 20000,
  19: 27600,
  20: 38000,
  21: 52500,
  22: 71500,
  23: 97000,
  24: 132000,
  25: 180000,
  26: 243000,
  27: 328000,
  28: 445000,
  29: 600000,
  30: 800000,
  31: 1065000,
  32: 1410000,
  33: 1900000,
  34: 2500000,
  35: 3300000,
  36: 4300000,
  37: 5600000,
  38: 7200000,
  39: 9200000,
  40: 12000000,
  41: 15000000,
  42: 19000000,
  43: 24000000,
  44: 30000000,
  45: 38000000,
  46: 48000000,
  47: 60000000,
  48: 75000000,
  49: 93000000,
  50: 116250000,
  51: 200000000,
  52: 200000000,
  53: 200000000,
  54: 200000000,
  55: 200000000,
  56: 200000000,
  57: 200000000,
  58: 200000000,
  59: 200000000,
  60: 200000000,
  61: 200000000,
  62: 200000000,
  63: 200000000,
  64: 200000000,
}; //yep every level post 50 is 200m to next one
