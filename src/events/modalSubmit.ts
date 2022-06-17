import { ModalSubmitInteraction } from "discord.js";
import { allowedNodeEnvironmentFlags } from "process";
import { botcynx } from "..";
import { Event } from "../structures/Event";

export default new Event("interactionCreate", (interaction) => {
  if (!(interaction instanceof ModalSubmitInteraction)) return; 
  const modalC = botcynx.modals.get(interaction.customId.split(":")[0]);
  if (!modalC)
  interaction
      .reply({
        content: `The modal ${interaction.customId} does not exist`,
        ephemeral: true,
      })
      .then((message) => {
        throw new Error(
          `Modal handler for ${interaction.customId} not found,\n\terror triggered in ${interaction.guildId} by ${interaction.user.tag}`
        );
      });

  modalC.run({ modal: interaction, client: botcynx });
});
