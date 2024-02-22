import {
  GuildTextBasedChannel,
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
  Colors,
} from "discord.js";
import { postStartData } from "../../../events/ready";
import { ticketModel } from "../../../models/ticket";
import { SlashCommand } from "../../../structures/Commands";

export default new SlashCommand({
  name: "setup-ticket",
  description: "create a ticket message",
  require: ["mongooseConnectionString"],
  userPermissions: ["ManageChannels"],
  botPermissions: ["ManageChannels"],
  category: "ticket",
  options: [
    {
      name: "channel",
      description: "the channel where the ticket system will be based in",
      required: true,
      type: ApplicationCommandOptionType.Channel,
    },
    {
      name: "config-name",
      description: "the name the config will be refered to in the commands",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "welcome-message",
      description:
        "the message that will be displayed when creating a new ticket",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "description",
      description:
        "the description that will be shown above the create ticket button",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],

  run: async ({ interaction }) => {
    const guildId = interaction.guildId;
    const setupChannel = interaction.options.get("channel")?.channel;
    const name = interaction.options.get("config-name")?.value as string;
    const welcomeMessage = interaction.options.get("welcome-message")?.value as string;
    const welcomeButton = interaction.options.get("description")?.value as string;
    let botPermissions = (
      await interaction.guild.members.me
    ).permissions.toArray();

    if (
      !botPermissions.includes("CreatePrivateThreads") &&
      !botPermissions.includes("CreatePublicThreads") &&
      !botPermissions.includes("Administrator")
    )
      return interaction
        .followUp({ content: `Missing permissions to create threads` })
        .catch(() => null);

    const blacklisted = postStartData.ticketblockedNames;
    const success = blacklisted.some((c) => c === name);
    if (success == true)
      return interaction.followUp({
        content: `You cannot name a ticket ${name}`,
      });

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`ticket:${name}`)
        .setLabel("create ticket")
        .setStyle(ButtonStyle.Success)
    );

    const embed = new EmbedBuilder()
      .setColor(Colors.Red)
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
