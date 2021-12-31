import { ApplicationCommandDataResolvable, MessageApplicationCommandData, UserApplicationCommandData } from "discord.js";

export interface RegisterCommandsOptions {
    guildId?: string;
    commands: any;//ApplicationCommandDataResolvable[] | MessageApplicationCommandData[] | UserApplicationCommandData[]//;
}
export type snowflake = "USER" |
"CHANNEL" |
"ROLE" |
"TIMESTAMP" |
"GUILD"