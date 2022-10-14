import { slashCommandRequestCache } from "../slashCommandRequestCache"

export const clearCache = async () => {
    const cache = slashCommandRequestCache.getInstance();
    return setInterval(() => {
        cache.resetCache();
    }, 900000)
}