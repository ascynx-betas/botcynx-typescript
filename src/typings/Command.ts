import { ModalSubmitInteraction } from "discord-modals";
import {
  ChatInputApplicationCommandData,
  CommandInteraction,
  CommandInteractionOptionResolver,
  ContextMenuInteraction,
  Guild,
  GuildMember,
  Message,
  MessageApplicationCommandData,
  MessageComponentInteraction,
  PermissionString,
  UserApplicationCommandData,
} from "discord.js";
import { botClient } from "../structures/botClient";

export interface botcynxInteraction extends CommandInteraction {
  member: GuildMember;
}
export interface contextInteraction extends ContextMenuInteraction {
  member: GuildMember;
  message: Message;
}

/**
 * required values.
 */
export type require =
  | "webhookLogLink"
  | "hypixelApiKey"
  | "ticketBlockedNames"
  | "mongooseConnectionString"
  | "botPrefix";

/**
 * client - the client that will run this interaction
 * interaction - the informations linked to this interaction
 * args - the interaction options
 */
interface baseRunOptions {
  client: botClient;
}

interface runOptions extends baseRunOptions {
  interaction: botcynxInteraction;
  args: CommandInteractionOptionResolver;
} //SlashCommands

interface updateRunOptions extends baseRunOptions {
  interaction: MessageComponentInteraction;
}

interface runContextOptions extends baseRunOptions {
  interaction: contextInteraction;
  args: CommandInteractionOptionResolver;
} //ContextCommands

interface runOptionsMessage extends baseRunOptions {
  message: Message;
  args: any;
} //MessageCommands

interface modalRunOption extends baseRunOptions {
  modal: ModalSubmitInteraction;
}

/**
 * all run functions
 */
type updateRunFunction = (options: updateRunOptions) => any;
type RunFunction = (options: runOptions) => any;
type MessageRunFunction = (options: runOptionsMessage) => any;
type ContextRunFunction = (options: runContextOptions) => any;
type modalRunFunction = (options: modalRunOption) => any;
type RegisterWhitelistedFunction = (options: {
  client: botClient;
  guild: Guild;
}) => any;

/**
 * all arguments for the environment in which the commands will be executed
 */
export type CommandType = {
  require?: require[];
  userPermissions?: PermissionString[];
  botPermissions?: PermissionString[];
  devonly?: boolean;
  invisible?: boolean;
  category?: string;
  cooldown?: number; //seconds
  isModalCommand?: boolean;
  run: RunFunction;
} & ChatInputApplicationCommandData; //SlashCommands

/**
 * interaction commands that are whitelisted
 */
export type WhitelistedCommands = {
  pack?: string;
  register: RegisterWhitelistedFunction;
} & CommandType &
  ChatInputApplicationCommandData; //Whitelisted Interaction Commands (slash)

export type modalResponseType = {
  once?: boolean;
  run: modalRunFunction;
  name: string;
};

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

/**
 * Cooldowns linked to commands
 */
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
