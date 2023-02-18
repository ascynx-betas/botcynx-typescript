import { Event } from "../structures/Event";
import { getKeyInfo } from "../lib/HypixelAPIUtils";
import { ticketBlockedName } from "../config";
import chalk from "chalk";
import { botcynx, finishLoading } from "..";
import { logLevel } from "../lib/Logger";

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
  await finishLoading();
  //sends to log the time it took for the bot to connect to the discord api
  console.timeEnd("Login time");
  //post start data setup
  botcynx.getLogger.log(chalk.blue("----Status----"), logLevel.INFO);
  botcynx.getLogger.log(chalk.green("Bot is now online"), logLevel.INFO);

  postStartData.maxTimeout = "28 days";
  postStartData.ticketblockedNames = ticketBlockedName;

  postStartData.mongooseconnectionstring = process.env.mongooseConnectionString
    ? true
    : false;

  postStartData.developerid = process.env.developerId ? true : false; //whether the developerId exists in env or not

  if (process.env.environment)
    postStartData.environment = process.env.environment; //set environment to process environment value
  process.env.guildId
    ? botcynx.getLogger.log(
        chalk.green("commands will be registered locally"),
        logLevel.INFO
      )
    : botcynx.getLogger.log(
        chalk.red("Commands will be registered globally"),
        logLevel.INFO
      );

  if (process.env.hypixelapikey) {
    botcynx.getLogger.log(chalk.green("api key exists"), logLevel.INFO);
    let data = await getKeyInfo();
    postStartData.hypixelapikey = data.success;
  }

  postStartData.loglink = process.env.webhookLogLink ? true : false;

  postStartData.githubtoken = process.env.githubToken ? true : false;
});
