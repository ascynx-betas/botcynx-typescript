import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} from "discord.js";
import {
  infoEmbedCreation,
  SetActiveButton,
  setButtonRows,
} from "../personal-modules/discordPlugin";
import { ButtonResponse } from "../structures/Commands";

export default new ButtonResponse({
  category: "info",
  temporary: true,
  require: ["mongooseConnectionString"],
  onlyAuthor: true,
  run: async ({ interaction, client }) => {
    //info categories
    const interactionCommands: any = client.ArrayOfSlashCommands.concat(
      client.commands
    );
    let types: string[] = interactionCommands.map((c) => c.category || "other");
    types = [...new Set(types)];
    let category: string[] | string = interaction.customId.split(":");
    category = category[1];
    let arrayOfButtons: ButtonBuilder[] = [];
    let messageComponents = interaction.message.components.map(
      (c) => c.components
    );
    let newMessageComponents = messageComponents[0].concat(messageComponents[1]);
    let idArray = newMessageComponents.map((c) => c.customId);
    const buttonStyles = await SetActiveButton(interaction.customId, idArray);
    types.forEach(function (type, index) {
      const button = new ButtonBuilder()
        .setCustomId(`info:${type}`)
        .setLabel(`${type}`)
        .setStyle(buttonStyles[index]);

      arrayOfButtons.push(button);
    });
    if (arrayOfButtons.length >= 25)
      return interaction.followUp({
        content: `there are too many categories to create enough buttons`,
      });
    let components: ActionRowBuilder<ButtonBuilder>[] = await setButtonRows(arrayOfButtons);

    let infoEmbed = infoEmbedCreation(category);
    let { fields, title } = infoEmbed;
    let embed: EmbedBuilder;
    embed = new EmbedBuilder().addFields(fields).setTitle(title || "error");

    //update embed and set current button to PRIMARY style
    interaction.update({ embeds: [embed], components: components });
  },
});
