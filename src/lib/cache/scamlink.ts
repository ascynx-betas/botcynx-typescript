import { isLink } from "../../personal-modules/testFor";
import { repoLink } from "./cache";
import { jsonCache } from "./crashFix";

//! ALL OF THE LINKS IN THERE AREN'T NECESSARELY SCAM LINKS
export const scamLinks = new jsonCache(new repoLink('nacrt', 'SkyblockClient-REPO', 'files/scamlinks.json'));

export function hasScamLink(message: string) {
    let hasScamLink: boolean = false;
    let words = message.split(' ');
    words = words.filter((w) => isLink(w));

    for (const scam in scamLinks.data) {
        const scamRegExp = new RegExp((`.+${scamLinks.data[scam]}.*`), 'gi');
        let isScam: boolean;

        words.forEach((word) => {
            if(scamRegExp.test(word) == true) return isScam = true;
        })
        if (isScam == true) return hasScamLink = true;
    }

    return hasScamLink;
}
