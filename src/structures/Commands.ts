import { Guild, GuildMember, PermissionsString, User } from "discord.js";
import { botcynx } from "..";
import { configModel } from "../models/config";
import {
  ButtonResponseType,
  CommandCooldown,
  CommandType,
  MessageCommandType,
  MessageContextType,
  ModalResponseType,
  UserContextType,
  WhitelistedCommands,
} from "../typings/Command";

class BaseCommand {
  private command = this;
  /**
   * an inhibitor allowing to see if the user has the permissions required to run that command
   * @param command - The command which has been instantiated
   * @param {member: GuildMember, guild: Guild} data - The data about the guild and member affected
   * @returns {boolean} - Whether it failed or not. (true = passed, false = failed)
   */
  public userPermissionInhibitor = function (data: {
    member: GuildMember;
    guild: Guild;
  }) {
    const requiredPermissions: PermissionsString[] =
      this.command.userPermissions;
    const userPermissions: PermissionsString[] =
      data.member.permissions.toArray();

    if (
      requiredPermissions.some(
        (permission) => !userPermissions.includes(permission)
      ) &&
      !userPermissions.includes("Administrator") &&
      data.member.id != process.env.developerId &&
      data.member.id != data.guild.ownerId
    )
      return false;

    return true;
  };

  /**
   * an inhibitor allowing to see if the bot has the permissions required to run that command
   * @param command The command which has been instantiated
   * @param {Guild} guild - The data about the guild, member and channel affected
   * @returns {boolean} - Whether it failed or not. (true = passed, false = failed)
   */
  public botPermissionInhibitor = async function (
    guild: Guild
  ): Promise<boolean> {
    const requiredPermissions: PermissionsString[] =
      this.command.botPermissions;
    const botPermissions: PermissionsString[] =
      guild.members.me.permissions.toArray();
    if (
      requiredPermissions.some(
        (permission) => !botPermissions.includes(permission)
      ) &&
      !botPermissions.includes("Administrator")
    )
      return false;

    return true;
  };

  /**
   * Allows to see if the command is disabled or not
   * @param {Guild} guild - The guild affected
   * @returns {boolean}
   */
  public isDisabled = async function (guild?: Guild): Promise<boolean> {
    let guildConfig = null;
    if (guild) guildConfig = await configModel.findOne({ guildId: guild.id });
    const globalConfig = await configModel.findOne({ guildId: "global" });

    if (guild && guildConfig?.disabledCommands?.includes(this.command.name))
      return false;
    if (globalConfig?.disabledCommands?.includes(this.command.name))
      return false;

    return true;
  };

  /**
   * Allows to see if the command is only for developer
   * @param user - The user affected
   * @returns {boolean} - Whether it failed or not. (true = passed, false = failed)
   */
  public isDevOnly = function (user: User): boolean {
    if (user.id != process.env.developerId) return false;

    return true;
  };

  /**
   * If the command is on cooldown for the user or not
   * @param command - The command instantiated
   * @param {User} user - The user affected
   * @returns {boolean} - Whether it failed or not. (true = passed, false = failed)
   */
  public isOnCooldown = function (user: User): boolean {
    const time = this.command.cooldown * 1000; //set seconds to milliseconds
    let userCooldowns = botcynx.cooldowns.get(
      `${user.id}-${this.command.name}`
    );

    if (typeof userCooldowns != "undefined") {
      let cooldown = userCooldowns.timestamp;

      if (cooldown > Date.now()) {
        //still in cooldown
        return false;
      } else {
        //ended

        botcynx.cooldowns.delete(`${user.id}-${this.command.name}`);
        const newCoolDown = new CommandCooldown(
          user.id,
          time,
          this.command.name
        );
        botcynx.cooldowns.set(`${user.id}-${this.command.name}`, newCoolDown);
        return true;
      }
    } else {
      //doesn't exist

      const newCoolDown = new CommandCooldown(user.id, time, this.command.name);
      botcynx.cooldowns.set(`${user.id}-${this.command.name}`, newCoolDown);
      return true;
    }
  };

  public isAdminOrHigherThanBot = function (user: GuildMember) {
    if (user.id == process.env.developerId) return true;
    if (user.id == user.guild.ownerId) return true;
    if (user.permissions.has("Administrator")) return true;

    return false;
  };
}

export class SlashCommand extends BaseCommand {
  constructor(commandOptions: CommandType) {
    super();
    Object.assign(this, commandOptions);
  }
} // SlashCommands
export class Command extends BaseCommand {
  constructor(commandOptions: MessageCommandType) {
    super();
    Object.assign(this, commandOptions);
  }
} //MessageCommand
export class UserContextCommand extends BaseCommand {
  constructor(commandOptions: UserContextType) {
    super();
    Object.assign(this, commandOptions);
  }
} //User Context Commands
export class MessageContextCommand extends BaseCommand {
  constructor(commandOptions: MessageContextType) {
    super();
    Object.assign(this, commandOptions);
  }
} //Message Context Commands
export class ButtonResponse extends BaseCommand {
  constructor(commandOptions: ButtonResponseType) {
    super();
    Object.assign(this, commandOptions);
  }
} //Buttons

export class WhitelistedCommand extends BaseCommand {
  constructor(commandOptions: WhitelistedCommands) {
    super();
    Object.assign(this, commandOptions);
  }
}

export class ModalResponse extends BaseCommand {
  constructor(commandOptions: ModalResponseType) {
    super();
    Object.assign(this, commandOptions);
  }
}
