import { Collection } from "discord.js";
import { JsonCache, RepoLink } from "./cache";
import { LoggerFactory } from "../Logger";
import { getVersions } from "../ModrinthAPIUtils";
import { ModrinthModVersion } from "../ModrinthFileCache";

const LOGGER = LoggerFactory.getLogger("CRASHFIX");

const logText = [
  "net.minecraft.launchwrapper.Launch",
    "net.fabricmc.loader.impl.launch.knot.KnotClient",
    "net.minecraftforge.fml.common.launcher.FMLTweaker",
    "Launched instance in online mode",
    "# A fatal error has been detected by the Java Runtime Environment:",
    "---- Minecraft Crash Report ----",
    "A detailed walkthrough of the error",
    "launchermeta.mojang.com",
    "Running launcher bootstrap",
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
    // "gg.essential",
    "club.sk1er",
    "fabric-api",
    "Environment: authHost='https://authserver.mojang.com'",
    " with Fabric Loader ",
    "net/digitalingot/feather-server-api-proto",
    'Essential branch set to "stable" via default.',
];

export function checkIfLog(possibleLog: string): boolean {
  let isLog = false;

  for (const text of logText) {
    if ((text == "net.minecraftforge" && possibleLog.includes("import")) || (text == "net.fabricmc" && possibleLog.includes("import"))) {
      isLog = false;
      break;//stops it from triggering on a class
    }

    if (possibleLog.includes(text)) {
      isLog = true;
      break;
    }
  }

  return isLog;
}

type ModCollection = {
  state?: string;
  name?: string;
  ID: string;
  version: string;
  source?: string;
  isDependency?: boolean;
};

type OutdatedMod = {
  outdated: boolean;
  mod: ModCollection;
  latestVersion?: string;
  modrinthURL?: string;
}

export const minecraftVersionRegex = /\d\.\d{1,2}(?:\.\d{1,2})?/;

/**
 * @author Ascynx
 * @returns if the mod is outdated
 */
