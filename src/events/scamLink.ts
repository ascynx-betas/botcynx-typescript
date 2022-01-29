import { GuildTextBasedChannel, MessageEmbed } from "discord.js";
import { botcynx } from "..";
import { hasScamLink } from "../lib/cache/scamlink";
import { Event } from "../structures/Event";

export default new Event('messageCreate', (message) => {
    if (message.author.bot || !message.guild) return;

    const isScamLink = hasScamLink(message.content);

    if (isScamLink == true) {
        const embed = new MessageEmbed()
            .setAuthor({name: "⚠️ "+ message.author.tag})
            .setDescription(`Triggered Scam link detection: [here](https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id})`)
            .setFooter({text: "triggered in: " + message.guild.name});

      (botcynx.channels.cache.get('903281241594413176') as GuildTextBasedChannel).send({
        embeds: [embed]
      }) 
    } else return;
})