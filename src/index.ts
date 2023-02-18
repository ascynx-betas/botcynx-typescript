require("dotenv").config();
import { HypixelAPI, LoadAllCaches } from "./lib";
import { LocalizationHandler } from "./lib/Lang";
import { LoggerFactory, logLevel, postLoadingLogs } from "./lib/Logger";
import { FlagHandler, RequestHandler } from "./lib/messageCommandRequest";
import { BotClient } from "./structures/botClient";

export const botcynx = BotClient.getInstance();

export const localeHandler = LocalizationHandler.getInstance().load();
export const messageRequestHandler = RequestHandler.getInstance();

export let finishedLoading = false;
export let showDiscordAPIErrors = false;

const parseBool = (bool: string) => {
  return bool == "true" ? true : bool == "false" ? false : undefined;
}

function main(args: string[]) {
  botcynx.getLogger.debug("Entered index file, logging in!");

  if (args.length > 0) {
    let flags = FlagHandler.getFlags(args.join(" "));

    if (flags.get("setEnv")) {
      let setEnvIndex = flags.get("setEnv").index;
      let env = args[setEnvIndex + 1];
      if (["prod", "dev", "debug"].includes(env)) {
        process.env.environment = env as "prod" | "dev" | "debug";
      }

      botcynx.getLogger.info("Set environment to " + env);
    }

    if (flags.get("renderTime")) {
      let index = flags.get("renderTime").index;
      let bool = args[index + 1];
      let renderTime = parseBool(bool);
      if (renderTime == undefined)
        throw new Error("Cannot set renderTime to " + bool);
      LoggerFactory.shouldRenderTime = renderTime;

      botcynx.getLogger.info(
        renderTime ? "Logs will show time" : "Logs will not show time"
      );
    }

    if (flags.get("showCallStack")) {
      let index = flags.get("showCallStack").index;
      let bool = args[index + 1];
      let showCallStack = parseBool(bool);
      if (showCallStack == undefined) throw new Error("Cannot set showCallStack to " + bool);
      LoggerFactory.shouldShowCallStack = showCallStack;

      botcynx.getLogger.info(
        showCallStack ? "Error logs will show the callstack" : "Error logs won't show the callstack"
      )
    }

    if (flags.get("showDiscordAPIErrors")) {
      let index = flags.get("showDiscordAPIErrors").index;
      let bool = args[index + 1];
      let showDiscordErrors = parseBool(bool);

      if (showDiscordErrors == undefined) throw new Error("Cannot set showDiscordAPIErrors to " + bool);
      showDiscordAPIErrors = showDiscordErrors;

      botcynx.getLogger.info(
        showDiscordErrors ? "Discord Errors will show up in console" : "Discord Errors won't show up in console"
      );
    }
  }

  console.time("Login time");
  botcynx.start();
  listenDebugAPI();
}

function listenDebugAPI() {
  HypixelAPI.INSTANCE.on("reset", (data) => {
    if (!botcynx.isDebug) return;
    console.log(data);
  });

  HypixelAPI.INSTANCE.on("invalidAPIKey", async () => {
    console.log("Hypixel api key is currently invalid");
    if (process.env.developerId && process.env.hypixelapikey) {
      //only send if the developer and the key were defined
      let dmChannel = botcynx.users.cache.get(process.env.developerId).dmChannel;
      if (dmChannel) {
        //the dm channel exists
        await dmChannel.send("The provided api key is currently invalid, please fix this issue.");
      } else {
        dmChannel = await botcynx.users.cache.get(process.env.developerId).createDM();
        dmChannel.send("The provided api key is currently invalid, please fix this issue.");
      }
    }
  });
}

export const finishLoading = async () => {
  finishedLoading = true;
  botcynx.getLogger.log("Finished Loading", logLevel.DEBUG, true);
  botcynx.emit("finishedLoading");
  postLoadingLogs();
  LoadAllCaches();
}

main(process.argv.slice(2));