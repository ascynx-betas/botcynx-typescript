import { Message } from "discord.js";
import { botcynx } from "../..";
import { Announcer, preference } from "./announcer";

export const handleAnnouncement = async (
  message: Message,
  announcer: Announcer
) => {
  if (announcer.isDisabled == true) return;
  const m = await message.react("<a:wait:948353694657818664>");
  let errors: Error[] = [];

  const listeners = announcer.LISTENERS;

  for (const listener of listeners) {
    const preferences =
      listener.PREFERENCES != null ? listener.PREFERENCES : null;
    let isActiveListener = true;
    let announcementType: preference["type"] = "ANONYMOUS";
    let content = message.content;

    for (const preference of preferences) {
      if (preference.method == "REPLACE") {
        const regex = new RegExp(preference.original, "gmi");
        content = content.replace(
          regex,
          typeof preference.replaced_value == "string"
            ? preference.replaced_value
            : "[REDACTED INFORMATION]"
        );
      }
      if (preference.method == "DISABLE" && isActiveListener != false)
        isActiveListener = false;
      if (preference.method == "IDENTITY" && announcementType != "ANONYMOUS")
        announcementType = preference.type;
    }

    if (!isActiveListener) continue;

    const webhookLink = listener.webhookLogLink;

    const webhook = botcynx.fetchWebhook(
      webhookLink.split("/")[5],
      webhookLink.split("/")[6]
    );

    await (
      await webhook
    )
      .send({
        username:
          announcementType == "SERVER-USER"
            ? message.guild.name + ` (${message.author.tag})`
            : announcementType == "ANONYMOUS"
            ? message.guild.name
            : message.author.tag, //Example SERVER-USER = Ascynx's cavern (Ascynx#0736), ANONYMOUS = Ascynx's cavern, USER = Ascynx#0736
        avatarURL:
          announcementType != "USER"
            ? message.guild.iconURL({ dynamic: true })
            : message.author.avatarURL({ dynamic: true }),
        content: content != null ? content : null,
        embeds: message.embeds != null ? message.embeds : null,
        attachments:
          message.attachments != null
            ? message.attachments.map((m) => m)
            : null,
        allowedMentions: { parse: ["roles", "users"] },
      })
      .catch((err) => {
        errors.push(err);
      }); // Now that I think about it, it would be possible to create an interconnected chatroom with that
  }
  m.remove();
  if (errors.length == 0) message.react("✅");
  else message.react("❌");
};
