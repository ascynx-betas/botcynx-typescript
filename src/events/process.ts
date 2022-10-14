import process from "process";
import { botcynx, showDiscordAPIErrors } from "..";
import { webhook } from "../lib/personal-modules/discordPlugin";
import { getTimeOfDay } from "../lib/personal-modules/testFor";
import chalk from "chalk";
import { postStartData } from "./ready";
import { LoggerFactory, logLevel } from "../lib/Logger";
import { DiscordAPIError } from "discord.js";

const Logger = LoggerFactory.getLogger("PROCESS-CAUGHT");

const sendError = async (error: Error) => {
  let stack = error.stack;
  let fields = stack?.split("\n");
  if (typeof fields == "undefined")
    return Logger.log(error.toString(), logLevel.ERROR);
  if (
    error instanceof DiscordAPIError &&
    !showDiscordAPIErrors
  )
    return;
  stack = fields.slice(1, 5).join("\n\n");
  const err = "[" + getTimeOfDay() + "]" + " Caught error: \n" + stack;

  Logger.log(chalk.red(`${fields.slice(0)[0]} ${err}`), logLevel.ERROR);

  const info = webhook(process.env.webhookLogLink);
  if (!info) return;

  return botcynx.fetchWebhook(info.id, info.token).then((webhook) =>
    webhook.send({
      embeds: [
        {
          title: fields.slice(0)[0],
          description: err,
          footer: {
            text: `${botcynx.uptime}ms since last restart`,
          },
        },
      ],
      username: `${botcynx.user?.tag || "preloading Error"}`,
      avatarURL: botcynx.user?.displayAvatarURL({ forceStatic: false }),
      allowedMentions: { users: [process.env.developerId] },
    })
  );
};

process.on("unhandledRejection", (error: Error) => {
  sendError(error);
});

process.on("uncaughtException", (error: Error) => {
  sendError(error);
});
