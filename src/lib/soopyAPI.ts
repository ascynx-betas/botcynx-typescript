import { botcynx } from "..";

export class SoopyAPI {
    private readonly baseURL = "https://soopy.dev/api/v2";
    private USER_AGENT: string;

    private nextResetAt: number;
    private APICallsLastMinute: number;
    private ReachedMax: boolean;

    private activityLog: {[key: string]: number} = {}; //functionName: number of calls

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
        this.APICallsLastMinute = 0;
        this.ReachedMax = false;
    }

    createRequest(endpoint: string, queries: {[key: string]: string} = {}): string {
        if (endpoint.startsWith("/")) {
            endpoint = endpoint.slice(1);
        }

        let newLink = this.baseURL + endpoint;
        
        let isFirstQuery = false;

        for (let key of Object.keys(queries)) {
            if (isFirstQuery) {
                newLink += "?" + key + "=" + queries[key];
                isFirstQuery = false;
            } else {
                newLink += "&" + key + "=" + queries[key];
            }
        }

        return newLink;
    }

    private parseRequest(link: string) {
        let testString = link.replace(this.baseURL, "");
        const r = /\/?(?<endpoint>[a-zA-Z0-9;,/:@&=+$\-_.!]*)(?:\?[a-zA-Z0-9;,/?:@&=+$\-_.!]*$|$)/gmi;

        const result = r.exec(testString);
        if (result?.groups && Object.hasOwn(result.groups, "endpoint")) {
            return result.groups["endpoint"];
        }
        return "unknown";
    }

    async fetchSoopyAPI(link: string, method: "POST" | "GET"  | "PATCH" = "GET", data: any = {}) {
        if (this.ReachedMax && this.nextResetAt > 0) {
            throw new APIError(429, "Total API call limit reached", false);
        }

        const endpoint = this.parseRequest(link);
        !Object.hasOwn(this.activityLog, endpoint) ?
            this.activityLog[endpoint] = 1 :
            this.activityLog[endpoint] += 1;

            return (fetch(link, { headers: {"user-agent": SoopyAPI.INSTANCE.USER_AGENT}, method: method, body: data})).then(
                async (body) => {
                    let data = await body.json();

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
                        switch (body.status) {
                            case 429: {
                                this.ReachedMax = true;
                            }
                            
                        }

                        throw new APIError(body.status, data.error.description);//data.cause could not exist
                    }

                    return data;
                }
            )
    }
}

export const getPlayerNetworth = async function (uuid: string) {
    const req = SoopyAPI.INSTANCE.createRequest("player_skyblock/" + uuid, {
        items: "true",
        networth: "true"
    });

    return (await SoopyAPI.INSTANCE.fetchSoopyAPI(req) as sbProfileWithItemAndNetworth);
}

export class APIError extends Error {
    constructor(code: number, cause: string, thrownByAPI: boolean = true) {
        let message: string;

        if (thrownByAPI == true) {
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