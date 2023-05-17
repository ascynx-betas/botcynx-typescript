import process from "process";
import { botcynx, showDiscordAPIErrors } from "..";
import { getWebhook } from "../lib/personal-modules/discordPlugin";
import { getTimeOfDay } from "../lib/personal-modules/testFor";
import chalk from "chalk";
import { LoggerFactory, LogLevel } from "../lib/Logger";
import { DiscordAPIError } from "discord.js";

const Logger = LoggerFactory.getLogger("PROCESS");

async function handleUncaughtError (error: Error) {
  let stack = error.stack;
  let fields = stack?.split("\n");
  if (typeof fields == "undefined") {
    Logger.log(error.toString(), LogLevel.ERROR);
    return;
  }

  if (error instanceof DiscordAPIError && !showDiscordAPIErrors) return;

  stack = fields.slice(1, 5).join("\n\n");
  const err = "[" + getTimeOfDay() + "]" + " Caught error: \n" + stack;

  Logger.log(chalk.red(`${fields.slice(0)[0]} ${err}`), LogLevel.ERROR);

  const webhook = getWebhook(process.env.webhookLogLink);
  if (!webhook) return;

  return botcynx.fetchWebhook(webhook.id, webhook.token).then((webhook) =>
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
  handleUncaughtError(error);
});

process.on("uncaughtException", (error: Error) => {
  handleUncaughtError(error);
});
