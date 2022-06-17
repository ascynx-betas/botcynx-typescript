import { ApplicationCommandType, GuildTextBasedChannel, MessageContextMenuCommandInteraction } from "discord.js";
import { MessageContextCommand } from "../../../structures/Commands";

export default new MessageContextCommand({
  name: "rawData",
  type: ApplicationCommandType.Message,
  category: "other",
  userPermissions: ["ManageMessages"],

  run: async ({ interaction, client }) => {
    (interaction.channel as GuildTextBasedChannel).messages
      .fetch((interaction as MessageContextMenuCommandInteraction).targetId)
      .then(async (message) => {
        try {
          const channel = await interaction.user.createDM(true);

          channel.send({ content: `${JSON.stringify(message.toJSON())}`, allowedMentions: {parse: []} });
        } catch (e) {
          console.log(e);
        }
      });

      (interaction as MessageContextMenuCommandInteraction).followUp({ content: "Done!", ephemeral: true });
  },
});
