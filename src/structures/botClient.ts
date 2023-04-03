import { Client, ClientEvents, Collection, Partials } from "discord.js";
import * as fs from "fs";
import {
  CommandType,
  UserContextType,
  MessageCommandType,
  MessageContextType,
  ButtonResponseType,
  CommandCooldown,
  WhitelistedCommands,
  ModalResponseType,
} from "../typings/Command";
import glob from "glob";
import { promisify } from "util";
import {
  RegisterCommandsOptions,
  registerModulesOptions,
} from "../typings/Client";
import { Event } from "./Event";
import { connect } from "mongoose";
import { tagModel } from "../models/tag";
import { reload } from "../lib";
import chalk from "chalk";
import { registerCooldownTask } from "../lib/Tasks/cooldownReset";
import { registerGistReload } from "../lib/Tasks/gistLoadFail";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { configModel } from "../models/config";
import { LoggerFactory, logLevel } from "../lib";
import { botcynx } from "..";
import { clearCache } from "../lib/Tasks/slashInteractionReset";
import {HypixelAPI} from "../lib";
import { RepositoryCacheHandler } from "../lib/cache/repoCache";

const globPromise = promisify(glob);

export class BotClient extends Client {
  //dynamic Collections
  slashCommands: Collection<string, CommandType> = new Collection();
  userContextCommands: Collection<string, UserContextType> = new Collection();
  messageContextCommands: Collection<string, MessageContextType> =
    new Collection();
  commands: Collection<string, MessageCommandType> = new Collection();
  ArrayOfSlashCommands = new Collection();
  buttonCommands: Collection<string, ButtonResponseType> = new Collection();
  whitelistedCommands: Collection<string, WhitelistedCommands> =
    new Collection();
  cooldowns: Collection<string, CommandCooldown> = new Collection();
  tasks: Collection<string, NodeJS.Timer> = new Collection();
  modals: Collection<string, ModalResponseType> = new Collection();

  //static values
  private static instance: BotClient;
  package: any = JSON.parse(fs.readFileSync("package.json", "utf-8"));
  public readonly userAgent = `${this.package.name}/${this.version}${process.env.environment == "dev" ? "-dev" : ""}`;

  private get version() {
    return this.package.version;
  }

  private logger = LoggerFactory.getLogger("CLIENT");

  get getLogger() {
    return this.logger;
  }

  private get debug(): boolean {
    return process.env.environment === "debug";
  }

  public isDev(): boolean {
    return process.env.environment === "dev";
  }

  private constructor() {
    super({ intents: 65535, partials: [Partials.Channel, Partials.Message] });
  }

  static getInstance(): BotClient {
    if (!BotClient.instance) BotClient.instance = new BotClient();
    return BotClient.instance;
  }

  getUserAgent(): string {
    return this.userAgent;
  }

  start() {
    if (process.env.mongooseConnectionString) {
      this.logger.log("connecting to mongoose", logLevel.DEBUG);
      connect(process.env.mongooseConnectionString);
    }

    this.registerModules();
    this.login(process.env.botToken).then(() =>
      this.logger.log(chalk.green(`successfully logged in`), logLevel.INFO)
    );
  }

  async importFile(filePath: string) {
    return (await import(filePath))?.default;
  }

  public isDebug(): boolean {
    return this.debug;
  }

  private registerTable: { type: string; name: string; registered: boolean }[] =
    [];

  async registerModule(options: registerModulesOptions) {
    const data = await this.importFile(options.path);
    let name = "";
    let type = options.type;

    if (options.type == "command") {
      if (!data.name) return;
      name = data.name;
    } else if (options.type == "modal") {
      if (!data.name || !data.run) return;
      name = data.name;
    } else if (options.type == "button") {
      if (!data.category) return;
      name = data.customId
        ? data.category + ":" + data.customId
        : data.category;
    }

    try {
      options.callback(data);
      this.registerTable.push({ type, name, registered: true });
    } catch (e) {
      console.log(e);
      this.registerTable.push({ type, name, registered: false });
    }
  }

