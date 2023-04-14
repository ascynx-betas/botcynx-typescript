import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { SlashCommandRequestCache } from "../lib/slashCommandRequestCache";
import { ButtonResponse } from "../structures/Commands";

export default new ButtonResponse({
    category: "newquery",
    temporary: true,
    onlyAuthor: true,

    run: ({ client, interaction }) => {
        //create modal and send it then respond to modal
        let oldQuery: string = interaction.customId.split(":")[1];

        SlashCommandRequestCache.getInstance().addToCache(interaction, true);

        let modal = new ModalBuilder()
            .setCustomId("findrepo:" + interaction.id)
            .setTitle("Enter new repository query")
            .addComponents(
                ...[
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder({
                    customId: "query",
                    label: "Enter the new query here",
                    style: TextInputStyle.Paragraph,
                    minLength: 1,
                    maxLength: 200,
                    required: true,
                    placeholder: oldQuery ? oldQuery : "",
                  })
                ),
                ]
      );
    interaction.showModal(modal);
    }

});