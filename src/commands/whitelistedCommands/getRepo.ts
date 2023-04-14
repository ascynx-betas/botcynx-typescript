import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { botcynx } from "../..";
import { searchRepositories } from "../../lib/repoPull";
import { queryEmbed, returnEditQueryButton } from "../../lib/utils";
import { WhitelistedCommand } from "../../structures/Commands";

//! TODO create a query cache to avoid spamming the github api for data of the same query (e.g: getting data from the same list when moving pages)

export function getSortingRowForQuery(query: string) {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
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
      .setPlaceholder("sorting method")
);
}


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
      interaction.user.tag,
      queryParameter
    );

    const queryButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonFields);
    
    interaction.followUp({
      embeds: [embed],
      components: [queryButtons, getSortingRowForQuery(query), returnEditQueryButton(0, (data.total_count / 5), query)],
      allowedMentions: { parse: [] },
    });
  },
  register: ({ guild }) => {
    guild.commands.create(botcynx.whitelistedCommands.get("find-repo"));
  },
});
