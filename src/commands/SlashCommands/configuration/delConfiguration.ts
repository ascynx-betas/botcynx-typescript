import { ApplicationCommandOptionType, TextBasedChannel } from "discord.js";
import { configModel } from "../../../models/config";
import { SlashCommand } from "../../../structures/Commands";

export default new SlashCommand({
  name: "delconfig",
  description: "delete information from server configuration",
  require: ["mongooseConnectionString"],
  userPermissions: ["ManageRoles"],
  category: "configuration",
  options: [
    {
      name: "type",
      description: "the array you want to modify",
      required: true,
      type: ApplicationCommandOptionType.String,
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
          name: "unblock channel",
          value: "blockchannel",
        },
      ],
    },
    {
      name: "role",
      description: `the role that will be removed`,
      required: false,
      type: ApplicationCommandOptionType.Role,
    },
    {
      name: "channel",
      description:
        "the channel that will be removed (only for unblock channel)",
      required: false,
      type: ApplicationCommandOptionType.Channel,
    },
  ],

  run: async ({ client, interaction }) => {
    const type = interaction.options.get("type")?.value;
    const guildId = interaction.guild.id;
    const guild = interaction.guild;
    const channel = interaction.options.get("channel")?.channel;
    const role = interaction.options.get("role")?.role;

    const config = await configModel.find({
      guildId: guildId,
    });

    if (!config || config.length == 0) {
      let conf = new configModel({
        name: guild.name,
        guildId: guildId,
        trigger: [],
        bypass: [],
        removable: [],
        logchannel: "",
        su: [],
        blocked: [],
      });
      conf.save();
      config.push(conf);
    }
    const guildConfig = config[0];

    if (type === "bypass") {
      const roleId = role.id;

      if (!guildConfig.bypass.includes(roleId)) {
        return interaction.followUp({
          content: `${role} isn't a bypass role, if you want to add it, use the /setconfig command`,
          allowedMentions: { parse: [] },
        });
      }

      configModel.updateOne({ guildId: guildId}, { $pull: { bypass: roleId}})
        .exec().catch((_err) => {
          return interaction.followUp({
            content: `there was an error, please try again later`,
          });
      });

      interaction.followUp({
        content: `the changes to ${type} have been made, it may take some time before the changes take effect`,
      });
    } else if (type === "removable") {
      const roleId = role.id;

      if (!guildConfig.removable.includes(roleId)) {
        return interaction.followUp({
          content: `${role} isn't a removable role, if you want to add it, use the /setconfig command`,
          allowedMentions: { parse: [] },
        });
      }

      configModel.updateOne( { guildId: guildId }, { $pull: { removable: roleId } })
        .exec().catch((_err) => {
          return interaction.followUp({
            content: `there was an error, please try again later`,
          });
      });

      interaction.followUp({
        content: `the changes to ${type} have been made, it may take some time before the changes take effect`,
      });
    } else if (type === "trigger") {
      const roleId = role.id;

      if (!guildConfig.trigger.includes(roleId)) {
        return interaction.followUp({
          content: `${role} isn't a trigger role, if you want to add it, use the /setconfig command`,
          allowedMentions: { parse: [] },
        });
      }

      configModel.updateOne({ guildId: guildId }, { $pull: { trigger: roleId } })
        .exec().catch((_err) => {
          return interaction.followUp({
            content: `there was an error, please try again later`,
          });
      });

      interaction.followUp({
        content: `the changes to ${type} have been made, it may take some time before the changes take effect`,
      });
    } else if (type === "blockchannel") {
      let channelId = channel.id;
      if (!guildConfig.blocked.includes(channelId)) {
        return interaction.followUp({
          content: `${channel} is not blocked, if you want to block it use the /setconfig command`,
        });
      }

      configModel.updateOne({ guildId: guildId }, { $pull: { blocked: channelId } })
        .exec().catch((_err) => {
          return interaction.followUp({
            content: `there was an error, please try again later`,
          });
      });

      interaction.followUp({
        content: `the changes to ${type} have been made, it may take some time before the changes take effect`,
      });
    } else {
      return interaction.followUp({ content: `${type} is not recognized` });
    }
    if (guildConfig.logchannel) {
      const log = interaction.guild.channels.cache.get(guildConfig.logchannel);
      if (!log) return;
      (log as TextBasedChannel).send({
        content: `configuration was modified by \`\`${interaction.user.tag}\`\`\nit may take a few minutes for the changes to take effect`,
      });
    }
  },
});
