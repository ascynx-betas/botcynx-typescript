export interface request {
  success: boolean;
  cause?: string;
}
export interface ressources extends request {
  lastUpdated: number;
}

export interface key extends request {
  record?: {
    key: string;
    owner: string;
    limit: number;
    queriesInPastMin: number;
    totalQueries: number;
  };
}

export interface player extends request {
  player?: {
    uuid: string;
    displayname: string;
    rank: string;
    packageRank: string;
    newPackageRank: string;
    monthlyPackageRank: string;
    firstLogin: number;
    lastLogin: number;
    lastLogout: number;
    stats: object;
    socialMedia: {
      links: {
        DISCORD?: string;
      };
    };
  };
}
export interface friends extends request {
  uuid?: string;
  records?: [
    {
      _id: string;
      uuidSender: string;
      uuidReceiver: string;
      started: number;
    }
  ];
}
export interface recentgames extends request {
  uuid?: string;
  games: [
    {
      date: number;
      gameType: string;
      mode: string;
      map: string;
      ended: number;
    }
  ];
}
export interface status extends request {
  uuid?: string;
  session: {
    online: boolean;
    gameType: string;
    mode: string;
    map: string;
  };
}
export interface guild extends request {
  guild: object;
}
export interface rankedSkywars extends request {
  result?: {
    key: string;
    position: number;
    score: number;
  };
}
export interface gameInfo extends ressources {
  games: {
    _: {
      id: number;
      name: string;
      databaseName: string;
      modeNames: object;
    };
  };
}
export interface achievements extends ressources {
  achievements: object;
}
export interface challenges extends ressources {
  challenges: object;
}
export interface quests extends ressources {
  quests: object;
}
export interface guildAchievements extends ressources {
  one_time: object;
  tiered: object;
}
export interface vanityPets extends ressources {
  types: object;
  rarities: object;
}
export interface vanityCompanions extends ressources {
  types: object;
  rarities: object;
}
export interface skyblockCollections extends ressources {
  version: string;
  collections: object;
}
export interface skyblockSkills extends ressources {
  version: string;
  skills: object;
}
type skyblockItem = {
  material: string;
  color?: string;
  name: string;
  skin: string;
  category: string;
  tier: rarity;
  stats?: stat[];
  npc_sell_price?: number;
  id: string;
  museum?: boolean;
  description?: string;
};
type Profile = {
  profile_id: string;
  members: object;
  community_upgrades: object;
  cute_name: string;
  banking: object;
  game_mode: string;
};
type bid = {
  auction_id: string;
  bidder: string;
  profile_id: string;
  amount: number;
  timestamp: number;
};
export type rarity =
  | "COMMON"
  | "UNCOMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY"
  | "MYTHIC"
  | "DIVINE"
  | "SPECIAL"
  | "VERY SPECIAL";
type stat = {
  HEALTH?: number;
  DEFENSE?: number;
  STRENGTH?: number;
  CRITICAL_CHANCE?: number;
  CRITICAL_DAMAGE?: number;
  INTELLIGENCE?: number;
  FEROCITY?: number;
  WEAPON_ABILITY_DAMAGE?: number;
  ATTACK_SPEED?: number;
  WALK_SPEED?: number;
  TRUE_DEFENSE?: number;
  MINING_FORTUNE?: number;
  MINING_SPEED?: number;
  MAGIC_FIND?: number;
  DAMAGE?: number;
  BREAKING_POWER?: number;
  PRISTINE?: number;
  SEA_CREATURE_CHANCE?: number;
};
type auction = {
  _id: string;
  uuid: string;
  auctioneer: string;
  profile_id: string;
  coop: string[];
  start: string;
  end: string;
  item_name: string;
  item_lore: string;
  extra: string;
  category: string;
  tier: rarity;
  starting_bid: number;
  item_bytes: {
    type: number;
    data: string;
  };
  claimed: boolean;
  claimed_bidders: any[];
  highest_bid_amount: number;
  bids: bid[];
};
export interface skyblockItems extends ressources {
  items: Array<skyblockItem>;
}
export interface skyblockNews extends request {
  items: Array<any>;
}
export interface skyblockAuction extends request {
  auctions: Array<auction>; //skyblock auction
}
export interface skyblockActiveAuctions extends ressources {
  page: number;
  totalPages: number;
  totalAuctions: number;
  auctions: Array<auction>; //skyblock auction
}
export interface skyblockInactiveAuctions extends ressources {
  auctions: Array<object>;
}
export interface skyblockBazaar extends ressources {
  products: object;
}
export interface skyblockProfile extends request {
  profile: Profile; //skyblock profile
}
export interface skyblockProfiles extends request {
  profiles: Array<Profile>; // Skyblock profile
}
export interface activeNetworkBoosters extends request {
  boosters: Array<object> | object; //Array of ActiveBooster or QueuedBooster
  boosterState: {
    decrementing: boolean;
  };
}
export interface playerCount extends request {
  playerCount: number;
  games: object;
}
export interface currentLeaderboards extends request {
  leaderboards: object;
}
export interface punishmentStatistics extends request {
  watchdog_lastMinute: number;
  staff_rollingDaily: number;
  watchdog_total: number;
  watchdog_rollingDaily: number;
  staff_total: number;
}
