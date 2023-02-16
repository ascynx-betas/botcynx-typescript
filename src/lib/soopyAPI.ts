import { RequestInit } from "node-fetch";
import fetch from 'node-fetch';
import { botcynx } from "..";
import * as lib from "./index";


//seems like it requires a keep-alive connection (pain)
export class SoopyAPI {
    private readonly baseURL = "https://soopy.dev/api/v2/";
    private USER_AGENT: string;

    private nextResetAt: number;
    private ReachedMax: boolean;

    private activityLog: {[key: string]: number} = {}; //endpoint name: number of calls

    private static instance: SoopyAPI;

    static get INSTANCE() {
        if (!SoopyAPI.instance) {
            this.instance = new SoopyAPI();
        }

        return this.instance;
    }

    private constructor() {
        this.USER_AGENT = botcynx.getUserAgent();
        this.nextResetAt = 0;
        this.ReachedMax = false;
    }

    createRequest(endpoint: string, queries: {[key: string]: string} = {}): URL {
        if (endpoint.startsWith("/")) {
            endpoint = endpoint.slice(1);
        }

        let url = new URL(this.baseURL + endpoint);

        for (let key of Object.keys(queries)) {
            url.searchParams.append(key, queries[key]);
        }

        return url;
    }

    private parseRequest(link: string | URL) {
        let url = link instanceof URL ? link : new URL(link);
        return url.pathname;
    }

    async fetchSoopyAPI(link: string | URL, method: "POST" | "GET"  | "PATCH" = "GET", data: any = {}) {
        console.log(link);
        if (this.nextResetAt <= Date.now()) {
            // manually reset if should have reset by now.
            this.ReachedMax = false;
            this.nextResetAt = 0;
        }

        if (this.ReachedMax && this.nextResetAt > 0) {
            throw new APIError(429, "Total API call limit reached", false);
        }

        const endpoint = this.parseRequest(link);
        !Object.hasOwn(this.activityLog, endpoint) ?
            this.activityLog[endpoint] = 1 :
            this.activityLog[endpoint] += 1;


        const requestInit: RequestInit =  { headers: { "User-Agent": SoopyAPI.INSTANCE.USER_AGENT, "Connection": "Keep-Alive" }, method: method, timeout: 30000};

        if (Object.keys(data).length > 0) {
            requestInit.body = data;
            requestInit.headers["Content-Type"] = "application/json";
        }


        return (fetch(link, requestInit)).then(
            async (res) => {
                if(!res.ok) {
                    console.log("failed request");
                    console.log(res);
                    return null;
                }
                let data;
                console.log(res);
                if (res.headers.get("content-encoding") && res.headers.get("content-encoding") == "gzip") {
                    //incorrect header check error
                    let buf = (await res.buffer());
                    console.log(buf.toString());
                    data = buf.toString()
                } else {
                    data = await res.json();
                }

                if (data["rateLimitInfo"]) {
                    //uses
                    //resetsIn
                    //rateLimitLeft
                    //rateLimitMax
                    //20 max

                    this.nextResetAt = Date.now() + data["rateLimitInfo"]["resetsIn"];

                    if (data["rateLimitInfo"]["uses"] == data["rateLimitInfo"]["rateLimitMax"]) {
                        this.ReachedMax = true;
                    }
                }

                if (!data.success) {//either false or null
                    switch (res.status) {
                        case 429: {
                            this.ReachedMax = true;
                        }
                            
                    }

                    throw new APIError(res.status, data.error.description);//data.cause could not exist
                }

                return data;
            }
        )
    }
}

export const getPlayerNetworth = async function (uuid: string) {
    //{
    //    items: "true",
    //    networth: "true"
    //}
    const req = SoopyAPI.INSTANCE.createRequest("player_skyblock/" + uuid);

    let data = await lib.getRawProfiles(uuid);
    console.log("got profiles");

    return (await SoopyAPI.INSTANCE.fetchSoopyAPI(req, "POST", JSON.stringify(data["profiles"])) as sbProfileWithItemAndNetworth);
}

export class APIError extends Error {
    constructor(code: number, cause: string, thrownByAPI: boolean = true) {
        let message: string;

        if (thrownByAPI) {
            message = `API returned code ${code} for reason: ${cause}`;
        } else {
            message = `Stopped request with code ${code} for reason: ${cause}`;
        }

        super(message);
    }
}

type baseSoopyResponse = {
    success: boolean;
    error?: {
        name: string;
        description: string;
    }
    rateLimitInfo: {
        uses: number;
        resetsIn: number;
        rateLimitLeft: number;
        rateLimitMax: number;
    };
}

