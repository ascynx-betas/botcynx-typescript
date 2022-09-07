import { Command } from "../../../structures/Commands";

export default new Command({
  name: "ping",
  category: "other",
  usage: `${process.env.botPrefix}ping`,

  run: async ({ message, client, args, request }) => {
      request.send({ content: ` ${client.ws.ping}ms!` });
  },
});
