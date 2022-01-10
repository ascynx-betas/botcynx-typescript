require("dotenv").config();
import { Octokit } from "@octokit/core";
import { botClient } from "./structures/botClient";

export const octokit = new Octokit({ auth: process.env.githubToken });
export const botcynx = new botClient();
botcynx.start();
