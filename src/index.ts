require('dotenv').config();
import { botClient } from "./structures/botClient";

export const botcynx = new botClient();
botcynx.start();