import fetch from "node-fetch";
import { botcynx } from "..";
interface hastebinRes {
  key: string;
}

const hasteUrls = [
    "https://hst.sh",
    "https://hasteb.in",
    "https://hastebin.com",
    "https://mystb.in",
    "https://haste.clicksminuteper.net",
    "https://paste.pythondiscord.com",
    "https://haste.unbelievaboat.com",
];

//this next function is largely based on the one used in bush bot (https://github.com/NotEnoughUpdates/bush-bot)
async function haste(content: string) {
  for (const url of hasteUrls) {
    try {
      const res: hastebinRes = await (
        await fetch(`${url}/documents`, {
          method: "POST",
          body: content,
          headers: {
            "user-agent": `${botcynx.package.name}/${botcynx.package.version} haste function, commonly used for when the output of commands exceeds the maximum character limit.`,
          },
        })
      ).json();

      return `${url}/${res.key}`;
    } catch (e) {
      continue;
    }
  }
  return "Unable to post";
}

function isHaste(string: string) {

  let result: boolean;
  for (const url of hasteUrls) {
    let regex = new RegExp(`.*${url}.*`, "gi");
    if (regex.test(string)) return (result = true);
  }

  if (result == true) return true;
  return false;
}

export { haste, isHaste };
