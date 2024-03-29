import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
} from "discord.js";
import { localeHandler } from "../../..";
import { isDisabled } from "../../../lib/command/commandInhibitors";
import { emojis } from "../../../lib/emojis";
import { Command } from "../../../structures/Commands";

//TODO refactor to slash command
export default new Command({
  name: "disable",
  aliases: ["d", "enable"],
  userPermissions: ["ManageGuild"],
  usage: `${process.env.botPrefix}disable [target (command name)] <flag (-l | -g)>`,
  category: "other",

  run: async ({ message, client, args, request }) => {
    const target = args[0];
    //available flags: -l local(current guild) -g global(every guild)

    //events that can be disabled: linkReader and roleLinked and crashLogReader
    //commands that can be disabled: all except exec and disable
    const commands = client.ArrayOfSlashCommands.concat(client.commands).map(
      (c: any) => c.name
    );

    if (!target || typeof target == "undefined")
      return request.send({
        content: `please specify the command you want to disable`,
      });

    if (
      !commands.includes(target) &&
      target != "linkReader" &&
      target != "roleLinked" &&
      target != "crashLogReader"
    )
      return request.send({
        content: `you cannot disable ${target} as it is not an available command / event`,
        allowedMentions: { parse: [] },
      }); //doesn't exist

    if (target == "disable" || target == "exec")
      return request.send({
        content: `sorry but you cannot disable that command.`,
      });

    if (
      request.getFlags().length == 0 ||
      request.hasFlag("local") ||
      request.hasFlag("global")
    ) {
      let flag: string;
      if (request.hasFlag("local") || request.getFlags().length == 0) {
        flag = "local";
      } else if (request.hasFlag("global")) flag = "global";

      const embed = new EmbedBuilder()
        .setDescription(
          `${emojis.danger} ${localeHandler
            .getLang(
              (await isDisabled({ name: target }, message.guild))
                ? "command.disable"
                : "command.enable"
            )
            .insert("command", target)
            .get(message.guild.preferredLocale)}`
        )
        .setFooter({ text: `requested by ${message.author.tag}` });

      const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`disable:${target}:${flag}`)
          .setLabel("Yes")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`clear`)
          .setLabel("cancel")
          .setStyle(ButtonStyle.Danger)
      );

      request.send({
        embeds: [embed],
        components: [buttonRow],
        allowedMentions: { parse: [] },
      });
    } else {
      return request.send({ content: `there is no such command flag` });
    }
  },
});
