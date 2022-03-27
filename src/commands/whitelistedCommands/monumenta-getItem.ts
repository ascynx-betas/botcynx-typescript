import { MessageEmbed } from "discord.js";
import { itemModel } from "../../models/item";
import { WhitelistedCommand } from "../../structures/Commands";

export default new WhitelistedCommand({
  name: "getitem",
  description: "get the stats / how to get an item in monumenta",
  options: [
    {
      name: "item-name",
      description: "the name of the item",
      required: true,
      type: "STRING",
    },
  ],

  run: async ({ client, interaction, args }) => {
    const itemName = args.getString("item-name");
    const item = await itemModel.findOne({
      name: itemName.toLowerCase(),
    });
  },
  register: ({ client, guild }) => {
    guild.commands.create(client.whitelistedCommands.get("getitem"));
  },
});
