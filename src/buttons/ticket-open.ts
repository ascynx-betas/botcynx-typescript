import {
  BaseGuildTextChannel,
  GuildChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ThreadChannel,
  ButtonStyle,
  GuildFeature,
  ChannelType,
} from "discord.js";
import { postStartData } from "../events/ready";
import { ticketModel } from "../models/ticket";
import { permissions } from "../personal-modules/bitfieldCalculator";
import { permOverride } from "../personal-modules/discordPlugin";
import { ButtonResponse } from "../structures/Commands";

export default new ButtonResponse({
  category: "ticket",
  require: ["mongooseConnectionString"],
  botPermissions: ["ManageThreads"],
  run: async ({ interaction, client }) => {
    //ticket open buttons
    const guildId = interaction.guild.id;
    const guild = interaction.guild;
    const channel = interaction.channel;
    const customId = interaction.customId;
    let target = interaction.user;

    const success = postStartData.ticketblockedNames.some(
      (c) => c === interaction.customId
    );
    if (success != true) {
      let fields = customId.split(":");
      const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("close")
          .setLabel("close ticket")
          .setStyle(ButtonStyle.Danger)
      );

      const config = await ticketModel.find({
        guildId: guildId,
        name: fields[1],
      });
      const permissionOverwrites = (
        channel as GuildChannel
      ).permissionOverwrites.cache.map((any) => any);
      let blacklisted: string;
      await permOverride(permissionOverwrites).then((permission) => {
        let list = permission.permlist;
        let denied = permission.denied;
        let result: number;
        list.forEach(function (list, index) {
          if (list.includes(`<@&${target.id}>`)) return (result = index);
        });

        if (typeof result !== "undefined") {
          let userPermissions = permissions(Number(denied[result]));
          if (userPermissions.includes("SendMessagesInThreads"))
            return (blacklisted = "blacklisted");
        }
      });
      if (blacklisted == "blacklisted") return;

      const thread = await (channel as BaseGuildTextChannel).threads.create({
        name: `${interaction.user.tag}-${fields[1]}`,
        autoArchiveDuration: 1440,
        type: guild.features.includes(GuildFeature.PrivateThreads)
          ? ChannelType.GuildPrivateThread
          : ChannelType.GuildPublicThread,
        reason: `created new ${
          guild.features.includes(GuildFeature.PrivateThreads) ? "private" : "public"
        } ticket`,
      });

      (thread as ThreadChannel).send({
        content: `${config[0]?.welcomemessage || "undefined"}`,
        components: [buttonRow],
      });
      (thread as ThreadChannel).members.add(`${interaction.user.id}`);
    }
  },
});
