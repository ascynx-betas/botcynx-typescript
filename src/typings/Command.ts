import { ChatInputApplicationCommandData, CommandInteraction, CommandInteractionOptionResolver, ContextMenuInteraction, GuildMember, Message, MessageApplicationCommandData, MessageContextMenuInteraction, PermissionString, UserApplicationCommandData, UserContextMenuInteraction } from "discord.js";
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

export type require = "webhookLogLink" |
"hypixelApiKey" |
"ticketBlockedNames" |
"mongooseConnectionString" |
"botPrefix"

interface runOptions {
    client: botClient,
    interaction: botcynxInteraction,
    args: CommandInteractionOptionResolver
} //SlashCommands

interface runContextOptions {
    client: botClient,
    interaction: contextInteraction,
    args: CommandInteractionOptionResolver
}//ContextCommands


interface runOptionsMessage {
    client: botClient,
    message: Message,
    args: any,
} //MessageCommands

type RunFunction = (options: runOptions) => any;
type MessageRunFunction = (options: runOptionsMessage) => any;
type ContextRunFunction = (options: runContextOptions) => any;


export type CommandType = {
    require?: require[];
    userPermissions?: PermissionString[];
    botPermissions?: PermissionString[];
    devonly?: boolean;
    invisible?: boolean;
    run: RunFunction;
} & ChatInputApplicationCommandData //SlashCommands

export type UserContextType = {
    require?: require[];
    userPermissions?: PermissionString[];
    botPermissions?: PermissionString[];
    devonly?: boolean;
    invisible?: boolean;
    run: ContextRunFunction;
}   & UserApplicationCommandData //User Context Commands
export type MessageContextType = {
    require?: require[];
    userPermissions?: PermissionString[];
    botPermissions?: PermissionString[];
    devonly?: boolean;
    invisible?: boolean;
    run: ContextRunFunction;
} & MessageApplicationCommandData //Chat Context Commands

export type MessageCommandType = {
    require?: require[];
    name: string;
    userPermissions?: PermissionString[];
    botPermissions?: PermissionString[];
    devonly?: boolean;
    aliases?: String[];
    run: MessageRunFunction;
}; // MessageCommands