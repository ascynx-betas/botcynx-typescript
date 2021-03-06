import { ApplicationCommandOptionType, TextChannel } from "discord.js";
import { slashCommand } from "../../../structures/Commands";

export default new slashCommand({
  name: "echo",
  description: "allows the person to send a message via the bot",
  userPermissions: ["ManageMessages"],
  category: "moderation",
  options: [
    {
      name: "message",
      description: "the message you want to send",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "channel",
      description: "in what channel you want to send it",
      type: ApplicationCommandOptionType.Channel,
      required: false,
    },
    {
      name: "target",
      description: "to who you want to send it",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],

  run: async ({ client, interaction }) => {
    const message = interaction.options.getString("message");
    const user = interaction.options.getUser("target");
    const channel = interaction.options.getChannel("channel");
    if (user) {
      user
        .send({
          content: `${interaction.user.tag} wanted to tell you: ` + message,
        })
        .then(() => {
          interaction
            .followUp({ content: `sent message '${message}' to ${user.tag}` })
            .catch(() => null);
        })
        .catch(() => interaction.followUp("Cannot send DM to specified user"));
    } else if (channel) {
      (channel as TextChannel)
        .send({ content: message, allowedMentions: { parse: [] } })
        .then(() => {
          interaction
            .followUp({ content: `sent message in ${channel}` })
            .catch(() => null);
        })
        .catch(() =>
          interaction.editReply(
            "I don't have permission to send a message in the specified channel"
          )
        );
    } else {
      interaction.followUp({ content: message });
    }
  },
});
