import { botcynx } from "..";
import { configModel } from "../models/config";
import { Event } from "../structures/Event";
import { RequireTest } from "../personal-modules/commandHandler";
import { commandCooldown } from "../typings/Command";

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

  //cooldown
  if (command.cooldown && message.author.id != process.env.developerId) {
    const time = command.cooldown * 1000; //set seconds to milliseconds
    let userCooldowns = botcynx.cooldowns.get(
      `${message.author.id}-${command.name}`
    );

    if (typeof userCooldowns != "undefined") {
      let cooldown = userCooldowns.timestamp;

      if (cooldown > Date.now()) {
        //still in cooldown

        return message.reply({
          content: `chill out, you're currently on cooldown from using the ${command.name} command`,
        });
      } else {
        //ended

        botcynx.cooldowns.delete(`${message.author.id}-${command.name}`);
        const newCoolDown = new commandCooldown(
          message.author.id,
          time,
          command.name
        );
        botcynx.cooldowns.set(
          `${message.author.id}-${command.name}`,
          newCoolDown
        );
      }
    } else {
      //doesn't exist

      const newCoolDown = new commandCooldown(
        message.author.id,
        time,
        command.name
      );
      botcynx.cooldowns.set(
        `${message.author.id}-${command.name}`,
        newCoolDown
      );
    }
  }

  //require values
  if (command.require) {
    let RequireValue = await RequireTest(command.require);
    if (RequireValue == false) return;
  }

  //disabled commands
  const config = await configModel.find({guildId: message.guild.id});
  const isDisabled = (config[0].disabledCommands.includes(command.name));

  if (isDisabled == true) {
    return message.reply({content: `this command has been disabled`})
  };

  const Guildinfo = await configModel.find({
    guildId: message.guildId,
  });
  let info = Guildinfo[0];
  const su = info.su;
  if (
    !su.includes(message.author.id) &&
    message.author.id != process.env.developerId
  )
    return; //message commands can only be used by super-users or the developer
  if (command.devonly === true && message.author.id != process.env.developerId)
    return; //In message commands, devonly means that it can only be used by the set developer.

    botcynx.emit('messageCommandCreate', message)
    
  await command.run({ client: botcynx, message, args });
});
