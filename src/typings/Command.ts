import {
  ButtonInteraction,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  CommandInteractionOptionResolver,
  ContextMenuCommandInteraction,
  Guild,
  GuildMember,
  Message,
  MessageApplicationCommandData,
  ModalSubmitInteraction,
  PermissionsString,
  AnySelectMenuInteraction,
  UserApplicationCommandData,
} from "discord.js";
import { Request } from "../lib/messageCommandRequest";
import { BotClient } from "../structures/botClient";

export interface botcynxInteraction extends ChatInputCommandInteraction {
  member: GuildMember;
}

/**
 * required values.
 */
type RequireType =
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
export interface baseRunOptions {
  client: BotClient;
}

interface runOptions extends baseRunOptions {
  interaction: botcynxInteraction;
  args: CommandInteractionOptionResolver;
} //SlashCommands

interface updateRunOptions extends baseRunOptions {
  interaction: ButtonInteraction | AnySelectMenuInteraction;
}

interface runContextOptions extends baseRunOptions {
  interaction: ContextMenuCommandInteraction;
  args: CommandInteractionOptionResolver;
} //ContextCommands

interface runOptionsMessage extends baseRunOptions {
  message: Message;
  args: string[];
  request: Request;
} //MessageCommands

interface modalRunOption extends baseRunOptions {
  modal: ModalSubmitInteraction;
}

/**
 * all run functions
 */
type UpdateRunFunction = (options: updateRunOptions) => any;
type RunFunction = (options: runOptions) => any;
type MessageRunFunction = (options: runOptionsMessage) => any;
type ContextRunFunction = (options: runContextOptions) => any;
type ModalRunFunction = (options: modalRunOption) => any;
type RegisterWhitelistedFunction = (options: {
  client: BotClient;
  guild: Guild;
}) => any;

/**
 * all arguments for the environment in which the commands will be executed
 */
export type CommandType = {
  require?: RequireType[];
  userPermissions?: PermissionsString[];
  botPermissions?: PermissionsString[];
  devonly?: boolean;
  invisible?: boolean;
  category?: string;
  cooldown?: number; //seconds
  isModalCommand?: boolean;
  run: RunFunction;
  default_member_permissions?: bigint | string; //bitfield or string
} & ChatInputApplicationCommandData; //SlashCommands

export type CommandSimili = {
  name: string;
}

/**
 * interaction commands that are whitelisted
 */
export type WhitelistedCommands = {
  pack?: string;
  register: RegisterWhitelistedFunction;
} & CommandType &
  ChatInputApplicationCommandData; //Whitelisted Interaction Commands (slash)

export type ModalResponseType = {
  once?: boolean;
  run: ModalRunFunction;
  name: string;
};

export type UserContextType = {
  require?: RequireType[];
  userPermissions?: PermissionsString[];
  botPermissions?: PermissionsString[];
  devonly?: boolean;
  invisible?: boolean;
  category?: string;
  cooldown?: number; //seconds
  run: ContextRunFunction;
  default_member_permissions?: bigint | string; //bitfield or string
} & UserApplicationCommandData; //User Context Commands

export type MessageContextType = {
  require?: RequireType[];
  userPermissions?: PermissionsString[];
  botPermissions?: PermissionsString[];
  devonly?: boolean;
  invisible?: boolean;
  category?: string;
  cooldown?: number; //seconds
  run: ContextRunFunction;
  default_member_permissions?: bigint | string; //bitfield or string
} & MessageApplicationCommandData; //Chat Context Commands

export type MessageCommandType = {
  require?: RequireType[];
  name: string;
  userPermissions?: PermissionsString[];
  botPermissions?: PermissionsString[];
  devonly?: boolean;
  aliases?: String[];
  category?: string;
  cooldown?: number; //seconds
  usage?: string;
  run: MessageRunFunction;
  advancedFlags?: boolean;
}; // MessageCommands

export type ButtonResponseType = {
  require?: RequireType[];
  category: string; //1st field of customId
  customId?: string; //2nd field of customId //if multiple choices for 1st field
  temporary?: boolean;
  onlyAuthor?: boolean;
  cooldown?: number; //seconds
  userPermissions?: PermissionsString[];
  botPermissions?: PermissionsString[];
  run: UpdateRunFunction;
};

/**
 * Cooldowns linked to commands
 */
export class CommandCooldown {
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
