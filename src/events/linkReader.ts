import {
  GuildTextBasedChannel,
  Message,
  TextChannel,
  ThreadChannel,
  Webhook,
} from "discord.js";
import { botcynx } from "..";
import { configModel } from "../models/config";
import { isId } from "../personal-modules/discordPlugin";
import { containsLink } from "../personal-modules/testFor";
import { Event } from "../structures/Event";

export default new Event("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  let botPermissions = message.guild.me.permissions.toArray();
  if (
    !botPermissions.includes("MANAGE_WEBHOOKS") &&
    !botPermissions.includes("ADMINISTRATOR")
  )
    return;

  const config = await configModel.find({ guildId: message.guild.id });
  if (config[0].disabledCommands.includes("linkReader")) return;

  const discordSiteRegExp = /.{0,6}\.?discord\.com/gim;

  let results = containsLink(message.content);
  if (results.length == 0) return;
  let whitespace = /\s/gi;
  message.content = message.content.replace(whitespace, " ");
  let linkfield = message.content.split(" ");
  results.forEach( async(result) => {
    let first = linkfield[result];

  let link = first.slice(8, message.content.length);
  let fields = link.split("/");
  if (!discordSiteRegExp.test(fields[0])) return; //if the link isn't discord related (avoid getting a youtube link caught up in it 💀)
  if (fields[1] !== "channels") return;
  let Id = isId(fields[2]);
  let regex = /[^[0-9]/gi;
  fields[2] = fields[2].replace(regex, "");
  if (Id == false) return message.react("❌"); //link contains a non-id
  Id = isId(fields[3]);
  fields[3] = fields[3].replace(regex, "");
  if (Id == false) return message.react("❌"); //link contains a non-id
  Id = isId(fields[4]);
  fields[4] = fields[4].replace(regex, "");
  if (Id == false) return message.react("❌"); //link contains a non-id
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
  let username;
  let avatarURL;
  let content = `${(source as Message<boolean>).content || " "}`; //might break
  let sourceGuildMember = (source as Message<boolean>).guild.members.cache.get(
    (source as Message<boolean>).author.id
  );
  if (typeof sourceGuildMember !== "undefined") {
    username = sourceGuildMember.user.tag;
    avatarURL = sourceGuildMember.user.displayAvatarURL({ dynamic: true });
  } else if (typeof source !== "undefined") {
    username = (source as Message<boolean>).author.username;
    avatarURL = (source as Message<boolean>).author.displayAvatarURL({
      dynamic: true,
    });
  } else {
    username = "Unknown User";
    avatarURL = null;
  }
  let webhook: any;
  let isThread = message.channel.isThread();
  let attachmentsUrls: any = (source as Message<boolean>).attachments.map(
    (a) => a.url
  );

  //deprecated using deprecated property, might fail at any time
  let embeds = (source as Message<boolean>).embeds.filter(
    (embed) => embed.type === "rich"
  );

  if (isThread == true) {
    webhook = await (message.channel as ThreadChannel).parent.fetchWebhooks();
  } else webhook = await (message.channel as TextChannel).fetchWebhooks();
  webhook = webhook.filter((webhook) => webhook.owner.id === botcynx.user.id);

  if (typeof webhook === "undefined" || webhook.size == 0) {
    webhook = await (message.channel as TextChannel).createWebhook(
      "Botcynx link reader",
      {
        avatar: `${botcynx.user.displayAvatarURL({ dynamic: true })}`,
        reason: "request for non existing webhook",
      }
    );
    return message.react("💀"); //webhook didn't exist
  }
  let id: any;
  id = webhook.map((w) => w.id);
  webhook = webhook.get(id[0]);
  const webhookClient: Webhook = await botcynx
    .fetchWebhook(webhook.id, webhook.token)
    .catch(() => null);
  if (webhookClient == null) return;
  if (isThread == true) {
    if (typeof attachmentsUrls[0] !== "undefined") {
      webhookClient
        .send({
          content: content,
          username: username,
          avatarURL: avatarURL,
          threadId: message.channel.id,
          embeds: embeds,
          components: (source as Message<boolean>).components,
          allowedMentions: { parse: [] },
          files: attachmentsUrls,
        })
        .catch(() => message.react("🔇")); //empty message
    } else {
      webhookClient
        .send({
          content: content,
          username: username,
          avatarURL: avatarURL,
          threadId: message.channel.id,
          embeds: embeds,
          components: (source as Message<boolean>).components,
          allowedMentions: { parse: [] },
        })
        .catch(() => message.react("🔇")); //empty message
    }
  } else {
    if (typeof attachmentsUrls[0] !== "undefined") {
      webhookClient
        .send({
          content: content,
          username: username,
          avatarURL: avatarURL,
          embeds: embeds,
          components: (source as Message<boolean>).components,
          allowedMentions: { parse: [] },
          files: attachmentsUrls,
        })
        .catch(() => message.react("🔇")); //empty message
    } else {
      webhookClient
        .send({
          content: content,
          username: username,
          avatarURL: avatarURL,
          embeds: embeds,
          components: (source as Message<boolean>).components,
          allowedMentions: { parse: [] },
        })
        .catch(() => message.react("🔇")); //empty message
    }
  }
  });
});
