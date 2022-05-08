import { rarity } from "./Hypixel";

// MOJANG API INTERFACES
export interface uuid {
  name: string;
  id: string;
}

export interface profile {
  id: string;
  name: string;
  properties: [
    {
      name: string;
      value: string;
    }
  ];
}
type skinModel = "slim" | "classic";

export interface decodedvalue {
  timestamp: number;
  profileId: string;
  profileName: string;
  textures: {
    SKIN: {
      url: string;
      metadata: {
        model: skinModel;
      };
    };
  };
  CAPE?: {
    url: string;
  };
}

//SENITHER API INTERFACE
type skill = {
  level: number;
  experience: number;
  weight: number;
  weight_overflow: number;
};
type slayerboss = {
  level: number;
  experience: number;
  weight: number;
  weight_overflow: number;
  kills: {
    tier_1: number;
    tier_2: number;
    tier_3: number;
    tier_4: number;
    tier_5: number;
  };
};
type pet = {
  type: string;
  tier: rarity;
  level: number;
  xp: number;
  heldItem: string | null;
  candyUsed: number;
  active: boolean;
};
type bestScore = {
  value: number;
  score: string;
};
type fastestTime = {
  time: string;
  seconds: number;
};
type dungeons = {
  highest_tier_completed: number;
  times_played: {
    entrance: number;
    tier_1: number;
    tier_2: number;
    tier_3: number;
    tier_4: number;
    tier_5: number;
    tier_6: number;
    tier_7: number;
  };
  tier_completion: {
    entrance: number;
    tier_1: number;
    tier_2: number;
    tier_3: number;
    tier_4: number;
    tier_5: number;
    tier_6: number;
    tier_7: number;
  };
  best_score: {
    entrance: bestScore;
    tier_1: bestScore;
    tier_2: bestScore;
    tier_3: bestScore;
    tier_4: bestScore;
    tier_5: bestScore;
    tier_6: bestScore;
    tier_7: bestScore;
  };
  fastest_time: {
    entrance: fastestTime;
    tier_1: fastestTime;
    tier_2: fastestTime;
    tier_3: fastestTime;
    tier_4: fastestTime;
    tier_5: fastestTime;
    tier_6: fastestTime;
    tier_7: fastestTime;
  };
  fastest_time_s_plus: {
    entrance: fastestTime;
    tier_1: fastestTime;
    tier_2: fastestTime;
    tier_3: fastestTime;
    tier_4: fastestTime;
    tier_5: fastestTime;
    tier_6: fastestTime;
    tier_7: fastestTime;
  };
  mobs_killed: {
    entrance: number;
    tier_1: number;
    tier_2: number;
    tier_3: number;
    tier_4: number;
    tier_5: number;
    tier_6: number;
    tier_7: number;
  };
  most_mobs_killed: {
    entrance: number;
    tier_1: number;
    tier_2: number;
    tier_3: number;
    tier_4: number;
    tier_5: number;
    tier_6: number;
    tier_7: number;
  };
};
export type senitherProfile = {
  id: string;
  name: string;
  username: string;
  last_save_at: {
    time: number;
    date: string;
  };
  weight: number;
  weight_overflow: number;
  fairy_souls: number;
  skills: {
    apiEnabled: boolean;
    average_skills: number;
    weight: number;
    weight_overflow: number;
    mining: skill;
    foraging: skill;
    enchanting: skill;
    farming: skill;
    combat: skill;
    fishing: skill;
    alchemy: skill;
    taming: skill;
    carpentry: skill;
    runecrafting: skill;
  };
  slayers: {
    total_coins_spent: number;
    total_experience: number;
    weight: number;
    weight_overflow: number;
    bosses: {
      revenant: slayerboss;
      tarantula: slayerboss;
      sven: slayerboss;
      enderman: slayerboss;
    };
  };
  dungeons: null | {
    selected_class: string;
    weight: number;
    weight_overflow: number;
    secrets_found: number;
    classes: {
      healer: skill;
      mage: skill;
      berserker: skill;
      archer: skill;
      tank: skill;
    };
    types: {
      catacombs: {
        level: number;
        experience: number;
        weight: number;
        weight_overflow: number;
        highest_tier_completed: number;
        times_played: {
          entrance: number;
          tier_1: number;
          tier_2: number;
          tier_3: number;
          tier_4: number;
          tier_5: number;
          tier_6: number;
          tier_7: number;
        };
        tier_completion: {
          entrance: number;
          tier_1: number;
          tier_2: number;
          tier_3: number;
          tier_4: number;
          tier_5: number;
          tier_6: number;
          tier_7: number;
        };
        best_score: {
          entrance: bestScore;
          tier_1: bestScore;
          tier_2: bestScore;
          tier_3: bestScore;
          tier_4: bestScore;
          tier_5: bestScore;
          tier_6: bestScore;
          tier_7: bestScore;
        };
        fastest_time: {
          entrance: fastestTime;
          tier_1: fastestTime;
          tier_2: fastestTime;
          tier_3: fastestTime;
          tier_4: fastestTime;
          tier_5: fastestTime;
          tier_6: fastestTime;
          tier_7: fastestTime;
        };
        fastest_time_s_plus: {
          entrance: fastestTime;
          tier_1: fastestTime;
          tier_2: fastestTime;
          tier_3: fastestTime;
          tier_4: fastestTime;
          tier_5: fastestTime;
          tier_6: fastestTime;
          tier_7: fastestTime;
        };
        mobs_killed: {
          entrance: number;
          tier_1: number;
          tier_2: number;
          tier_3: number;
          tier_4: number;
          tier_5: number;
          tier_6: number;
          tier_7: number;
        };
        most_mobs_killed: {
          entrance: number;
          tier_1: number;
          tier_2: number;
          tier_3: number;
          tier_4: number;
          tier_5: number;
          tier_6: number;
          tier_7: number;
        };
        master_mode: dungeons;
      };
    };
  };
  pets: pet[];
  coins: {
    total: number;
    bank: number;
    purse: number;
  };
};
export interface senitherProfiles {
  status: number;
  data: senitherProfile[];
}
export interface senitherProfileSingular {
  status: number;
  data?: senitherProfile;
}
