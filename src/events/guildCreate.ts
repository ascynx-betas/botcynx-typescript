import { MessageEmbed, TextChannel } from "discord.js";
import { botcynx } from "..";
import { configModel } from "../models/config";
import { Event } from "../structures/Event";

export default new Event('guildCreate', async (guild) => {
    const embed = new MessageEmbed()
        .setTitle("Joined Server")
        .addField('Guild Info', `${guild.name} (${guild.id})\n ${guild.memberCount} members`)
        .setFooter({text: `Now in ${botcynx.guilds.cache.size} guilds`})
        .setTimestamp(Date.now())
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setColor('GREEN');

    (botcynx.channels.cache.get(process.env.webhookLogLink) as TextChannel).send({embeds: [embed]})
    const guildId = guild.id;

    const config = await configModel.find({
        guildId: guildId
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

})