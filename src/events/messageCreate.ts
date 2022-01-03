import { botcynx } from "..";
import { configModel } from "../models/config";
import { Event } from "../structures/Event";
import { RequireTest } from "../personal-modules/commandHandler";

export default new Event("messageCreate", async (message) => {
  // MesssageCommands
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

  if (command.require) {
    let RequireValue = await RequireTest(command.require);
    if (RequireValue == false) return;
  }

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

  await command.run({ client: botcynx, message, args });
});
