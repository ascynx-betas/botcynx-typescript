import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";
import { getSortingRowForQuery } from "../commands/whitelistedCommands/getRepo";
import { searchRepositories } from "../lib/repoPull";
import { SlashCommandRequestCache } from "../lib/slashCommandRequestCache";
import { queryEmbed, returnEditQueryButton } from "../lib/utils";
import { ModalResponse } from "../structures/Commands";

export default new ModalResponse({
    name: "newquery",
    once: false,

    run: async ({ client, modal }) => {
        let interactionId = modal.customId.split(":")[1];
        const interaction = SlashCommandRequestCache.getInstance().getFromCache(interactionId);

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

        //edit the original message
        (interaction.Interaction as ButtonInteraction).editReply({
            embeds: [embed],
            components: [queryButtons, getSortingRowForQuery(query), returnEditQueryButton(0, (data.total_count / 5), query)],
            allowedMentions: { parse: [] }
        });

        //delete the request to avoid having duplicates
        SlashCommandRequestCache.getInstance().deleteElement(interactionId);

        modal.reply({content: "Updated query", ephemeral: true});//required to avoid discord sending an error to the user
    }
})