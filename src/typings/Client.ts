export interface RegisterCommandsOptions {
  guildId?: string;
  commands: any; //ApplicationCommandDataResolvable[] | MessageApplicationCommandData[] | UserApplicationCommandData[]//;
}

export interface registerModulesOptions {
  path: string;
  callback: Function;
  type: string;
}
export type snowflake = "USER" | "CHANNEL" | "ROLE" | "TIMESTAMP" | "GUILD";
