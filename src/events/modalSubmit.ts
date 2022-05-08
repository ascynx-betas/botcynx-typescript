import { botcynx } from "..";
import { Event } from "../structures/Event";

export default new Event("modalSubmit", (modal) => {
  const modalC = botcynx.modals.get(modal.customId.split(":")[0]);
  if (!modalC)
    modal
      .reply({
        content: `The modal ${modal.customId} does not exist`,
        ephemeral: true,
      })
      .then((message) => {
        throw new Error(
          `Modal handler for ${modal.customId} not found,\n\terror triggered in ${modal.guildId} by ${modal.user.tag}`
        );
      });

  modalC.run({ modal, client: botcynx });
});
