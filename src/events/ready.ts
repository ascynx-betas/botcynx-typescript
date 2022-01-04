import { Event } from "../structures/Event";
import { getKeyInfo } from "../personal-modules/hypixel";
import { ticketBlockedName } from "../config";

export default new Event("ready", async () => {
  console.log("----Status----");
  console.log("Bot is now online");
  global.bot = {}; //set value of global.bot
  global.bot.maxTimeout = "28 days";
  global.bot.ticketBlockedNames = ticketBlockedName;
  if (process.env.mongooseConnectionString) {
    global.bot.mongooseConnectionString = true;
  }
  if (process.env.developerId) global.bot.developerid = true; //set value of developerId
  if (process.env.environment) global.bot.environment = process.env.environment; //set environment
  if (process.env.guildId) console.log("commands will be registered locally");
  if (process.env.hypixelapikey) {
    console.log("api key exists");
    let data = await getKeyInfo();
    if (data.success === true) global.bot.hypixelapikey = true; //set value of hypixelApiKey to valid
    if (data.success === false) global.bot.hypixelapikey = false; //set value of hypixelApiKey to invalid
  }
  if (process.env.webhookLogLink) global.bot.LogLink = true; //set value of LogLink to valid
});
