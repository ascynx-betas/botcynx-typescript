import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { slashCommand } from "../../../structures/Commands";

export default new slashCommand({
    name: 'bot-info',
    description: "gives informations about the bot and it's creator",

    run: async({ interaction, client }) => {
        const description = `bot Mention: ${client.user} developer: ${process.env.developerId}\nin ${client.guilds.cache.size} guilds\n serving ${client.users.cache.size} users`;
        const buttonRow = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('info userContextCommand')
                .setLabel('User context Commands')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('info messageContextCommand')
                .setLabel('Message Context Commands')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('info MessageCommand')
                .setLabel('Message commands')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('info slashCommand')
                .setLabel('Slash commands')
                .setStyle('SECONDARY')
            );

        const embed = new MessageEmbed()
            .setDescription(description)
            .setTitle('Information')
            .setFooter({text: `requested by ${interaction.user.tag}`})

        interaction.followUp({embeds: [embed], components: [buttonRow]});
    }
})