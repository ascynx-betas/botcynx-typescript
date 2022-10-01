import { LoggerFactory } from "../../../lib/Logger";
import { Command } from "../../../structures/Commands";

const DevTestLogger = LoggerFactory.getLogger("DEV");

export default new Command({
  name: "devtest",
  aliases: ["dt", "test"],
  usage: `${process.env.botPrefix}test (any flag)`,
  devonly: true,

  run: ({ request }) => {
    if (request.hasFlag("error")) {
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
