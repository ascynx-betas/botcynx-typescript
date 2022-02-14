import { configModel } from "../models/config";
import { Event } from "../structures/Event";
import fetch from "node-fetch";
import {
  checkPossibleLog,
  crashFixCache,
  getMods,
} from "../lib/cache/crashFix";
import { haste, isHaste } from "../lib/haste";
import { MessageActionRow, MessageButton } from "discord.js";
import { containsLink, isLink } from "../personal-modules/testFor";
import { indexOf } from "lodash";

//originally based on SkyblockClient's bot's crashLogReader
export default new Event("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  let botPermissions = message.guild.me.permissions.toArray();
  if (
    !botPermissions.includes("MANAGE_MESSAGES") &&
    !botPermissions.includes("ADMINISTRATOR")
  )
    return;

  const config = await configModel.find({ guildId: message.guild.id });
  if (config[0].disabledCommands.includes("crashLogReader")) return;

  if (
    message.attachments.size === 0 &&
    containsLink(message.content).length === 0
  )
    return;

  let logs = [];

  for (const [, { url }] of message.attachments) {
    if (!url.endsWith(".txt") && !url.endsWith(".log")) return;

    const log = await (await fetch(url)).text();
    if (checkPossibleLog(log) == false) return;
    logs.push(log);
  }

  if (message.content.length > 0) {
    for (const word of message.content.replaceAll("\n", " ").split(" ")) {
      if (!isLink(word)) return;
      if (!isHaste(word)) return;

      let linkSplit = word.split("/");
      let link = word;
      if (linkSplit[3] != "raw")
        link = linkSplit[0] + "//" + linkSplit[2] + "/raw/" + linkSplit[3];

      const log = await (await fetch(link)).text();
      const isLog = checkPossibleLog(log);
      if (isLog == false) return;
      logs.push(log);
    }
  }

  for (const log of logs) {
    const mods = getMods(log);
    let forgeVersion = mods?.get("Forge").version;
    if (!forgeVersion) forgeVersion = null;

    let logUrl = await haste(log);
    if (
      logUrl != "unable to post" &&
      message.channel.messages.cache.get(message.id)
    )
      await message.delete().catch();

    const fixes = crashFixCache.data.fixes; //type 1 => solution; type 2 => recommendations //type 0 => informations;
    let extraLogOutput: string[] = [];
    let recommendedOutput: string[] = [];
    let clientData: string[] = [];

    for (const fix of fixes) {
      let completedProblems = 0;
      let maxProblems = fix.causes.length;

      for (const cause of fix.causes) {
        if (cause.method === "contains") {
          if (log.includes(cause.value)) {
            completedProblems += 1;
          }
        }
        if (cause.method === "contains_not") {
          if (!log.includes(cause.value)) {
            completedProblems += 1;
          }
        }
        if (cause.method === "regex") {
          const regex = new RegExp(cause.value);
          if (regex.test(log)) {
            completedProblems += 1;
          }
        }
        if (cause.method === "regex_not") {
          const regex = new RegExp(cause.value);
          if (!regex.test(cause.value)) {
            completedProblems += 1;
          }
        }
      }

      if (completedProblems === maxProblems) {
        if (fix.fixtype == 1) extraLogOutput.push(fix.fix);
        else if (fix.fixtype == 2) recommendedOutput.push(fix.fix);
        else if (fix.fixtype == 0) clientData.push(fix.fix);
      }
    }

    let solutions = "";
    for (const fix of extraLogOutput)
      solutions.length === 0
        ? (solutions += `\t• ${fix}`)
        : extraLogOutput.length - indexOf(extraLogOutput, fix) > 1
        ? (solutions += `\n\t• ${fix}`)
        : (solutions += `\n\t• ${fix}\n`);

    let recommendations = "";
    for (const recommended of recommendedOutput)
      recommendations.length === 0
        ? (recommendations += `\t• ${recommended}`)
        : (solutions += `\n\t• ${recommended}`);

    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton().setStyle("LINK").setURL(logUrl).setLabel("view log")
    );
    await message.channel.send({
      content: `**${message.author}** sent a log,\n${clientData.join(
        ",\n"
      )}\n\n ${
        extraLogOutput.length === 0
          ? message.content
            ? message.content
            : ""
          : `Solutions: \n${solutions}`
      }${
        recommendedOutput.length === 0 && message.content
          ? `\n\n${message.content}`
          : ""
      }${
        recommendedOutput.length === 0
          ? `${
              extraLogOutput.length === 0
                ? message.content
                  ? `\n\n${message.content}`
                  : ""
                : ""
            }`
          : `\nRecommendations: \n${recommendations}`
      }`,
      components: [buttonRow],
      allowedMentions: { parse: [] },
    });
  }
});
