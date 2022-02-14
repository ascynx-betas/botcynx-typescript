import { botcynx } from "..";
import { Event } from "../structures/Event";
import {
  commandCooldown,
  contextInteraction,
  MessageContextType,
  UserContextType,
} from "../typings/Command";
import { CommandInteractionOptionResolver } from "discord.js";
import { RequireTest } from "../personal-modules/commandHandler";
import {
  botPermissionInhibitor,
  isOnCooldown,
  userPermissionInhibitor,
} from "../lib/command/commandInhibitors";

export default new Event(
  "interactionCreate",
  async (interaction: contextInteraction) => {
    if (interaction.isCommand()) return;
    if (interaction.isButton()) return;
    if (interaction.isContextMenu()) {
      let command: UserContextType | MessageContextType =
        botcynx.userContextCommands.get(interaction.commandName);
      if (!command)
        command = botcynx.messageContextCommands.get(interaction.commandName);
      if (!command)
        return interaction.followUp("You have used a non existant command");

      // if command is ephemeral
      if (command.invisible) {
        if (command.invisible == true) {
          await interaction.deferReply({ ephemeral: true });
        }
      } else {
        await interaction.deferReply();
      }

      //cooldown
      if (command.cooldown && interaction.user.id != process.env.developerId) {
        if (!isOnCooldown(command, interaction.user))
          return interaction.reply({
            content: "you are currently in cooldown from using that command",
          });
      }

      // if bot requires permissions
      if (command.botPermissions) {
        if (!botPermissionInhibitor(command, interaction.guild))
          return interaction.reply({
            content:
              "I do not have the permissions required to run that command !",
          });
      }
      //if user requires permission
      if (command.userPermissions) {
        if (
          !userPermissionInhibitor(command, {
            member: interaction.member,
            guild: interaction.guild,
          })
        )
          return interaction.reply({
            content:
              "You do not have the required permissions to run that command !",
          });
      }

      if (command.require) {
        let RequireValue = await RequireTest(command.require);
        if (RequireValue == false)
          return interaction.reply({
            content: `the client in which this command has been called, doesn't have the required values to execute this command`,
          });
      }

      botcynx.emit("interactioncommandCreate", interaction);

      command.run({
        args: interaction.options as CommandInteractionOptionResolver,
        client: botcynx,
        interaction: interaction as contextInteraction,
      });
    } else return;
  }
);
