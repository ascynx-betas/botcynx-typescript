import { Collection } from "discord.js";
import { jsonCache, repoLink } from "./cache";

export function checkIfLog(possibleLog: string): boolean {
  let isLog = false;

  const logText = [
    "net.minecraft.launchwrapper.Launch",
    "# A fatal error has been detected by the Java Runtime Environment:",
    "---- Minecraft Crash Report ----",
    "A detailed walkthrough of the error",
    "launchermeta.mojang.com",
    "Running launcher core",
    "Native Launcher Version:",
    "[Client thread/INFO]: Setting user:",
    "[Client thread/INFO]: (Session ID is",
    "MojangTricksIntelDriversForPerformance",
    "Loading for game Minecraft ",
    "[main/INFO]: [FabricLoader] Loading ",
    ".minecraft/libraries/net/fabricmc",
    "net.fabricmc.loader.launch",
    "net.fabricmc.loader.game",
    "net.minecraftforge",
    "gg.essential",
    "club.sk1er",
    "fabric-api",
    "Environment: authHost='https://authserver.mojang.com'",
    " with Fabric Loader ",
  ];

  for (const text of logText) {
    if (possibleLog.includes(text)) {
      isLog = true;
      break;
    }
  }

  return isLog;
}

type ModCollection = {
  state: string;
  ID: string;
  version: string;
  source: string;
};

export function getMods(Log: string): Collection<string, ModCollection> {
  Log = Log.replace(/\B\s+|\s+\B/gi, "");
  //shoutout to https://stackoverflow.com/questions/49385915/how-do-i-remove-all-whitespaces-except-those-between-words-with-regular-expressi for amazing regex
  const mods: Collection<string, ModCollection> = new Collection();
  let modList = Log.split("|").slice(1); //get only the mod list (starts at the first "|" and ends at the last "|")
  modList = modList.slice(0, modList.length - 1);
  //every mod is 4 then empty 1st and 2nd aren't part of the mods;
  //let statuses = [];
  //let IDs = [];
  //let Versions = [];
  //let Sources = [];
  let lastEmptyInfo = {
    index: 0,
  };

  let modsE: ModCollection[] = [];

  modList.forEach((modInfo, index) => {
    let lastMod = modsE[modsE.length - 1];
    if (modInfo != "" && index >= 10) {
      //is a mod info
      if (index - 1 == lastEmptyInfo.index) {
        if (lastMod == null || lastMod.state != null) {
          modsE.push({ state: modInfo, ID: null, version: null, source: null });
        } else {
          modsE[modsE.length - 1].state = modInfo;
        }
        //statuses.push(modInfo);//isStatus
      } else if (index - 2 == lastEmptyInfo.index) {
        modsE[modsE.length - 1].ID = modInfo;
        //IDs.push(modInfo);//isID
      } else if (index - 3 == lastEmptyInfo.index) {
        modsE[modsE.length - 1].version = modInfo;
        //Versions.push(modInfo);//isVersion
      } else if (index - 4 == lastEmptyInfo.index) {
        modsE[modsE.length - 1].source = modInfo;
        //Sources.push(modInfo);//isModSource
      }
    } else if (modInfo == "") {
      lastEmptyInfo.index = index;
    }
  });

  modsE.forEach((v) => {
    mods.set(v.ID, v);
  });

  //statuses.forEach((status, index) => {
  //  let mod: ModCollection = {
  //    state: status,
  //    ID: IDs[index],
  //    version: Versions[index],
  //    source: Sources[index],
  //  };
  //
  //  mods.set(IDs[index], mod);
  //});

  return mods;
}

enum Loaders {
  FORGE = "Forge",
  FABRIC = "Fabric",
  OPTIFINE = "Vanilla w/Optifine HD U",
  FEATHER = "Feather",
}

