import { ActionRow, ActionRowBuilder, ButtonBuilder, MessageActionRowComponent } from "discord.js";
import { searchRepositories } from "../lib/repoPull";
import { queryEmbed } from "../lib/utils";
import { ButtonResponse } from "../structures/Commands";

export default new ButtonResponse({
  category: "sort-repo",
  temporary: true,
  run: async ({ interaction, client }) => {
    const sortby = interaction.customId.split(":")[2]; //sorting technique
    const query = interaction.customId.split(":")[1]; //query parameter
    //options: star-down, star-up, last-updated, oldest-updated, forks-up, forks-down
    const data = await searchRepositories(query);
    const decodedQuery = decodeURIComponent(query);

    if (sortby == "last-updated") {
      data.items.forEach((item, index: number) => {
        const date: string = item.pushed_at;
        const parsedData = Date.parse(date); //! Might bug

        data.items[index].pushed_at = parsedData; //change date to timestamp
      });

      data.items.sort((a, b) => b.pushed_at - a.pushed_at);

      const { embed, buttonFields } = queryEmbed(
        data,
        interaction.user.tag,
        decodedQuery
      );

      const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonFields);
      interaction.update({
        embeds: [embed],
        components: [
          actionRow,
          interaction.message.components[1] as ActionRow<MessageActionRowComponent>,
        ],
      });
    } else if (sortby == "oldest-updated") {
      data.items.forEach((item, index: number) => {
        const date: string = item.pushed_at;
        const parsedData = Date.parse(date); //! Might bug

        data.items[index].pushed_at = parsedData; //change date to timestamp
      });

      data.items.sort((a, b) => a.pushed_at - b.pushed_at);

      const { embed, buttonFields } = queryEmbed(
        data,
        interaction.user.tag,
        decodedQuery
      );

      const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonFields);
      interaction.update({
        embeds: [embed],
        components: [
          actionRow,
          interaction.message.components[1] as ActionRow<MessageActionRowComponent>,
        ],
      });
    } else if (sortby == "forks-up") {
      data.items.sort((a, b) => a.forks_count - b.forks_count);

      const { embed, buttonFields } = queryEmbed(
        data,
        interaction.user.tag,
        decodedQuery
      );

      const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonFields);
      interaction.update({
        embeds: [embed],
        components: [
          actionRow,
          interaction.message.components[1] as ActionRow<MessageActionRowComponent>,
        ],
      });
    } else if (sortby == "forks-down") {
      data.items.sort((a, b) => b.forks_count - a.forks_count);

      const { embed, buttonFields } = queryEmbed(
        data,
        interaction.user.tag,
        decodedQuery
      );

      const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonFields);
      interaction.update({
        embeds: [embed],
        components: [
          actionRow,
          interaction.message.components[1] as ActionRow<MessageActionRowComponent>,
        ],
      });
    } else if (sortby == "star-down") {
      data.items.sort((a, b) => b.stargazers_count - a.stargazers_count);

      const { embed, buttonFields } = queryEmbed(
        data,
        interaction.user.tag,
        decodedQuery
      );

      const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonFields);
      interaction.update({
        embeds: [embed],
        components: [
          actionRow,
          interaction.message.components[1] as ActionRow<MessageActionRowComponent>,
        ],
      });
    } else if (sortby == "star-up") {
      data.items.sort((a, b) => a.stargazers_count - b.stargazers_count);

      const { embed, buttonFields } = queryEmbed(
        data,
        interaction.user.tag,
        decodedQuery
      );

      const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonFields);
      interaction.update({
        embeds: [embed],
        components: [
          actionRow,
          interaction.message.components[1] as ActionRow<MessageActionRowComponent>,
        ],
      });
    } else return;
  },
});
