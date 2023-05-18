import { botcynx } from "../index";
import fetch, { Response } from "node-fetch";
import { LogLevel, LoggerFactory } from "./Logger";
import { Loader } from "./cache/crashFix";
import { base62 } from "./utils";
import { ModrinthFileCache, ModrinthModCached } from "./ModrinthFileCache";

//----- Classes -----//

export class Modrinth {
    private static LOGGER = LoggerFactory.getLogger("MODRINTH");

    private static instance: Modrinth;

    static get INSTANCE() {
        if (!Modrinth.instance) {
            this.instance = new Modrinth();
        }
        return this.instance;
    }

    private readonly baseURL = "https://api.modrinth.com/v2/";
    private readonly stageURL = "https://staging-api.modrinth.com/v2/";

    private readonly USER_AGENT: string;

    private readonly rateLimit = 300;

    private lastReset: number;//every 60000 reset APICallsLastMinute
    private APICallsLastMinute: number;//see ratelimit
    private ReachedMax: boolean = false;
    readonly task: NodeJS.Timer;

    get isRateLimited() {
        return this.ReachedMax;
    }

    willRateLimit(requests: number) {
        return this.APICallsLastMinute + requests > this.rateLimit || this.ReachedMax;
    }

    private constructor() {
        this.lastReset = Date.now();
        this.APICallsLastMinute = 0;
        this.ReachedMax = false;
        this.task = this.initTask();  
        this.USER_AGENT = "Ascynx/" + botcynx.getUserAgent();
    }

    private initTask() {
        return setInterval(async () => {
            this.lastReset = Date.now();
            this.APICallsLastMinute = 0;
            this.ReachedMax = false;
            Modrinth.LOGGER?.debug("Reset API usage");
        }, 60000);
    }

    /**
     * Create a request using the base or stage url as base
     * @author Ascynx
     * @return the link
     */
    createRequest(endpoint: string, queries: {[key: string]: string} = {}, mode: "STAGE" | "PROD" = "PROD") {
        if (endpoint.startsWith("/")) {
            endpoint = endpoint.slice(1);
        }

        let url = new URL((mode === "PROD" ? this.baseURL : this.stageURL) + endpoint);

        for (let key of Object.keys(queries)) {
            url.searchParams.append(key, queries[key]);
        }

        return url.toString();
    }

    private async handleResponse(res: Response) {
        this.APICallsLastMinute++;
                if (res.headers["X-Ratelimit-Limit"]) {//piggyback off of headers to update
                    this.APICallsLastMinute = res.headers["X-Ratelimit-Limit"] - res.headers["X-Ratelimit-Remaining"];
                    this.lastReset = Date.now() - (60000 -  (1000 * res.headers["X-Ratelimit-Reset"]));//syncs current reset to remote reset
                }
                if (this.APICallsLastMinute >= this.rateLimit) {
                    this.ReachedMax = true;
                }

                try {
                    let data = await res.json();
                    return {data, status: res.status};
                } catch (e) {
                    return {data: null, status: res.status};
                }
    }

    async postModrinthAPI(link: string, body: any) {
        if (this.ReachedMax) {
            return null;
        }
        return (fetch(link, { headers: { "user-agent" : this.USER_AGENT, "Content-Type": "application/json" }, body, method: "POST" } )).then(async (res) => this.handleResponse(res));
    }

    async fetchModrinthAPI(link: string) {
        if (this.ReachedMax) {
            return null;
        }
        return (fetch(link, { headers: { "user-agent" : this.USER_AGENT } } )).then(async (res) => this.handleResponse(res));
    }

    static log(message: any, loglevel: LogLevel) {
        Modrinth.LOGGER.log(message, loglevel);
    }
}

class ModrinthHttpError extends Error {
    constructor(cause: string, public readonly status: number, public readonly thrownByAPI: boolean, options?: ErrorOptions) {
        let constructedMessage = thrownByAPI ?
            `Modrinth API returned error code ${status} with cause of ${cause}`:
            `Stopped request with error code ${status} with cause of ${cause}`;

        super(constructedMessage, options);
    }
}

//----- Related Functions -----//

export const searchProjects = async (queries: { [key: string]: string }): Promise<ModrinthSearchResponse> => {
    const req = Modrinth.INSTANCE.createRequest("search", queries);

    const data = await Modrinth.INSTANCE.fetchModrinthAPI(req);

    if (data.data === null) {
        Modrinth.log(new ModrinthHttpError(`No projects found for given query`, 404, true), LogLevel.DEBUG);
        return null;
    }

    if ((data.data as ModrinthError).error) {
        Modrinth.log(new ModrinthHttpError((data.data as ModrinthError).description, data.status, true).message, LogLevel.DEBUG);//Probably error 400
        return null;
    }

    return data.data as ModrinthSearchResponse;
}