const regexes = {
  loaders: [
    {
      loader: Loaders.FEATHER,
      regexes: [
        /Started Feather \((?<loaderver>\w*)\)/gim,
        /Forge Mod Loader version (?:\d{1,2}\.)?\d{1,3}\.\d{1,3}\.\d{1,5} for Minecraft (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?) loading/gim,
        /Forge mod loading, version (?:\d{1,2}\.)?\d{1,3}\.\d{1,3}\.\d{1,5}, for MC (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?)/gim,
        /--version, (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?)-forge-(?:\d{1,2}\.)?\d{1,3}\.\d{1,3}\.\d{1,5}/gim,
        /Launched Version: (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?)-forge(?:\d\.\d{1,2}(?:\.\d{1,2})?)-(?:\d{1,2}\.)?\d{1,3}\.\d{1,3}\.\d{1,5}/gim,
        /forge-(?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?)-(?:\d{1,2}\.)?\d{1,3}\.\d{1,3}\.\d{1,5}/gim,
        /Loading Minecraft (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?) with Fabric Loader \d\.\d{1,3}\.\d{1,3}/gim,
        /Loading for game Minecraft (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?)/gim,
      ],
    },
    {
      loader: Loaders.FORGE,
      regexes: [
        /Forge Mod Loader version (?<loaderver>(?:\d{1,2}\.)?\d{1,3}\.\d{1,3}\.\d{1,5}) for Minecraft (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?) loading/gim,
        /Forge mod loading, version (?<loaderver>(?:\d{1,2}\.)?\d{1,3}\.\d{1,3}\.\d{1,5}), for MC (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?)/gim,
        /--version, (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?)-forge-(?<loaderver>(?:\d{1,2}\.)?\d{1,3}\.\d{1,3}\.\d{1,5})/gim,
        /forge-(?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?)-(?<loaderver>(?:\d{1,2}\.)?\d{1,3}\.\d{1,3}\.\d{1,5})/gim,
        /Launched Version: (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?)-forge(?:\d\.\d{1,2}(?:\.\d{1,2})?)-(?<loaderver>(?:\d{1,2}\.)?\d{1,3}\.\d{1,3}\.\d{1,5})/gim,
      ],
    },
    {
      loader: Loaders.FABRIC,
      regexes: [
        /Loading Minecraft (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?) with Fabric Loader (?<loaderver>\d\.\d{1,3}\.\d{1,3})/gim,
        /Loading for game Minecraft (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?)/gim,
        /fabricloader(?:@|\s*)(?<loaderver>\d\.\d{1,3}\.\d{1,3})/gim,
      ],
    },
    {
      loader: Loaders.OPTIFINE,
      regexes: [
        /Launched Version: (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?)-OptiFine_HD_U_(?<loaderver>[A-Z]\d)/gim,
      ],
    }
  ],
};

/**
 * ML = ModLoader
 */
export function getML(log: string): {
  loaderVersion: string;
  mcVersion: string;
  loader: string;
} {
  let loaderData = {
    loaderVersion: "",
    mcVersion: "",
    loader: "",
  };

  for (const loader of regexes.loaders) {
    const matches = loader.regexes.map((regex) => regex.exec(log));
    loader.regexes.forEach((regex) => (regex.lastIndex = 0));
    for (const match of matches) {
      if (match?.groups?.mcver) {
        if (loaderData.mcVersion == "") loaderData.mcVersion = match.groups.mcver;
      }
      if (match?.groups?.loaderver) {
        if (loaderData.loaderVersion == "") loaderData.loaderVersion = match.groups.loaderver;
      }

      if (loaderData.loaderVersion || loaderData.mcVersion) {
        if (loaderData.loader == "") loaderData.loader = loader.loader;
      }
    }

    if (loaderData.loader && loaderData.loaderVersion && loaderData.mcVersion)
      break;
  }

  return loaderData;
}

//original source of getML, regexes and Loaders after update 1.8.5(saturday 7th of may 2022) https://github.com/FireDiscordBot/bot/blob/master/src/modules/mclogs.ts

export const crashFixCache = new jsonCache(
  new repoLink("SkyblockClient", "CrashData", "crashes.json")
);
