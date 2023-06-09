import { LoggerFactory } from "./Logger";
import * as fs from "fs";
import { Loader, minecraftVersionRegex } from "./cache/crashFix";
import { Collection } from "discord.js";
import { ModrinthProject, ModrinthVersion, getProject } from "./ModrinthAPIUtils";

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

    private readonly kTypes: {[key: string]: "number" | "string" | "array" | "loaderArray" | "gameVersionArray"} = {
        "lastUpdated": "number",
        "slug": "string",
        "id": "string",
        "title": "string",
        "versions.version_number": "string",
        "versions": "array",
        "versions.loader": "loaderArray",
        "versions.game_versions": "gameVersionArray"
    };

    public readonly cache = this.parse(this.read(ModrinthFileCache.FilePath));


    getByID(projectID: string): ModrinthModCached | null {
        const projects = this.cache.filter((v) => v.id === projectID);
        return projects.size > 0 ? projects.first() : null;
    }

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

    toJSON(): string {
        const projects = this.cache;
        const object = {};

        projects.forEach(
            (v, k) => {
                if (v.linked) {
                    object[k] = `&${v.linked}`;
                } else {
                    object[k] = v;
                }
            }
        )

        return JSON.stringify(object, null, 2);
    }

    save(path: string) {
        fs.writeFileSync(path, this.toJSON());
    }

    //----- Utility methods -----//
    static shouldUpdate(mod: ModrinthModCached) {
        //(last Updated + 1 day in milliseconds)
        return (mod.lastUpdated + 86400000) - Date.now() <= 0;
    }

    private isKRightType(k: string, v: any): boolean {
        if (!this.kTypes) {
            throw new Error("kTypes have not yet been initialized");
        }
        if (["array"].includes(this.kTypes[k])) {
            if (!Array.isArray(v)) return false;
            let rightTypeArray = false;
            for (let i = 0; i < (v as Array<object>).length; i++) {
                let obj = v[i];
                for (let key in obj) {
                    const typeCheckerKey = `${k}.${key}`;
                    switch (this.kTypes[typeCheckerKey]) {
                        case "loaderArray": {
                            rightTypeArray = rightTypeArray || (obj[key] as string[]).every((string) => Loader.fromString((string as String).toUpperCase()));
                            break;
                        }
                        case "gameVersionArray": {
                            rightTypeArray = rightTypeArray || (obj[key] as string[]).every((string) => minecraftVersionRegex.test(string));
                            break;
                        }
                        default: {
                            rightTypeArray = rightTypeArray || this.isKRightType(typeCheckerKey, obj[key]);
                        }
                    }
                }
            }

            return rightTypeArray;
        }
        if (typeof v === this.kTypes[k]) {
            return true;
        }
        ModrinthFileCache.LOGGER.debug(this.kTypes[k] ? `${k}=${v} is not of type ${this.kTypes[k]}` : `Key/value pair ${k}=${v} is not recognized`);
        return false;
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
                        //create a deep clone of the original
                        Object.assign(modObject, parsedObject.get(linkedModID));
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

                    if (k !== "versions") {
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

    //----- Update methods -----//

    updateProjects(...projects: ModrinthProject[]) {
        for (const project of projects) {
            this.updateProject(project);
        }
    }

    updateProject(project: ModrinthProject) {
        //get relevant data, check if the project alr exists in cache, update cache or create new entry
        const newObject = {};
        
        //parse and get relevant data
        for (const k in project) {
            const v = project[k];

            if (!this.isKRightType(k, v)) continue;

            //versions are set as ids so they should not be included
            if (k !== "versions") {
                newObject[k] = v;
            }
        }

        if (!newObject["slug"] || !newObject["id"]) {
            throw new Error("Could not update project " + project.id);
        }

        newObject["versions"] = [];

        if (this.cache.some((v) => v.id === project.id)) {
            //set update to original, changes will be carried over to linked ones on cache update.
            const cachedData = this.cache.filter((v) => v.id === project.id && !v.linked).first();
            for (const k in cachedData) {
                if (k === "versions") continue;//skip this as it is always empty in the new object
                if (cachedData[k] !== newObject[k]) {
                    cachedData[k] = newObject[k];
                }
            }

            cachedData["lastUpdated"] = Date.now();

            this.cache.set(project.slug, cachedData);
            return;
        }

        this.cache.set(project.slug, (newObject as ModrinthModCached));
    }

    async updateVersions(...versions: ModrinthVersion[]) {
        if (versions.length === 0) return;
        const projectID = versions[0].project_id;
        let cachedData = this.getByID(projectID);
        if (!cachedData) {
            //create from modrinth api
            const project = await getProject(projectID);
            if (project !== null) {
                this.updateProject(project);
            } else {
                throw new Error(`Could not create cache for project slug ${projectID}`);
            }
            cachedData = this.getByID(projectID);
        }

        //If this happens, something went really wrong.
        if (!cachedData) throw new Error("Could not find project for id: " + versions[0].project_id);

        const newVersions = [];
        let newVersion = {"loaders" : [], "game_versions": []};

        versions.sort((a, b) => new Date(b.date_published).getTime() - new Date(a.date_published).getTime());
        for (const version of versions) {
            if (!newVersion["version_number"]) {
                newVersion["version_number"] = version.version_number;
                for (let loaderString of version.loaders) {
                    try {
                        const loader = Loader.fromString(loaderString.toUpperCase());
                        newVersion["loaders"].push(loader);
                    } catch (e) {
                        ModrinthFileCache.LOGGER.error(new Error(`Expected Loader convertible, received ${JSON.stringify(loaderString)}`));
                    }
                }
                newVersion["game_versions"] = version.game_versions;
            } else if (newVersion["version_number"] && newVersion["version_number"] == version.version_number) {
                for (let loaderString of version.loaders) {
                    try {
                        const loader = Loader.fromString(loaderString.toUpperCase());
                        if (!newVersion["loaders"].includes(loader)) newVersion["loaders"].push(loader);
                    } catch (e) {
                        ModrinthFileCache.LOGGER.error(new Error(`Expected Loader convertible, received ${JSON.stringify(loaderString)}`));
                    }
                }
                for (let gameVersion of version.game_versions) {
                    if (!newVersion["game_versions"].includes(gameVersion)) newVersion["game_versions"].push(gameVersion);
                }
            } else {
                //has version number but isn't same
                newVersions.push(newVersion);
                newVersion = {"loaders" : [], "game_versions": []};

                newVersion["version_number"] = version.version_number;
                for (let loaderString of version.loaders) {
                    try {
                        const loader = Loader.fromString(loaderString.toUpperCase());
                        newVersion["loaders"].push(loader);
                    } catch (e) {
                        ModrinthFileCache.LOGGER.error(new Error(`Expected Loader convertible, received ${JSON.stringify(loaderString)}`));
                    }
                }
                newVersion["game_versions"] = version.game_versions;
            }
        }
        
        //filter versions that don't exist
        newVersions.filter((version) => {
            const cachedVersions = cachedData.versions;
            return cachedVersions.length > 0 && !cachedVersions.some((v) => v === version.version_number);
            //||cachedVersions.filter((v) => v.version_number === version.version_number) !== version; //could be useful if new informations are added to version cache.
        });

        cachedData.versions.push(...newVersions);
        cachedData.lastUpdated = Date.now();

        this.cache.set(cachedData.slug, cachedData);

        Buffer.from("test").toString("ascii");
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
    id: string;
    title: string;
    versions?: ModrinthModVersion[];
    lastUpdated: number;
    linked?: string;
}