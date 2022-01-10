import {
  MessageActionRow,
  MessageActionRowComponent,
  MessageButton,
  MessageComponentTypeResolvable,
  MessageEmbed,
} from "discord.js";
import { setButtonRows } from "../../../personal-modules/discordPlugin";
import { slashCommand } from "../../../structures/Commands";

export default new slashCommand({
  name: "bot-info",
  description: "gives informations about the bot and it's creator",
  category: "information",

  run: async ({ interaction, client }) => {
    const interactionCommands: any = client.ArrayOfSlashCommands.concat(
      client.commands
    );
    let types: string[] = interactionCommands.map((c) => c.category || "other");
    types = [...new Set(types)];
    const description = `bot Mention: ${client.user} developer: ${
      client.users.cache.get(process.env.developerId).tag
    }(${process.env.developerId})\nin ${
      client.guilds.cache.size
    } guilds\n serving ${client.users.cache.size} users`;
    let arrayOfButtons: MessageActionRowComponent[] = [];
    types.forEach(function (type) {
      const button = new MessageButton()
        .setCustomId(`info:${type}`)
        .setLabel(`${type}`)
        .setStyle("SECONDARY");

      arrayOfButtons.push(button);
    });
    if (arrayOfButtons.length >= 25)
      return interaction.followUp({
        content: `there are too many categories to create enough buttons`,
      });
    let components: MessageActionRow[] = await setButtonRows(arrayOfButtons);

    const embed = new MessageEmbed()
      .setDescription(description)
      .setTitle("Information")
      .setFooter({ text: `requested by ${interaction.user.tag}` });

    interaction.followUp({ embeds: [embed], components: components });
  },
});
