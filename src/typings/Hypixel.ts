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
export type profilePet = {
  uuid: string;
  type: string;
  exp: number;
  tier: string;
  held_item: string;
  candyUsed: number;
  skin: string;
};
type slayer = {
  claimed_levels: {
    [key: string]: number;
  };
  boss_kills_tier_0: number;
  xp: number;
  boss_kills_tier_1: number;
  boss_kills_tier_2: number;
  boss_kills_tier_3: number;
  boss_kills_tier_4: number;
};
type bestDungeon = {
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
type contest = {
  collected: number;
  claimed_rewards: boolean;
  claimed_position: number;
  claimed_participants: number;
};
export type profileMember = {
  last_save: number;
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
    zombie: slayer;
    spider: slayer;
    wolf: slayer;
    enderman: slayer;
  };
  pets: profilePet[];
  dungeons: {
    dungeon_types: {
      catacombs: {
        times_played: { [key: number]: number };
        experience: number;
        tier_completions: { [key: number]: number };
        fastest_time: { [key: number]: number };
        best_runs: { [key: number]: bestDungeon[] };
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
    contests: { [key: string]: contest };
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
type transation = {
  amount: number;
  timestamp: number;
  action: "DEPOSIT" | "WITHDRAW";
  initiator_name: string;
};
type upgrade = {
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
  members: profileMember[];
  community_upgrades: {
    currently_upgrading: {
      currently_upgrading: unknown;
      upgrade_states: upgrade[];
    };
  };
  cute_name: string;
  banking: {
    balance: number;
    transactions: transation[];
  };
  game_mode?: "island" | "ironman" | "bingo"; //if none then it's normal gamemode
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
