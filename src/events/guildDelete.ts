import { MessageEmbed, TextChannel } from "discord.js";
import { botcynx } from "..";
import { configModel } from "../models/config";
import { Event } from "../structures/Event";

export default new Event("guildDelete", (guild) => {
  const embed = new MessageEmbed()
    .setTitle("Left server")
    .addField(
      "Guild infos",
      `${guild.name} (${guild.id})\n ${guild.memberCount} members`
    )
    .setFooter({ text: `Now in ${botcynx.guilds.cache.size} guilds` })
    .setTimestamp(Date.now())
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .setColor("RED");

  (botcynx.channels.cache.get('903281241594413176') as TextChannel).send({
    embeds: [embed],
  });
  const guildId = guild.id;
  configModel.deleteOne({ guildId: guildId });
});
