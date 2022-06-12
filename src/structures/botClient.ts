import { Client, ClientEvents, Collection } from "discord.js";
import * as fs from "fs";
import {
  CommandType,
  UserContextType,
  MessageCommandType,
  MessageContextType,
  ButtonResponseType,
  commandCooldown,
  WhitelistedCommands,
  modalResponseType,
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
import { reload } from "../lib/coolPeople";
import chalk from "chalk";
import { registerCooldownTask } from "../lib/Tasks/cooldownReset";
import { registerGistReload } from "../lib/Tasks/gistLoadFail";

const globPromise = promisify(glob);

export class botClient extends Client {
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
  cooldowns: Collection<string, commandCooldown> = new Collection();
  tasks: Collection<string, NodeJS.Timer> = new Collection();
  modals: Collection<string, modalResponseType> = new Collection();

  //static values
  private static instance: botClient;
  package: any = JSON.parse(fs.readFileSync("package.json", "utf-8"));

  private constructor() {
    super({ intents: 32767, partials: ["CHANNEL"] });
  }

  static getInstance(): botClient {
    if (!botClient.instance) botClient.instance = new botClient();
    return botClient.instance;
  }

  start() {
    if (process.env.mongooseConnectionString) {
      connect(process.env.mongooseConnectionString);
    }

    this.registerModules();
    this.login(process.env.botToken).then(() =>
      console.log(chalk.green(`successfully logged in`))
    );
  }

  async importFile(filePath: string) {
    return (await import(filePath))?.default;
  }

  async registerModule(options: registerModulesOptions) {
    const data = await this.importFile(options.path);

    if (options.type == "command") {
      if (!data.name) return;
      if (process.env.environment == "debug")
        console.log("registering " + data.name + "!");
    } else if (options.type == "modal") {
      if (!data.name || !data.run) return;
      if (process.env.environment == "debug")
        console.log("registering " + data.name + "!");
    } else if (options.type == "button") {
      if (!data.category) return;
      if (process.env.environment == "debug")
        console.log(
          "registering " + typeof data.customId != "undefined"
            ? data.category + ":" + data.customId
            : data.category + "!"
        );
    }

    if (process.env.environment == "debug")
      console.log("――――――――――――――――――――――――――");

    options.callback(data);
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
          botClient.getInstance().userContextCommands.set(data.name, data);
          botClient.getInstance().ArrayOfSlashCommands.set(data.name, data);
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
          botClient.getInstance().messageContextCommands.set(data.name, data);
          botClient.getInstance().ArrayOfSlashCommands.set(data.name, data);
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
          botClient.getInstance().ArrayOfSlashCommands.set(data.name, data);
          botClient.getInstance().slashCommands.set(data.name, data);
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
          botClient.getInstance().whitelistedCommands.set(data.name, data);
        },
        type: "command",
      });
    });

    //modals
    const modalFiles = await globPromise(`${__dirname}/../modals/*{.ts,.js}`);

    modalFiles.forEach(async (filePath) => {
      this.registerModule({
        path: filePath,
        callback: function (data: modalResponseType) {
          botClient.getInstance().modals.set(data.name, data);
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
            botClient.getInstance().buttonCommands.set(data.category, data);
          } else {
            botClient
              .getInstance()
              .buttonCommands.set(`${data.category}:${data.customId}`, data);
          }
        },
        type: "button",
      });
    });

    this.on("ready", async () => {
      //register tags
      let guildsWithTags: any = await tagModel.find();
      guildsWithTags = guildsWithTags.map((g) => g.guildId);
      guildsWithTags = [...new Set(guildsWithTags)];
      guildsWithTags.forEach((guild) => this.registerTags(guild));
      //register commands
      if (process.env.environment != "dev")
        this.registerCommands({
          commands: this.ArrayOfSlashCommands,
        });
      else {
        this.registerCommands({
          commands: this.ArrayOfSlashCommands,
          guildId: process.env.guildId,
        });
        for (let command of this.whitelistedCommands.map((c) => c)) {
          command.register({
            client: this,
            guild: this.guilds.cache.get(process.env.guildId),
          });
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
          botClient.getInstance().commands.set(data.name, data);
        },
        type: "command",
      });
    });

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
    this.tasks.set("cooldown", await registerCooldownTask(this)); //register cooldown timer id
  }

  async killTasks() {
    // kill all registered tasks, what did you expect?
    for (let task of this.tasks.map((t) => t)) {
      clearInterval(task);
      this.tasks.delete(this.tasks.findKey((t) => t == task));
    }
  }

  async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
    if (guildId) {
      this.guilds.cache.get(guildId)?.commands.set(commands);
      console.log(
        chalk.redBright(
          `Registering commands to ${this.guilds.cache.get(guildId).name}`
        )
      );
    } else {
      this.application?.commands.set(commands);
      console.log(chalk.green(`Registering global commands`));
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
    this.guilds.cache.get(guildId)?.commands.set(tags);
  }
}