type sbProfileWithItemAndNetworth = {
    data?: {
        uuid: string;
        stats: {
            profileCount: number;
            bestProfileId: string;
            currentProfileId: string;
        };
        profiles: {
            [key: string]: {
                stats: {
                    gamemode?: string;
                    cute_name: string;
                    bank_balance?: number;
                };
                members: {
                    [key: string]: {
                       coin_purse: number;
                       fairy_souls_collected: number;
                       fairy_souls: number;
                       fairy_exchanges: number;
                       fishing_treasure_caught: number;
                       death_count: number;
                       last_death: number;
                       crafted_minions: string[];
                       slayer: {
                        totalExp: number;
                        zombie: {
                            xp: number;
                            level: number;
                            kills: number[];
                            claimed_level: number;
                        };
                        spider: {
                            xp: number;
                            level: number;
                            kills: number[];
                            claimed_level: number;
                        };
                        wolf: {
                            xp: number;
                            level: number;
                            kills: number[];
                            claimed_level: number;
                        };
                        enderman: {
                            xp: number;
                            level: number;
                            kills: number[];
                            claimed_level: number;
                        };
                        blaze: {
                            xp: number;
                            level: number;
                            kills: number[];
                            claimed_level: number;
                        };
                       };
                       pets: {
                        uuid: string;
                        type: string;
                        exp: number;
                        active: boolean;
                        tier: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
                        heldItem: string;
                        candyUsed: number;
                        skin: string;
                        level: number;
                        name: string;
                        xpMax: number;
                        price: number;
                        base: number;
                        calculation: {id: string; type: string; price: number; count: number;}[];
                        soulbound: boolean;
                       }[];
                       selectedPet: {
                        uuid: string;
                        type: string;
                        exp: number;
                        active: boolean;
                        tier: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
                        heldItem: string;
                        candyUsed: number;
                        skin: string;
                        level: number;
                        name: string;
                        xpMax: number;
                        price: number;
                        base: number;
                        calculation: {id: string; type: string; price: number; count: number;}[];
                        soulbound: boolean;
                       };
                       dungeons: {
                        selected_class: "berserk" | "healer" | "archer" | "tank" | "mage";
                        catacombs_level: number;
                        catacombs_exp: number;
                        class_levels: {
                            berserk: {xp: number; level: number;}
                            healer: {xp: number; level: number;}
                            archer: {xp: number; level: number;}
                            tank: {xp: number; level: number;}
                            mage: {xp: number; level: number;}
                        };
                        daily_runs: {
                            current_day_stamp: number;
                            completed_runs_count: number;
                        };
                        treasures: {
                            id: string;
                            timestamp: number;
                            dungeon_type: "catacombs";
                            dungeon_tier: number;
                            bought: boolean;
                            rerolled: boolean;
                            chestKeyed: boolean;
                            chests: {
                                wood: {
                                    paid: boolean;
                                    quality: number;
                                    rerolls: number;
                                    rewards: {
                                        rewards: string[]
                                        rolled_rng_meter_randomly: boolean;
                                        shiny_eligible: boolean;
                                    }
                                    shiny_eligible: boolean;
                                };
                                gold?: {
                                    paid: boolean;
                                    quality: number;
                                    rerolls: number;
                                    rewards: {
                                        rewards: string[]
                                        rolled_rng_meter_randomly: boolean;
                                        shiny_eligible: boolean;
                                    }
                                    shiny_eligible: boolean;
                                };
                                diamond?: {
                                    paid: boolean;
                                    quality: number;
                                    rerolls: number;
                                    rewards: {
                                        rewards: string[]
                                        rolled_rng_meter_randomly: boolean;
                                        shiny_eligible: boolean;
                                    }
                                    shiny_eligible: boolean;
                                };
                                emerald?: {
                                    paid: boolean;
                                    quality: number;
                                    rerolls: number;
                                    rewards: {
                                        rewards: string[]
                                        rolled_rng_meter_randomly: boolean;
                                        shiny_eligible: boolean;
                                    }
                                    shiny_eligible: boolean;
                                };
                                obsidian?: {
                                    paid: boolean;
                                    quality: number;
                                    rerolls: number;
                                    rewards: {
                                        rewards: string[]
                                        rolled_rng_meter_randomly: boolean;
                                        shiny_eligible: boolean;
                                    }
                                    shiny_eligible: boolean;
                                };
                                bedrock?: {
                                    paid: boolean;
                                    quality: number;
                                    rerolls: number;
                                    rewards: {
                                        rewards: string[]
                                        rolled_rng_meter_randomly: boolean;
                                        shiny_eligible: boolean;
                                    }
                                    shiny_eligible: boolean;
                                };
                            };
                        }[];
                       }
                    }
                }
                cute_name: string;

                skyhelperNetworth: {
                    total: number;
                    categories: {
                        coins: number;
                        armor: number;
                        equipment: number;
                        wardrobe: number;
                        inventory: number;
                        enderchest: number;
                        accessories: number;
                        personal_vault: number;
                        storage: number;
                        sacks: number;
                        essence: number;
                        pets: number;
                    }
                }
                nwDetailed: {
                    noInventory: boolean;
                    networth: number;
                    unsoulboundNetworth: number;
                    purse: number;
                    bank: number;
                    types: {
                        armor: {
                            total: number;
                            unsoulboundTotal: number;
                            items: {
                               name: string;
                               id: string;
                               price: number;
                               base: number;
                               calculation: {
                                id: string;
                                type: string,
                                price: number;
                                count: number;
                               }[];
                               count: number;
                               soulbound: boolean; 
                            }[];
                        };
                        equipment: {
                            total: number;
                            unsoulboundTotal: number;
                            items: {
                               name: string;
                               id: string;
                               price: number;
                               base: number;
                               calculation: {
                                id: string;
                                type: string,
                                price: number;
                                count: number;
                               }[];
                               count: number;
                               soulbound: boolean; 
                            }[];
                        };
                        wardrobe: {
                            total: number;
                            unsoulboundTotal: number;
                            items: {
                               name: string;
                               id: string;
                               price: number;
                               base: number;
                               calculation: {
                                id: string;
                                type: string,
                                price: number;
                                count: number;
                               }[];
                               count: number;
                               soulbound: boolean; 
                            }[];
                        };
                        inventory: {
                            total: number;
                            unsoulboundTotal: number;
                            items: {
                               name: string;
                               id: string;
                               price: number;
                               base: number;
                               calculation: {
                                id: string;
                                type: string,
                                price: number;
                                count: number;
                               }[];
                               count: number;
                               soulbound: boolean; 
                            }[];
                        };
                        enderchest: {
                            total: number;
                            unsoulboundTotal: number;
                            items: {
                               name: string;
                               id: string;
                               price: number;
                               base: number;
                               calculation: {
                                id: string;
                                type: string,
                                price: number;
                                count: number;
                               }[];
                               count: number;
                               soulbound: boolean; 
                            }[];
                        };
                        accessories: {
                            total: number;
                            unsoulboundTotal: number;
                            items: {
                               name: string;
                               id: string;
                               price: number;
                               base: number;
                               calculation: {
                                id: string;
                                type: string,
                                price: number;
                                count: number;
                               }[];
                               count: number;
                               soulbound: boolean; 
                            }[];
                        };
                        personal_vault: {
                            total: number;
                            unsoulboundTotal: number;
                            items: {
                               name: string;
                               id: string;
                               price: number;
                               base: number;
                               calculation: {
                                id: string;
                                type: string,
                                price: number;
                                count: number;
                               }[];
                               count: number;
                               soulbound: boolean; 
                            }[];
                        };
                        storage: {
                            total: number;
                            unsoulboundTotal: number;
                            items: {
                               name: string;
                               id: string;
                               price: number;
                               base: number;
                               calculation: {
                                id: string;
                                type: string,
                                price: number;
                                count: number;
                               }[];
                               count: number;
                               soulbound: boolean; 
                            }[];
                        };
                        sacks: {
                            total: number;
                            unsoulboundTotal: number;
                            items: {
                               name: string;
                               id: string;
                               price: number;
                               base: number;
                               calculation: {
                                id: string;
                                type: string,
                                price: number;
                                count: number;
                               }[];
                               count: number;
                               soulbound: boolean; 
                            }[];
                        };
                        essence: {
                            total: number;
                            unsoulboundTotal: number;
                            items: {
                               name: string;
                               id: string;
                               price: number;
                               base: number;
                               calculation: {
                                id: string;
                                type: string,
                                price: number;
                                count: number;
                               }[];
                               count: number;
                               soulbound: boolean; 
                            }[];
                        };
                        pets: {
                            total: number;
                            unsoulboundTotal: number;
                            items: {
                               name: string;
                               id: string;
                               price: number;
                               base: number;
                               calculation: {
                                id: string;
                                type: string,
                                price: number;
                                count: number;
                               }[];
                               count: number;
                               soulbound: boolean; 
                            }[];
                        };
                    }
                }
            }
        }
    }
} & baseSoopyResponse

type playerLBNetworth = {
    data?: {
        data: {
            position: number;
            userData: {
                _id: string;
                uuid: string;
                _loadedTime: number;
                catacombsLevel: number;
                exists: boolean;
                networth: number;
                skillAvg: number;
                totalSlayer: number;
                username: string;
                weight: number;
                catacombsXp: number;
                classAverage: number;
                lastUpdatedHistory: {[key: string]: number};
                bestiary: number;
                gamemode: string;
                usernameLower: string;
                skillAvgOver60: number;
                svLvl: number;
            }
        }
    };
} & baseSoopyResponse;