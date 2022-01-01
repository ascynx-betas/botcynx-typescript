import { ChatInputApplicationCommandData, CommandInteraction, CommandInteractionOptionResolver, ContextMenuInteraction, GuildMember, Message, MessageApplicationCommandData, MessageContextMenuInteraction, UserApplicationCommandData, UserContextMenuInteraction } from "discord.js";
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

export type permissionResolvable = 
"CREATE_INSTANT_INVITE" |
"KICK_MEMBERS" |
"BAN_MEMBERS" |
"ADMINISTRATOR" |
"MANAGE_CHANNELS" |
"MANAGE_GUILD" |
"ADD_REACTIONS" |
"VIEW_AUDIT_LOG" |
"PRIORITY_SPEAKER" |
"STREAM" |
"VIEW_CHANNEL" |
"SEND_MESSAGES" |
"SEND_TTS_MESSAGES" |
"MANAGE_MESSAGES" |
"EMBED_LINKS" |
"ATTACH_FILES" |
"READ_MESSAGE_HISTORY" |
"MENTION_EVERYONE" |
"USE_EXTERNAL_EMOJIS" |
"VIEW_GUILD_INSIGHTS" |
"CONNECT" |
"SPEAK" |
"MUTE_MEMBERS" |
"DEAFEN_MEMBERS" |
"MOVE_MEMBERS" |
"USE_VAD" |
"CHANGE_NICKNAME" |
"MANAGE_NICKNAMES" |
"MANAGE_ROLES" |
"MANAGE_WEBHOOKS" |
"MANAGE_EMOJIS_AND_STICKERS" |
"USE_APPLICATION_COMMANDS" |
"REQUEST_TO_SPEAK" |
"MANAGE_THREADS" |
"USE_PUBLIC_THREADS" |
"USE_PRIVATE_THREADS" |
"USE_EXTERNAL_STICKERS" |
"SEND_MESSAGES_IN_THREADS" |
"START_EMBEDDED_ACTIVITIES" |
"MODERATE_MEMBERS";


export type CommandType = {
    require?: require[];
    userPermissions?: permissionResolvable[];
    botPermissions?: permissionResolvable[];
    devonly?: boolean;
    invisible?: boolean;
    run: RunFunction;
} & ChatInputApplicationCommandData //SlashCommands

export type UserContextType = {
    require?: require[];
    userPermissions?: permissionResolvable[];
    botPermissions?: permissionResolvable[];
    devonly?: boolean;
    invisible?: boolean;
    run: ContextRunFunction;
}   & UserApplicationCommandData //User Context Commands
export type MessageContextType = {
    require?: require[];
    userPermissions?: permissionResolvable[];
    botPermissions?: permissionResolvable[];
    devonly?: boolean;
    invisible?: boolean;
    run: ContextRunFunction;
} & MessageApplicationCommandData //Chat Context Commands

export type MessageCommandType = {
    require?: require[];
    name: string;
    userPermissions?: permissionResolvable[];
    botPermissions?: permissionResolvable[];
    devonly?: boolean;
    aliases?: String[];
    run: MessageRunFunction;
}; // MessageCommands