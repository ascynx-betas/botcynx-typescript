import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { slashCommandRequestCache } from "../lib/slashCommandRequestCache";
import { ButtonResponse } from "../structures/Commands";

export default new ButtonResponse({
    category: "newquery",
    temporary: true,
    onlyAuthor: true,

    run: ({ client, interaction }) => {
        //create modal and send it then respond to modal

        let oldQuery: string;

        if (interaction.message.embeds && interaction.message.embeds[0].title) {
          let title = interaction.message.embeds[0].title;
          let rgx = /results for (?<query>.*)/gi
          if (rgx.test(title)) {
            rgx.lastIndex = 0;
            oldQuery = rgx.exec(title).groups["query"];
          }

        }

        slashCommandRequestCache.getInstance().addToCache(interaction, true);

        let modal = new ModalBuilder()
            .setCustomId("newquery:" + interaction.id)
            .setTitle("Enter new repository query")
            .addComponents(
                ...[
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder({
                    customId: "query",
                    label: "Enter query here",
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