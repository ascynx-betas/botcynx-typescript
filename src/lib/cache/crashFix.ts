import { Collection } from "discord.js";
import { indexOf } from "lodash";
import { linkContentPull } from "../repoPull";
import { cache, repoLink } from "./cache";

export class jsonCache extends cache {
  constructor(link: string | repoLink) {
    super(link);
  }

  /**
   * @override - overrides the base reload function from cache - and make it get JSON data instead of text
   */
  async reload() {
    this.data = JSON.parse(await linkContentPull(this.reloader));
  }

  /**
   * - Import data into the current data cache (currently overrides data)
   * @param data - Data to import (currently overrides the internal data)
   */
  importData(data: any) {
    this.data = data;
  }
}

export function checkPossibleLog(possibleLog: string): boolean {
  let isLog = false;

  const logText = [
    "The game crashed whilst",
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
    "[DefaultDispatcher-worker-1] INFO Installer",
    "[DefaultDispatcher-worker-1] ERROR Installer",
    "net.minecraftforge",
    "club.sk1er",
    "gg.essential",
    "View crash report",
  ];

  for (const text of logText) {
    if (possibleLog.includes(text)) {
      isLog = true;
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
  let statuses = [];
  let IDs = [];
  let Versions = [];
  let Sources = [];

  modList.forEach((modInfo, index) => {
    if (modInfo != "" && index >= 11) {
      //is a mod info
      if (modList[index - 1] == "") statuses.push(modInfo);
      //isStatus
      else if (modList[index - 2] == "") IDs.push(modInfo);
      //isID
      else if (modList[index - 3] == "") Versions.push(modInfo);
      //isVersion
      else if (modList[index - 4] == "") Sources.push(modInfo); //isSource
    }
  });

  statuses.forEach((status, index) => {
    let mod: ModCollection = {
      state: status,
      ID: IDs[index],
      version: Versions[index],
      source: Sources[index],
    };

    mods.set(IDs[index], mod);
  });

  return mods;
}

/**
 * ML = ModLoader
 */
export function getML(log: string): string {
  const splitLog = log.split("\n");
  let fml: string;
  splitLog.forEach((line) => {
    if (line.startsWith("\tIs Modded:")) {
      const FML = line.split("'");
      fml = FML[1];
    }
  });

  return fml || "unknown / vanilla";
}

export const crashFixCache = new jsonCache(
  new repoLink("SkyblockClient", "CrashData", "crashes.json")
);
