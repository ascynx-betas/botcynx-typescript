import { Event } from "../structures/Event";
import fetch from "node-fetch";
import {
  checkIfLog,
  crashFixCache,
  getML,
  getMods,
} from "../lib/cache/crashFix";
import { HasteUtils } from "../lib/hasteUtils";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
} from "discord.js";
import { containsLink, isLink } from "../lib/personal-modules/testFor";
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

  let logs: string[] = [];

  for (const [, { url }] of message.attachments) {
    if (!url.endsWith(".txt") && !url.endsWith(".log")) return;

    const log = await (await fetch(url)).text();
    if (!checkIfLog(log)) return;
    if (!logs.includes(log)) logs.push(log);
  }

  if (message.content.length > 0) {
    for (const word of message.content.replaceAll("\n", " ").split(" ")) {
      if (!isLink(word) || !HasteUtils.isHaste(word)) continue;

      let linkSplit = word.split("/");
      let link = word;
      if (linkSplit[3] != "raw")
        link = linkSplit[0] + "//" + linkSplit[2] + "/raw/" + linkSplit[3];
      //Example https://hst.sh/raw/ID

      const log = await (await fetch(link)).text();
      const isLog = checkIfLog(log);
      if (!isLog) continue;
      if (!logs.includes(log)) logs.push(log);
    }
  }

  for (const log of logs) {
    const mods = getMods(log);
    const ModLoader = getML(log);

    let AdditionalData = "";
    if (!log.match(/Botcynx additional Data/)) {
      AdditionalData += `\n\n\tBotcynx additional Data:`;

      if (ModLoader && ModLoader.loader != "") {
        AdditionalData += `\n\n\tMod Loader: ${ModLoader.loader}${ModLoader.loaderVersion != "" ? ` ${ModLoader.loaderVersion}` : ""}`;
      }

      if (mods.size > 0) {
        AdditionalData += `\n\tMods: ${mods.map((mod) => mod.ID).join(", ")}`;
      }
    }

    const IDs = mods.map((m) => m.ID);
    const Statuses = mods.map((m) => m.state);

    let logUrl = await HasteUtils.post(log + AdditionalData);

    let extraLogOutput: string[] = [];
    let recommendedOutput: string[] = [];
    let clientData: string[] = [];

    if (ModLoader.loader == "Feather") {
      if (message.author.id == process.env.developerId) {
        recommendedOutput.push("Feather client is unsupported, issues that occur while using it must be reported to its support team.");
      } else {
        let buttonRow = new ActionRowBuilder<ButtonBuilder>();
        buttonRow.addComponents(
       new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setURL(logUrl)
          .setLabel("view log")
        );
      let content = "";
      content += `**${message.author}** sent a log`;

      if (message.content) content += ", " + message.content;
      content +=
        "\n\n\t• Feather client is unsupported, issues that occur while using it must be reported to its support team.";


        await sendLogMessage(content, buttonRow, message);
        return;
      }
    }

    if (
      logUrl != "unable to post" &&
      message.channel.messages.cache.get(message.id)
    )
      try {
        if (message.deletable) message.delete();
      } catch (ignore) {}

    const fixes = crashFixCache.data.fixes ? crashFixCache.data.fixes : []; //type 1 => solution //type 2 => recommendations //type 0 => informations;

    if (ModLoader) {
      if (ModLoader.loader && ModLoader.loader != "") {
        clientData.push(
        `user is using ${ModLoader.loader} ${ModLoader.loaderVersion}`
        );
      }

      if (ModLoader.mcVersion && ModLoader.mcVersion != "") {
        clientData.push(`user is on minecraft version ${ModLoader.mcVersion}`);
      }

    }

    for (const fix of fixes) {
      let foundProblems = 0;
      let maxCauses = fix.causes.length;
                  
      for (const cause of fix.causes) {
        if (cause.method === "contains") {
          if (log.includes(cause.value)) {
            foundProblems += 1;
          }
        }
        if (cause.method === "contains_not") {
          if (!log.includes(cause.value)) {
            foundProblems += 1;
          }
        }
        if (cause.method === "regex") {
          const regex = new RegExp(cause.value);
          if (regex.test(log)) {
            foundProblems += 1;
          }
        }
        if (cause.method === "regex_not") {
          const regex = new RegExp(cause.value);
          if (!regex.test(cause.value)) {
            foundProblems += 1;
          }
        }
      }

      if (foundProblems === maxCauses) {
        if (fix.fixtype == 1) extraLogOutput.push(fix.fix);
        else if (fix.fixtype == 2) recommendedOutput.push(fix.fix);
        else if (fix.fixtype == 0) clientData.push(fix.fix);
      }
    }

    for (let i = 0; i < Statuses.length; i++) {
      const status = Statuses[i];
      if (status == null) continue;

      if (status.search(/.E.*/) != -1) {
        extraLogOutput.push(
          `${IDs[i]} ran into an error, please contact its support team with this log.`
        );
      }
    }

    let solutions = "";
    for (const fix of extraLogOutput)
      solutions.length === 0
        ? (solutions += `\t• ${fix}`)
        : extraLogOutput.length - extraLogOutput.indexOf(fix) > 1
        ? (solutions += `\n\t• ${fix}`)
        : (solutions += `\n\t• ${fix}\n`);

    let recommendations = "";
    for (const recommended of recommendedOutput)
      recommendations.length === 0
        ? recommendations = `\t• ${recommended}`
        : (recommendations += `\n\t• ${recommended}`);

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setURL(logUrl)
        .setLabel("view log")
    );
    await sendLogMessage(
      `**${message.author}** sent a log, ${
        message.content ? message.content : ""
      }\n${clientData.join(",\n")}${clientData.length > 0 ? "\n\n" : ""} ${
        extraLogOutput.length === 0 ? "" : `Solutions: \n${solutions}`
      }${
        recommendedOutput.length === 0
          ? ""
          : `\nRecommendations: \n${recommendations}`
      }`,
      buttonRow,
      message
    );
  }
});

const sendLogMessage = async (
  content: string,
  components: ActionRowBuilder<ButtonBuilder>,
  message: Message<boolean>
): Promise<Message<boolean>> =>
  await message.channel.send({
    content: content,
    components: [components],
    allowedMentions: { users: [message.author.id] },
  });
