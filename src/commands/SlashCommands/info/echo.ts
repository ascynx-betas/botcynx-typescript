import { ApplicationCommandOptionType, TextChannel } from "discord.js";
import { SlashCommand } from "../../../structures/Commands";

export default new SlashCommand({
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
    const message = interaction.options.get("message")?.value;
    const user = interaction.options.get("target")?.user;
    const channel = interaction.options.get("channel")?.channel;
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
        .send({ content: (message as string), allowedMentions: { parse: [] } })
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
      interaction.followUp({ content: (message as string) });
    }
  },
});
