import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection } from "discord.js";
import { CommandType, UserContextType, MessageCommandType, MessageContextType } from "../typings/Command";
import glob from 'glob'
import { promisify } from "util";
import { RegisterCommandsOptions } from "../typings/Client";
import { Event } from "./Event";

const globPromise = promisify(glob)


export class botClient extends Client {
    slashCommands: Collection<string, CommandType> = new Collection();
    userContextCommands: Collection<string, UserContextType> = new Collection();
    messageContextCommands: Collection<string, MessageContextType> = new Collection();
    commands: Collection<string, MessageCommandType> = new Collection();
    ArrayOfSlashCommands = new Collection();
    constructor() {
        super({ intents: 32767 });
    }

    start() {
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
        const userContextFiles = await globPromise(`${__dirname}/../commands/ContextCommands/user/*{.ts,.js}`);

        userContextFiles.forEach(async filePath => {
            const command: UserContextType = await this.importFile(filePath);
            if(!command.name) return;

            this.userContextCommands.set(command.name, command);
            userContextCommands.push(command);
            this.ArrayOfSlashCommands.set(command.name, command);
            ArrayOfSlashCommands.push(command)

        });
            //Message
        const messageContextCommands: MessageContextType[] = [];
        const messageContextFiles = await globPromise(`${__dirname}/../commands/ContextCommands/message/*{.ts,.js}`);

        messageContextFiles.forEach(async filePath => {
            const command: MessageContextType = await this.importFile(filePath);
            if(!command.name) return;

            this.messageContextCommands.set(command.name, command);
            messageContextCommands.push(command);
            this.ArrayOfSlashCommands.set(command.name, command);
            ArrayOfSlashCommands.push(command)

        });

        
        //SlashCommands
        const slashCommands: ApplicationCommandDataResolvable[] = [];
        const slashCommandFiles = await globPromise(`${__dirname}/../commands/SlashCommands/*/*{.ts,.js}`);
        
        slashCommandFiles.forEach(async filePath => {
            const command: CommandType = await this.importFile(filePath);
            if(!command.name) return;

            this.slashCommands.set(command.name, command);
            slashCommands.push(command);
            this.ArrayOfSlashCommands.set(command.name, command);
            ArrayOfSlashCommands.push(command)

        });

        this.on("ready", () => {


            //Registering all commands
            this.registerCommands({
                commands: this.ArrayOfSlashCommands,
                guildId: process.env.guildId
            });

        });

        //MessageCommands
        const commands: MessageCommandType[] = [];
        const CommandFiles = await globPromise(`${__dirname}/../commands/MessageCommands/*/*{.ts,.js}`);

        CommandFiles.forEach(async filePath => {
            const command: MessageCommandType = await this.importFile(filePath);
            if (!command.name) return;

            this.commands.set(command.name, command);
            commands.push(command);

        })

        //Events
        const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`);
        eventFiles.forEach(async filePath => {
            const event: Event<keyof ClientEvents> = await this.importFile(filePath);
            if (event) {
            this.on(event.event, event.run);

            };

        })
    }

    async registerCommands({commands, guildId}: RegisterCommandsOptions) {
        if (guildId) {
            this.guilds.cache.get(guildId)?.commands.set(commands);
            console.log(`Registering commands to ${guildId}`);

        } else {
            this.application?.commands.set(commands);
            console.log(`Registering global commands`);

        }
    }
}