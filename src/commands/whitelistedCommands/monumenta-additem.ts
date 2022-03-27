import { Modal, showModal, TextInputComponent } from "discord-modals";
import { itemModel } from "../../models/item";
import { WhitelistedCommand } from "../../structures/Commands";

export default new WhitelistedCommand({
  name: "additem",
  description: "add a monumenta item into the database",
  isModalCommand: true,
  options: [
    {
      name: "add",
      type: "SUB_COMMAND",
      description: "add an item",
      options: [
        {
          name: "item-name",
          type: "STRING",
          required: true,
          description: "the name of the item",
        },
      ],
    },
    {
      name: "modify",
      type: "SUB_COMMAND",
      description: "modify an existing item",
      options: [
        {
          name: "item-name",
          type: "STRING",
          required: true,
          description: "the name of the item",
        },
      ],
    },
  ],

  run: async ({ interaction, client, args }) => {
    const subcommand = args.getSubcommand(true);
    let item = args.getString("item-name");

    const dbItem = await itemModel.findOne({ name: item.toLowerCase() });

    if (subcommand == "add" && dbItem)
      return interaction.reply({
        content: `item already exists, if you want to modify it, please use the modify subcommand`,
      });

    let modal: Modal;

    if (subcommand == "add") {
      modal = new Modal()
        .addComponents(
          new TextInputComponent()
            .setCustomId("enchantments")
            .setLabel('Set enchantments, limit each by a ","')
            .setRequired(false)
            .setStyle("LONG")
        )
        .addComponents(
          new TextInputComponent()
            .setCustomId("lore")
            .setLabel("set the item lore, to change line use \\n")
            .setRequired(false)
            .setStyle("LONG")
        )
        .addComponents(
          new TextInputComponent()
            .setCustomId("current-price")
            .setLabel("set the current item value")
            .setRequired(false)
            .setStyle("SHORT")
        )
        .setCustomId("monumenta-add-item:" + item)
        .setTitle("add item " + item);
    } else if (subcommand == "modify") {
      const itemFromDB = dbItem;
      let dbEnchantments = itemFromDB.enchantments;
      let enchantments = [];

      for (let enchantment in dbEnchantments) {
        let enchantValue = dbEnchantments[enchantment];

        const enchant = enchantValue.name + " " + enchantValue.level;

        enchantments.push(enchant);
      }

      let price: string;
      let interValue: number = itemFromDB.currentPrice;
      let priceInfos: { a: number; b: number; c: number } = {a: null, b: null, c: null}; //a (xp, cs) b (cxp, ccs) c (hcs, hxp)
      
      let {increments, rest} = incrementor(512, interValue);
      interValue = rest;
      priceInfos.c = increments;
      ({increments, rest} = incrementor(8, interValue));
      interValue = rest;
      priceInfos.b = increments;
      ({increments, rest} = incrementor(1, interValue));
      priceInfos.a = increments;

      
      price = priceBuilder(priceInfos.c, priceInfos.b, priceInfos.a, itemFromDB.currency);

      modal = new Modal()
        .addComponents(
          new TextInputComponent()
            .setCustomId("enchantments")
            .setLabel(
              'Set enchantments, limit each by a ","'
            )
            .setRequired(false)
            .setPlaceholder(enchantments.join(",").length > 100 ? "PLACEHOLDER TOO LONG" : enchantments.join(","))
            .setStyle("LONG")
        )
        .addComponents(
          new TextInputComponent()
            .setCustomId("lore")
            .setLabel("set the item lore, to change line use \\n")
            .setRequired(false)
            .setPlaceholder(itemFromDB.lore.length > 100 ? "PLACEHOLDER TOO LONG": itemFromDB.lore)
            .setStyle("LONG")
        )
        .addComponents(
          new TextInputComponent()
            .setCustomId("current-price")
            .setLabel("set the current item value")
            .setRequired(false)
            .setPlaceholder(price)
            .setStyle("SHORT")
        )
        .setCustomId("monumenta-add-item:" + item)
        .setTitle("modify item: " + item);
    }

    if (!interaction.replied) showModal(modal, { client, interaction });
  },
  register: ({ client, guild }) => {
    guild.commands.create(client.whitelistedCommands.get("additem"));
  },
});

const incrementor = (increments: number, value: number) => {
const stuff = value / increments;

const rest = stuff - Math.floor(stuff);
const increment = Math.floor(stuff); 

return {increments: increment, rest: rest};
}

const priceBuilder = (H: number, C: number, base: number, region: string): string => {
 
 const currency = currencyDictionary[region];

let priceString = base != 0 ? base + " " + currency.base : "";
    priceString = C != 0 ? priceString + C + " " + currency.C : priceString + "";
    priceString = H != 0 ? priceString + H + " " + currency.H : priceString + "";


return priceString;
}

const currencyDictionary = {
  "R1": {H: "HXP", C: "CXP", base: "XP"},
  "R2": {H: "HCS", C: "CCS", base: "CS"}
};
