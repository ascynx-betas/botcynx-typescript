import { Collection } from "discord.js";
import { LoggerFactory } from "../Logger";

export class RepositoryCacheHandler {
    private static LOGGER = LoggerFactory.getLogger("REPO-CACHE");
    private profileCache: Collection<string, CachedQuery>;
    task: NodeJS.Timer;

    private constructor() {
        this.profileCache = new Collection();
        this.task = this.initTask();
    }
    private static instance: RepositoryCacheHandler;
    static get INSTANCE() {
        if (!this.instance) {
            this.instance = new this();
        }
        return this.instance;
    }

    hasQuery(query: string) {
        return this.profileCache.has(decodeURIComponent(query));
    }
    addCachedQuery(query: CachedQuery) {
        if (!this.hasQuery(query.getQuery)) {
            this.profileCache.set(query.getQuery, query);
        }
        return query;
    }
    removeCachedQuery(query: string) {
        const decodedQuery = decodeURIComponent(query);
        if (this.hasQuery(decodedQuery)) {
            this.profileCache.delete(decodedQuery);
        }
    }

    /**
     * @description Initializes the task related to dirty queries (is ran every hour)
     */
    private initTask() {
        return setInterval(async () => {
            RepositoryCacheHandler.LOGGER.debug("Running Task: clearing dirty queries");
            if (this.profileCache.size === 0) {
                return;
            }
            for (let element of this.getDirtyQueries()) {
                this.removeCachedQuery(element[0]);
            }
        }, 360000);
    }

    private static DIRTY_TIMESTAMP = 360000 * 4;
    /**
     * @description Returns queries that haven't been updated in the last 4 hours
    */
    getDirtyQueries() {
        return this.profileCache.filter((a) => a.lastUpdatedTimestamp < Date.now() + RepositoryCacheHandler.DIRTY_TIMESTAMP);
    }

    public getQuery(query: string) {
        return this.profileCache.get(decodeURIComponent(query));
    }
}

export class CachedQuery {
    private query: string;
    get getQuery() {
        return this.query;
    }

    private cache: RepoProfile[];
    lastUpdatedTimestamp: number;

    constructor(query: string, ...repositories: RepoProfile[]) {
        this.query = decodeURIComponent(query);
        this.cache = [...repositories];
        this.lastUpdatedTimestamp = Date.now();
    }

    getPage(page: number) {
        return this.cache.slice((page * 5), (page * 5) + 5);
    }

    get total_count() {
        return this.cache.length;
    }

    get items() {
        return this.cache;
    }
}

export class RepoProfile {
    name: string;
    owner: string;
    description: string;
    repoURL: string;
    stars: number;
    forks: number;
    stargazers_count: number;
    watchers: number;
    watchers_count: number;
    
    pushed_at: string;
    pushed_at_parsed: number;//timestamp

    forks_count: number;

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
        this.stargazers_count = item.stargazers_count;
        this.watchers = item.watchers;
        this.watchers_count = item.watchers_count;
        this.forks_count = item.forks_count;

        //deal with date stuff
        this.pushed_at = item.pushed_at;
        const parsedDate = Date.parse(this.pushed_at);//! Might bug
        this.pushed_at_parsed = parsedDate;
    }
  }