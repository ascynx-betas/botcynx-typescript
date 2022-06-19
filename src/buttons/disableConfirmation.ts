import { EmbedBuilder, PermissionFlagsBits, PermissionsString } from "discord.js";
import { configModel } from "../models/config";
import { ButtonResponse } from "../structures/Commands";

export default new ButtonResponse({
  category: "disable",
  temporary: true,
  onlyAuthor: true,

  run: async ({ interaction, client }) => {
    const fields = interaction.customId.split(":");
    const command = fields[1];
    const flag = fields[2];

    if (flag == "local") {
      const config = await configModel.find({ guildId: interaction.guild.id });
      const guildConfig = config[0];
      if (guildConfig.disabledCommands.includes(command)) {
        configModel.updateOne(
          { guildId: interaction.guild.id },
          { $pull: { disabledCommands: command } },
          function (err) {
            if (err) {
              const embed = new EmbedBuilder()
                .setDescription(
                  "there was an error while removing the command from disabled commands"
                )
                .setTitle("Error")
                .setFooter({ text: `E` });
              return interaction.update({ embeds: [embed], components: [] });
            }
          }
        );

        const embed = new EmbedBuilder()
          .setTitle("Success")
          .setDescription(
            `successfully removed ${command} from disabled commands`
          );

        interaction.update({
          embeds: [embed],
          components: [],
          allowedMentions: { parse: [] },
        });
      } else {
        configModel.updateOne(
          {
            guildId: interaction.guild.id,
          },
          { $addToSet: { disabledCommands: command } },
          function (err) {
            if (err) {
              const embed = new EmbedBuilder()
                .setDescription(
                  "there was an error while disabling that command"
                )
                .setTitle("Error")
                .setFooter({ text: `E` });
              return interaction.update({ embeds: [embed], components: [] });
            }
          }
        );

        const embed = new EmbedBuilder()
          .setTitle("Success")
          .setDescription(`successfully added ${command} to disabled commands`);

        interaction.update({
          embeds: [embed],
          components: [],
          allowedMentions: { parse: [] },
        });
      }
    } else if (flag == "global") {
      if (interaction.user.id != process.env.developerId)
        return interaction.update({
          content: `You cannot modify the global configuration`,
        });

      const config = await configModel.find({ guildId: "global" });
      const globalConfig = config[0];

      if (globalConfig.disabledCommands.includes(command)) {
        //remove command

        configModel.updateOne(
          { guildId: "global" },
          { $pull: { disabledCommands: command } },
          function (err) {
            if (err) {
              const embed = new EmbedBuilder()
                .setDescription(
                  "there was an error while removing the command from disabled commands"
                )
                .setTitle("Error")
                .setFooter({ text: `E` });
              return interaction.update({ embeds: [embed], components: [] });
            }
          }
        );

        const c = client.application.commands.cache.filter((c) => c.name == command).first();

        const Localcommand: any = client.ArrayOfSlashCommands.filter((c: any) => c.name == command);
        
        let value = BigInt(0);

        (Localcommand.userPermissions as Array<PermissionsString>)?.forEach((c) => {
          value |= PermissionFlagsBits[c];
        });
        Localcommand.default_member_permissions = String(value);
        
        client?.application?.commands?.edit(c?.id, Localcommand).catch((e) => {});

        const embed = new EmbedBuilder()
          .setTitle("Success")
          .setDescription(
            `successfully removed ${command} from global disabled commands`
          );

        interaction.update({
          embeds: [embed],
          components: [],
          allowedMentions: { parse: [] },
        });
      } else {
        //add command

        configModel.updateOne(
          { guildId: "global" },
          { $addToSet: { disabledCommands: command } },
          function (err) {
            if (err) {
              const embed = new EmbedBuilder()
                .setDescription(
                  "there was an error while disabling that command"
                )
                .setTitle("Error")
                .setFooter({ text: `E` });
              return interaction.update({ embeds: [embed], components: [] });
            }
          }
        );

        const c = client.application.commands.cache.filter((c) => c.name == command).first();

        const Localcommand: any = client.ArrayOfSlashCommands.filter((c: any) => c.name == command);
        Localcommand.default_member_permissions = String(PermissionFlagsBits.Administrator);
        
        client?.application?.commands?.edit(c?.id, Localcommand).catch((e) => {})

        const embed = new EmbedBuilder()
          .setTitle("Success")
          .setDescription(
            `successfully added ${command} to global disabled commands`
          );

        interaction.update({
          embeds: [embed],
          components: [],
          allowedMentions: { parse: [] },
        });
      }
    }
  },
});
