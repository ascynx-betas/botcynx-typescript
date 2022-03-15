import { botcynx } from "..";
import { Event } from "../structures/Event";

export default new Event("modalSubmit", (modal) => {
  const modalC = botcynx.modals.get(modal.customId.split(":")[0]);
  if (!modalC) return console.log("no modal handler found for that");

  modalC.run({ modal, client: botcynx });
});
