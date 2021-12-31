import { configModel } from "../../../models/config";
import { slashCommand } from "../../../structures/Commands";
import { snowflakeToMention } from "../../../personal-modules/discordPlugin";
import { MessageEmbed } from "discord.js";

export default new slashCommand({
    name: 'serverconfig',
    description: 'Allows a server administrator to see the configuration of the server',
    userPermissions: ["MANAGE_ROLES"],
    
    run: async({ interaction }) => {
        const guildId = interaction.guildId;
        const config = await configModel.find({
            guildId: guildId
        });
        if (!config || config.length == 0) {
            new configModel({
            name: interaction.guild.name,
            guildId: guildId,
            trigger: [],
            bypass: [],
            removable: [],
            logchannel: "",
            su: [],
            blocked: [],
            }).save();
            return interaction.followUp({
                content: `Configuration was missing, please re-use the command`
            });
        }
        //get informations from config
        const guildConfig = config[0];
        const name = interaction.guild.name;
        let removable = guildConfig.removable;
        let trigger = guildConfig.trigger;
        let bypass = guildConfig.bypass;
        let su = guildConfig.su;
        let blocked = guildConfig.blocked;
        let logChannel = guildConfig.logchannel;
        // transform snowflake to mention
        if(removable.length >= 1) removable = snowflakeToMention(removable, "ROLE");
        if (removable.length == 0) removable[0] = "**none set**";
        if(trigger.length >= 1) trigger = snowflakeToMention(trigger, "ROLE");
        if (trigger.length == 0) trigger[0] = "**none set**";
        if(bypass.length >= 1) bypass = snowflakeToMention(bypass, "ROLE");
        if (bypass.length == 0) bypass[0] = "**none set**";
        if(su.length >= 1) su = snowflakeToMention(su, "USER");
        if (su.length == 0) su[0] = "**none set**";
        if(blocked.length >= 1) blocked = snowflakeToMention(blocked, "CHANNEL");
        if (blocked.length == 0) blocked[0] = "**none set**";

        if (logChannel != "") {logChannel = `<#${logChannel}>`} else logChannel = `**none set**`

        //join information together
        removable.join(', ');
        trigger.join(', ');
        bypass.join(', ');
        su.join(', ');
        blocked.join(', ');

        const description = `${name || "unset"}'s config \n
        guild id: ${guildId || "unknown"} \n
        removable roles: ${removable} \n
        trigger roles: ${trigger} \n
        bypass roles: ${bypass} \n
        Elevated Permissions: ${su} \n
        Log Channel: ${logChannel} \n
        Blocked Channels: ${blocked} \n`; //don't forget to modify in delconfig for slots by setting index-1 instead of index

        const embed = new MessageEmbed()
            .setAuthor({name:`${name || "unknown"} server's configuration`})
            .setDescription(description)
            .setColor(`BLUE`)
            .setTimestamp(Date.now());

        interaction.followUp({
            embeds: [embed],
            allowedMentions: { parse: [] },
        });
    }
})