require("dotenv").config();
import { LocalizationHandler } from "./lib/Lang";
import { botClient } from "./structures/botClient";

export const botcynx = botClient.getInstance();

export const localeHandler = LocalizationHandler.getInstance().load();

function main(args: string[]) {
  if (args.length > 0 && ["prod", "dev", "debug"].includes(args[0]))
    process.env.environment = args[0] as "prod" | "dev" | "debug"; //override setting environment
  if (botcynx.isDebug()) console.log("entered index file, logging in !");
  console.time("Login time");
  botcynx.start();
}

main(process.argv.slice(2));
