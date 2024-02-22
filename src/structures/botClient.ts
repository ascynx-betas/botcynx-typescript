import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection, Partials } from "discord.js";
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
  registerModulesOptions,
  tagTableElement,
} from "../typings/Client";
import { Event, extendedClientEvents } from "./Event";
import { connect } from "mongoose";
import { tagModel } from "../models/tag";
import { reload } from "../lib";
import chalk from "chalk";
import { registerCooldownTask } from "../lib/Tasks/cooldownReset";
import { registerGistReload } from "../lib/Tasks/gistLoadFail";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { configModel } from "../models/config";
import { LoggerFactory, LogLevel } from "../lib";
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
  ArrayOfSlashCommands: Collection<string, {name: string}> = new Collection();
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
      this.logger.log("connecting to mongoose", LogLevel.DEBUG);
      connect(process.env.mongooseConnectionString);
    }

    this.registerModules();
    this.login(process.env.botToken).then(() =>
      this.logger.log(chalk.green(`successfully logged in`), LogLevel.INFO)
    );
  }

  async importFile(filePath: string) {
    return (await import(filePath))?.default;
  }

  public isDebug(): boolean {
    return this.debug;
  }

  public emitLater<K extends keyof extendedClientEvents, E extends keyof ClientEvents>(event: K, ...args: extendedClientEvents[K|E]) {
    const task = setInterval(() => {
      clearInterval(task);
      //make it think it's one of its own events :)
      this.emit(event as unknown as E, ...args as ClientEvents[E]);
    }, 1000);
  }

  private registerTable: { type: string; name: string; registered: boolean, note?: string }[] =
    [];

  async registerModule(options: registerModulesOptions) {
    const data = await this.importFile(options.path);
    let name = "";
    let type = options.type;

    try {
      switch (type) {
        case "command": {
          if (!data.name) return;
          name = data.name;
          break;
        }
        case "modal": {
          if (!data.name || !data.run) return;
          name = data.name;
          break;
        }
        case "button": {
          if (!data.category) return;
          name = data.customId
          ? data.category + ":" + data.customId
          : data.category; 
          break;
        }
        default: {
          throw new TypeError(`Module type ${type} is not a registered type`);
        }
      }

      options.callback(data);
      this.registerTable.push({ type, name, registered: true });
    } catch (e) {
      console.log(e);
      let NOTE = "";

      if (e instanceof TypeError && e.message.startsWith("Module")) {
        NOTE = "Module Type does not exist";
      } else {
        NOTE = "Error in callback";
      }

      if (!name) {
        if (data.name) {
          name = data.name;
        } else {
          name = "UNKNOWN"
        }
      }

      this.registerTable.push({ type, name: name, registered: false, note: NOTE });
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
      await this.updateDisabledCommands();

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

    this.logger.table(this.registerTable, LogLevel.DEBUG);

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

  async updateDisabledCommands() {
    let config = await configModel.findOne({ guildId: "global" });
    this.ArrayOfSlashCommands.forEach((c: any) => {
      if (config.disabledCommands.includes(c.name)) {
        c.default_member_permissions = String(
          PermissionFlagsBits.Administrator
        );
        botcynx.ArrayOfSlashCommands.set(c.name, c);
      }
    });
    
    //update commands.
    await this.updateCommands(process?.env?.guildId !== undefined);
  }

  async registerTags() {
    const tagTable: tagTableElement[] = [];//guildId, tag name, status (updated|created)

    let taggedGuilds = await tagModel.find();

    const guildTags: Collection<string, Collection<string, CommandType>> = new Collection();

    taggedGuilds.forEach((g) => {
      let tagObject = guildTags.get(g.guildId);
      if (!tagObject) {
        guildTags.set(g.guildId, new Collection());
        tagObject = guildTags.get(g.guildId);
      }

      tagObject.set(g.name, {
        name: g.name,
        description: g.description,
        category: "tag",
        run: async ({ interaction, client }) => {
          interaction.followUp({
            content: g.text,
            allowedMentions: { parse: [] },
          });
        }
       });
     });

     for (const guildId of guildTags.keys()) {
       const tags = guildTags.get(guildId);
       const guild = this.guilds.cache.get(guildId);
       if (!guild) continue;
       this.logger.debug(`Checking tags for ${guild.name}/${guildId}`);

      if (tags.size > 0) {
         //update command cache.
         await guild.commands.fetch();
       }

      for (const tagName of tags.keys()) {
        const localTag = tags.get(tagName);

         const tableElement: tagTableElement = {
           guild: guildId,
           tag: localTag.name,
           status: "UNKNOWN"
         };

         try {
           let guildCommand = guild.commands.cache.filter((command) => command.name === tagName).first();
           if (guildCommand) {
             if (!guildCommand.equals(localTag, false).valueOf()) {
               guildCommand.edit(localTag);

               tableElement.status = "EDITED";
               tableElement["note"] = "Command existed and different";
             } else {
               tableElement.status = "EQUAL";
              tableElement["note"] = "Command existed and was equal to local version";
            }
          } else {
            //command is undefined
            guild.commands.create(localTag);

            tableElement.status = "CREATED";
             tableElement["note"] = "Command did not exist";
           }
         } catch (error) {
          tableElement.status = "ERRORED";
          tableElement["note"] = "Command did not exist";
        }

        tagTable.push(tableElement);
       }
     }

    this.logger.table(tagTable, LogLevel.DEBUG);
  }

  async updateCommands(updateLocally: boolean) {
    if (updateLocally) {
      if (!process?.env?.guildId) {
        throw new Error("Missing Guild Id in the process environment values");
      }

      const guild = this.guilds.cache.get(process?.env?.guildId);
      this.logger.log(
        chalk.redBright(
          `Registering commands to ${this.guilds.cache.get(process?.env?.guildId).name}`
        ),
        LogLevel.INFO
      );

      //update local command cache.
      await guild.commands.fetch();
      
      for (const lCommand of this.ArrayOfSlashCommands.map((command) => command)) {
        try {
          let guildCommands = guild.commands.cache.filter((gCommand) => gCommand.name == lCommand.name);
          if (guildCommands.size == 0) {
            guild.commands.create(lCommand as ApplicationCommandDataResolvable);
          } else {
            if (!guildCommands.first().equals(lCommand as any, false).valueOf()) {
              await guildCommands.first().edit(lCommand as any);
            }
          }
        } catch (error) {
          this.logger.error(error);
        }
      }
    } else {
      this.logger.log(
        chalk.green(`Registering global commands`),
        LogLevel.INFO
      );

      //Load command cache
      await this.application.commands.fetch();

      for (const command of this.ArrayOfSlashCommands.map((command) => command)) {
        try {
          let appCommands = this.application.commands.cache.filter((appCommand) => appCommand.name == command.name);
          if (appCommands.size == 0) {
            this.application.commands.create(command as ApplicationCommandDataResolvable);
          } else {
            if (!appCommands.first().equals(command as any, false).valueOf()) {
              await appCommands.first().edit(command as any);
            } 
          }
        } catch (error) {
          this.logger.error(error);
        }
      }
    }
  }
}
