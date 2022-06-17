import { MessageActionRow, Modal, TextInputComponent } from "discord.js";
import { WhitelistedCommand } from "../../structures/Commands";

export default new WhitelistedCommand({
  name: "giveawayrequest",
  description: "send a new giveaway request",
  isModalCommand: true,

  run: async ({ interaction, client, args }) => {
    let modal = new Modal()
      .setCustomId("giveawayrequest:" + interaction.guild.id)
      .setTitle("Giveaway Request (minimum: 5m coins)")
      .addComponents(...[
        new MessageActionRow<TextInputComponent>().addComponents(new TextInputComponent({
          customId: "item",
          label: "Items or money",
          style: "PARAGRAPH",
          minLength: 10,
          maxLength: 200,
          required: true,
          placeholder: "5 MILLION Skyblock coins"
        })),
      new MessageActionRow<TextInputComponent>().addComponents(new TextInputComponent({
        customId: "username",
        label: "Minecraft username (if ≄ discord)",
        style: "SHORT",
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