export async function isModOutdated(mod: ModCollection, loader: Loader, minecraftVersion: string): Promise<OutdatedMod> {
  let outdated = {outdated: false, mod: mod};
  if (loader === Loader.VANILLA || loader === Loader.UNKNOWN) return;
  if (!minecraftVersion.match(minecraftVersionRegex) || !mod.ID.match(/^[\w!@$()`.+,"\-']{3,64}$/)) {
    return outdated;//minecraft version is not valid or mod ID cannot be a slug
  }
  const modVersion = mod.version;
  const versions = await getVersions(mod.ID, loader, minecraftVersion);

  if (!versions || versions.length === 0) return outdated;//received nothing

  const remoteVersions = (versions as ModrinthModVersion[]).filter((v) => v.version_number === modVersion);

  //doesn't have the current installed version (it could be another mod or a private release / modification)
  if (remoteVersions.length === 0) return {outdated: false, modrinthURL: `https://modrinth.com/mod/${mod.ID}`, mod: mod};

  const remoteVersion = remoteVersions[0];

  const latestVersion = versions.sort((a, b) => new Date(b.date_published).getTime() - new Date(a.date_published).getTime())[0];

  return {outdated: (latestVersion !== remoteVersion), latestVersion: latestVersion.version_number, modrinthURL: `https://modrinth.com/mod/${mod.ID}`, mod: mod};
}

/**
 * @author Ascynx
 * @returns an array of the same length as mods which says if the mod is outdated
 */
export async function returnOutdatedMods(mods: ModCollection[], loader: Loader, minecraftVersion: string): Promise<OutdatedMod[]> {
  const out: OutdatedMod[] = [];

  for (const mod of mods) {
    out.push(await isModOutdated(mod, loader, minecraftVersion));
  }

  return out;
}

/**
 * @author Ascynx
 * @returns a list of mods based on the chosen mod loader
 */
export function getMods(Log: string, loader: Loader = Loader.FORGE): Collection<string, ModCollection>  {
  switch(loader) {
    case Loader.FORGE: {
      return getModsForge(Log);
    }
    case Loader.FABRIC: {
      return getModsFabric(Log);
    }
    case Loader.OPTIFINE: {
      let coll: Collection<string, ModCollection> = new Collection();
      coll.set("optifine", {ID: "optifine", version: "unknown", name: "Optifine"});
      return coll;
    }
    case Loader.FEATHER: {
      return getMods(Log, Loader.getML(Log, true).loader);
    }
    default: {
      return new Collection();
    }
  }
}

//get tabs, modid, mod name and mod version (skips if the mod id ends in java/minecraft)
const FabricModRegex = /(?<tabs>\t+)((?<modid>[^\t]*)(?<!(java|minecraft))): (?<modname>.*) (?<modversion>(\d|.)*)/gm;

/**
 * @author Ascynx
 * @returns a list of mods from the fabric mod loader
 */
function getModsFabric(Log: string): Collection<string, ModCollection> {
  const mods: Collection<string, ModCollection> = new Collection();
  //ModID: ModName ModVersion

  //reset regex
  FabricModRegex.lastIndex = 0;
  for (let match of Log.substring(Log.indexOf("Fabric Mods:"), Log.indexOf("Launched Version:")).matchAll(FabricModRegex)) {
    const modColl: ModCollection = {name: match?.groups?.modname, ID: match?.groups?.modid, version: match?.groups?.modversion, isDependency: (match?.groups?.tabs.length > 2)};
    mods.set(match?.groups?.modid, modColl);
  }

  return mods;
}

/**
 * @author Ascynx
 * @returns a list of mods gotten from the forge mod loader
 */
function getModsForge(Log: string): Collection<string, ModCollection> {
  /*
   * source: https://stackoverflow.com/questions/49385915/how-do-i-remove-all-whitespaces-except-those-between-words-with-regular-expressi
   * removes whitespaces in between words
  */
  Log = Log.replace(/\B\s+|\s+\B/gi, "");
  const mods: Collection<string, ModCollection> = new Collection();
  let modList = Log.split("|").slice(1); //get only the mod list (starts at the first "|" and ends at the last "|")
  modList = modList.slice(0, modList.length - 1);
  //every mod is 4 then empty 1st and 2nd aren't part of the mods;
  let lastEmptyInfo = 0

  let modArray: ModCollection[] = [];
  
    modList.forEach((element, index) => {
      let lastMod = modArray[modArray.length - 1];
      if (element !== "" && index >= 10) {
        if (index - 1 == lastEmptyInfo) {//is a mod info/state
          if (lastMod == null || lastMod.state != null) {
            //either the first or after a possibly fully populated mod
            modArray.push({ state: element, ID: null, version: null, source: null });
          } else {
            //already exists and state isn't populated
            lastMod.state = element;
          }
        } else if (index - 2 === lastEmptyInfo) {//is a mod id
          lastMod.ID = element;
        } else if (index - 3 === lastEmptyInfo) {//is a mod version
          lastMod.version = element;
        } else if (index - 4 === lastEmptyInfo) {//is a mod source
          lastMod.source = element;
        } else {
          LOGGER.error(new Error(`Failed during mod parsing at index ${index} marker ${lastEmptyInfo}`));
        }
      } else if (element === "") {
        lastEmptyInfo = index;//set the new index
      }
    });
  
    modArray.forEach((mod) => {
        mods.set(mod.ID, mod);
  });

  return mods;
}


export class Loader {
  //------ Instances ------//

  static readonly UNKNOWN = new Loader(
    'Unknown',
    []
  );

  static readonly FEATHER = new Loader(
    'Feather',
    [
      /Started Feather \((?<loaderver>\w*)\)/gim,
      /Launched Version: (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?(?:-pre\d)?)-feather/gim,
      /FeatherOpt \(FeatherOpt-(?<loaderver>(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))/gim,
    ]
  );

  static readonly FORGE = new Loader(
    'Forge',
    [
      /Forge Mod Loader version (?<loaderver>(?:\d{1,2}\.)?\d{1,3}\.\d{1,3}\.\d{1,5}) for Minecraft (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?) loading/gim,
      /Forge mod loading, version (?<loaderver>(?:\d{1,2}\.)?\d{1,3}\.\d{1,3}\.\d{1,5}), for MC (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?)/gim,
      /--version, (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?)-forge-(?<loaderver>(?:\d{1,2}\.)?\d{1,3}\.\d{1,3}\.\d{1,5})/gim,
      /forge-(?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?)-(?<loaderver>(?:\d{1,2}\.)?\d{1,3}\.\d{1,3}\.\d{1,5})/gim,
      /Launched Version: (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?)-forge(?:\d\.\d{1,2}(?:\.\d{1,2})?)-(?<loaderver>(?:\d{1,2}\.)?\d{1,3}\.\d{1,3}\.\d{1,5})/gim,
    ]
  );

  static readonly FABRIC = new Loader(
    'Fabric',
    [
      /Loading Minecraft (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?(?:-pre\d)?) with Fabric Loader (?<loaderver>\d\.\d{1,3}\.\d{1,3})/gim,
      /Loading for game Minecraft (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?(?:-pre\d)?)/gim,
      /fabricloader(?:@|\s*)(?<loaderver>\d\.\d{1,3}\.\d{1,3})/gim,
      /fabricloader: Fabric Loader (?<loaderver>\d\.\d{1,3}\.\d{1,3})/gim,
      /Is Modded: Definitely; Client brand changed to 'fabric'/gim,
    ]
  );

  static readonly QUILT = new Loader(
    'Quilt',
    [
      /Loading Minecraft (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?(?:-pre\d)?) with Quilt Loader (?<loaderver>\d\.\d{1,3}\.\d{1,3})/gim,
    ]
  )

  static readonly OPTIFINE = new Loader(
    'Vanilla w/Optifine HD U',
    [
      /Launched Version: (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?)-OptiFine_HD_U_(?<loaderver>[A-Z]\d)/gim,
    ]
  );

  //Should only be used for filling in missing informations
  static readonly VANILLA = new Loader(
    'Vanilla',
    [
      /Minecraft Version: (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?)/gim,
      /Launched Version: (?<mcver>\d\.\d{1,2}(?:\.\d{1,2})?)/gim,
    ]
  );

  //------ Static Methods ------//

  static get values(): Loader[] {
    return [
      this.UNKNOWN,         //Unknown loader, before anything is defined
      this.FEATHER,         //Feather, should also check for additional loader
      this.FORGE,           //Forge
      this.FABRIC,          //Fabric loader
      this.QUILT,           //Quilt
      this.OPTIFINE,        //Vanilla w/ Optifine
    ];
  }

  static fromString(string: string): Loader {
    const value = (this as any)[string];
    if (value) {
      return value;
    }

    throw new RangeError(
      `Illegal argument passed to fromString(): ${string} does not correspond to any instance of the enum ${(this as any).prototype.constructor.name}`
    );
  }

   static getML(log: string, ignoreFeather: boolean = false): {
    loaderVersion: string;
    mcVersion: string;
    loader: Loader;
  } {
    let loaderData = {
      loaderVersion: "",
      mcVersion: "",
      loader: this.UNKNOWN
    };
  
    for (const loader of this.values) {
      if (loader === this.UNKNOWN || (ignoreFeather && loader === this.FEATHER)) continue;//if checking unknown or vanilla or feather is disabled (and checking feather)
      const matches = loader.regexes.map((regex) => regex.exec(log));
      loader.resetRegexes();
      for (const match of matches) {
        if (match?.groups?.mcver && loaderData.mcVersion == "") {
            loaderData.mcVersion = match.groups.mcver;
        }
        if (match?.groups?.loaderver && loaderData.loaderVersion == "") {
          loaderData.loaderVersion = match.groups.loaderver;
        }
        if ((loaderData.loaderVersion || loaderData.mcVersion) && loaderData.loader == this.UNKNOWN) {
          loaderData.loader = loader;
        }
      }


      if (loaderData.loader && loaderData.loaderVersion) {
        break;
      }
    }

    //if the version is not defined from what we found before, then search throughout the vanilla regexes.
    if (!loaderData.mcVersion) {
      const matches = this.VANILLA.regexes.map((regex) => regex.exec(log));
      this.VANILLA.resetRegexes();

      for (const match of matches) {
        if (match?.groups?.mcver) {
          loaderData.mcVersion = match.groups.mcver;
          break;
        }
      }

      if (loaderData.loader === this.UNKNOWN) {
        loaderData.loader == this.VANILLA;
      }
    }
  
    return loaderData;
  }

  //------ Constructor------//

  private constructor(
    public readonly name: string,
    public readonly regexes: RegExp[]
  ) {}

  //------ Methods ------//

  public toJSON() {
    return this.name;
  }

  public toString() {
    return this.toJSON();
  }

  resetRegexes() {
    for (let regex of this.regexes) {
      regex.lastIndex = 0;
    }
  }
}

//original source of getML, regexes and Loaders after update 1.8.5(7th of may 2022) https://github.com/FireDiscordBot/bot/blob/master/src/modules/mclogs.ts

export const crashFixCache = new JsonCache(
  new RepoLink("SkyblockClient", "CrashData", "crashes.json")
);
