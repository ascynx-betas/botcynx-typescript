import { ThreadChannel } from "discord.js";
import { ButtonResponse } from "../structures/Commands";

export default new ButtonResponse({
  category: "close",
  botPermissions: ["MANAGE_THREADS"],
  run: async ({ interaction, client }) => {
    //close ticket button
    const thread = interaction.channel;
    if (
      interaction.channel.type === "GUILD_PRIVATE_THREAD" ||
      interaction.channel.type === "GUILD_PUBLIC_THREAD"
    ) {
      interaction
        .reply({ content: `Locking thread...`, ephemeral: true })
        .then(() => (thread as ThreadChannel).setLocked())
        .then(() => (thread as ThreadChannel).setArchived());
    } else
      return interaction.reply({
        content: `this channel is not a thread`,
        ephemeral: true,
      });
  },
});
