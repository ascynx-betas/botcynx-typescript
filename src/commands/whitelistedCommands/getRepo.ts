import { MessageActionRow, MessageSelectMenu } from "discord.js";
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
      type: "STRING",
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

    const actionRow = new MessageActionRow().addComponents(buttonFields);
    const componentRow = new MessageActionRow().addComponents(
      new MessageSelectMenu()
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
          value: "forks-up",
          label: "sort by forks a < b",
        })
        .addOptions({
          value: "forks-down",
          label: "sort by forks a > b",
        })
        .setCustomId(`sort-repo:${query}`)
        .setPlaceholder("sorting technique")
    );

    interaction.followUp({
      embeds: [embed],
      components: [actionRow, componentRow],
    });
  },
});

/**
 * TODO add sorting
 * by stars
 * forks
 * commits
 * last updated
 * and most recently updated
 */
