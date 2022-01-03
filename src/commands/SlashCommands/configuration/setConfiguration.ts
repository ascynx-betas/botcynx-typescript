import { TextBasedChannel } from "discord.js";
import { configModel } from "../../../models/config";
import { slashCommand } from "../../../structures/Commands";

export default new slashCommand({
  name: "setconfig",
  description: "store certain informations for uses in the bot",
  require: ["mongooseConnectionString"],
  userPermissions: ["MANAGE_ROLES"],
  options: [
    {
      name: "type",
      description: "the type of information to add",
      required: true,
      type: "STRING",
      choices: [
        {
          name: "trigger",
          value: "trigger",
        },
        {
          name: "removable",
          value: "removable",
        },
        {
          name: "bypass",
          value: "bypass",
        },
        {
          name: "logchannel",
          value: "logChannel",
        },
        {
          name: "blocked channel",
          value: "blockChannel",
        },
      ],
    },
    {
      name: "role",
      description: "role to add",
      type: "ROLE",
      required: false,
    },
    {
      name: "channel",
      description: "only used for setting logchannel",
      type: "CHANNEL",
      channelTypes: ["GUILD_TEXT"],
      required: false,
    },
  ],

  run: async ({ interaction, client }) => {
    const role = interaction.options.getRole("role");
    const type = interaction.options.getString("type");
    const channel = interaction.options.getChannel("channel");
    const guild = interaction.guild;
    const guildId = guild.id;

    const config = await configModel.find({
      guildId: guildId,
    });

    if (!config || config.length == 0) {
      new configModel({
        name: guild.name,
        guildId: guildId,
        trigger: [],
        bypass: [],
        removable: [],
        logchannel: "",
        su: [],
        blocked: [],
      }).save();
      return interaction.followUp({
        content: `configuration was missing, pleas re-execute the command`,
      });
    }
    const guildConfig = config[0];

    if (type === "bypass") {
      const roleId = role.id;
      if (guildConfig.bypass.includes(roleId))
        return interaction.followUp({
          content: `bypass already contains this role, if you want to delete it, please use the /delconfig command`,
        });

      configModel.updateOne(
        { guildId: `${guildId}` },
        { $addToSet: { bypass: `${roleId}` } },
        function (err: any) {
          if (err)
            return interaction.followUp({
              content: `there was an error while trying to update the configuration, please try again later`,
            });
        }
      );

      interaction.followUp({
        content: `${role} has been successfully added to ${type}`,
        allowedMentions: { parse: [] },
      });
    } else if (type === "trigger") {
      const roleId = role.id;
      if (guildConfig.trigger.includes(roleId))
        return interaction.followUp({
          content: `trigger already contains this role, if you want to remove it, please use the /delconfig command`,
        });

      configModel.updateOne(
        { guildId: guildId },
        { $addToSet: { trigger: `${roleId}` } },
        function (err: any) {
          if (err)
            return interaction.followUp({
              content: `there was an error while trying to update the configuration, please try again later`,
            });
        }
      );

      interaction.followUp({
        content: `${role} has successfully been added to ${type}`,
        allowedMentions: { parse: [] },
      });
    } else if (type === "removable") {
      const roleId = role.id;
      if (guildConfig.removable.includes(roleId))
        return interaction.followUp({
          content: `removable already contains this role, if you want to remove it, please use the /delconfig command`,
        });

      configModel.updateOne(
        { guildId: guildId },
        { $addToSet: { removable: `${roleId}` } },
        function (err: any) {
          if (err)
            return interaction.followUp({
              content: `there was an error while trying to update the configuration, please try again later`,
            });
        }
      );

      interaction.followUp({
        content: `${role} has successfully been added to ${type}`,
        allowedMentions: { parse: [] },
      });
    } else if (type === "logChannel") {
      let logChannel = channel.id;
      if (guildConfig.logchannel == `${logChannel}`)
        return interaction.followUp({
          content: `the current Logging channel is the same as the one you're trying to set it to`,
        });

      configModel.updateOne(
        { guildId: guildId },
        { $set: { logchannel: `${logChannel}` } },
        function (err: any) {
          if (err)
            return interaction.followUp({
              content: `there was an error while trying to update the configuration, please try again later`,
            });
        }
      );

      interaction.followUp({
        content: `the new Logging channel is ${logChannel}, modifications after this one will also be logged there`,
      });
    } else if (type == "blockChannel") {
      const channelId = channel.id;

      if (guildConfig.blocked.includes(channelId))
        return interaction.followUp({
          content: `${channel} is already blocked, if you want to unblock it, please use the /delconfig command`,
        });

      configModel.updateOne(
        { guildId: guildId },
        { $addToSet: { blocked: `${channelId}` } },
        function (err: any) {
          if (err)
            return interaction.followUp({
              content: `there was an error while trying to update the configuration, please try again later`,
            });
        }
      );

      interaction.followUp({
        content: `${channel} is now blocked, any person that tries to use the bot's link reader on a link that leads to that channel, will be ignored`,
      });
    } else interaction.followUp({ content: `type is not supported` });

    if (guildConfig.logchannel) {
      const log = interaction.guild.channels.cache.get(guildConfig.logchannel);
      if (!log) return;
      (log as TextBasedChannel).send({
        content: `configuration was just modified by \`\`${interaction.user.tag}\`\`\n the changes may take a few minutes to take affect`,
      });
    }
  },
});
