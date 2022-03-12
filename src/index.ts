require("dotenv").config();
import { Modal } from "discord-modals";
const discordjsModals = require("discord-modals");
import { botClient } from "./structures/botClient";

console.log("entered index file, logging in !");
export const botcynx = new botClient();
botcynx.start();
discordjsModals(botcynx);

Modal
