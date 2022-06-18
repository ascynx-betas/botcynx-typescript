import { Colors, EmbedBuilder, TextChannel } from "discord.js";
import { botcynx } from "..";
import { configModel } from "../models/config";
import { Event } from "../structures/Event";

export default new Event("guildCreate", async (guild) => {
  const embed = new EmbedBuilder()
    .setTitle("Joined Server")
    .addFields({
      name: "Guild Info",
      value: `${guild.name} (${guild.id})\n${guild.memberCount} members`,
    })
    .setFooter({ text: `Now in ${botcynx.guilds.cache.size} guilds` })
    .setTimestamp(Date.now())
    .setThumbnail(guild.iconURL({ forceStatic: false }))
    .setColor(Colors.Green);

  (botcynx.channels.cache.get("903281241594413176") as TextChannel).send({
    embeds: [embed],
  });
  const guildId = guild.id;

  const config = await configModel.find({
    guildId: guildId,
  });

  if (!config || config.length == 0) {
    new configModel({
      name: guild.name,
      guildId: guildId,
      trigger: [],
      bypass: [],
      removable: [],
      logchannel: "",
      su: [],
      blocked: [],
    }).save();
  }
});
