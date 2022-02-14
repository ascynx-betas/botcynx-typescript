import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { Command } from "../../../structures/Commands";

export default new Command({
  name: "disable",
  aliases: ["d", "enable"],

  run: async ({ message, client, args }) => {
    const target = args[0];
    const flags = args[1];
    //available flags: -l local(current guild) -g global(every guild)

    //events that can be disabled: linkReader and roleLinked
    //commands that can be disabled: all except exec and disable
    const commands = client.ArrayOfSlashCommands.concat(client.commands).map(
      (c: any) => c.name
    );

    if (!target || typeof target == "undefined")
      return message.reply({
        content: `please specify the command you want to disable`,
      });

    if (
      !commands.includes(target) &&
      target != "linkReader" &&
      target != "roleLinked" &&
      target != "crashLogReader"
    )
      return message.reply({
        content: `you cannot disable ${target} as it is not an available command / event`,
      }); //doesn't exist

    if (target == "disable" || target == "exec")
      return message.reply({
        content: `sorry but you cannot disable that command.`,
      });

    if (!flags || flags == "-l" || flags == "-g") {
      let flag: string;
      if (flags == "-l" || !flag) flag = "local";
      if (flags == "-g") flag = "global";

      const embed = new MessageEmbed()
        .setDescription(`are you sure you want to disable/enable ${target}`)
        .setFooter({ text: `requested by ${message.author.tag}` });

      const buttonRow = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId(`disable:${target}:${flag}`)
          .setLabel("Yes")
          .setStyle("SUCCESS"),
        new MessageButton()
          .setCustomId(`clear`)
          .setLabel("cancel")
          .setStyle("DANGER")
      );

      message.reply({ embeds: [embed], components: [buttonRow] });
    } else {
      return message.reply({ content: `there is no such command flag` });
    }
  },
});
