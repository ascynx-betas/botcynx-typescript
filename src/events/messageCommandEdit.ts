import { Message } from "discord.js";
import { botcynx, messageRequestHandler } from "..";
import {
  botPermissionInhibitor,
  isDisabled,
  isOnCooldown,
  userPermissionInhibitor,
} from "../lib/command/commandInhibitors";
import { configModel } from "../models/config";
import { RequireTest } from "../lib/personal-modules/commandHandler";
import { Event } from "../structures/Event";

export default new Event(
  "messageUpdate",
  async (oldMessage: Message, newMessage: Message) => {
    // MessageCommands
    if (
      newMessage.author.bot ||
      !newMessage.content.toLowerCase().startsWith(process.env.botPrefix)
    )
      return;

      try {
        messageRequestHandler.getRequest(newMessage);
      } catch (e) {
        return;//doesn't have a request linked.
      }

    const [cmd, ...args] = newMessage.content
      .slice(process.env.botPrefix.length)
      .trim()
      .split(/ +/g);

    let command = botcynx.commands.get(cmd.toLowerCase());
    if (!command)
      command = botcynx.commands.find((c) =>
        c.aliases?.includes(cmd.toLowerCase())
      );

    if (!command) return;

    if (command.require) {
      let RequireValue = await RequireTest(command.require);
      if (RequireValue == false) return;
    }
    const globalConfig = await configModel.findOne({ guildId: "global" });
    if (!(await isDisabled(command, newMessage?.guild)))
      return newMessage.reply("This command is disabled");

    //cooldown
    if (command.cooldown && newMessage.author.id != process.env.developerId && newMessage.guild) {
      if (!isOnCooldown(command, newMessage.author))
        return newMessage.reply("You are currently in cooldown");
    }

    // if bot requires permissions
    if (command.botPermissions && newMessage.guild) {
      if (!botPermissionInhibitor(command, newMessage.guild))
        return newMessage.reply(
          "I do not have the permissions required to run that command !"
        );
    }
    //if user requires permission
    if (command.userPermissions && newMessage.guild) {
      if (
        !userPermissionInhibitor(command, {
          member: newMessage.member,
          guild: newMessage.guild,
        })
      )
        return newMessage.reply(
          "You do not have the required permissions to run that command !"
        );
    }


    if (newMessage.guild) {
      const Guildinfo = await configModel.find({
        guildId: newMessage.guildId,
      });
      let info = Guildinfo[0];

      const su = info.su.concat(globalConfig.su);
      if (
        !su.includes(newMessage.author.id) &&
        newMessage.author.id != process.env.developerId
      )
        return; //message commands can only be used by super-users or the developer
    } else {
      if (!globalConfig.su.includes(newMessage.author.id) &&
      newMessage.author.id != process.env.developerId) return;
    }
    if (
      command.devonly === true &&
      newMessage.author.id != process.env.developerId
    )
      return; //In message commands, devonly means that it can only be used by the set developer.

      const request = messageRequestHandler.getRequest(newMessage);

      if (command.usage && ["--usage", "-u", "--help", "-h"].includes(args[0])) {
        request.send({
          content: command.usage,
          allowedMentions: { parse: []}
        });
        return;
      }

    await command.run({ client: botcynx, message: newMessage, args: request.getNonFlagArgs(), request: request });
  }
);
