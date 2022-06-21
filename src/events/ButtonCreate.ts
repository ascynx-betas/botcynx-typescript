import { botcynx } from "..";
import { Event } from "../structures/Event";
import {
  GuildMember,
  Message,
  ActionRow,
  MessageActionRowComponent,
} from "discord.js";
import { RequireTest } from "../lib/personal-modules/commandHandler";
import {
  botPermissionInhibitor,
  isDisabled,
  userPermissionInhibitor,
} from "../lib/command/commandInhibitors";

export default new Event("interactionCreate", async (interaction) => {
  if (interaction.isSelectMenu()) {
    const category = interaction.customId;
    const Id = interaction.values;

    if (Id[0] == "disabled")
      return interaction.update({
        components: interaction.message
          .components as ActionRow<MessageActionRowComponent>[],
      });

    let command = botcynx.buttonCommands.get(category.split(":")[0]);
    if (!command)
      command = botcynx.buttonCommands.get(`${category.split(":")[0]}:${Id}`);
    if (!command) return;
    if (interaction.message.author.id != botcynx.user.id) return;

    if (command.botPermissions) {
      const botRequiredPermission = command.botPermissions;
      let botPermission = interaction.guild.members.me.permissions.toArray();

      if (
        !botPermission.includes(botRequiredPermission[0]) &&
        !botPermission.includes("Administrator")
      )
        return interaction.followUp({
          content: `I cannot execute this command due to the lack of ${botRequiredPermission}`,
          ephemeral: true,
        });
    }

    if (command.userPermissions) {
      const userRequiredPermission = command.userPermissions;
      let userPermissions = interaction.guild.members.cache
        .get(interaction.user.id)
        .permissions.toArray();

      if (
        !userPermissions.includes(userRequiredPermission[0]) &&
        !userPermissions.includes("Administrator") &&
        interaction.user.id != interaction.guild.ownerId &&
        interaction.user.id != process.env.developerId
      )
        return interaction.followUp({
          content: `You cannot use this command as you lack ${userRequiredPermission}`,
          ephemeral: true,
        });
    }

    if (command.require) {
      let RequireValue = await RequireTest(command.require);
      if (RequireValue == false)
        return interaction.followUp({
          content: `Client cannot run this command as it's missing required values`,
        });
    }

    if (command.onlyAuthor) {
      let user = interaction.user.id;
      let author =
        interaction.message.interaction?.user?.id ||
        (interaction.message as Message).mentions.repliedUser?.id;

      if (user != author)
        return interaction.update({
          components: interaction.message
            .components as ActionRow<MessageActionRowComponent>[],
        });
    }

    interaction.customId = `${category}:${Id}`;

    command.run({
      client: botcynx,
      interaction: interaction,
    });
  }
  if (interaction.isButton()) {
    //fetch button from client
    const fields = interaction.customId.split(":");
    const category = fields[0];
    const Id = fields[1];
    let button = botcynx.buttonCommands.get(category);
    if (!button) button = botcynx.buttonCommands.get(`${category}:${Id}`);
    if (!button) return;

    if (interaction.message.author.id != botcynx.user.id) return;

    if (button.temporary == true) {
      let current = Date.now();
      let creation = (interaction.message as Message).createdTimestamp;
      let time = current - creation;

      //deprecated
      //Timeout
      if (time >= 900000) {
        //const components = interaction.message.components;
        //components.forEach((components) => components.components.forEach((button: MessageButton) => {
        //  button.setDisabled(true);
        //  button.setStyle('DANGER');
        //}))

        return interaction.update({ components: [] }); //(components as MessageActionRow[])
      }
    } //temp check

    if (button.botPermissions) {
      if (!botPermissionInhibitor(button, interaction.guild))
        return interaction.followUp({
          content: `I am missing the required permissions to run this command`,
          ephemeral: true,
        });
    }

    if (button.userPermissions) {
      if (
        !userPermissionInhibitor(button, {
          member: interaction.member as GuildMember,
          guild: interaction.guild,
        })
      )
        return interaction.followUp({
          content: `You do not have the required permissions to run this command`,
          ephemeral: true,
        });
    }

    if (button.require) {
      let RequireValue = await RequireTest(button.require);
      if (RequireValue == false)
        return interaction.followUp({
          content: `the client in which this command has been called, doesn't have the required values to execute this command`,
        });
    }

    if (button.onlyAuthor) {
      let user = interaction.user.id;
      let author =
        interaction.message.interaction?.user?.id ||
        (interaction.message as Message).mentions.repliedUser?.id;

      if (user != author)
        return interaction.update({
          components: interaction.message
            .components as ActionRow<MessageActionRowComponent>[],
        });
    }

    button.run({
      client: botcynx,
      interaction: interaction,
    });
  }
});
