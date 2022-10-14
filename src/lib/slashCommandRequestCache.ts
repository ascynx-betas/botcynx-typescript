import { Collection, Interaction } from "discord.js";

export class slashCommandRequestCache {
    private cache: Collection<string, slashCommandRequest>;

    private static INSTANCE: slashCommandRequestCache;

    private constructor() {
        this.cache = new Collection();
    }

    public static getInstance() {
        if (!this.INSTANCE) this.INSTANCE = new slashCommandRequestCache();
        return this.INSTANCE;
    }

    public addToCache(interaction: Interaction, bool: boolean) {
        this.cache.set(interaction.id, new slashCommandRequest(interaction, bool, Date.now()));
    }
    public getFromCache(interactionId: string) {
        return this.cache.get(interactionId);
    }

    deleteElement(interactionId: string) {
        return this.cache.delete(interactionId);
    }

    resetCache() {
        for (let item of this.cache.map((e) => e)) {
            if (item.shouldDelete()) {
                this.deleteElement(item.Interaction.id);
            }
        }
    }

}
export class slashCommandRequest {
    private interaction: Interaction;
    private shouldCache: boolean;
    private creationTime: number;

    constructor(interaction: Interaction, shouldCache: boolean, creationTime: number) {
        this.interaction = interaction;
        this.shouldCache = shouldCache;
        this.creationTime = creationTime;
    }

    get Interaction() {
        return this.interaction;
    }

    get CreationTime() {
        return this.creationTime;
    }

    shouldDelete() {
        return !this.shouldCache && (this.creationTime + 900000) < Date.now();
    }
}