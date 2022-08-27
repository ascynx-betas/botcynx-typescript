import { Command } from "../../../structures/Commands";

export default new Command({
  name: "ping",
  category: "other",
  usage: `${process.env.botPrefix}ping`,
  run: async ({ message, client, args, request }) => {
    if (message.author.id == process.env.developerId && args.length > 0)
      throw Error("beans");
      request.send({ content: ` ${client.ws.ping}ms!` });
  },
});
