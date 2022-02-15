import { Command } from "../../../structures/Commands";

export default new Command({
  name: "ping",
  category: "other",
  run: async ({ message, client, args }) => {
    if (message.author.id == process.env.developerId  && args.length > 0) throw Error("beans");
    message.reply({ content: ` ${client.ws.ping}ms!` });
  },
});
