import { configModel } from "../models/config";
import { Event } from "../structures/Event";
import fetch from "node-fetch";
import {
  checkIfLog,
  crashFixCache,
  getML,
  getMods,
} from "../lib/cache/crashFix";
import { haste, isHaste } from "../lib/haste";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { containsLink, isLink } from "../lib/personal-modules/testFor";
import { indexOf } from "lodash";
import { isDisabled } from "../lib/command/commandInhibitors";

export default new Event("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  let botPermissions = message.guild.members.me.permissions.toArray();
  if (
    !botPermissions.includes("ManageMessages") &&
    !botPermissions.includes("Administrator")
  )
    return;

  if (process.env.environment != "dev") {
    if (!(await isDisabled({ name: "crashLogReader" }, message.guild))) return;
  }

  if (
    message.attachments.size === 0 &&
    containsLink(message.content).length === 0
  )
    return;

  let logs = [];

  for (const [, { url }] of message.attachments) {
    if (!url.endsWith(".txt") && !url.endsWith(".log")) return;

    const log = await (await fetch(url)).text();
    if (checkIfLog(log) == false) return;
    logs.push(log);
  }

  if (message.content.length > 0) {
    for (const word of message.content.replaceAll("\n", " ").split(" ")) {
      if (!isLink(word) || !isHaste(word)) continue;

      let linkSplit = word.split("/");
      let link = word;
      if (linkSplit[3] != "raw")
        link = linkSplit[0] + "//" + linkSplit[2] + "/raw/" + linkSplit[3]; //Example https://hst.sh/raw/ID

      const log = await (await fetch(link)).text();
      const isLog = checkIfLog(log);
      if (isLog == false) continue;
      logs.push(log);
    }
  }

  for (const log of logs) {
    const mods = getMods(log);
    const ModLoader = getML(log);

    const AdditionalData = `\n\tBotcynx additional Data:\n\nMod Loader: ${
      ModLoader.loader
    } ${ModLoader.loaderVersion} \nMods: ${mods.map((m) => m.ID).join(", ")}`;

    const IDs = mods.map((m) => m.ID);
    const Statuses = mods.map((m) => m.state);

    let logUrl = await haste(log + AdditionalData);
    if (
      logUrl != "unable to post" &&
      message.channel.messages.cache.get(message.id)
    )
      message.delete().catch();

    const fixes = crashFixCache.data.fixes; //type 1 => solution //type 2 => recommendations //type 0 => informations;
    let extraLogOutput: string[] = [];
    let recommendedOutput: string[] = [];
    let clientData: string[] = [];
    clientData.push(
      `user is using ${ModLoader.loader} ${ModLoader.loaderVersion}`
    );
    clientData.push(`user is on minecraft version ${ModLoader.mcVersion}`);

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

    Statuses.forEach((status, index) => {
      if (status.search(/.*E.*/) != -1) {
        extraLogOutput.push(
          `${IDs[index]} errored, please report this to the developer.`
        );
      }
    });

    let solutions = "";
    for (const fix of extraLogOutput)
      solutions.length === 0
        ? (solutions += `\t??? ${fix}`)
        : extraLogOutput.length - indexOf(extraLogOutput, fix) > 1
        ? (solutions += `\n\t??? ${fix}`)
        : (solutions += `\n\t??? ${fix}\n`);

    let recommendations = "";
    for (const recommended of recommendedOutput)
      recommendations.length === 0
        ? recommendations == `\t??? ${recommended}`
        : (recommendations += `\n\t??? ${recommended}`);

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setURL(logUrl)
        .setLabel("view log")
    );
    await message.channel.send({
      content: `**${message.author}** sent a log, ${
        message.content ? message.content : ""
      }\n${clientData.join(",\n")}\n\n ${
        extraLogOutput.length === 0 ? "" : `Solutions: \n${solutions}`
      }${
        recommendedOutput.length === 0
          ? ""
          : `\nRecommendations: \n${recommendations}`
      }`,
      components: [buttonRow],
      allowedMentions: { users: [message.author.id] },
    });
  }
});
