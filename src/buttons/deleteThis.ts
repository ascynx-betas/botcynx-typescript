import { MessageEmbed } from "discord.js";
import { ButtonResponse } from "../structures/Commands";

export default new ButtonResponse({
    category: "clear",
    onlyAuthor: true,
    temporary: true,

    run: async({ interaction, client }) => {

        const embed = new MessageEmbed()
            .setDescription('This command has been cancelled')
            .setTitle('cancelled command')
            .setFooter({text: `cancelled by ${interaction.user.tag}`});

        interaction.update({embeds: [embed], components: []});
    }
})