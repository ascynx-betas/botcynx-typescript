import { botcynx } from "..";
import { Event } from "../structures/Event";
import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
} from "discord.js";
import { RequireTest } from "../personal-modules/commandHandler";

export default new Event("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) return;
  if (interaction.isContextMenu()) return;

  if (interaction.isSelectMenu()) {
    const category = interaction.customId;
    const Id = interaction.values;

    if (Id[0] == "disabled")
      return interaction.update({
        components: interaction.message.components as MessageActionRow[],
      });

    let command = botcynx.buttonCommands.get(category);
    if (!command) command = botcynx.buttonCommands.get(`${category}:${Id}`);
    if (!command) return;
    if (interaction.message.author.id != botcynx.user.id) return;

    if (command.temporary == true) {
      let current = Date.now();
      let creation = (interaction.message as Message).createdTimestamp;
      let time = current - creation;

      //Timeout
      if (time >= 900000) {
        //const components = interaction.message.components
        //components.forEach((component) => component.components.forEach(sub => {
        //  sub.setDisabled(true);
        //}))

        return interaction.update({ components: [] }); //(components as MessageActionRow[])
      }
    } //temp check

    if (command.botPermissions) {
      const botRequiredPermission = command.botPermissions;
      let botPermission = interaction.guild.me.permissions.toArray();

      if (
        !botPermission.includes(botRequiredPermission[0]) &&
        !botPermission.includes("ADMINISTRATOR")
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
        !userPermissions.includes(userPermissions[0]) &&
        !userPermissions.includes("ADMINISTRATOR") &&
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
          content: `the client in which this command has been called, doesn't have the required values to execute this command`,
        });
    }

    if (command.onlyAuthor) {
      let user = interaction.user.id;
      let author = interaction.message.interaction.user.id;

      if (user != author)
        return interaction.update({
          components: interaction.message.components as MessageActionRow[],
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
      const botRequiredPermission = button.botPermissions;
      let botPermission = interaction.guild.me.permissions.toArray();

      if (
        !botPermission.includes(botRequiredPermission[0]) &&
        !botPermission.includes("ADMINISTRATOR")
      )
        return interaction.followUp({
          content: `I cannot execute this command due to the lack of ${botRequiredPermission}`,
          ephemeral: true,
        });
    }

    if (button.userPermissions) {
      const userRequiredPermission = button.userPermissions;
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
      let author = interaction.message.interaction.user.id;

      if (user != author)
        return interaction.update({
          components: interaction.message.components as MessageActionRow[],
        });
    }

    button.run({
      client: botcynx,
      interaction: interaction,
    });
  }
});
