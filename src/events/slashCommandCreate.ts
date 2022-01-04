import { botcynx } from "..";
import { Collection, CommandInteractionOptionResolver } from "discord.js";
import { Event } from "../structures/Event";
import { botcynxInteraction, CommandType } from "../typings/Command";
import { RequireTest } from "../personal-modules/commandHandler";
import { tagModel } from "../models/tag";

export default new Event(
  "interactionCreate",
  async (interaction: botcynxInteraction) => {
    // slashCommands
    if (interaction.isContextMenu()) return;
    if (interaction.isButton()) return;

    if (interaction.isCommand()) {
      await interaction.deferReply();
      let command = botcynx.slashCommands.get(interaction.commandName);
      if (!command) {
        const tag = await tagModel.find({
          guilId: interaction.guild.id,
          name: interaction.commandName,
        });
        let commandReCreate: CommandType = {
          name: tag[0].name,
          description: tag[0].description,
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
        return interaction.followUp("You have used a non existant command");

      if (command.devonly) {
        if (interaction.member.id != process.env.developerId) {
          return interaction.followUp({
            content: `Command is a dev only command, and is currently not available to other users.`,
          });
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
        interaction: interaction as botcynxInteraction,
      });
    } else return;
  }
);
