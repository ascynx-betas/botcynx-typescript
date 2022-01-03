import {
  GuildTextBasedChannel,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { ticketModel } from "../../../models/ticket";
import { testfor } from "../../../personal-modules/testFor";
import { slashCommand } from "../../../structures/Commands";

export default new slashCommand({
  name: "setup-ticket",
  description: "create a ticket message",
  require: ["mongooseConnectionString"],
  userPermissions: ["MANAGE_CHANNELS"],
  botPermissions: ["MANAGE_CHANNELS"],
  options: [
    {
      name: "channel",
      description: "the channel where the ticket system will be based in",
      required: true,
      type: "CHANNEL",
      channelTypes: ["GUILD_TEXT"],
    },
    {
      name: "config-name",
      description: "the name the config will be refered to in the commands",
      required: true,
      type: "STRING",
    },
    {
      name: "welcome-message",
      description:
        "the message that will be displayed when creating a new ticket",
      required: true,
      type: "STRING",
    },
    {
      name: "description",
      description:
        "the description that will be shown above the create ticket button",
      required: false,
      type: "STRING",
    },
  ],

  run: async ({ interaction }) => {
    const guildId = interaction.guildId;
    const setupChannel = interaction.options.getChannel("channel");
    const name = interaction.options.getString("config-name");
    const welcomeMessage = interaction.options.getString("welcome-message");
    const welcomeButton = interaction.options.getString("description");
    let botPermissions = interaction.guild.me.permissions.toArray();

    if (
      !botPermissions.includes("USE_PRIVATE_THREADS") &&
      !botPermissions.includes("USE_PUBLIC_THREADS") &&
      !botPermissions.includes("ADMINISTRATOR")
    )
      return interaction
        .followUp({ content: `Missing permissions to create threads` })
        .catch(() => null);

    const blacklisted = global.bot.ticketBlockedNames;
    const success = testfor(blacklisted, name);
    if (success == true)
      return interaction.followUp({
        content: `You cannot name a ticket ${name}`,
      });

    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(`ticket ${name}`)
        .setLabel("create ticket")
        .setStyle("SUCCESS")
    );

    const embed = new MessageEmbed()
      .setColor("RANDOM")
      .setDescription(
        `${
          welcomeButton || "press create to enter in contact with staff members"
        }`
      );

    let sent: Message;
    await (setupChannel as GuildTextBasedChannel)
      .send({ embeds: [embed], components: [buttonRow] })
      .then((message) => {
        interaction.followUp({
          content: `success, created a new ticket message in ${setupChannel}`,
        });
        sent = message;
      })
      .catch(() =>
        interaction.followUp({
          content: `I don't have permission to send a message in the specified channel`,
        })
      );

    const existing = await ticketModel.find({
      name: name,
      guildId: guildId,
    });
    if (!existing || existing.length == 0) {
      new ticketModel({
        channel: setupChannel.id,
        name: name,
        welcomemessage: welcomeMessage,
        linkedmessage: sent.id,
        guildId: guildId,
      }).save();
    }
  },
});
