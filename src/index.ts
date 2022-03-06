require("dotenv").config();
import { botClient } from "./structures/botClient";

console.log("entered index file, logging in !");
export const botcynx = new botClient();
botcynx.start();
