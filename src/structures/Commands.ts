import { CommandType, MessageCommandType, MessageContextType, UserContextType } from "../typings/Command";

export class slashCommand {
    constructor(commandOptions: CommandType) {
        Object.assign(this, commandOptions);
    }
} // SlashCommands
export class Command {
    constructor(commandOptions: MessageCommandType) {
        Object.assign(this, commandOptions)
    }
} //MessageCommand
export class UserContextCommand {
    constructor(commandOptions: UserContextType) {
        Object.assign(this, commandOptions)
    }
} //User Context Commands
export class MessageContextCommand {
    constructor(commandOptions: MessageContextType) {
        Object.assign(this, commandOptions)
    }
} //Message Context Commands