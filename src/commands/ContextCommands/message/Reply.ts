import { MessageContextCommand } from "../../../structures/Commands";
import { ApplicationCommandType, GuildTextBasedChannel, MessageContextMenuCommandInteraction } from "discord.js";

export default new MessageContextCommand({
  name: "reply",
  type: ApplicationCommandType.Message,
  category: "other",
  userPermissions: ["ManageMessages"],

  run: async ({ interaction }) => {
    (interaction as MessageContextMenuCommandInteraction).followUp({
      content: `${
        (interaction.channel as GuildTextBasedChannel).messages.cache.get(
          (interaction as MessageContextMenuCommandInteraction).targetId
        ).content || "no content"
      }`,
    });
  },
});
