import { Event } from "../../structures/Event";
import { messageOnEndCollection } from "../command/messageComponentUtils";
export default new Event("messageCommandCreate", (message) => {
  if (message == null) return;
  const filter = (i) => i?.message?.reference?.messageId === message.id; //see if the interaction is linked to the created collector
  const collector = message.channel.createMessageComponentCollector({
    filter,
    time: 300000,
  });

  collector.on("end", async (collected) => {
    messageOnEndCollection(message, collected);
  });
});
