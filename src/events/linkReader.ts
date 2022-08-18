import {
  APIEmbed,
  GuildTextBasedChannel,
  Message,
  MessagePayload,
  TextChannel,
  ThreadChannel,
  Webhook,
  WebhookMessageOptions,
} from "discord.js";
import { botcynx } from "..";
import { configModel } from "../models/config";
import { isId } from "../lib/personal-modules/discordPlugin";
import { containsLink } from "../lib/personal-modules/testFor";
import { Event } from "../structures/Event";
import { isDisabled } from "../lib/command/commandInhibitors";

export default new Event("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  let botPermissions = message.guild.members.me.permissions.toArray();
  if (
    !botPermissions.includes("ManageWebhooks") &&
    !botPermissions.includes("Administrator")
  )
    return;

  if (!(await isDisabled({ name: "linkReader" }, message.guild))) return;

  let results = containsLink(message.content);
  if (results.length == 0) return;
  let whitespace = /\s/gi;
  message.content = message.content.replace(whitespace, " ");
  let linkfield = message.content.split(" ");
  results.forEach(async (result) => {
    let first = linkfield[result];

    let link = first.slice(8, message.content.length);
    let fields = link.split("/");
    if (!checkLink(link)) return;
    if (!botcynx.guilds.cache.get(fields[2])) return message.react("📵"); // The guild isn't in the bot's cache

    const source = await (
      botcynx.channels.cache.get(fields[3]) as GuildTextBasedChannel
    ).messages
      .fetch(fields[4])
      .catch(
        () => {
          return message.react("📵");
        } /**the message does not exist */
      );
    const sourceConfig = await configModel.find({
      guildId: fields[2],
    });
    let blocked = sourceConfig[0].blocked;
    if (blocked.includes(fields[3])) return message.react("🚫"); //blocked channel
    if (!source || source == null || typeof source === "undefined") return;
    let webhook: any;
    let isThread = message.channel.isThread();

    if (isThread == true) {
      webhook = await (message.channel as ThreadChannel).parent.fetchWebhooks();
    } else webhook = await (message.channel as TextChannel).fetchWebhooks();
    webhook = webhook.filter((webhook) => webhook.owner.id === botcynx.user.id);

    if (typeof webhook === "undefined" || webhook.size == 0) {
      webhook = await (message.channel as TextChannel).createWebhook({
        name: `${botcynx.user.username} Link reader`,
        avatar: `${botcynx.user.displayAvatarURL({ forceStatic: false })}`,
        reason: "request for non existing webhook",
      });
      return message.react("💀"); //webhook didn't exist
    }
    let id: any;
    id = webhook.map((w) => w.id);
    webhook = webhook.get(id[0]);
    const webhookClient: Webhook = await botcynx
      .fetchWebhook(webhook.id, webhook.token)
      .catch(() => null);
    if (webhookClient == null) return;
    if (handler(source as Message<boolean>, message)) {
      webhookClient
        .send(handler(source as Message<boolean>, message))
        .catch((err) => {
          message.react("🔇");
          if (
            process.env.environment == "dev" ||
            process.env.environment == "debug"
          )
            console.log(err);
        }); //empty message
    }
  });
});

