import { SlashCommandRequestCache } from "../slashCommandRequestCache"

export const clearCache = async () => {
    const cache = SlashCommandRequestCache.getInstance();
    return setInterval(() => {
        cache.resetCache();
    }, 900000)
}