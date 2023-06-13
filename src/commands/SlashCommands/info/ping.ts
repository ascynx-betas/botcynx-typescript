import { SlashCommand } from "../../../structures/Commands";

export default new SlashCommand({
  name: "ping",
  description: "replies with pong",
  category: "other",
  run: async ({ interaction, client }) => {
    interaction.followUp({ content: ` ${client.ws.ping}ms!` });
  },
});
