import { configModel } from "../models/config";
import { Event } from "../structures/Event";
import fetch from "node-fetch";
import { checkPossibleLog, crashFixCache } from "../lib/cache/crashFix";
import { haste } from "../lib/haste";
import { MessageActionRow, MessageButton } from "discord.js";

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

  if (message.attachments.size === 0) return;

  for (const [, { url }] of message.attachments) {
    if (!url.endsWith(".txt") && !url.endsWith(".log")) return;

    const log = await (await fetch(url)).text();
    const isLog = checkPossibleLog(log);
    if (isLog == false) return;

    let logUrl = await haste(log);
    if (logUrl != "unable to post") {
      await message.delete();
    }

    const fixes = crashFixCache.data.fixes; //type 1 => solution; type 2 => recommendations //type 0 => informations;
    let extraLogOutput: string[] = [];
    let recommendedOutput: string[] = [];

    let clientData: string[] = [];

    for (const fix of fixes) {
      let completedProblems = 0;
      let maxProblems = fix.causes.length;

      for (const p of fix.causes) {
        if (p.method === "contains") {
          if (log.includes(p.value)) {
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
    for (const fix of extraLogOutput) {
      solutions.length === 0 ? (solutions += fix) : (solutions += `\n${fix}`);
    }

    let recommendations = "";
    for (const recommended of recommendedOutput) {
      recommendations.length === 0
        ? (recommendations += recommended)
        : (solutions += `\n${recommended}`);
    }

    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton().setStyle("LINK").setURL(logUrl).setLabel("view log")
    );
    await message.channel.send({
      content: `**${
        message.author
      }** sent a log,\nit's running on\n${clientData.join(",\n")}\n\n ${
        extraLogOutput.length === 0
          ? message.content
            ? message.content
            : ""
          : `Solutions: \n\n${solutions}`
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
          : `\nRecommendations: \n\n${recommendations}`
      }`,
      components: [buttonRow],
    });
  }
});
