import {botcynx} from "../index";
import fetch from "node-fetch";
import {key, player, skyblockProfiles, status, Profile} from "../typings/Hypixel";
import {Collection} from "discord.js";

export class HypixelAPI {


    private key = process.env.hypixelapikey;
    private keyStatus: {valid: boolean} = {valid: true};
    private USER_AGENT;
    private readonly baseLink = "https://api.hypixel.net/";

    private lastReset;//every 60000 reset APICallsLastMinute
    private APICallsLastMinute;
    private ReachedMax;

    readonly task;

    private static instance: HypixelAPI;

    static get INSTANCE() {
        if (!HypixelAPI.instance) {
            this.instance = new HypixelAPI();
        }
        return this.instance;
    }

    private constructor() {
        this.USER_AGENT = botcynx.getUserAgent();
        this.lastReset = Date.now();
        this.APICallsLastMinute = 0;
        this.ReachedMax = false;
        this.task = this.initTask();
    }

    private initTask() {
        return setInterval(async () => {
            this.lastReset = Date.now();
            this.APICallsLastMinute = 0;
            this.ReachedMax = false;
        }, 60000);
    }

    /**
     *
     * @param endpoint the endpoint of the api used
     * @param useAPIKey whether it should include the api key in the request or not
     * @param queries the queries added to the endpoint
     * @return link
     */
    createRequest(endpoint: string, useAPIKey: boolean, queries: {[key: string]: string} = {}): string {
        if (endpoint.startsWith("/")) {
            endpoint = endpoint.slice(1);
        }

        let newLink = this.baseLink + endpoint;
        if (useAPIKey) {
            newLink += "?key=" + this.key;
        }

        let isFirstQuery = !useAPIKey;
        for (let key of Object.keys(queries)) {
          if (isFirstQuery) {
              newLink += "?" + key + "=" + queries[key];
          } else {
              newLink += "&" + key + "=" + queries[key];
          }
        }
        return newLink;
    }

    async fetchHypixelAPI(link: string) {
        let hasKey = false;
        if (link.match(new RegExp(`\\?key=${this.key}`))) {
            hasKey = true;
        }

        if (hasKey && !this.keyStatus.valid) {
            throw new HypixelError(500, "API key has been detected as invalid, please change the provided api key");
        } else if (this.ReachedMax) {
            throw new HypixelError(429, "Total API call limit reached last minute");
        }

        return(fetch(link, { headers: { "user-agent": HypixelAPI.INSTANCE.USER_AGENT } } )).then(
            async (body) => {
                let data = await body.json();

                if (data.success == false) {
                    //handle all error codes

                    switch (body.status) {
                        case 429: {
                            //api limit reached
                            //TODO add queue for failed hypixel api request?
                            break;
                        }
                        case 403: {
                            //forbidden, requires api key (not provided or invalid)
                            if (hasKey) {
                                this.keyStatus.valid = false;
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

export const getPlayerByUuid = async function (uuid: string) {
    const req = HypixelAPI.INSTANCE.createRequest("player", true, {uuid: uuid});

    return (await HypixelAPI.INSTANCE.fetchHypixelAPI(req) as player);
}

export const getStatus = async function (uuid: string) {
    const req = HypixelAPI.INSTANCE.createRequest("status", true, {uuid});

    return (await HypixelAPI.INSTANCE.fetchHypixelAPI(req) as status);
}

export const getKeyInfo = async function () {
    const req = HypixelAPI.INSTANCE.createRequest("key", true);

    return (await HypixelAPI.INSTANCE.fetchHypixelAPI(req) as key);
}

export const getProfiles = async function (uuid: string) {
    const req = HypixelAPI.INSTANCE.createRequest("skyblock/profiles", true, {uuid});

    let data: skyblockProfiles = await HypixelAPI.INSTANCE.fetchHypixelAPI(req);
    let profiles: Collection<string, Profile> = new Collection();
    for (let profile of data?.profiles) {
        profiles.set(profile.cute_name, profile);
    }

    return profiles;
}

export class HypixelError extends Error {
    constructor(code: number, cause: string) {
        super(`Hypixel API returned code ${code} for reason: ${cause}`);
    }
}
