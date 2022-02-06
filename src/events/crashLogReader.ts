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

    const fixes = crashFixCache.data.fixes;

    let extraLogOutput: string[] = [];

    let clientData: string[] = [];
    let fields = log.split("\n");

    const JavaVersion = /\s+Java Version:.+$/g;
    const MinecraftVersion = /\s+Minecraft Version:.+$/g;
    const isModded = /\s+is Modded:.+$/g;

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
        extraLogOutput.push(fix.fix);
      }
    }
    let solutions = "";
    for (const fix of extraLogOutput) {
      solutions.length === 0 ? (solutions += fix) : (solutions += `\n${fix}`);
    }

    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton().setStyle("LINK").setURL(logUrl).setLabel("view log")
    );
    await message.channel.send({
      content: `**${
        message.author
      }** sent a log,\nit's running on\n${clientData.join(",\n")}\n\nI found ${
        extraLogOutput.length === 1
          ? `${extraLogOutput.length} fix.`
          : `${extraLogOutput.length} fixes.`
      } ${extraLogOutput.length === 0 ? "" : `\n\n${solutions}`}${
        message.content ? `\n\n${message.content}` : ""
      }`,
      components: [buttonRow],
    });
  }
});
