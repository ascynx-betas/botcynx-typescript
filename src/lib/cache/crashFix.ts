import { linkContentPull } from "../repoPull";
import { cache, repoLink } from "./cache";

export class jsonCache extends cache {
    constructor(link: string | repoLink) {
        super(link)
    }

    /**
     * @override - overrides the base reload function from cache - and make it get JSON data instead of text
     */
    async reload() {
        this.data = JSON.parse(await linkContentPull(this.reloader));
        
    }

    /**
     * - Import data into the current data cache (currently overrides data)
     * @param data - Data to import (currently overrides the internal data)
     */
    importData(data: any) {
        this.data = data;
    }
}

export function checkPossibleLog (possibleLog: string): boolean {
    let isLog = false

    const logText = [
        'The game crashed whilst',
        'net.minecraft.launchwrapper.Launch',
        '# A fatal error has been detected by the Java Runtime Environment:',
        '---- Minecraft Crash Report ----',
        'A detailed walkthrough of the error',
        'launchermeta.mojang.com',
        'Running launcher core',
        'Native Launcher Version:',
        '[Client thread/INFO]: Setting user:',
        '[Client thread/INFO]: (Session ID is',
        'MojangTricksIntelDriversForPerformance',
        '[DefaultDispatcher-worker-1] INFO Installer',
        '[DefaultDispatcher-worker-1] ERROR Installer',
        'net.minecraftforge',
        'club.sk1er',
        'gg.essential',
        'View crash report',
    ]

    for (const text of logText) {
        if (possibleLog.includes(text)) {
            isLog = true
        }
    }

    return isLog
}

export const crashFixCache = new jsonCache(new repoLink('SkyblockClient', 'CrashData', 'crashes.json'));