require("dotenv").config();
import { botClient } from "./structures/botClient";

export const botcynx = botClient.getInstance();

function main(args: string[]) {
  if (args.length > 0 && ["prod", "dev", "debug"].includes(args[0]))
    process.env.environment = args[0] as "prod" | "dev" | "debug"; //override setting environment

  console.time("Login time");
  console.log("entered index file, logging in !");
  botcynx.start();
  console.timeEnd("Login time");
}

main(process.argv.slice(2));
