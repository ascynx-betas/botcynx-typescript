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

    const fixes = crashFixCache.data.fixes; //type 1 => solution; type 2 => recommendations
    let extraLogOutput: string[] = [];
    let recommendedOutput: string[] = [];

    let clientData: string[] = [];
    let fields = log.split("\n");

    const JavaVersion = /\s+Java Version:.+$/g;
    const MinecraftVersion = /\s+Minecraft Version:.+$/g;

    fields.forEach((data) => {
      if (JavaVersion.test(data) == true || MinecraftVersion.test(data) == true)
        clientData.push(data);
      if (
        data.includes(
          "Is Modded: Definitely; Client brand changed to 'Feather Forge'"
        )
      )
        clientData.push("Feather Forge");
    });

    if (clientData.includes("Feather Forge")) {
      const buttonRow = new MessageActionRow().addComponents(
        new MessageButton().setStyle("LINK").setURL(logUrl).setLabel("view log")
      );

      return message.channel.send({
        content: `**${
          message.author
        }** sent a log,\n- Feather 'client' is completely unsupported due to it being obfuscated. Any issues you get while using it has to be reported to them ${
          message.content ? `\n\n${message.content}` : ""
        }`,
        components: [buttonRow],
      });
    }

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
        fix.fixtype == 1
          ? extraLogOutput.push(fix.fix)
          : recommendedOutput.push(fix.fix);
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
          ? extraLogOutput.length === 0
            ? ""
            : message.content
            ? `\n\n${message.content}`
            : ""
          : `Recommendations: \n\n${recommendations}`
      }`,
      components: [buttonRow],
    });
  }
});
