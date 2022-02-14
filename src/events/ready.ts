import { Event } from "../structures/Event";
import { getKeyInfo } from "../personal-modules/hypixel";
import { ticketBlockedName } from "../config";
import chalk from "chalk";

export default new Event("ready", async () => {
  console.log(chalk.blue("----Status----"));
  console.log(chalk.green("Bot is now online"));
  global.bot = {}; //set value of global.bot
  global.bot.maxTimeout = "28 days";
  global.bot.ticketblockedNames = ticketBlockedName;
  if (process.env.mongooseConnectionString) {
    global.bot.mongooseconnectionstring = true;
  }
  if (process.env.developerId) global.bot.developerid = true; //set value of developerId
  if (process.env.environment) global.bot.environment = process.env.environment; //set environment
  if (process.env.guildId && process.env.environment == "dev")
    console.log(chalk.green("commands will be registered locally"));
  if (process.env.hypixelapikey) {
    console.log(chalk.green("api key exists"));
    let data = await getKeyInfo();
    if (data.success === true) global.bot.hypixelapikey = true; //set value of hypixelApiKey to valid
    if (data.success === false) global.bot.hypixelapikey = false; //set value of hypixelApiKey to invalid
  }
  if (process.env.webhookLogLink) global.bot.loglink = true; //set value of LogLink to valid
  if (process.env.githubToken) {
    global.bot.githubtoken = true;
  }
});
