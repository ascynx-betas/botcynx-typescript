import { botcynx } from "..";
import { Collection, CommandInteractionOptionResolver } from "discord.js";
import { Event } from "../structures/Event";
import { botcynxInteraction, CommandType } from "../typings/Command";
import { RequireTest } from "../lib/personal-modules/commandHandler";
import { tagModel } from "../models/tag";
import {
  botPermissionInhibitor,
  isDevOnly,
  isDisabled,
  isOnCooldown,
  userPermissionInhibitor,
} from "../lib/command/commandInhibitors";
import { LoggerFactory, logLevel } from "../lib/Logger";

const CommandLogger = LoggerFactory.getLogger("SLASH-COMMAND");

export default new Event(
  "interactionCreate",
  async (interaction: botcynxInteraction) => {
    // slashcommands

    if (interaction.isChatInputCommand()) {
      let command = botcynx.slashCommands.get(interaction.commandName);
      if (!command)
        command = botcynx.whitelistedCommands.get(interaction.commandName);
      if (!command) {
        const tag = await tagModel.find({
          guilId: interaction.guild.id,
          name: interaction.commandName,
        });
        if (tag.length == 0)
          return interaction.reply("You have used a non existant command");
        let commandReCreate: CommandType = {
          name: tag[0].name,
          description: tag[0].description,
          category: "tag",
          run: async ({ interaction, client }) => {
            interaction.followUp({
              content: tag[0].text,
              allowedMentions: { parse: [] },
            });
          },
        };
        let commands: Collection<string, CommandType> = new Collection();
        commands.set(commandReCreate.name, commandReCreate);
        command = commands.get(commandReCreate.name);
      }
      if (!command)
        return interaction.reply("You have used a non existant command");

      //disabled commands
      CommandLogger.log("isDisabled check", logLevel.DEBUG);
      if (!(await isDisabled(command, interaction.guild))) {
        return interaction.reply("This command is disabled");
      }

      CommandLogger.log("isDevOnly check", logLevel.DEBUG);
      if (command.devonly) {
        if (!isDevOnly(interaction.user))
          return interaction.reply("this command is developer only");
      }

      CommandLogger.log("isOnCooldown check", logLevel.DEBUG);
      //cooldown
      if (command.cooldown && interaction.user.id != process.env.developerId) {
        if (!isOnCooldown(command, interaction.user))
          return interaction.reply("You are currently in cooldown");
      }

      CommandLogger.log("botPermission check", logLevel.DEBUG);
      // if bot requires permissions
      if (command.botPermissions) {
        if (!botPermissionInhibitor(command, interaction.guild))
          return interaction.reply(
            "I do not have the permissions required to run that command !"
          );
      }

      CommandLogger.log("userPermission check", logLevel.DEBUG);
      //if user requires permission
      if (command.userPermissions) {
        if (
          !userPermissionInhibitor(command, {
            member: interaction.member,
            guild: interaction.guild,
          })
        )
          return interaction.reply(
            "You do not have the required permissions to run that command !"
          );
      }

      CommandLogger.log("require check", logLevel.DEBUG);
      if (command.require) {
        let RequireValue = await RequireTest(command.require);
        if (RequireValue == false)
          return interaction.reply({
            content: `Client missing requirement to run this command.`,
          });
      }

      CommandLogger.log("sending interactionCommand event", logLevel.DEBUG);
      if (!command.isModalCommand) await interaction.deferReply();
      botcynx.emit("interactioncommandCreate", interaction);

      CommandLogger.log("running command", logLevel.DEBUG);

      await command.run({
          args: interaction.options as CommandInteractionOptionResolver,
          client: botcynx,
          interaction: interaction as botcynxInteraction,
        });
    } else return;
  }
);
