import { TextBasedChannel } from "discord.js";
import { configModel } from "../../../models/config";
import { slashCommand } from "../../../structures/Commands";


export default new slashCommand({
    name: 'delconfig',
    description: 'delete information from server configuration',
    userPermissions: ["MANAGE_ROLES"],
    options: [
        {
          name: "type",
          description: "the array you want to modify",
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
              name: "unblock channel",
              value: "blockchannel",
            },
          ],
        },
        {
          name: "role",
          description: `the role that will be removed`,
          required: false,
          type: "ROLE",
        },
        {
          name: "channel",
          description:
            "the channel that will be removed (only for unblock channel)",
          required: false,
          type: "CHANNEL",
          channelTypes: ["GUILD_TEXT"],
        },
      ],

    run: async({ client, interaction }) => {
        const type = interaction.options.getString("type");
        const guildId = interaction.guild.id;
        const guild = interaction.guild;
        const channel = interaction.options.getChannel("channel");
        const role = interaction.options.getRole('role')

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

            return interaction.followUp({content: `configuration was missing, please re-execute the command.`});
        }
        const guildConfig = config[0];

        if (type === "bypass") {
            const roleId = role.id;

            if (!guildConfig.bypass.includes(roleId)) return interaction.followUp({content: `${role} isn't a bypass role, if you want to add it, use the /setconfig command`, allowedMentions: {parse: []}});

            configModel.updateOne(
                { guildId: `${guildId}`},
                { $pull: { bypass: `${roleId}`}},
                function (err: any) {
                    if (err) return interaction.followUp({content: `there was an error, please try again later`});
                });

                interaction.followUp({content: `the changes to ${type} have been made, it may take some time before the changes take effect`});
        } else if (type === "removable") {
            const roleId = role.id;

            if(!guildConfig.removable.includes(roleId)) return interaction.followUp({content: `${role} isn't a removable role, if you want to add it, use the /setconfig command`, allowedMentions: {parse: []}});

            configModel.updateOne(
                { guildId: `${guildId}`},
                { $pull: { removable: `${roleId}`}},
                function (err: any) {
                    if (err) return interaction.followUp({content: `there was an error, please try again later`});
                });

                interaction.followUp({content: `the changes to ${type} have been made, it may take some time before the changes take effect`});
        } else if (type === "trigger") {
            const roleId = role.id;

            if (!guildConfig.trigger.includes(roleId)) return interaction.followUp({content: `${role} isn't a trigger role, if you want to add it, use the /setconfig command`, allowedMentions: { parse: []}});

            configModel.updateOne(
                { guildId: `${guildId}`},
                { $pull: { trigger: `${roleId}`}},
                function (err: any) {
                    if (err) return interaction.followUp({content: `there was an error, please try again later`});
                });

                interaction.followUp({content: `the changes to ${type} have been made, it may take some time before the changes take effect`});
        } else if (type === "blockchannel") {
            let channelId = channel.id;
            if (!guildConfig.blocked.includes(channelId)) return interaction.followUp({content: `${channel} is not blocked, if you want to block it use the /setconfig command`});

            configModel.updateOne(
                { guildId: `${guildId}`},
                { $pull: { blocked: `${channelId}`}},
                function (err: any) {
                    if (err) return interaction.followUp({content: `there was an error, please try again later`});
                });

                interaction.followUp({content: `the changes to ${type} have been made, it may take some time before the changes take effect`});   
        } else return interaction.followUp({content: `${type} is not recognized`});

        if (guildConfig.logchannel) {
            const log = interaction.guild.channels.cache.get(guildConfig.logchannel);
            if (!log) return;
            (log as TextBasedChannel).send({content: `configuration was modified by \`\`${interaction.user.tag}\`\`\nit may take a few minutes for the changes to take effect`});
        }
    }
})