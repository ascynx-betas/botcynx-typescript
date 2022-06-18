import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  SelectMenuBuilder,
} from "discord.js";
import { searchRepositories } from "../../lib/repoPull";
import { queryEmbed } from "../../lib/utils";
import { WhitelistedCommand } from "../../structures/Commands";

export default new WhitelistedCommand({
  name: "find-repo",
  description: "Search for mods on github",
  cooldown: 60,
  options: [
    {
      name: "query",
      description: "the query you want to use",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  run: async ({ interaction, client }) => {
    const queryParameter = interaction.options.getString("query");

    const query = encodeURIComponent(queryParameter);

    const data = await searchRepositories(query);
    if (data.total_count == 0)
      return interaction.followUp({
        content: `there are no results for that query`,
      });
    data.items.sort((a, b) => b.stargazers_count - a.stargazers_count);

    const { embed, buttonFields } = queryEmbed(
      data,
      interaction.user.tag,
      queryParameter
    );

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      buttonFields
    );
    const componentRow =
      new ActionRowBuilder<SelectMenuBuilder>().addComponents(
        new SelectMenuBuilder()
          .addOptions({
            value: "star-down",
            label: "sort by stars a > b",
          })
          .addOptions({
            value: "star-up",
            label: "sort by stars a < b",
          })
          .addOptions({
            value: "last-updated",
            label: "last updated",
          })
          .addOptions({
            value: "oldest-updated",
            label: "oldest since updated",
          })
          .addOptions({
            value: "forks-down",
            label: "sort by forks a > b",
          })
          .addOptions({
            value: "forks-up",
            label: "sort by forks a < b",
          })
          .setCustomId(`sort-repo:${query}`)
          .setPlaceholder("sorting technique")
      );

    interaction.followUp({
      embeds: [embed],
      components: [actionRow, componentRow],
      allowedMentions: { parse: [] },
    });
  },
  register: ({ client, guild }) => {
    guild.commands.create(client.whitelistedCommands.get("find-repo"));
  },
});
