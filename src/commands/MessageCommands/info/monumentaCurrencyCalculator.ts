import { Command } from "../../../structures/Commands";

export default new Command({
  name: "trade",
  aliases: ["t"],
  usage: `${process.env.botPrefix}trade [price per item|region(R1|R2)] [price per item|number of items] ([number of items] | <H | HXP | HCS to make the price be in Hyper compressed>)`,

  run: async ({ message, client, args, request }) => {
    let isShifted = false;
    if (!["R1", "R2"].includes(args[0])) isShifted = true;

    let pricePerItem = Number.parseFloat(!isShifted ? args[1] : args[0]); //could create an error
    if (isNaN(pricePerItem))
      return request.send({
        content: `please enter a number as the ${!isShifted ? "second" : "first"} argument (you can use a decimal)`,
      });

    let itemNumber = Number.parseInt(!isShifted ? args[2] : args[1]);
    if (isNaN(itemNumber))
      return request.send({
        content: `please enter a number as the ${!isShifted ? "third" : "second"} argument`,
      });
    if (["HCS", "HXP", "H"].includes(!isShifted ? args[3] : args[2]))
      pricePerItem = pricePerItem * 64;
    const Hypervalue = Math.floor((itemNumber * pricePerItem) / 64);

    const Compressedvalue = (itemNumber * pricePerItem) % 64;

    request.send({
      content: `region: ${
        !isShifted ? args[0] : "R1"
      },\nPrice per unit: ${pricePerItem}${
        ["HCS", "HXP", "H"].includes(!isShifted ? args[3] : args[2])
          ? ` (${!isShifted ? args[1] : args[0]}${
              !isShifted ? (args[0] == "R1" ? "HXP" : "HCS") : "HXP"
            })`
          : ""
      }, units: ${itemNumber}\nTo Pay: ${Hypervalue}${
        !isShifted ? (args[0] == "R1" ? "HXP" : "HCS") : "HXP"
      } ${Compressedvalue}${
        !isShifted ? (args[0] == "R1" ? "CXP" : "CCS") : "CXP"
      }`,
      allowedMentions: { parse: [], repliedUser: true },
    });

    //example of arguments
    //b!trade [Region or price] [price or itemNumber] [itemNumber or H] [H or nothing]
  },
});
