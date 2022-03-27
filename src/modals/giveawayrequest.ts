import { GuildTextBasedChannel, MessageEmbed } from "discord.js";
import { sendInfoWebhook } from "../lib/utils";
import { modalResponse } from "../structures/Commands";

export default new modalResponse({
  name: "giveawayrequest",
  once: false,

  run: async ({ modal, client }) => {
    if (
      ["779489942899785748", "758015919451537522"].includes(
        modal.customId.split(":")[1]
      )
    ) {
      const embed = new MessageEmbed()
        .setTitle(
          "Giveaway Queue" + modal.customId.split(":")[1] ==
            "779489942899785748"
            ? " (debug)"
            : ""
        )
        .addField("Name: ", `${modal.member} | ${modal.user.tag}`)
        .addField("Giveaway Item(s): ", modal.getTextInputValue("item"), true);

      if (modal.getTextInputValue("username") != null)
        embed.addField("username: ", modal.getTextInputValue("username"), true);

      if (modal.customId.split(":")[1] == "758015919451537522") {
        const channel = client.channels.cache.get("890996343085088778");

        await (channel as GuildTextBasedChannel).send({ embeds: [embed] });
      } else if (modal.customId.split(":")[1] == "779489942899785748") {
        await sendInfoWebhook({ embed });
      }
      modal.reply({ content: "successfully submitted", ephemeral: true });
    }
  },
});
