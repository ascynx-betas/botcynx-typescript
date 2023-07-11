export interface RegisterCommandsOptions {
  guildId?: string;
  commands: any; //ApplicationCommandDataResolvable[] | MessageApplicationCommandData[] | UserApplicationCommandData[]//;
}

export interface registerModulesOptions {
  path: string;
  callback: Function;
  type: ModuleType;
}
export type ModuleType = "command" | "modal" | "button";

export type snowflake = "USER" | "CHANNEL" | "ROLE" | "TIMESTAMP" | "GUILD";

export interface tagTableElement {
  guild: string;
  tag: string;
  status: ("UNKNOWN" | "EDITED" | "CREATED" | "EQUAL" | "ERRORED");
  note?: string;
}