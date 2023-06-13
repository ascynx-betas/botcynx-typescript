import { ActionRow, ActionRowBuilder, ButtonBuilder, MessageActionRowComponent, queryEmbed, returnEditQueryButton } from "../lib";
import { RepositoryCacheHandler } from "../lib/cache/repoCache";
import { ButtonResponse } from "../structures/Commands";

export default new ButtonResponse({
    category: "querypage",
    temporary: true,
    run: async({ interaction, client }) => {
        const fields = interaction.customId.split(":");
        const query = fields[1];
        const page = fields[2];
        if (!RepositoryCacheHandler.INSTANCE.hasQuery(query)) return;
        const data = RepositoryCacheHandler.INSTANCE.getQuery(query);
        const decodedQuery = decodeURIComponent(query);

        const pageInt = parseInt(page);

        const { embed, buttonFields } = queryEmbed(
            interaction.user.tag,
            decodedQuery,
            pageInt
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
                returnEditQueryButton(pageInt, data.total_count / 5, query)
            ]
        });
    }
})