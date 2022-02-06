import { MessageContextCommand } from "../../../structures/Commands";
import { GuildTextBasedChannel } from "discord.js";

export default new MessageContextCommand({
  name: "reply",
  type: "MESSAGE",
  category: "other",
  userPermissions: ["MANAGE_MESSAGES"],

  run: async ({ interaction }) => {
    interaction.followUp({
      content: `${
        (interaction.channel as GuildTextBasedChannel).messages.cache.get(
          interaction.targetId
        ).content || "no content"
      }`,
    });
  },
});
