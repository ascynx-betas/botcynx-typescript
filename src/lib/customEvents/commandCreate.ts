import { Event } from "../../structures/Event";
import { botcynxInteraction } from "../../typings/Command";
import { interactionOnEndCollection } from "../command/messageComponentUtils";

export default new Event("interactionCommandCreate", (interaction: botcynxInteraction) => {
    if (interaction == null) return;
    const filter = (i) => i?.message?.interaction?.id === interaction.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 300000,
    });

    collector.on("end", async (collected) => {
      interactionOnEndCollection(interaction, collected);
    });
  }
);
