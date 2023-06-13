import {botcynx} from "../index";
import fetch from "node-fetch";
import {Key, Player, Status, Profile, PlayerCount} from "../typings/Hypixel";
import {Collection} from "discord.js";
import EventEmitter from "events";
import { HypixelAPIEvents } from "../structures/Event";
import { LoggerFactory } from "./Logger";

//----- Classes -----//

export class HypixelAPI extends EventEmitter implements HypixelEmitter {
    private LOGGER = LoggerFactory.getLogger("HYPIXEL");

    getLogger() {
        return this.LOGGER;
    }

    private key = process.env.hypixelapikey;
    private keyStatus: {valid: boolean} = {valid: true};

    public setKeyStatus(isValid: boolean): boolean {
        this.keyStatus.valid = isValid;
        if (!isValid) {
            this.emit("invalidAPIKey");
        }
        return isValid;
    }

    private USER_AGENT: string;
    private readonly baseURL = "https://api.hypixel.net/";

    private lastReset: number;//every 5*60000 reset APICallsLastMinute
    private APICallsLastMinute: number;
    private ReachedMax: boolean;
    private limit: number = 120;

    private activityLog: {[key: string]: number} = {};//functionName: number of calls

    readonly task: NodeJS.Timer;

    private static instance: HypixelAPI;

    static get INSTANCE() {
        if (!HypixelAPI.instance) {
            this.instance = new HypixelAPI();
        }
        return this.instance;
    }

    private constructor() {
        super();
        this.USER_AGENT = botcynx.getUserAgent();
        this.lastReset = Date.now();
        this.APICallsLastMinute = 0;
        this.ReachedMax = false;
        this.task = this.initTask();
    }

    /**
     * TODO make it possible to synchronize task based on request headers.
     */
    private initTask() {
        return setInterval(async () => {
            this.emit("reset", {lastReset: this.lastReset, APICallsLastMinute: this.APICallsLastMinute, ReachedMax: this.ReachedMax, activityLog: this.activityLog});
            this.lastReset = Date.now();
            this.APICallsLastMinute = 0;
            this.ReachedMax = false;
            this.activityLog = {};
        }, 5*60000);
    }

    /**
     *
     * @param endpoint the endpoint of the api used
     * @param useAPIKey whether it should include the api key in the request or not
     * @param queries the queries added to the endpoint
     * @return link
     */
    createRequest(endpoint: string, queries: {[key: string]: string} = {}): string {
        if (endpoint.startsWith("/")) {
            endpoint = endpoint.slice(1);
        }

        let url = new URL(this.baseURL + endpoint);

        for (let key of Object.keys(queries)) {
            url.searchParams.append(key, queries[key]);
        }

        return url.toString();
    }

    private parseRequest(link: string) {
        let url = new URL(link);
        return url.pathname;
    }

    async fetchHypixelAPI(link: string, useAPIKey: boolean = false) {

        //pre-request errors.
        if (useAPIKey && !this.keyStatus.valid) {
            throw new HypixelError(500, "API key has been detected as invalid, please change the provided api key", false);
        } else if (this.ReachedMax || this.APICallsLastMinute > this.limit) {
            this.ReachedMax = true;
            this.emit("rateLimit", {eventType: "client"})
            throw new HypixelError(429, "Total API call limit reached last minute", false);
        }

        //Log which endpoint is used.
        const endpoint = this.parseRequest(link);
        !Object.hasOwn(this.activityLog, endpoint) ?
            this.activityLog[endpoint] = 1 :
            this.activityLog[endpoint] += 1;
        

        let headers = { "user-agent": HypixelAPI.INSTANCE.USER_AGENT };
        if (useAPIKey) {
            headers["Api-Key"] = this.key;
        }

        return(fetch(link, { headers } )).then(
            async (body) => {
                let data = await body.json();

                //piggyback off of headers to sync ratelimit
                const headers = body.headers;

                const limit = headers.get("RateLimit-Limit");
                const remaining = headers.get("RateLimit-Remaining");
                if (parseInt(limit)) {
                    this.limit = parseInt(limit);
                }
                if (parseInt(remaining)) {
                    this.APICallsLastMinute = (this.limit - parseInt(remaining));
                }

                if (data.success == false) {
                    //handle all known error codes
                    switch (body.status) {
                        case 429: {
                            //api limit reached
                            //TODO add queue for failed hypixel api request?
                            this.emit("rateLimit", {eventType: "server"})
                            break;
                        }
                        case 403: {
                            //forbidden request, requires api key (not provided or invalid)
                            if (useAPIKey) {
                                this.setKeyStatus(false);
                            }
                            break;
                        }
                    }

                    throw new HypixelError(body.status, data.cause);
                }
                this.APICallsLastMinute++;//add a single call;
                return data;
            }
        )
    }
}

export class HypixelError extends Error {
    constructor(code: number, cause: string, thrownByAPI: boolean = true) {
        let message: string;

        if (thrownByAPI == true) {
            message = `Hypixel API returned code ${code} for reason: ${cause}`;
        } else {
            message = `Stopped request with code ${code} for reason: ${cause}`;
        }

        super(message);
    }
}

//----- Functions -----//

export const getPlayerByUuid = async function (uuid: string) {
    const req = HypixelAPI.INSTANCE.createRequest("player", {uuid: uuid});

    return (await HypixelAPI.INSTANCE.fetchHypixelAPI(req, true) as Player);
}

export const getStatus = async function (uuid: string) {
    const req = HypixelAPI.INSTANCE.createRequest("status", {uuid});

    return (await HypixelAPI.INSTANCE.fetchHypixelAPI(req, true) as Status);
}

/**@deprecated planned removal on the 14th of August 2023*/
export const getKeyInfo = async function () {
    const req = HypixelAPI.INSTANCE.createRequest("key");

    return (await HypixelAPI.INSTANCE.fetchHypixelAPI(req, true) as Key);
}

export const getCurrPlayerCount = async function () {
    const req = HypixelAPI.INSTANCE.createRequest("counts");

    return (await HypixelAPI.INSTANCE.fetchHypixelAPI(req, true) as PlayerCount);
}

export const getRawProfiles = async function (uuid: string) {
    const req = HypixelAPI.INSTANCE.createRequest("skyblock/profiles", {uuid});

    const data = await HypixelAPI.INSTANCE.fetchHypixelAPI(req, true);

    if (data?.profiles && data?.profiles == null) {
        throw new HypixelError(404, "Player doesn't have profiles", false);
    }

    return data;
}


export const getProfiles = async function (uuid: string) {
    let data = await getRawProfiles(uuid);
    let profiles: Collection<string, Profile> = new Collection();

    //sort by last saved profile

    for (let profile of data?.profiles) {
        profiles.set(profile.cute_name, profile);
    }

    return profiles;
}

//----- Types -----//

declare type Awaitable<T> = PromiseLike<T> | T;
declare interface HypixelEmitter {
    on<K extends keyof HypixelAPIEvents>(event: K, listener: (...args: HypixelAPIEvents[K]) => Awaitable<void>): this;
    on<S extends string | symbol>(
    event: Exclude<S, keyof HypixelAPIEvents>,
    listener: (...args: any[]) => Awaitable<void>,
    ): this;
}