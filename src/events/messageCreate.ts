import { botcynx } from "..";
import { configModel } from "../models/config";
import { Event } from "../structures/Event";
import { RequireTest } from "../personal-modules/commandHandler";
import { commandCooldown } from "../typings/Command";
import {
  botPermissionInhibitor,
  isDisabled,
  isOnCooldown,
  userPermissionInhibitor,
} from "../lib/command/commandInhibitors";

export default new Event("messageCreate", async (message) => {
  // MessageCommands
  if (
    message.author.bot ||
    !message.guild ||
    !message.content.toLowerCase().startsWith(process.env.botPrefix)
  )
    return;

  const [cmd, ...args] = message.content
    .slice(process.env.botPrefix.length)
    .trim()
    .split(/ +/g);

  let command = botcynx.commands.get(cmd.toLowerCase());
  if (!command)
    command = botcynx.commands.find((c) =>
      c.aliases?.includes(cmd.toLowerCase())
    );

  if (!command) return;

  if (!isDisabled(command, message.guild))
    return message.reply("This command is disabled");

  //cooldown
  if (command.cooldown && message.author.id != process.env.developerId) {
    if (!isOnCooldown(command, message.author))
      return message.reply("You are currently in cooldown");
  }

  // if bot requires permissions
  if (command.botPermissions) {
    if (!botPermissionInhibitor(command, message.guild))
      return message.reply(
        "I do not have the permissions required to run that command !"
      );
  }
  //if user requires permission
  if (command.userPermissions) {
    if (
      !userPermissionInhibitor(command, {
        member: message.member,
        guild: message.guild,
      })
    )
      return message.reply(
        "You do not have the required permissions to run that command !"
      );
  }

  //require values
  if (command.require) {
    let RequireValue = await RequireTest(command.require);
    if (RequireValue == false) return;
  }

  const globalConfig = await configModel.findOne({ guildId: "global" });

  const Guildinfo = await configModel.find({
    guildId: message.guildId,
  });
  let info = Guildinfo[0];
  const su = info.su.concat(globalConfig.su);
  if (
    !su.includes(message.author.id) &&
    message.author.id != process.env.developerId &&
    message.author.id != message.guild.ownerId
  )
    return; //message commands can only be used by super-users or the developer
  if (command.devonly === true && message.author.id != process.env.developerId)
    return; //In message commands, devonly means that it can only be used by the set developer.

  botcynx.emit("messageCommandCreate", message);

  await command.run({ client: botcynx, message, args });
});
