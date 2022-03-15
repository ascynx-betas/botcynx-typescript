export interface itemType {
  type: string;
  Tier: string;
  enchantments: {
    [key: string]: {
      level: number;
      isVanilla: boolean;
    };
  };
  Attributes: {
    "main-hand"?: string[];
    "off-hand"?: string[];
    helmet?: string[];
    chestplate?: string[];
    legs?: string[];
    boots?: string[];
  };
}

export const itemList = {
  Busturus: {
    type: "Iron Sword",
    Tier: "Celsian Isles: Rare",
    enchantments: {
      Smite: {
        level: 2,
        isVanilla: true,
      },
      Unbreaking: {
        level: 4,
        isVanilla: true,
      },
      Duelist: {
        level: 2,
        isVanilla: false,
      },
    },
    Attributes: {
      "main-hand": ["10 Attack Damage", "1.6 Attack Speed"],
    },
    Source: [
      "Teal Dungeon Loot Chests",
      "4 Teal fragements from the rare Trader in the Teal Dungeon Lobby",
      "Obtainable in the Celsian Isles Transmogrifier",
    ],
  },
  "Keeper Of The Jungle": {
    type: "Shield",
    Tier: "King's Valley: Rare",
    enchantments: {
      Unbreaking: {
        level: 2,
        isVanilla: true,
      },
    },
    Attributes: {
      "off-hand": ["+2 armor"],
    },
  },
  "Earthbound Runeblade": {
    type: "Stone Sword",
    Tier: "King's Valley Rare",
    enchantments: {
      Sharpness: {
        level: 2,
        isVanilla: true,
      },
      Unbreaking: {
        level: 2,
        isVanilla: true,
      },
    },
    Attributes: {
      "main-hand": [
        "1.6 Attack Speed",
        "6.5 Attack Damage",
        "+2 Armor",
        "+1 Knockback Resistance",
      ],
    },
    Source: ["Rock's Little Casino (5% Chance)"],
  },
  "Stormborn Runeblade": {
    Type: "Stone Sword",
    Tier: "King's Valley: Rare",
    enchantments: {
      Knockback: {
        level: 2,
        isVanilla: true,
      },
      Sharpness: {
        level: 2,
        isVanilla: true,
      },
      Unbreaking: {
        level: 2,
        isVanilla: true,
      },
    },
    Attributes: {
      "main-hand": ["2 Attack Speed", "6.5 Attack Damage", "+10% Speed"],
    },
    Source: ["Rock's Little Casino (5% Chance)"],
  },
  "Earthbound Pants": {
    Type: "Leather armor (legs)",
    Tier: "King's Valley: Rare",
    enchantments: {
      Unbreaking: {
        level: 3,
        isVanilla: true,
      },
    },
    Attributes: {
      legs: ["+2 armor", "+3 max health", "+1 knockback resistance"],
    },
    Source: ["Rock's Little Casino (Unknown Percentage)"],
  },
};
