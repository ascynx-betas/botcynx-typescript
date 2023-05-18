import { LoggerFactory } from "./Logger";
import * as fs from "fs";
import { Loader, minecraftVersionRegex } from "./cache/crashFix";
import { Collection } from "discord.js";
import { ModrinthProject } from "./ModrinthAPIUtils";

//----- Classes -----//

export class ModrinthFileCache {
    private static readonly LOGGER = LoggerFactory.getLogger("MODRINTH-CACHE");

    private static FilePath = `${process.cwd()}/cache/modrinth.json`;
    
    private static instance = new ModrinthFileCache();
    public static get INSTANCE() {
        if (!ModrinthFileCache.instance) {
            ModrinthFileCache.instance = new ModrinthFileCache();
        }

        return ModrinthFileCache.instance;
    }

    public readonly cache = this.parse(this.read(ModrinthFileCache.FilePath));

    read(path: string): object {
        const fileData = fs.readFileSync(path);
        try {
            const fileContent = fileData.toString();
            const object = JSON.parse(fileContent);

            return object;
        } catch (e) {
            ModrinthFileCache.LOGGER.error(e);
        }

        return null;
    
    
    }
    static shouldUpdate(mod: ModrinthModCached) {
        //(last Updated + 1 day in milliseconds)
        return (mod.lastUpdated + 86400000) - Date.now() <= 0;
    }

    private isKRightType(k: string, v: any): boolean {
        switch (k) {
            case "lastUpdated": {
                if (!(typeof v === "number")) {
                    ModrinthFileCache.LOGGER.error(new Error(`Expected Number, received ${typeof v}`));
                    return false;
                }
                return true;
            }
            case "slug":
            case "projectID":
            case "title":
            case "version.version_number": {
                if (!(typeof v === "string")) {
                    ModrinthFileCache.LOGGER.error(new Error(`Expected String, received ${typeof v}`));
                    return false;
                }
                return true;
            }
            case "versions": {
                if (Array.isArray(v)) {
                    let rightTypeArray = false;
                    for (let i = 0; i < (v as Array<object>).length; i++) {
                        let obj = v[i];
                        for (let key in obj) {
                            rightTypeArray = rightTypeArray || this.isKRightType("version."+key, obj[key]);
                        }
                    }

                    if (rightTypeArray) {
                        return true;
                    }
                }
                ModrinthFileCache.LOGGER.error(new Error(`Expected Version Array, received ${typeof v}`));
                return false;
            }
            case "version.loaders": {
                if (Array.isArray(v)) {
                    for (let i = 0; i < (v as Array<string>).length; i++) {
                        let string = v[i];

                        try {
                            Loader.fromString((string as String).toUpperCase());
                        } catch (e) {
                            ModrinthFileCache.LOGGER.error(new Error(`Expected Loader convertible, received ${JSON.stringify(string)}`));
                            return false;
                        }
                    }
                    //It'd return false if any of the loaders are incorrect anyway.
                    return true;
                }
                ModrinthFileCache.LOGGER.error(new Error(`Expected Loader Array, received ${typeof v}`));
                return false;//wrong type
            }
            case "version.game_versions": {
                if (Array.isArray(v)) {
                    for (let i = 0; i < (v as Array<string>).length; i++) {
                        let string = v[i];

                        if (!minecraftVersionRegex.test(string)) {
                            ModrinthFileCache.LOGGER.error(new Error(`Expected Game version, received ${JSON.stringify(string)}`));
                            return false;
                        }
                    }

                    //It'd return false if any of the game versions are incorrect anyway.
                    return true;
                }
                ModrinthFileCache.LOGGER.error(new Error(`Expected Game version Array, received ${typeof v}`));
                return false;//wrong type
            }

            default: {
                ModrinthFileCache.LOGGER.error(new Error(`Key/value pair ${k}=${v} is not recognized`));
                return false;
            }
        }
    }

    private parse(obj: object): Collection<string, ModrinthModCached> {
        /**
         * see ModrinthCacheType
         * 
         * {
         *  "modid": {
         *          "slug": string,
         *          "projectID": string,
         *          "title": string,
         *          "versions": [
         *              {
         *                  "version_number": string,
         *                  "loaders": string[],//the string being a Loader convertible
         *                  "game_versions": string[]
         *              }
         *          ],
         *          "lastUpdated": number
         *      },
         *  "othermodid": "&modid"
         * }
         */

        let parsedObject: Collection<string, ModrinthModCached> = new Collection();

        for (let modid in obj) {
            let modObject = {};

            let mod = obj[modid];
            if (typeof mod === "string") {
                if (mod.startsWith("&")) {
                    let linkedModID = mod.slice(1);

                    if (parsedObject.has(linkedModID)) {
                        modObject = parsedObject.get(linkedModID);
                        modObject["linked"] = linkedModID;
                    } else {
                        ModrinthFileCache.LOGGER.error(new Error(`modID: ${linkedModID} is not defined`));
                        continue;
                    }
                }
            } else {
                for (let k in mod) {
                    const v = mod[k];

                    if (!this.isKRightType(k, v)) continue;

                    if ((k !== "versions")) {
                        modObject[k] = v;
                    } else if (k === "versions") {
                      //need to set loaders to a loader array
                      const parsedVersionArray = [];
                      for (let i = 0; i < (v as Array<object>).length; i++) {
                        let versionObject = v[i];

                        let parsedVersionObject = {game_versions: versionObject["game_versions"], version_number: versionObject["version_number"], loaders: []};

                        for (let loaderIndex = 0; loaderIndex < versionObject["loaders"].length; loaderIndex++) {
                            const loaderString = versionObject["loaders"][loaderIndex];
                            try {
                                const loader = Loader.fromString((loaderString as String).toUpperCase());
                                parsedVersionObject.loaders.push(loader);
                            } catch (e) {
                                ModrinthFileCache.LOGGER.error(new Error(`Error during Loader parsing at ${modid}.${k}[${i}].loaders[${loaderIndex}]`));
                                continue;
                            }
                        }
                        parsedVersionArray.push(parsedVersionObject);
                      }

                      modObject[k] = parsedVersionArray;
                    }
                }
            }

            parsedObject.set(modid, (modObject as ModrinthModCached));
        }

        //at this point, it was parsed and should be of the ModrinthCacheType type
        return parsedObject;
    }

    updateUsing(project: ModrinthProject) {
        //get relevant data, check if the project alr exists in cache, update cache or create new entry
        
    }


}

//----- Types -----//

export type ModrinthModVersion = {
    version_number: string;
    loaders: Loader[],
    game_versions: string[];
}

export type ModrinthModCached = {
    slug: string;
    projectID: string;
    title: string;
    versions: ModrinthModVersion[];
    lastUpdated: number;
    linked?: string;
}