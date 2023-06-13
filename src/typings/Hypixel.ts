export interface Request {
  success: boolean;
  cause?: string;
}
export interface Resources extends Request {
  lastUpdated: number;
}

export interface Key extends Request {
  record?: {
    key: string;
    owner: string;
    limit: number;
    queriesInPastMin: number;
    totalQueries: number;
  };
}

export interface Player extends Request {
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
        YOUTUBE?: string;
      };
      prompt?: boolean;
    };
    achievements?: {
      [key: string]: any
    };
  };
}
export interface Friends extends Request {
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
export interface Recentgames extends Request {
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
export interface Status extends Request {
  uuid?: string;
  session: {
    online: boolean;
    gameType: string;
    mode: string;
    map: string;
  };
}
export interface Guild extends Request {
  guild: object;
}
export interface RankedSkywars extends Request {
  result?: {
    key: string;
    position: number;
    score: number;
  };
}
export interface GameInfo extends Resources {
  games: {
    _: {
      id: number;
      name: string;
      databaseName: string;
      modeNames: object;
    };
  };
}
export interface Achievements extends Resources {
  achievements: object;
}
export interface Challenges extends Resources {
  challenges: object;
}
export interface Quests extends Resources {
  quests: object;
}
export interface GuildAchievements extends Resources {
  one_time: object;
  tiered: object;
}
export interface VanityPets extends Resources {
  types: object;
  rarities: object;
}
export interface VanityCompanions extends Resources {
  types: object;
  rarities: object;
}
export interface SkyblockCollections extends Resources {
  version: string;
  collections: object;
}
export interface SkyblockSkills extends Resources {
  version: string;
  skills: object;
}
type SkyblockItem = {
  material: string;
  color?: string;
  name: string;
  skin: string;
  category: string;
  tier: Rarity;
  stats?: Stat[];
  npc_sell_price?: number;
  id: string;
  museum?: boolean;
  description?: string;
};
export type ProfilePet = {
  uuid: string;
  type: string;
  exp: number;
  tier: string;
  held_item: string;
  candyUsed: number;
  skin: string;
  active: boolean;
};
export type Slayer = {
  claimed_levels?: {
    [key: string]: number;
  };
  boss_kills_tier_0?: number;
  xp?: number;
  boss_kills_tier_1?: number;
  boss_kills_tier_2?: number;
  boss_kills_tier_3?: number;
  boss_kills_tier_4?: number;
};
type BestDungeon = {
  timestamp: number;
  score_exploration: number;
  score_speed: number;
  score_skill: number;
  score_bonus: number;
  dungeon_class: string;
  teammates: string[];
  elapsed_time: number;
  damage_dealt: number;
  deaths: number;
  mobs_killed: number;
  secrets_found: number;
  damage_mitigated: number;
  ally_healing: number;
};
type Contest = {
  collected: number;
  claimed_rewards: boolean;
  claimed_position: number;
  claimed_participants: number;
};
export type ProfileMember = {
  selected: boolean;
  experience_skill_combat: number;
  inv_armor: { type: number; data: string };
  coop_invitation: {
    timestamp: number;
    invited_by: string;
    confirmed: boolean;
    confirmed_timestamp: number;
  };
  first_join: number;
  first_join_hub: number;
  stats: { [key: string]: number };
  objectives: {
    [key: string]: {
      status: string;
      progress: number;
      completed_at?: number;
    };
  };
  tutorial: string[];
  quests: {
    [key: string]: {
      status: string;
      progress: number;
      completed_at_sb: number;
      activated_at: number;
    };
  };
  coin_purse: number;
  last_death: number;
  crafted_generators: string[];
  visited_zones: string[];
  fairy_souls_collected: number;
  fairy_souls: number;
  fairy_exchanges: number;
  fishing_treasure_caught: number;
  death_count: number;
  achievement_spawned_island_types: string[];
  slayer_bosses: {
    zombie: Slayer;
    spider: Slayer;
    wolf: Slayer;
    enderman: Slayer;
    blaze: Slayer;
  };
  pets: ProfilePet[];
  dungeons: {
    dungeon_types: {
      catacombs: {
        times_played: { [key: number]: number };
        experience: number;
        tier_completions: { [key: number]: number };
        fastest_time: { [key: number]: number };
        best_runs: { [key: number]: BestDungeon[] };
      };
      master_catacombs: {
        times_played: { [key: number]: number };
        experience: number;
        tier_completions: { [key: number]: number };
        fastest_time: { [key: number]: number };
        best_runs: { [key: number]: BestDungeon[] };
      };
    };
    player_classes: { [key: string]: { experience: number } };
    dungeon_journal: {
      journal_entries: {
        [key: string]: number[];
      };
    };
    dungeons_blah_blah: string[];
    selected_dungeon_class: string;
  };
  griffin: {
    burrows: {
      ts: number;
      x: number;
      y: number;
      z: number;
      type: number;
      tier: number;
      chain: number;
    }[];
  };
  jacob2: {
    medals_inv: {
      bronze: number;
      silver: number;
      gold: number;
    };
    perks: {
      double_drops: number;
    };
    contests: { [key: string]: Contest };
    talked: boolean;
  };
  experimentation: {
    pairings: {
      last_claimed: number;
      claims_0: number;
      best_score_0: number;
      last_attempt: number;
      claims_1: number;
      best_score_1: number;
      claims_2: number;
      best_score_2: number;
      claims_3: number;
      best_score_3: number;
      claims_4: number;
      best_score_4: number;
      claims_5: number;
      best_score_5: number;
    };
    simon: {
      last_attempt: number;
      attempts_0: number;
      bonus_clicks: number;
      last_claimed: number;
      claims_0: number;
      best_score_0: number;
      attempts_1: number;
      claims_1: number;
      best_score_1: number;
      attempts_2: number;
      claims_2: number;
      best_score_2: number;
      attempts_3: number;
      claims_3: number;
      best_score_3: number;
      attempts_5: number;
      claims_5: number;
      best_score_5: number;
    };
    numbers: {
      last_attempt: number;
      attempts_1: number;
      bonus_clicks: number;
      last_claimed: number;
      claims_1: number;
      best_score_1: number;
      attempts_2: number;
      claims_2: number;
      best_score_2: number;
      attempts_3: number;
      claims_3: number;
      best_score_3: number;
    };
    claims_resets: number;
    claims_resets_timestamp: number;
  };
  perks: {
    catacombs_boss_luck: number;
    catacombs_defense: number;
    catacombs_crit_damage: number;
    catacombs_health: number;
    catacombs_strength: number;
    catacombs_intelligence: number;
    catacombs_looting: number;
    forbidden_blessing: number;
  };
  harp_quest: {
    [key: string]: number;
  };
  fastest_target_practice: number;
  active_effects: {
    effect: string;
    level: number;
    modifiers: [];
    ticks_remaining: number;
    infinite: false;
  }[];
  paused_effects: [];
  disabled_potion_effects: [];
  visited_modes: string[];
  temp_stat_buffs: {
    stat: number;
    key: string;
    amount: number;
    expire_at: number;
  }[];
  mining_core: {
    nodes: {
      [key: string]: boolean | number;
    };
    received_free_tier: boolean;
    tokens: number;
    tokens_spent: number;
    powder_mithril: number;
    powder_mithril_total: number;
    powder_spent_mithril: number;
    experience: number;
    daily_ores_mined_day_mithril_ore: number;
    daily_ores_mined_mithril_ore: number;
    retroactive_tier2_token: boolean;
    selected_pickaxe_ability: string;
    last_reset: number;
    crystals: {
      [key: string]: { state: "FOUND" | "NOT_FOUND"; total_placed?: number };
    };
    greater_mines_last_access: number;
    biomes: {
      precursor: { parts_delivered: [] };
      dwarven: { statues_placed: [] };
      goblin: { king_quest_active: boolean; king_quests_completed: number };
    };
    powder_gemstone: number;
    powder_gemstone_total: number;
    daily_ores_mined_day_gemstone: number;
    daily_ores_mined_gemstone: number;
    powder_spent_gemstone: number;
  };
  forge: {
    forge_processes: {
      [key: string]: object;
    };
  };
  experience_skill_runecrafting: number;
  experience_skill_mining: number;
  unlocked_coll_tiers: string[];
  experience_skill_alchemy: number;
  backpack_contents: {
    [key: number]: { type: number; data: string };
  };
  quiver: { type: number; data: string };
  experience_skill_taming: number;
  sacks_counts: {
    [key: string]: number;
  };
  essence_undead: number;
  talisman_bag: { type: number; data: string };
  backpack_icons: {
    [key: string]: { type: number; data: string };
  };
  experience_skill_farming: number;
  wardrobe_equipped_slot: number;
  collection: {
    [key: string]: number;
  };
  essence_dragon: number;
  essence_gold: number;
  ender_chest_contents: { type: number; data: string };
  potion_bag: { type: number; data: string };
  experience_skill_enchanting: number;
  personal_vault_contents: { type: number; data: string };
  experience_skill_fishing: number;
  inv_contents: { type: number; data: string };
  essence_ice: number;
  essence_wither: number;
  essence_spider: number;
  experience_skill_foraging: number;
  candy_inventory_contents: { type: number; data: string };
  experience_skill_carpentry: number;
};
type Transation = {
  amount: number;
  timestamp: number;
  action: "DEPOSIT" | "WITHDRAW";
  initiator_name: string;
};
type Upgrade = {
  upgrade: string;
  tier: number;
  started_ms: number;
  started_by: string;
  claimed_ms: number;
  claimed_by: string;
  fasttracked: boolean;
};
export type Profile = {
  profile_id: string;
  members: { [key: string]: ProfileMember };
  community_upgrades: {
    currently_upgrading: {
      currently_upgrading: unknown;
      upgrade_states: Upgrade[];
    };
  };
  cute_name: string;
  banking: {
    balance: number;
    transactions: Transation[];
  };
  game_mode?: "island" | "ironman" | "bingo"; //if none then it's normal gamemode
};
type Bid = {
  auction_id: string;
  bidder: string;
  profile_id: string;
  amount: number;
  timestamp: number;
};
export type Rarity =
  | "COMMON"
  | "UNCOMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY"
  | "MYTHIC"
  | "DIVINE"
  | "SPECIAL"
  | "VERY SPECIAL";
type Stat = {
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
type Auction = {
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
  tier: Rarity;
  starting_bid: number;
  item_bytes: {
    type: number;
    data: string;
  };
  claimed: boolean;
  claimed_bidders: any[];
  highest_bid_amount: number;
  bids: Bid[];
};
export interface skyblockItems extends Resources {
  items: Array<SkyblockItem>;
}
export interface SkyblockNews extends Request {
  items: Array<any>;
}
export interface SkyblockAuction extends Request {
  auctions: Array<Auction>; //skyblock auction
}
export interface SkyblockActiveAuctions extends Resources {
  page: number;
  totalPages: number;
  totalAuctions: number;
  auctions: Array<Auction>; //skyblock auction
}
export interface SkyblockInactiveAuctions extends Resources {
  auctions: Array<object>;
}
export interface SkyblockBazaar extends Resources {
  products: object;
}
export interface SkyblockProfile extends Request {
  profile: Profile; //skyblock profile
}
export interface SkyblockProfiles extends Request {
  profiles: Array<Profile>; // Skyblock profile
}
export interface ActiveNetworkBoosters extends Request {
  boosters: Array<object> | object; //Array of ActiveBooster or QueuedBooster
  boosterState: {
    decrementing: boolean;
  };
}
export interface PlayerCount extends Request {
  playerCount: number;
  games: object;
}
export interface CurrentLeaderboards extends Request {
  leaderboards: object;
}
export interface PunishmentStatistics extends Request {
  watchdog_lastMinute: number;
  staff_rollingDaily: number;
  watchdog_total: number;
  watchdog_rollingDaily: number;
  staff_total: number;
}
