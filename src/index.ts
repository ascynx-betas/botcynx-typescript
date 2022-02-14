require("dotenv").config();
import { botClient } from "./structures/botClient";

console.log("test")
export const botcynx = new botClient();
botcynx.start();
