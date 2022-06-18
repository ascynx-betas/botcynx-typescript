import { Guild, GuildMember, PermissionsString, User } from "discord.js";
import { botcynx } from "../..";
import { configModel } from "../../models/config";
import { commandCooldown } from "../../typings/Command";

/**
 * an inhibitor allowing to see if the user has the permissions required to run that command
 * @param command - The command which has been instantiated
 * @param {member: GuildMember, guild: Guild} data - The data about the guild and member affected
 * @returns {boolean} - Whether it failed or not. (true = passed, false = failed)
 */
const userPermissionInhibitor = function (
  command,
  data: { member: GuildMember; guild: Guild }
) {
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

/**
 * an inhibitor allowing to see if the bot has the permissions required to run that command
 * @param command The command which has been instantiated
 * @param {Guild} guild - The data about the guild, member and channel affected
 * @returns {boolean} - Whether it failed or not. (true = passed, false = failed)
 */
const botPermissionInhibitor = async function (command, guild: Guild) {
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

/**
 * Allows to see if the command is disabled or not
 * @param command - The command which has been instantiated
 * @param {Guild} guild - The guild affected
 * @returns {boolean}
 */
const isDisabled = async function (command, guild: Guild) {
  const guildConfig = await configModel.find({ guildId: guild.id });
  const globalConfig = await configModel.find({ guildId: "global" });

  if (
    guildConfig[0].disabledCommands.includes(command.name) ||
    globalConfig[0].disabledCommands.includes(command.name)
  )
    return false;

  return true;
};

/**
 * Allows to see if the command is only for developer
 * @param user - The user affected
 * @returns {boolean} - Whether it failed or not. (true = passed, false = failed)
 */
const isDevOnly = function (user: User) {
  if (user.id != process.env.developerId) return false;

  return true;
};

/**
 * If the command is on cooldown for the user or not
 * @param command - The command instantiated
 * @param {User} user - The user affected
 * @returns {boolean} - Whether it failed or not. (true = passed, false = failed)
 */
const isOnCooldown = function (command, user: User) {
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
      const newCoolDown = new commandCooldown(user.id, time, command.name);
      botcynx.cooldowns.set(`${user.id}-${command.name}`, newCoolDown);
      return true;
    }
  } else {
    //doesn't exist

    const newCoolDown = new commandCooldown(user.id, time, command.name);
    botcynx.cooldowns.set(`${user.id}-${command.name}`, newCoolDown);
    return true;
  }
};

const isAdminOrHigherThanBot = function (user: GuildMember) {
  if (user.id == process.env.developerId) return true;
  if (user.id == user.guild.ownerId) return true;
  if (user.permissions.has("Administrator")) return true;

  return false;
};

export {
  isDevOnly,
  isOnCooldown,
  isDisabled,
  botPermissionInhibitor,
  userPermissionInhibitor,
  isAdminOrHigherThanBot,
};
