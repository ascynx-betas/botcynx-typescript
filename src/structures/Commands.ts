import {
  ButtonResponseType,
  CommandType,
  MessageCommandType,
  MessageContextType,
  UserContextType,
  WhitelistedCommands,
} from "../typings/Command";

export class slashCommand {
  constructor(commandOptions: CommandType) {
    Object.assign(this, commandOptions);
  }
} // SlashCommands
export class Command {
  constructor(commandOptions: MessageCommandType) {
    Object.assign(this, commandOptions);
  }
} //MessageCommand
export class UserContextCommand {
  constructor(commandOptions: UserContextType) {
    Object.assign(this, commandOptions);
  }
} //User Context Commands
export class MessageContextCommand {
  constructor(commandOptions: MessageContextType) {
    Object.assign(this, commandOptions);
  }
} //Message Context Commands
export class ButtonResponse {
  constructor(commandOptions: ButtonResponseType) {
    Object.assign(this, commandOptions);
  }
} //Buttons

export class WhitelistedCommand {
  constructor(commandOptions: WhitelistedCommands) {
    Object.assign(this, commandOptions);
  }
}