const checkLink = (link: string) => {
  const discordSiteRegExp = /.{0,6}\.?discord\.com/gim;
  let fields = link.split("/");

  if (!discordSiteRegExp.test(fields[0])) return; //if the link isn't discord related (avoid getting a youtube link caught up in it 💀)
  if (fields[1] !== "channels") return;
  let Id = isId(fields[2]);
  let regex = /[^[0-9]/gi;
  fields[2] = fields[2].replace(regex, "");
  if (Id == false) return false;
  Id = isId(fields[3]);
  fields[3] = fields[3].replace(regex, "");
  if (Id == false) return false;
  Id = isId(fields[4]);
  fields[4] = fields[4].replace(regex, "");
  if (Id == false) return false;

  return true;
};

const handler = (source: Message<boolean>, message: Message<boolean>) => {
  let Handlers = [commandInputHandler, baseInputHandler];

  for (let handler of Handlers) {
    let out = handler(source, message);
    if (out != null) return out;
  }
  return null;
};

const commandInputHandler = (
  source: Message<boolean>,
  message: Message<boolean>
): string | MessagePayload | Omit<WebhookMessageOptions, "flags"> => {
  if (![20, 23].includes(source.type)) return null; //chat input and context command type;

  let username;
  let avatarURL;
  let content =
    `${source.interaction.user} used ${
      source.interaction.type == 2 ? "/" : ""
    }${source.interaction.commandName}` +
    ((source as Message<boolean>).content != null
      ? "\n" + (source as Message<boolean>).content
      : "");

  let sourceGuildMember = (source as Message<boolean>).guild.members.cache.get(
    (source as Message<boolean>).author.id
  );

  if (typeof sourceGuildMember !== "undefined") {
    username = sourceGuildMember.user.tag;
    avatarURL = sourceGuildMember.user.displayAvatarURL({
      forceStatic: false,
    });
  } else if (typeof source !== "undefined") {
    username = source.author.username;
    avatarURL = source.author.displayAvatarURL({
      forceStatic: false,
    });
  } else {
    username = "Unknown User";
    avatarURL = null;
  }

  let attachmentsUrls: any = (source as Message<boolean>).attachments.map(
    (a) => a.url
  );
  let embeds = (source as Message<boolean>).embeds.filter((embed) =>
    isRichEmbed(embed)
  );

  return {
    content: content != null ? content : null,
    username: username != null ? username : "Unknown",
    avatarURL: avatarURL != null ? avatarURL : null,
    threadId: message.channel.isThread() ? message.channel.id : null,
    embeds: embeds != null ? embeds : null,
    components:
      (source as Message<boolean>).components != null
        ? (source as Message<boolean>).components
        : null,
    allowedMentions: { parse: [] },
    files: attachmentsUrls != null ? attachmentsUrls : null,
  };
};

const baseInputHandler = (
  source: Message<boolean>,
  message: Message<boolean>
): string | MessagePayload | Omit<WebhookMessageOptions, "flags"> => {
  if (![0, 19].includes(source.type)) return null; //default and reply types

  let username;
  let avatarURL;
  let content =
    (source as Message<boolean>).content != null
      ? (source as Message<boolean>).content
      : null;

  let sourceGuildMember = (source as Message<boolean>).guild.members.cache.get(
    (source as Message<boolean>).author.id
  );

  if (typeof sourceGuildMember !== "undefined") {
    username = sourceGuildMember.user.tag;
    avatarURL = sourceGuildMember.user.displayAvatarURL({
      forceStatic: false,
    });
  } else if (typeof source !== "undefined") {
    username = source.author.username;
    avatarURL = source.author.displayAvatarURL({
      forceStatic: false,
    });
  } else {
    username = "Unknown User";
    avatarURL = null;
  }
  let isThread = message.channel.isThread();
  let attachmentsUrls: any = (source as Message<boolean>).attachments.map(
    (a) => a.url
  );
  let embeds = (source as Message<boolean>).embeds.filter((embed) =>
    isRichEmbed(embed)
  );

  return {
    content: content != null ? content : null,
    username: username != null ? username : "Unknown",
    avatarURL: avatarURL != null ? avatarURL : null,
    threadId: message.channel.isThread() ? message.channel.id : null,
    embeds: embeds != null ? embeds : null,
    components:
      (source as Message<boolean>).components != null
        ? (source as Message<boolean>).components
        : null,
    allowedMentions: { parse: [] },
    files: attachmentsUrls != null ? attachmentsUrls : null,
  };
};

function isRichEmbed(Embed: APIEmbed): boolean {
  if (Embed.provider != null) return false;
  if (Embed.video != null) return false;
  if (Embed.type && Embed.type != "rich") return false;

  return true;
}
