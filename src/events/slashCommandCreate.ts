import { botcynx } from "..";
import { Collection, CommandInteractionOptionResolver, Message } from "discord.js";
import { Event } from "../structures/Event";
import {
  botcynxInteraction,
  commandCooldown,
  CommandType,
} from "../typings/Command";
import { RequireTest } from "../personal-modules/commandHandler";
import { tagModel } from "../models/tag";
import { configModel } from "../models/config";

export default new Event(
  "interactionCreate",
  async (interaction: botcynxInteraction) => {
    // slashCommands
    if (interaction.isContextMenu()) return;
    if (interaction.isButton()) return;

    if (interaction.isCommand()) {
      let command = botcynx.slashCommands.get(interaction.commandName);
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
      const config = await configModel.find({guildId: interaction.guild.id});
      const isDisabled = (config[0].disabledCommands.includes(command.name));

      if (isDisabled == true) {
        if (command.name == "weight") {
          const weight = Math.floor(Math.random() * 10000);

          return interaction.reply({content: `your weight is ${weight} kg !`})
        }
        return interaction.reply({content: `this command has been disabled`, ephemeral: true})
      };

      if (command.devonly) {
        if (interaction.member.id != process.env.developerId) {
          return interaction.reply({
            content: `Command is a dev only command, and is currently not available to other users.`,
          });
        }
      }

      //cooldown
      if (command.cooldown && interaction.user.id != process.env.developerId) {
        await interaction.deferReply();
        const time = command.cooldown * 1000; //set seconds to milliseconds
        let userCooldowns = botcynx.cooldowns.get(
          `${interaction.user.id}-${command.name}`
        );

        if (typeof userCooldowns != "undefined") {
          let cooldown = userCooldowns.timestamp;

          if (cooldown > Date.now()) {
            //still in cooldown

            return interaction.followUp({
              content: `chill out, you're currently on cooldown from using the ${command.name} command`,
            });

          } else {
            //ended

            botcynx.cooldowns.delete(`${interaction.user.id}-${command.name}`);
            const newCoolDown = new commandCooldown(
              interaction.user.id,
              time,
              command.name
            );
            botcynx.cooldowns.set(
              `${interaction.user.id}-${command.name}`,
              newCoolDown
            );
          }
        } else {
          //doesn't exist

          const newCoolDown = new commandCooldown(
            interaction.user.id,
            time,
            command.name
          );
          botcynx.cooldowns.set(
            `${interaction.user.id}-${command.name}`,
            newCoolDown
          );
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
          return interaction.reply({
            content: `I cannot execute this command due to the lack of ${botRequiredPermission}`,
          })
          .catch(() => interaction.followUp({content: `I cannot execute this command due to the lack of ${botRequiredPermission}`}))
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
          return interaction.reply({
            content: `You cannot use this command as you lack ${userRequiredPermission}`,
          })
          .catch(() => interaction.followUp({content: `You cannot use this command as you lack ${userRequiredPermission}`}))
      }

      if (command.require) {
        let RequireValue = await RequireTest(command.require);
        if (RequireValue == false)
          return interaction.reply({
            content: `the client in which this command has been called, doesn't have the required values to execute this command`,
          })
          .catch(() => interaction.followUp({content: `the client in which this command has been called, doesn't have the required values to execute this command`}))
      }

      if (!command.cooldown || interaction.user.id == process.env.developerId) await interaction.deferReply();
      botcynx.emit('interactioncommandCreate', interaction);

      await command.run({
        args: interaction.options as CommandInteractionOptionResolver,
        client: botcynx,
        interaction: interaction as botcynxInteraction,
      });
    } else return;
  }
);
