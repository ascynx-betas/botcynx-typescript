import { botcynx } from "..";
import { Event } from "../structures/Event";
import { Message, MessageActionRow, MessageButton } from "discord.js";
import { RequireTest } from "../personal-modules/commandHandler";

export default new Event("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) return;
  if (interaction.isContextMenu()) return;
  //don't forget to add buttonInteraction once it's necessary
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
        const buttonRow = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId(interaction.customId)
            .setLabel("Timed out")
            .setStyle("DANGER")
            .setDisabled(true)
        );

        return interaction.update({ components: [buttonRow] });
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

    button.run({
      client: botcynx,
      interaction: interaction,
    });
  }
});
