import {
  ActionRow,
  ActionRowBuilder,
  ButtonBuilder,
  MessageActionRowComponent,
} from "discord.js";
import { searchRepositories } from "../lib/repoPull";
import { queryEmbed, returnEditQueryButton } from "../lib/utils";
import { ButtonResponse } from "../structures/Commands";

export default new ButtonResponse({
  category: "sort-repo",
  temporary: true,
  run: async ({ interaction, client }) => {
    const sortby = interaction.customId.split(":")[2]; //sorting method
    const query = interaction.customId.split(":")[1]; //query parameter
    //options: star-down, star-up, last-updated, oldest-updated, forks-up, forks-down
    const data = await searchRepositories(query);
    const decodedQuery = decodeURIComponent(query);

    if (sortby == "last-updated") {
      data.items.sort((a, b) => b.pushed_at_parsed - a.pushed_at_parsed);
    } else if (sortby == "oldest-updated") {
      data.items.sort((a, b) => a.pushed_at_parsed - b.pushed_at_parsed);
    } else if (sortby == "forks-up") {
      data.items.sort((a, b) => a.forks_count - b.forks_count);
    } else if (sortby == "forks-down") {
      data.items.sort((a, b) => b.forks_count - a.forks_count);
    } else if (sortby == "star-down") {
      data.items.sort((a, b) => b.stargazers_count - a.stargazers_count);
    } else if (sortby == "star-up") {
      data.items.sort((a, b) => a.stargazers_count - b.stargazers_count);
    } else return;//  unexpected sorting method

    const { embed, buttonFields } = queryEmbed(
      interaction.user.tag,
      decodedQuery
    );

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      buttonFields
    );
    interaction.update({
      embeds: [embed],
      components: [
        actionRow,
        interaction.message
          .components[1] as ActionRow<MessageActionRowComponent>,
        returnEditQueryButton(0, (data.total_count / 5), query)
      ],
    });
  },
});
