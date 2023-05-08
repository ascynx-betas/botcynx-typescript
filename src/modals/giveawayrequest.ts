import { GuildTextBasedChannel, EmbedBuilder, APIEmbed } from "discord.js";
import { sendInfoWebhook } from "../lib/utils";
import { ModalResponse } from "../structures/Commands";

export default new ModalResponse({
  name: "giveawayrequest",
  once: false,

  run: async ({ modal, client }) => {
    if (
      ["779489942899785748", "758015919451537522"].includes(
        modal.customId.split(":")[1]
      )
    ) {
      const embed = new EmbedBuilder()
        .setTitle(
          "Giveaway Queue" + modal.customId.split(":")[1] ==
            "779489942899785748"
            ? " (debug)"
            : ""
        )
        .addFields({
          name: "Name: ",
          value: `${modal.member} | ${modal.user.tag}`,
        })
        .addFields({
          name: "Giveaway Item(s): ",
          value: modal.fields.getTextInputValue("item"),
          inline: true,
        });

      if (modal.fields.getTextInputValue("username") != null)
        embed.addFields({
          name: "username: ",
          value: modal.fields.getTextInputValue("username"),
          inline: true,
        });

      const embedApi: APIEmbed = embed.data;

      if (modal.customId.split(":")[1] == "758015919451537522") {
        const channel = client.channels.cache.get("890996343085088778");

        await (channel as GuildTextBasedChannel).send({
          embeds: [embed],
          allowedMentions: { parse: [] },
        });
      } else if (modal.customId.split(":")[1] == "779489942899785748") {
        await sendInfoWebhook({ embed: embedApi });
      }
      modal.reply({ content: "successfully submitted", ephemeral: true });
    }
  },
});
