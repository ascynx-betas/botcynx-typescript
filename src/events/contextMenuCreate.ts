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
        const time = command.cooldown * 1000; //set seconds to milliseconds
        let userCooldowns = botcynx.cooldowns.get(`${interaction.user.id}-${command.name}`);


        if (typeof userCooldowns != "undefined") {
        let cooldown = userCooldowns.timestamp;

        if (cooldown > Date.now()) {
          //still in cooldown

          return interaction.followUp({content: `chill out, you're currently on cooldown from using the ${command.name} command`});
        
        } else {
          //ended

          botcynx.cooldowns.delete(`${interaction.user.id}-${command.name}`);
          const newCoolDown = new commandCooldown(interaction.user.id, time, command.name);
          botcynx.cooldowns.set(`${interaction.user.id}-${command.name}`, newCoolDown);
        
        }
      } else {
        //doesn't exist

        const newCoolDown = new commandCooldown(interaction.user.id, time, command.name);
        botcynx.cooldowns.set(`${interaction.user.id}-${command.name}`, newCoolDown);
        } 
      }


      // if bot requires permissions
      if (command.botPermissions) {
        const botRequiredPermission = command.botPermissions;
        let botPermission = interaction.guild.me.permissions.toArray();

        if (
          !botPermission.includes(botRequiredPermission[0]) &&
          !botPermission.includes("ADMINISTRATOR")
        )
          return interaction.followUp({
            content: `I cannot execute this command due to the lack of ${botRequiredPermission}`,
          });
      }
      //if user requires permission
      if (command.userPermissions) {
        const userRequiredPermission = command.userPermissions;
        let userPermissions = interaction.guild.members.cache
          .get(interaction.user.id)
          .permissions.toArray();

        if (
          !userPermissions.includes(userPermissions[0]) &&
          !userPermissions.includes("ADMINISTRATOR") &&
          interaction.user.id != interaction.guild.ownerId &&
          interaction.user.id != process.env.developerId
        )
          return interaction.followUp({
            content: `You cannot use this command as you lack ${userRequiredPermission}`,
          });
      }

      if (command.require) {
        let RequireValue = await RequireTest(command.require);
        if (RequireValue == false)
          return interaction.followUp({
            content: `the client in which this command has been called, doesn't have the required values to execute this command`,
          });
      }

      command.run({
        args: interaction.options as CommandInteractionOptionResolver,
        client: botcynx,
        interaction: interaction as contextInteraction,
      });
    } else return;
  }
);
