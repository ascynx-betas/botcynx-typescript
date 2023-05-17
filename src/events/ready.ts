import { Event } from "../structures/Event";
import { getKeyInfo } from "../lib/HypixelAPIUtils";
import { ticketBlockedName } from "../config";
import chalk from "chalk";
import { botcynx, runPostLoadingEvents } from "..";
import { LogLevel } from "../lib/Logger";

type PostStartDataType = {
  maxTimeout: string;
  ticketblockedNames: string[];
  mongooseconnectionstring: boolean;
  developerid: boolean;
  environment: string;
  hypixelapikey: boolean;
  loglink: boolean;
  githubtoken: boolean;
};

export let postStartData: PostStartDataType = {
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
  await runPostLoadingEvents();
  //sends to log the time it took for the bot to connect to the discord api
  console.timeEnd("Login time");
  //post start data setup
  botcynx.getLogger.log(chalk.blue("----Status----"), LogLevel.INFO);
  botcynx.getLogger.log(chalk.green("Bot is now online"), LogLevel.INFO);

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
        LogLevel.INFO
      )
    : botcynx.getLogger.log(
        chalk.red("Commands will be registered globally"),
        LogLevel.INFO
      );

  if (process.env.hypixelapikey) {
    botcynx.getLogger.log(chalk.green("api key exists"), LogLevel.INFO);
    let data = await getKeyInfo();
    postStartData.hypixelapikey = data.success;
  }

  postStartData.loglink = process.env.webhookLogLink ? true : false;

  postStartData.githubtoken = process.env.githubToken ? true : false;
});
