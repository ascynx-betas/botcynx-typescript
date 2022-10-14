import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";
import { sortingRow } from "../commands/whitelistedCommands/getRepo";
import { searchRepositories } from "../lib/repoPull";
import { slashCommandRequestCache } from "../lib/slashCommandRequestCache";
import { queryEmbed, returnEditQueryButton } from "../lib/utils";
import { modalResponse } from "../structures/Commands";

export default new modalResponse({
    name: "newquery",
    once: false,

    run: async ({ client, modal }) => {
        let interactionId = modal.customId.split(":")[1];
        const interaction = slashCommandRequestCache.getInstance().getFromCache(interactionId);

        const queryParameter = modal.fields.getTextInputValue("query");
        const query = encodeURIComponent(queryParameter);
        const data = await searchRepositories(query);
        if (data.total_count == 0) {
            return modal.reply({content: `there are no results for that query`, ephemeral: true});
        }
        data.items.sort((a, b) => b.stargazers_count - a.stargazers_count);

        const {embed, buttonFields} = queryEmbed(
            data,
            modal.user.tag,
            queryParameter
        );

        const queryButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonFields);

        const newQueryButton = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId("newquery").setLabel("New query").setStyle(ButtonStyle.Primary));

        //edit the original message
        (interaction.Interaction as ButtonInteraction).editReply({
            embeds: [embed],
            components: [queryButtons, sortingRow, returnEditQueryButton(0, (data.total_count / 5))],
            allowedMentions: { parse: [] }
        });

        //delete the request to avoid having duplicates
        slashCommandRequestCache.getInstance().deleteElement(interactionId);

        modal.reply({content: "Updated query", ephemeral: true});//required to avoid discord sending an error to the user
    }
})