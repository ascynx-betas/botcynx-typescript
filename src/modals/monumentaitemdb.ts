import { indexOf } from "lodash";
import { itemModel } from "../models/item";
import { modalResponse } from "../structures/Commands";

export default new modalResponse({
  name: "monumenta-add-item",
  once: false,

  run: async ({ modal, client }) => {
    let item = modal.customId.split(":")[1];
    let currentPrice = modal.getTextInputValue("current-price");
    let lore = modal.getTextInputValue("lore");
    let enchantments = modal.getTextInputValue("enchantments");

    const enchantmentArray = enchantments.split(",");
    let enchantmentsArray: { name: string; level: number }[] = [];

    let type: string;
    if (lore.includes("Currency")) type = "currency";
    else if (lore.includes("Material")) type = "material";
    else type = "item";
    let parsedPrice: number;
    let currency: string;
    let priceArray = currentPrice.split(" ");
    //price / currency "creator"
    for (let pricePart of priceArray) {
      if (["hcs", "ccs", "cs"].includes(pricePart.toLowerCase()))
        currency = "R2";
      else if (["hxp", "cxp", "xp"].includes(pricePart.toLowerCase()))
        currency = "R1";
      if (Number.parseInt(pricePart) != null) {
        const value = Number.parseInt(pricePart);
        const index = indexOf(priceArray, pricePart);
        if (value == NaN || !priceArray[index + 1]) continue;

        if (priceArray[index + 1].toLowerCase().startsWith("h"))
          typeof parsedPrice == "undefined"
            ? (parsedPrice = 512 * value)
            : (parsedPrice = parsedPrice + 512 * value);
        else if (
          priceArray[index + 1].toLowerCase().startsWith("c") &&
          priceArray[index + 1].toLowerCase() != "cs"
        )
          typeof parsedPrice == "undefined"
            ? (parsedPrice = 8 * value)
            : (parsedPrice = parsedPrice + 8 * value);
        else
          parsedPrice =
            typeof parsedPrice == "undefined"
              ? (parsedPrice = 1 * value)
              : (parsedPrice = parsedPrice + 1 * value);
      }
    }

    //enchantment "creator"
    for (let enchantment of enchantmentArray) {
      const regex = /[^[0-9]/gi;
      const inversedRegex = /[0-9]/gi;
      console.log(enchantment);
      let a1 = enchantment;
      let a2 = enchantment;

      enchantmentsArray.push({
        name: a2.replace(inversedRegex, ""),
        level:
          Number.parseInt(a1.replace(regex, "")) != NaN
            ? Number.parseInt(a1.replace(regex, ""))
            : 1,
      });
      //set in db as {name: enchantment, level: level};
    }

    let itemObject = {
      displayName: item,
      name: item.toLowerCase,
      lore,
      enchantments: enchantmentsArray,
      currency,
      currentPrice: parsedPrice,
      type,
    };
    console.log(itemObject);
    itemModel.create(itemObject);

    if (!modal.replied) modal.reply("successfully sent item");
  },
});
