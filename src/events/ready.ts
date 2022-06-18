import { Event } from "../structures/Event";
import { getKeyInfo } from "../lib/personal-modules/hypixel";
import { ticketBlockedName } from "../config";
import chalk from "chalk";
import { sendInfoWebhook } from "../lib/utils";

type postStartDataType = {
  maxTimeout: string;
  ticketblockedNames: string[];
  mongooseconnectionstring: boolean;
  developerid: boolean;
  environment: string;
  hypixelapikey: boolean;
  loglink: boolean;
  githubtoken: boolean;
};

export let postStartData: postStartDataType = {
  maxTimeout: "",
  ticketblockedNames: [],
  mongooseconnectionstring: false,
  developerid: false,
  environment: "",
  hypixelapikey: false,
  loglink: false,
  githubtoken: false,
};

export default new Event("ready", async () => {
  //post start data setup
  console.log(chalk.blue("----Status----"));
  console.log(chalk.green("Bot is now online"));

  postStartData.maxTimeout = "28 days";
  postStartData.ticketblockedNames = ticketBlockedName;

  postStartData.mongooseconnectionstring = process.env.mongooseConnectionString
    ? true
    : false;

  postStartData.developerid = process.env.developerId ? true : false; //set value of developerId to the value defined in process environment

  if (process.env.environment)
    postStartData.environment = process.env.environment; //set environment to process environment value
  process.env.guildId && process.env.environment == "dev"
    ? console.log(chalk.green("commands will be registered locally"))
    : console.log(chalk.red("Commands will be registered globally"));

  if (process.env.hypixelapikey) {
    console.log(chalk.green("api key exists"));
    let data = await getKeyInfo();
    if (data.success === true) postStartData.hypixelapikey = true;
    if (data.success === false) {
      postStartData.hypixelapikey = false; //set value of hypixelApiKey to invalid
      console.log(chalk.red("invalid api key\nreason: " + data.cause));
      sendInfoWebhook({
        message: `<@${process.env.developerId}>, API key invalid, reason: ${data.cause}`,
      });
    }
  }

  postStartData.loglink = process.env.webhookLogLink ? true : false;

  postStartData.githubtoken = process.env.githubToken ? true : false;
});
