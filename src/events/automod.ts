import { GuildTextBasedChannel, EmbedBuilder, Colors } from "discord.js";
import { botcynx } from "..";
import { contains, hasScamLink, ignore, safe } from "../lib/cache/scamlink";
import { isAdminOrHigherThanBot } from "../lib/command/commandInhibitors";
import { similarityDetection } from "../lib/utils";
import { isLink } from "../lib/personal-modules/testFor";
import { Event } from "../structures/Event";

export default new Event("messageCreate", (message) => {
  if (message.author.bot || !message.guild) return;

  let Data: { isScamLink: boolean; cause: string } = {
    isScamLink: false,
    cause: "",
  };

  //if in scamLink database
  if (hasScamLink(message.content))
    Data = {
      isScamLink: true,
      cause: "Link detected in known database",
    };

  //common server scam method
  if (
    message.content.includes("@everyone") ||
    message.content.includes("@here")
  ) {
    if (message.content.split(" ").some((w) => isLink(w))) {
      let DataArray = message.content.split(" ").filter((w) => isLink(w));
      DataArray.forEach((word, index) => {
        if (ignore.some((i) => contains(word, i))) DataArray.splice(index, 1);
      });
      if (DataArray.length >= 1) {
        if (!message.member.permissions.toArray().includes("MentionEveryone")) {
          console.log(DataArray.length);
          Data = { isScamLink: true, cause: "Common scam detection" };
        }
      }
    }
  }
  //similarity based automod
  message.content
    .split(" ")
    .filter((w) => isLink(w))
    .forEach((word) => {
      safe.forEach((safeword) => {
        const testFields = word.split("/").filter((f) => f != "");

        const result = similarityDetection(testFields[1], safeword);
        if (
          result.result == true &&
          result.percentage >= 60 &&
          !ignore.some((w) => w == testFields[1])
        )
          Data = {
            isScamLink: true,
            cause: `similarity based automod:\n${word} is ${
              Math.round(result.percentage * 10) / 10
            }% the same as ${safeword}`,
          };
      });
    });

  //if ping spam raid
  if (message.mentions.users.size >= 5)
    Data = { isScamLink: true, cause: "Spam mention" };

  if (Data.isScamLink == true && !isAdminOrHigherThanBot(message.member)) {
    const embed = new EmbedBuilder()
      .setAuthor({
        name: "BOT ⚠️ " + message.author.tag + " (" + message.author.id + ")",
      })
      .setDescription(
        `Possible Raid / scam link detected: [here](https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id})\n\t${message.cleanContent}\n**Cause:** \`\`\`${Data.cause}\`\`\``
      )
      .setFooter({ text: "triggered in: " + message.guild.name })
      .setColor(Colors.DarkRed);

    (
      botcynx.channels.cache.get("903281241594413176") as GuildTextBasedChannel
    ).send({
      embeds: [embed],
      allowedMentions: { parse: [] },
    });
  }
});
