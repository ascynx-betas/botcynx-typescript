import { Guild, GuildMember, PermissionsString, User } from "discord.js";
import { botcynx } from "../..";
import { configModel } from "../../models/config";
import { ButtonResponseType, CommandCooldown, CommandSimili, CommandType, MessageCommandType, MessageContextType, UserContextType } from "../../typings/Command";

const userPermissionInhibitor = function (
  command: CommandType | UserContextType | MessageContextType | MessageCommandType | ButtonResponseType,
  data: { member: GuildMember; guild: Guild }
): boolean {
  const requiredPermissions: PermissionsString[] = command.userPermissions;
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

const botPermissionInhibitor = async function (command: CommandType | UserContextType | MessageContextType | MessageCommandType | ButtonResponseType, guild: Guild): Promise<boolean> {
  const requiredPermissions: PermissionsString[] = command.botPermissions;
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

const isDisabled = async function (command: CommandType | UserContextType | MessageContextType | CommandSimili | MessageCommandType, guild?: Guild): Promise<boolean> {
  if (botcynx.isDev()) return true;
  let guildConfig = null;
  if (guild) guildConfig = await configModel.findOne({ guildId: guild.id });
  const globalConfig = await configModel.findOne({ guildId: "global" });

  if (guild && guildConfig?.disabledCommands?.includes(command.name))
    return false;
  if (globalConfig?.disabledCommands?.includes(command.name)) return false;

  return true;
};

/**
 * Allows to see if the user is the developer
 * @param user - The user affected
 * @returns {boolean} - Whether it failed or not. (true = passed, false = failed)
 */
const userIsDev = function (user: User): boolean {
  if (user.id != process.env.developerId) return false;

  return true;
};

const isOnCooldown = function (command: CommandType | UserContextType | MessageContextType | MessageCommandType, user: User): boolean {
  const time = command.cooldown * 1000; //set seconds to milliseconds
  let userCooldowns = botcynx.cooldowns.get(`${user.id}-${command.name}`);

  if (typeof userCooldowns != "undefined") {
    let cooldown = userCooldowns.timestamp;

    if (cooldown > Date.now()) {
      //still in cooldown
      return false;
    } else {
      //ended

      botcynx.cooldowns.delete(`${user.id}-${command.name}`);
      const newCooldown = new CommandCooldown(user.id, time, command.name);
      botcynx.cooldowns.set(`${user.id}-${command.name}`, newCooldown);
      return true;
    }
  } else {
    //doesn't exist

    const newCooldown = new CommandCooldown(user.id, time, command.name);
    botcynx.cooldowns.set(`${user.id}-${command.name}`, newCooldown);
    return true;
  }
};

const isAdminOrHigherThanBot = function (user: GuildMember) {
  if (!user) return false;

  if (user.id == process.env.developerId) return true;
  if (user.id == user.guild.ownerId) return true;
  if (user.permissions.has("Administrator")) return true;

  return false;
};

export {
  userIsDev,
  isOnCooldown,
  isDisabled,
  botPermissionInhibitor,
  userPermissionInhibitor,
  isAdminOrHigherThanBot,
};
