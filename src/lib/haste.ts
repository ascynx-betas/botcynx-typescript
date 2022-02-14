import fetch from "node-fetch";
import { botcynx } from "..";
interface hastebinRes {
  key: string;
}

//this next function is stolen from bush bot (https://github.com/NotEnoughUpdates/bush-bot)
async function haste(content: string) {
  const urls = [
    "https://hst.sh",
    "https://hasteb.in",
    "https://hastebin.com",
    "https://mystb.in",
    "https://haste.clicksminuteper.net",
    "https://paste.pythondiscord.com",
    "https://haste.unbelievaboat.com",
  ];
  for (const url of urls) {
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
  const urls = [
    "hst.sh",
    "hasteb.in",
    "hastebin.com",
    "mystb.in",
    "haste.clicksminuteper.net",
    "paste.pythondiscord.com",
    "haste.unbelievaboat.com",
  ];

  let result: boolean;
  for (const url of urls) {
    let regex = new RegExp(`.*${url}.*`, "gi");
    if (regex.test(url)) return (result = true);
  }

  if (result == true) return true;
  return false;
}

export { haste, isHaste };
