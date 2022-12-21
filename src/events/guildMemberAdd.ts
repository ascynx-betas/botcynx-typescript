import { GuildMember } from "discord.js";
import { Event } from "../structures/Event";
import * as crypto from 'crypto';


export default new Event("guildMemberAdd", async (member: GuildMember) => {
    console.log("new user: " + member.displayName);
    if (member.user.bot) {
        console.log("is bot: retracting")
        return;
    }

    let hash = await getImageHash(member.user.avatarURL({extension:"png", size: 4096}));

    console.log(hash);

    if (hash in frequentlyImpersonatedAccountAvatars) {
        console.log("detected Suspicious account, " + member.user.username);
    }
});

export const frequentlyImpersonatedAccountAvatars = [
    "f991e7c1bd04a86c32f5247e8379f695db8699881421085f19b29ca40f962b9d",//dyno
    "32b9be452b0f418f19f2d63283f102d60859168420101c43e97a84ca090580ab",//YAGDPDB
    "fcc7afe0136d7afb4900284f1d06d4409593e767f137fc60c647c520dfb78b59",//Captcha.bot
];

export const getImageHash = async (URL: string) => {
    let sha256 = "";

    let res = await fetch(URL);
    let r = await res.body.getReader().read();

    let hash = await crypto.subtle.digest('SHA-256', r.value);
    let sha256R = buffer2Hex(hash);
    sha256 = sha256R;

    return sha256;
};

//source: https://stackoverflow.com/a/40031979
export function buffer2Hex(buffer: ArrayBuffer) {
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
  }