  async registerModules() {
    //Context Commands
    //User
    const userContextFiles = await globPromise(
      `${__dirname}/../commands/ContextCommands/user/*{.ts,.js}`
    );

    userContextFiles.forEach(async (filePath) => {
      this.registerModule({
        path: filePath,
        callback: function (data: UserContextType) {
          if (data?.userPermissions) {
            //setup permissions
            data.default_member_permissions = BigInt(0);
            data?.userPermissions.forEach((permission) => {
              (data.default_member_permissions as bigint) |= BigInt(
                PermissionFlagsBits[permission]
              );
            });
            data.default_member_permissions = String(
              data.default_member_permissions
            );
          }
          //set dm permissions (generally non-compatible)
          if (!data.dmPermission) data.dmPermission = false;

          botcynx.userContextCommands.set(data.name, data);
          botcynx.ArrayOfSlashCommands.set(data.name, data);
        },
        type: "command",
      });
    });
    //Message
    const messageContextFiles = await globPromise(
      `${__dirname}/../commands/ContextCommands/message/*{.ts,.js}`
    );

    messageContextFiles.forEach(async (filePath) => {
      this.registerModule({
        path: filePath,
        callback: function (data: MessageContextType) {
          if (data?.userPermissions) {
            //setup permissions
            data.default_member_permissions = BigInt(0);
            data?.userPermissions.forEach((permission) => {
              (data.default_member_permissions as bigint) |= BigInt(
                PermissionFlagsBits[permission]
              );
            });
            data.default_member_permissions = String(
              data.default_member_permissions
            );
          }
          //set dm permissions (generally non-compatible)
          if (!data.dmPermission) data.dmPermission = false;

          botcynx.messageContextCommands.set(data.name, data);
          botcynx.ArrayOfSlashCommands.set(data.name, data);
        },
        type: "command",
      });
    });

    //SlashCommands
    const slashCommandFiles = await globPromise(
      `${__dirname}/../commands/SlashCommands/*/*{.ts,.js}`
    );

    slashCommandFiles.forEach(async (filePath) => {
      this.registerModule({
        path: filePath,
        callback: function (data: CommandType) {
          if (data?.userPermissions) {
            //setup permissions
            data.default_member_permissions = BigInt(0);
            data?.userPermissions.forEach((permission) => {
              (data.default_member_permissions as bigint) |= BigInt(
                PermissionFlagsBits[permission]
              );
            });
            data.default_member_permissions = String(
              data.default_member_permissions
            );
          }
          //set dm permissions (generally non-compatible)
          if (!data.dmPermission) data.dmPermission = false;

          botcynx.ArrayOfSlashCommands.set(data.name, data);
          botcynx.slashCommands.set(data.name, data);
        },
        type: "command",
      });
    });

    //WhitelistedCommands
    const whitelistedCommandFiles = await globPromise(
      `${__dirname}/../commands/whitelistedCommands/*{.ts,.js}`
    );

    whitelistedCommandFiles.forEach(async (filePath) => {
      this.registerModule({
        path: filePath,
        callback: function (data: WhitelistedCommands) {
          if (data?.userPermissions) {
            //setup permissions
            data.default_member_permissions = BigInt(0);
            data?.userPermissions.forEach((permission) => {
              (data.default_member_permissions as bigint) |= BigInt(
                PermissionFlagsBits[permission]
              );
            });
            data.default_member_permissions = String(
              data.default_member_permissions
            );
          }
          //set dm permissions (generally non-compatible)
          if (!data.dmPermission) data.dmPermission = false;

          botcynx.whitelistedCommands.set(data.name, data);
        },
        type: "command",
      });
    });

    //modals
    const modalFiles = await globPromise(`${__dirname}/../modals/*{.ts,.js}`);

    modalFiles.forEach(async (filePath) => {
      this.registerModule({
        path: filePath,
        callback: function (data: ModalResponseType) {
          botcynx.modals.set(data.name, data);
        },
        type: "modal",
      });
    });

    //Button
    const buttonFiles = await globPromise(`${__dirname}/../buttons/*{.ts,.js}`);

    buttonFiles.forEach(async (filePath) => {
      this.registerModule({
        path: filePath,
        callback: function (data: ButtonResponseType) {
          if (!data.customId) {
            botcynx.buttonCommands.set(data.category, data);
          } else {
            botcynx.buttonCommands.set(
              `${data.category}:${data.customId}`,
              data
            );
          }
        },
        type: "button",
      });
    });

    this.on("ready", async () => {
      //check globally disabled commands
      let config = await configModel.findOne({ guildId: "global" });
      this.ArrayOfSlashCommands.forEach((c: any) => {
        if (config.disabledCommands.includes(c.name)) {
          c.default_member_permissions = String(
            PermissionFlagsBits.Administrator
          );
          botcynx.ArrayOfSlashCommands.set(c.name, c);
        }
      });

      //register tags
      let guildsWithTags: any = await tagModel.find();
      guildsWithTags = guildsWithTags.map((g) => g.guildId);
      guildsWithTags = [...new Set(guildsWithTags)];
      guildsWithTags.forEach((guild) => this.registerTags(guild));
      //register commands
      if (!process?.env?.guildId)
        this.registerCommands({
          commands: this.ArrayOfSlashCommands,
        });
      else {
        this.registerCommands({
          commands: this.ArrayOfSlashCommands,
          guildId: process.env.guildId,
        });
        for (let command of this.whitelistedCommands.map((c) => c)) {
          try {
            command.register({
              client: this,
              guild: this.guilds.cache.get(process?.env?.guildId),
            });
          } catch (e) {}
        }
      }

      if (reload()) registerGistReload(); //attempt to reload coolPeople list / if it fails register the error Task
    });

    //MessageCommands
    const CommandFiles = await globPromise(
      `${__dirname}/../commands/MessageCommands/*/*{.ts,.js}`
    );

    CommandFiles.forEach(async (filePath) => {
      this.registerModule({
        path: filePath,
        callback: function (data: MessageCommandType) {
          botcynx.commands.set(data.name, data);
        },
        type: "command",
      });
    });

    this.logger.table(this.registerTable, logLevel.DEBUG);

    //Events
    const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`);
    eventFiles.forEach(async (filePath) => {
      const event: Event<keyof ClientEvents> = await this.importFile(filePath);

      if (event) {
        this.on(event.event, event.run); //add Listener
      }
    });

    //Custom Events

    const customEventFiles = await globPromise(
      `${__dirname}/../lib/customEvents/*{.ts,.js}`
    );
    customEventFiles.forEach(async (filePath) => {
      const event = await this.importFile(filePath);

      if (event) {
        this.on(event.event, event.run);
      }
    });

    //Tasks
    this.tasks.set("cooldown", await registerCooldownTask(this));                 //register cooldown timer id
    this.tasks.set("slashCommandCache", await clearCache());                      //Clear interactions when dropped
    this.tasks.set("hypixelApiReset", HypixelAPI.INSTANCE.task);                  //Reset api calls clientside
    this.tasks.set("githubRepoResetDirt", RepositoryCacheHandler.INSTANCE.task);  //Reset "dirty" repositories
  }

  async killTasks() {
    // kill all registered tasks, what did you expect? -> Killswitches are always useful
    for (let task of this.tasks.map((t) => t)) {
      clearInterval(task);
      this.tasks.delete(this.tasks.findKey((t) => t == task));
    }
  }

  async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
    if (guildId) {
      this.guilds.cache.get(guildId)?.commands.set(commands);

      this.logger.log(
        chalk.redBright(
          `Registering commands to ${this.guilds.cache.get(guildId).name}`
        ),
        logLevel.INFO
      );
    } else {
      this.application?.commands.set(commands);

      this.logger.log(
        chalk.green(`Registering global commands`),
        logLevel.INFO
      );
    }
  }


  async registerTags(guildId: string) {
    const guild = this.guilds.cache.get(guildId);
    if (!guild) return;

    const tags: any = new Collection();
    let guildTags = await tagModel.find({
      guildId: guildId,
    });
    if (guildTags.length == 0) return;
    guildTags.forEach((tag) => {
      let command: CommandType = {
        name: tag.name,
        description: tag.description,
        category: "tag",

        run: async ({ interaction, client }) => {
          interaction.followUp({
            content: tag.text,
            allowedMentions: { parse: [] },
          });
        },
      };
      this.ArrayOfSlashCommands.set(command.name, command);
      tags.set(command.name, command);
    });
    this.logger.log(
      chalk.green(`Registering tags for (${guild.name}/${guildId})`),
      logLevel.DEBUG
    );
    this.guilds.cache.get(guildId)?.commands.set(tags);
  }
}
