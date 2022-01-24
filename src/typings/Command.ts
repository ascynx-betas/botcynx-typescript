import { time } from "console";
import {
  ChatInputApplicationCommandData,
  CommandInteraction,
  CommandInteractionOptionResolver,
  ContextMenuInteraction,
  GuildMember,
  Message,
  MessageApplicationCommandData,
  MessageComponentInteraction,
  PermissionString,
  UserApplicationCommandData,
} from "discord.js";
import { botClient } from "../structures/botClient";

/**
 * {
 * name: "String",
 * aliases?: "Array of string"
 * description: "String",
 * userPermissions?: "Array of permissions",
 * botPermissions?: "Array of permissions",
 * devonly?: "boolean"
 * run: async({ botClient, interaction}) => {
 * }
 * }
 */

export interface botcynxInteraction extends CommandInteraction {
  member: GuildMember;
}
export interface contextInteraction extends ContextMenuInteraction {
  member: GuildMember;
  message: Message;
}

export type require =
  | "webhookLogLink"
  | "hypixelApiKey"
  | "ticketBlockedNames"
  | "mongooseConnectionString"
  | "botPrefix";

interface runOptions {
  client: botClient;
  interaction: botcynxInteraction;
  args: CommandInteractionOptionResolver;
} //SlashCommands
interface updateRunOptions {
  client: botClient;
  interaction: MessageComponentInteraction;
}

interface runContextOptions {
  client: botClient;
  interaction: contextInteraction;
  args: CommandInteractionOptionResolver;
} //ContextCommands

interface runOptionsMessage {
  client: botClient;
  message: Message;
  args: any;
} //MessageCommands

type updateRunFunction = (options: updateRunOptions) => any;
type RunFunction = (options: runOptions) => any;
type MessageRunFunction = (options: runOptionsMessage) => any;
type ContextRunFunction = (options: runContextOptions) => any;

export type CommandType = {
  require?: require[];
  userPermissions?: PermissionString[];
  botPermissions?: PermissionString[];
  devonly?: boolean;
  invisible?: boolean;
  category?: string;
  cooldown?: number; //seconds
  run: RunFunction;
} & ChatInputApplicationCommandData; //SlashCommands

export type WhitelistedCommands = {
  pack?: string;
} & CommandType & ChatInputApplicationCommandData //Whitelisted Interaction Commands (slash)

export type UserContextType = {
  require?: require[];
  userPermissions?: PermissionString[];
  botPermissions?: PermissionString[];
  devonly?: boolean;
  invisible?: boolean;
  category?: string;
  cooldown?: number; //seconds
  run: ContextRunFunction;
} & UserApplicationCommandData; //User Context Commands
export type MessageContextType = {
  require?: require[];
  userPermissions?: PermissionString[];
  botPermissions?: PermissionString[];
  devonly?: boolean;
  invisible?: boolean;
  category?: string;
  cooldown?: number; //seconds
  run: ContextRunFunction;
} & MessageApplicationCommandData; //Chat Context Commands

export type MessageCommandType = {
  require?: require[];
  name: string;
  userPermissions?: PermissionString[];
  botPermissions?: PermissionString[];
  devonly?: boolean;
  aliases?: String[];
  category?: string;
  cooldown?: number; //seconds
  run: MessageRunFunction;
}; // MessageCommands

export type ButtonResponseType = {
  require?: require[];
  category: string; //1st field of customId
  customId?: string; //2nd field of customId //if multiple choices for 1st field
  temporary?: boolean;
  onlyAuthor?: boolean;
  cooldown?: number; //seconds
  userPermissions?: PermissionString[];
  botPermissions?: PermissionString[];
  run: updateRunFunction;
};

export class commandCooldown {
  command: string;
  user: string;
  timestamp: number;
  constructor(userId: string, time: number, commandName: string) {
    this.command = commandName;
    this.user = userId;
    this.timestamp = Date.now() + time;
  }

  reset() {
    this.timestamp = Date.now();
  }
  toInfinite() {
    this.timestamp = 0;
  }
  toSpecifiedTime(time: number) {
    this.timestamp = time;
  }
  changeCommand(commandName: string) {
    this.command = commandName;
  }
  time() {
    return new Date(this.timestamp);
  }
}