/** 
 * @param projectIdentifier is either project ID or project slug
*/
export const getProject = async (projectIdentifier: string): Promise<ModrinthProject> => {
    const req = Modrinth.INSTANCE.createRequest(`project/${projectIdentifier}`);

    const data = await Modrinth.INSTANCE.fetchModrinthAPI(req);

    if (data.data === null) {
        Modrinth.log(new ModrinthHttpError(`No project found for given project identifier`, 404, true), LogLevel.DEBUG);
        return null;
    }

    if (data.status === 404) {
        Modrinth.log(new ModrinthHttpError("That requested project was not found or no authorization to see this project", data.status, true), LogLevel.DEBUG);
        return null;
    } else if (data.status > 399) {
        Modrinth.log(new ModrinthHttpError((data.data as ModrinthError).error ? (data.data as ModrinthError).description : "Error encounted in getProject", data.status, true), LogLevel.DEBUG);
        return null;
    }

    return data.data as ModrinthProject;
}

export const getProjects = async (...projectIds: string[]): Promise<ModrinthModCached[]|ModrinthProject[]> => {
    try {
        projectIds = projectIds.filter((v) => {
            v.split('').every((c, i) => {
                const indexOf = base62.charset.indexOf(c);
                if (indexOf == -1) throw new ModrinthHttpError(`Deserialization error: Invalid character '${c}' in base62 encoding at index ${i}`, 400, false);
            });
        });
    } catch (e) {
        return [];
    }
    if (projectIds.length == 0) return [];


    //Cache stuff
    const cachedData: ModrinthModCached[] = [];
    for (let projectID of projectIds) {
        if (ModrinthFileCache.INSTANCE.cache.has(projectID)) {
            const project = ModrinthFileCache.INSTANCE.cache.get(projectID);
            if (ModrinthFileCache.shouldUpdate(project)) break;
            cachedData.push(project);
        }
    }

    if (cachedData.length === projectIds.length) {
        //if everything was found
        return cachedData;
    }

    projectIds.filter((pID) => {
        for (let cached of cachedData) {
            if (cached.projectID !== pID) continue;
            return true;
        }
        return false;
    });
    //end cache stuff

    const req = Modrinth.INSTANCE.createRequest("projects", {"ids": JSON.stringify(projectIds)});

    const data = await Modrinth.INSTANCE.fetchModrinthAPI(req);

    if (data.data === null) {
        Modrinth.log(new ModrinthHttpError(`No project found for given project IDs`, 404, true), LogLevel.DEBUG);
        return [];
    }

    if ((data.data as ModrinthProject[]).length === 0 || (data.data as ModrinthError).error) {
        if (data.status > 399) {
            //error
            Modrinth.log(new ModrinthHttpError((data.data as ModrinthError).error ? (data.data as ModrinthError).description : "Error encounted in getProjects", data.status, true), LogLevel.DEBUG);
            return [];
        }
    }

    //TODO update cache with stuff in data

    return data.data as ModrinthProject[];
}

export const getVersions = async (projectIdentifier: string, loader?: Loader, game_version?: string): Promise<ModrinthVersion[]> => {
    const query = {};
    if (loader) {
        query["loaders"] = JSON.stringify([loader.name.toLowerCase()]);
    }

    if (game_version) {
        query["game_versions"] = JSON.stringify([game_version]);
    }

    const req = Modrinth.INSTANCE.createRequest(`project/${projectIdentifier}/version`, query);

    const data = await Modrinth.INSTANCE.fetchModrinthAPI(req);

    if (data.data === null) {
        Modrinth.log(new ModrinthHttpError(`No versions were found for given project identifier`, 404, true), LogLevel.DEBUG);
        return [];
    }

    if (data.status > 399 || (data.data as ModrinthError).error) {
        Modrinth.log(new ModrinthHttpError((data.data as ModrinthError).error ? (data.data as ModrinthError).description : `Error encounted in getVersions`, data.status, true), LogLevel.DEBUG);
        return [];
    }

    return data.data as ModrinthVersion[];
}

export const getVersion = async (version_id: string): Promise<ModrinthVersion> => {
    if (!version_id.split('').every((c) => base62.charset.indexOf(c) != -1)) {
        return;
    }
    const req = Modrinth.INSTANCE.createRequest(`/version/${version_id}`);

    const data = await Modrinth.INSTANCE.fetchModrinthAPI(req);

    if (data.data === null) {
        Modrinth.log(new ModrinthHttpError(`No version found for given version identifier`, 404, true), LogLevel.DEBUG);
        return null;
    }

    if (data.status > 399 || (data.data as ModrinthError).error) {
        Modrinth.log(new ModrinthHttpError((data.data as ModrinthError).error ? (data.data as ModrinthError).description : `Error encounted in getVersion`, data.status, true), LogLevel.DEBUG);
        return null;
    }

    return data.data as ModrinthVersion;
}

