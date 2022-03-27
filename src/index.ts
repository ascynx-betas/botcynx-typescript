require("dotenv").config();
const discordjsModals = require("discord-modals");
import { botClient } from "./structures/botClient";

console.time();
console.log("entered index file, logging in !");
export const botcynx = botClient.getInstance();
botcynx.start();
discordjsModals(botcynx);
console.timeEnd();
