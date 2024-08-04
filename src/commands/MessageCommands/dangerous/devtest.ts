import { LogLevel, LoggerFactory } from "../../../lib/Logger";
import { Command } from "../../../structures/Commands";

const DevTestLogger = LoggerFactory.getLogger("DEV");

export default new Command({
  name: "devtest",
  aliases: ["dt", "test"],
  usage: `${process.env.botPrefix}test (any flag)`,
  devonly: true,

  run: ({ request }) => {
    if (request.hasFlag("lo")) {
      let args: string[] = request.getNonFlagArgs();

      let logger = "";
      if (args[0] == "*" || args[0] == "*") {
        logger = "all";
      } else {
        logger = args[0];
      }

      if (logger != "all" && !LoggerFactory.loggerExists(logger)) {
        request.send(`Requested Logger: ${logger} does not exist.`);
        return;
      }

      let level: LogLevel | undefined;
      try { 
        level = LogLevel.fromString(args[1]);
      } catch (e) {
        if (e instanceof RangeError) {
          request.send("Could not find LogLevel: " + args[1]);
          return;
        }
      }

      if (!level) {
        request.send("Unexpected error whilst trying to load LogLevel: " + args[1] + ", please try again later.");
        return;
      }

      if (logger == "all") {
        LoggerFactory.addOverrides(level);
      } else {
        LoggerFactory.getLogger(logger).addModeOverride(level);
      }
      request.send(`${level} will now show up in logs for ${logger} logger${logger == "all" ? "s" : ""}`);
    } else if (request.hasFlag("error")) {
      throw new Error("Dev test");
    } else if (request.hasFlag("logger")) {
      DevTestLogger.info("This is an info");
      DevTestLogger.debug("this is a debug message");
      DevTestLogger.warn("This is a warning");
      DevTestLogger.error(new Error("This is an error"));
      return;
    } else request.send(`found flags: ${request.getFlags()}`);
  },
});