export const getVersionFromHash = async (hash: string, loader: Loader, mcVersion: string): Promise<ModrinthVersion> => {
    const req = Modrinth.INSTANCE.createRequest(`/version_file/${hash}/update`, {algorithm: "sha512"});

    const data = await Modrinth.INSTANCE.postModrinthAPI(req, JSON.stringify({loaders: [loader.name.toLowerCase()], game_versions: [mcVersion]}));

    if (data.data === null) {
        Modrinth.log(new ModrinthHttpError(`No version found for given version identifier`, 404, true), LogLevel.DEBUG);
        return null;
    }

    if (data.status > 399 || (data.data as ModrinthError).error) {
        Modrinth.log(new ModrinthHttpError((data.data as ModrinthError).error ? (data.data as ModrinthError).description : `Error encounted in getVersionFromHash`, data.status, true), LogLevel.DEBUG);
        return null;
    }

    return data.data as ModrinthVersion;
}

//----- Enums -----//
enum Compatibility {
    REQUIRED = "required",
    OPTIONAL = "optional",
    UNSUPPORTED = "unsupported"
}

enum ResourceType {
    MOD = "mod",
    MODPACK = "modpack",
    RESOURCEPACK = "resourcepack",
    SHADER = "shader"
}

enum ProjectStatus {
    APPROVED = "approved",
    REJECTED = "rejected",
    DRAFT = "draft",
    UNLISTED = "unlisted",
    ARCHIVED = "archived",
    PROCESSING = "processing",
    UNKNOWN = "unknown"
}

enum DependencyType {
    REQUIRED = "required",
    OPTIONAL = "optional",
    INCOMPATIBLE = "incompatible",
    EMBEDDED = "embedded",
}

enum ReleaseType {
    RELEASE = "release",
    BETA = "beta",
    ALPHA = "alpha"
}

enum RequestedReleaseStatus {
    LISTED = "listed",
    ARCHIVED = "archived",
    DRAFT = "draft",
    UNLISTED = "unlisted"
}

enum ReleaseStatus {
    LISTED = "listed",
    ARCHIVED = "archived",
    DRAFT = "draft",
    UNLISTED = "unlisted",
    SCHEDULED = "scheduled",
    UNKNOWN = "unknown"
}

enum FileType {
    REQUIRED = "required-resource-pack",
    OPTIONAL = "optional-resource-pack"
}

//----- Types -----//
type DonationUrl = {
    id: string;
    platform: string;
    url: string;
}

type ModeratorMessage = {
    message: string;
    body?: string;
}

type License = {
    id: string;
    name: string;
    url?: string;
}

type Image = {
    url: string;
    featured: boolean;
    title?: string;
    description?: string;
    created: string;                        //ISO-8601 format timestamp
    ordering?: number;
}

type Dependency = {
    version_id?: string;
    project_id?: string;
    file_name?: string;
    dependency_type: DependencyType;
}

type Hashes = {
    sha512: string;
    sha1: string;
}

type File = {
    hashes: Hashes[];
    url: string;
    filename: string;
    primary: boolean;
    size: number;
    file_type?: FileType;
}


//----- Response Types -----//
type ModrinthError = {
    error: string;
    description: string;
}

export type ModrinthProject = {
    slug: string;                           //Regex: ^[\w!@$()`.+,"\-']{3,64}$
    title: string;
    description: string;
    categories: string[],
    client_side: Compatibility;
    server_side: Compatibility;
    body: string;
    additional_categories?: string[],
    issues_url?: string;                     //github url
    source_url?: string;                     //github url
    wiki_url?: string;                       //github url
    discord_url?: string;                    //discord invite link
    donation_urls?: DonationUrl[];
    project_type: ResourceType,
    downloads: number;
    icon_url?: string;
    color?: number;                          //hex code, prolly
    id: string;
    team: string;
    /**
     * @deprecated
     */
    body_url?: string;                       //deprecated
    moderator_message?: ModeratorMessage;
    published: string;                       //ISO-8601 format timestamp
    updated:  string;                        //ISO-8601 format timestamp
    approved?: string;                       //ISO-8601 format timestamp
    followers: number;
    status: ProjectStatus;
    license: License;
    versions: string[];                      //Unless draft status, will never be empty
    game_versions: string[];
    loaders: string[];
    gallery?: Image[];
    featured_gallery?: string;
}

export type ModrinthSearchResponse = {
    hits: ModrinthProject[];
    offset: number;
    limit: number;
    total_hits: number;
}

export type ModrinthVersion = {
    name: string;
    version_number: string;                  //Ideally Semantic versioning
    changelog?: string;
    dependencies?: Dependency[];
    game_versions: string[];
    version_type: ReleaseType;
    loaders: string[];
    featured: boolean;
    status?: ReleaseStatus;
    requested_status?: RequestedReleaseStatus;
    id: string;                              //encoded in base62
    project_id: string;
    author_id: string;
    date_published: string;                  //ISO-8601 format timestamp
    downloads: number;
    /**
     * @deprecated
     */
    changelog_url?: string;                  //deprecated
    files: File[];
}