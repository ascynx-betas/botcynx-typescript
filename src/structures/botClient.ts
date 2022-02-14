import {
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
} from "discord.js";
import * as fs from "fs";
import {
  CommandType,
  UserContextType,
  MessageCommandType,
  MessageContextType,
  ButtonResponseType,
  commandCooldown,
  WhitelistedCommands,
} from "../typings/Command";
import glob from "glob";
import { promisify } from "util";
import { RegisterCommandsOptions } from "../typings/Client";
import { Event } from "./Event";
import { connect } from "mongoose";
import { tagModel } from "../models/tag";
import { reload } from "../lib/coolPeople";
import chalk from "chalk";

const globPromise = promisify(glob);

export class botClient extends Client {
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
  tasks: Collection<string, any> = new Collection(); //!CHANGE THE ANY TO THE TASK TYPE ONCE IT'S MADE
  package: any;
  constructor() {
    super({ intents: 32767 });
    this.package = JSON.parse(fs.readFileSync("package.json", "utf-8"));
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

  async registerModules() {
    const ArrayOfSlashCommands: any[] = [];
    //Context Commands
    //User
    const userContextCommands: UserContextType[] = [];
    const userContextFiles = await globPromise(
      `${__dirname}/../commands/ContextCommands/user/*{.ts,.js}`
    );

    userContextFiles.forEach(async (filePath) => {
      const command: UserContextType = await this.importFile(filePath);
      if (!command.name) return;

      this.userContextCommands.set(command.name, command);
      userContextCommands.push(command);
      this.ArrayOfSlashCommands.set(command.name, command);
      ArrayOfSlashCommands.push(command);
    });
    //Message
    const messageContextCommands: MessageContextType[] = [];
    const messageContextFiles = await globPromise(
      `${__dirname}/../commands/ContextCommands/message/*{.ts,.js}`
    );

    messageContextFiles.forEach(async (filePath) => {
      const command: MessageContextType = await this.importFile(filePath);
      if (!command.name) return;

      this.messageContextCommands.set(command.name, command);
      messageContextCommands.push(command);
      this.ArrayOfSlashCommands.set(command.name, command);
      ArrayOfSlashCommands.push(command);
    });

    //SlashCommands
    const slashCommands: ApplicationCommandDataResolvable[] = [];
    const slashCommandFiles = await globPromise(
      `${__dirname}/../commands/SlashCommands/*/*{.ts,.js}`
    );

    slashCommandFiles.forEach(async (filePath) => {
      const command: CommandType = await this.importFile(filePath);
      if (!command.name) return;

      this.slashCommands.set(command.name, command);
      slashCommands.push(command);
      this.ArrayOfSlashCommands.set(command.name, command);
      ArrayOfSlashCommands.push(command);
    });

    //WhitelistedCommands
    const whitelistedCommands: ApplicationCommandDataResolvable[] = [];
    const whitelistedCommandFiles = await globPromise(
      `${__dirname}/../commands/whitelistedCommands/*{.ts,.js}`
    );

    whitelistedCommandFiles.forEach(async (filePath) => {
      const command: WhitelistedCommands = await this.importFile(filePath);
      if (!command.name) return;

      this.whitelistedCommands.set(command.name, command);
      whitelistedCommands.push(command);
    });

    //Button
    const buttonFiles = await globPromise(`${__dirname}/../buttons/*{.ts,.js}`);

    buttonFiles.forEach(async (filePath) => {
      const buttons: ButtonResponseType = await this.importFile(filePath);
      if (!buttons.category) return;
      if (!buttons.customId) {
        this.buttonCommands.set(buttons.category, buttons);
      } else {
        this.buttonCommands.set(
          `${buttons.category}:${buttons.customId}`,
          buttons
        );
      }
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
      else
        this.registerCommands({
          commands: this.ArrayOfSlashCommands,
          guildId: process.env.guildId,
        });

      reload(); //reload coolPeople list
    });

    //MessageCommands
    const commands: MessageCommandType[] = [];
    const CommandFiles = await globPromise(
      `${__dirname}/../commands/MessageCommands/*/*{.ts,.js}`
    );

    CommandFiles.forEach(async (filePath) => {
      const command: MessageCommandType = await this.importFile(filePath);
      if (!command.name) return;

      this.commands.set(command.name, command);
      commands.push(command);
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
