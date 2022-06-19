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

export default new Event(
  "interactionCreate",
  async (interaction: botcynxInteraction) => {
    // slashcommands

    if (interaction.channel == null)
      return interaction.reply({
        content: `DM Commands are not currently supported`,
      });

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
      if (process.env.environment == "debug") console.log("isDisabled check");
      if (!await isDisabled(command, interaction.guild)) {
        console.log("test");
        return interaction.reply("This command is disabled");
      
      }

      if (process.env.environment == "debug") console.log("isDevOnly check");
      if (command.devonly) {
        if (!isDevOnly(interaction.user))
          return interaction.reply("this command is developer only");
      }

      if (process.env.environment == "debug") console.log("isOnCooldown check");
      //cooldown
      if (command.cooldown && interaction.user.id != process.env.developerId) {
        if (!isOnCooldown(command, interaction.user))
          return interaction.reply("You are currently in cooldown");
      }

      if (process.env.environment == "debug")
        console.log("botPermission check");
      // if bot requires permissions
      if (command.botPermissions) {
        if (!botPermissionInhibitor(command, interaction.guild))
          return interaction.reply(
            "I do not have the permissions required to run that command !"
          );
      }

      if (process.env.environment == "debug")
        console.log("userPermission check");
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

      if (process.env.environment == "debug") console.log("require check");
      if (command.require) {
        let RequireValue = await RequireTest(command.require);
        if (RequireValue == false)
          return interaction.reply({
            content: `the client in which this command has been called, doesn't have the required values to execute this command`,
          });
      }

      if (process.env.environment == "debug")
        console.log("sending interactioncommand");
      if (!command.isModalCommand) await interaction.deferReply();
      botcynx.emit("interactioncommandCreate", interaction);

      if (process.env.environment == "debug") console.log("running command");
      await command.run({
        args: interaction.options as CommandInteractionOptionResolver,
        client: botcynx,
        interaction: interaction as botcynxInteraction,
      });
    } else return;
  }
);
