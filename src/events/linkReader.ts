import {
  GuildTextBasedChannel,
  Message,
  TextBasedChannel,
  TextChannel,
  ThreadChannel,
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

  let results = containsLink(message.content);
  if (results.length == 0) return;
  let linkfield = message.content.split(" ");
  let first = linkfield[results[0]];
  let link = first.slice(8, message.content.length);
  let fields = link.split("/");
  if (fields[1] !== "channels") return;
  let result = isId(fields[2]);
  let regex = /[^[0-9]/gi;
  fields[2] = fields[2].replace(regex, "");
  if (result == false) return message.react("❌"); //link contains a non-id
  result = isId(fields[3]);
  fields[3] = fields[3].replace(regex, "");
  if (result == false) return message.react("❌"); //link contains a non-id
  result = isId(fields[4]);
  fields[4] = fields[4].replace(regex, "");
  if (result == false) return message.react("❌"); //link contains a non-id
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
  let embeds = (source as Message<boolean>).embeds.filter(
    (embed) => embed.type === "rich"
  ); //! using deprecated property, might fail at any time

  if (isThread == true) {
    webhook = await (message.channel as ThreadChannel).parent.fetchWebhooks();
  } else
    webhook = await (message.channel as ThreadChannel).parent.fetchWebhooks();
  webhook = webhook.filter((webhook) => webhook.owner.id === botcynx.user.id);

  if (typeof webhook === "undefined" || webhook.size == 0) {
    webhook = await (message.channel as TextChannel).createWebhook(
      "Botcynx link reader",
      {
        avatar: `${botcynx.user.displayAvatarURL({ dynamic: true })}`,
        reason: "request for non existing webhook",
      }
    );
    message.react("💀"); //webhook didn't exist
  }
  let id: any;
  id = webhook.map((w) => w.id);
  webhook.get(id[0]);
  const webhookClient = await botcynx.fetchWebhook(webhook.id, webhook.token);
  if (isThread == true) {
    if (typeof attachmentsUrls !== "undefined") {
      webhookClient
        .send({
          content: content,
          username: username,
          avatarURL: avatarURL,
          threadId: message.channel.id,
          embeds: embeds,
          components: (source as Message<boolean>).components,
          allowedMentions: { parse: [] },
          files: [attachmentsUrls],
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
    if (typeof attachmentsUrls !== "undefined") {
      webhookClient
        .send({
          content: content,
          username: username,
          avatarURL: avatarURL,
          embeds: embeds,
          components: (source as Message<boolean>).components,
          allowedMentions: { parse: [] },
          files: [attachmentsUrls],
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
