import process from "process";
import { botcynx } from "..";
import { webhook } from "../personal-modules/discordPlugin";
import { getTimeOfDay } from "../personal-modules/testFor";

const sendError = async (error: Error) => {
  let stack = error.stack;
  let fields = stack?.split("\n");
  if (typeof fields == "undefined") return console.log(error);
  if (
    fields[0].startsWith("DiscordAPIError") &&
    global.bot.environment != "dev"
  )
    return console.log(error); //returns if DiscordAPIError when it isn't in dev environment
    stack = fields.slice(1, 5).join('\n')
  const err = "[" + getTimeOfDay() + "]" + " Caught error: \n" + stack;

  console.log(`${fields.slice(0)[0]} ${err}`);

  const info = webhook(process.env.webhookLogLink);
  if (!info) return;

  return botcynx.fetchWebhook(info.id, info.token).then((webhook) =>
    webhook.send({
      embeds: [
        {
          title: fields.slice(0)[0],
          description: err,
          footer: {
            text: `${botcynx.uptime}ms since last restart`
          }
        },
      ],
      username: `${botcynx.user?.tag || "preloading Error"}`,
      avatarURL: botcynx.user?.displayAvatarURL({ dynamic: true }),
    })
  );
};

process.on("unhandledRejection", (error: Error) => {
  sendError(error);
});

process.on("uncaughtException", (error: Error) => {
  sendError(error);
});
