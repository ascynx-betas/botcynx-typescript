import { Collection } from "discord.js";

export class RepoCache {
    private ProfileCache: Collection<string, RepoProfile>;
    private Calls: string[];

    private static instance: RepoCache;

    private constructor() {
        this.ProfileCache = new Collection();
        this.Calls = [];
    }

    static get INSTANCE() {
        if (!this.instance) {
            this.instance = new RepoCache();
        }

        console.log(this.caller);

        return this.instance;
    }

    public getProfile(profileName: string) {
        this.ProfileCache.get(profileName);
    }

    public async getQuery(query: string) {
        if (this.Calls.includes(query)) {

        }

        //do request
    }
}

export class RepoProfile {
    name: string;
    owner: string;
    description: string;
    repoURL: string;
    stars: number;
    forks: number;

    constructor(item: RepoItem) {
        let description: string;
        if (item.description?.length <= 200) {
            description = item.description;
        } else if (item.description?.length >= 200) {
            description = item.description.slice(0, 196) + "... ";
        } else description = "no description set";

        this.description = description;
        this.name = item.name;
        this.owner = item.owner.login;
        this.repoURL = item.html_url;
        this.stars = item.stargazers_count;
        this.forks = item.forks;
    }
  }