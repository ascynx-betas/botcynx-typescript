import {
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
} from "discord.js";
import {
  CommandType,
  UserContextType,
  MessageCommandType,
  MessageContextType,
  ButtonResponseType,
  commandCooldown,
} from "../typings/Command";
import glob from "glob";
import { promisify } from "util";
import { RegisterCommandsOptions } from "../typings/Client";
import { Event } from "./Event";
import { connect } from "mongoose";
import { tagModel } from "../models/tag";

const globPromise = promisify(glob);

export class botClient extends Client {
  slashCommands: Collection<string, CommandType> = new Collection();
  userContextCommands: Collection<string, UserContextType> = new Collection();
  messageContextCommands: Collection<string, MessageContextType> =
    new Collection();
  commands: Collection<string, MessageCommandType> = new Collection();
  ArrayOfSlashCommands = new Collection();
  buttonCommands: Collection<string, ButtonResponseType> = new Collection();
  cooldowns: Collection<string, commandCooldown> = new Collection();
  constructor() {
    super({ intents: 32767 });
  }

  start() {
    if (process.env.mongooseConnectionString) {
      connect(process.env.mongooseConnectionString);
    }
    this.registerModules();
    this.login(process.env.botToken);
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
      this.registerCommands({
        commands: this.ArrayOfSlashCommands,
      });
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
        this.on(event.event, event.run);
      }
    });
  }

  async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
    if (guildId) {
      this.guilds.cache.get(guildId)?.commands.set(commands);
      console.log(`Registering commands to ${guildId}`);
    } else {
      this.application?.commands.set(commands);
      console.log(`Registering global commands`);
    }
  }
  async registerTags(guildId: string) {
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
