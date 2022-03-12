import { MessageEmbed } from "discord.js";
import { itemList, itemType } from "../../lib/monumenta";
import { WhitelistedCommand } from "../../structures/Commands";

export default new WhitelistedCommand({
    name: "getItem",
    description: "get the stats / how to get an item in monumenta",
    options: [
        {
            name: "item-name",
            description: "the name of the item",
            required: true,
            type: "STRING"
        }
    ],

    run: async({client, interaction, args}) => {
        const itemName = args.getString("item-name");


        if (!Object.keys(itemList).includes(itemName)) interaction.followUp({content: "I cannot find that item in the item list"});
        const item: itemType = itemList[itemName]; //create itemList;

        let itemAttributes: string;
        let enchantmentsString: string;
        Object.keys(item.Attributes).forEach((element) => {
            let itemAttributeString: string = element;
            itemAttributeString = itemAttributeString + item.Attributes[element].join(",\n");

            itemAttributes = itemAttributes + "\n" + itemAttributeString;

        });

        Object.keys(item.enchantments).forEach((enchantment) => {
            let enchantString;

            enchantString = enchantString + "\n" + item.enchantments[enchantment].level + enchantment;

            enchantmentsString = enchantmentsString + "\n" + enchantString;

        });

        

        let embed = new MessageEmbed()
            .setTitle(itemName)
            .addField("Attributes", itemAttributes, true)
        
    }
})