import { ActionRowBuilder, TextInputBuilder, ModalBuilder, TextInputComponent, TextInputStyle } from "discord.js";
import { WhitelistedCommand } from "../../structures/Commands";

export default new WhitelistedCommand({
  name: "giveawayrequest",
  description: "send a new giveaway request",
  isModalCommand: true,

  run: async ({ interaction, client, args }) => {
    let modal = new ModalBuilder()
      .setCustomId("giveawayrequest:" + interaction.guild.id)
      .setTitle("Giveaway Request (minimum: 5m coins)")
      .addComponents(...[
        new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder({
          customId: "item",
          label: "Items or money",
          style: TextInputStyle.Paragraph,
          minLength: 10,
          maxLength: 200,
          required: true,
          placeholder: "5 MILLION Skyblock coins"
        })),
      new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder({
        customId: "username",
        label: "Minecraft username (if ≄ discord)",
        style: TextInputStyle.Short,
        minLength: 1,
        maxLength: 16,
        required: false
      }))
    ])
      interaction.showModal(modal);
  },
  register: ({ client, guild }) => {
    guild.commands.create(client.whitelistedCommands.get("giveawayrequest"));
  },
});
