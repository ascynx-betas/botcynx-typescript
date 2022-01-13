import { Collection, EmbedFieldData, MessageEmbed } from "discord.js";
import { configModel } from "../models/config";
import { snowflakeToMention } from "../personal-modules/discordPlugin";
import { ButtonResponse } from "../structures/Commands";

export default new ButtonResponse({
  category: "settings",
  temporary: true,
  require: ["mongooseConnectionString"],
  run: async ({ interaction, client }) => {
    let fields = interaction.customId.split(":");
    const type = fields[1];
    let name: string;
    let embedFields: EmbedFieldData[] = [];

    const config = await configModel.find({
      guildId: interaction.guild.id,
    });
    const guildConfig = config[0];

    //type checks
    if (type == "roleLinked") {
      //roleUdate event
      let { removable, trigger, bypass, logchannel } = guildConfig;
      // transform snowflake to mention
      if (removable.length >= 1)
        removable = snowflakeToMention(removable, "ROLE");
      if (removable.length == 0) removable[0] = "**none set**";
      if (trigger.length >= 1) trigger = snowflakeToMention(trigger, "ROLE");
      if (trigger.length == 0) trigger[0] = "**none set**";
      if (bypass.length >= 1) bypass = snowflakeToMention(bypass, "ROLE");
      if (bypass.length == 0) bypass[0] = "**none set**";

      if (logchannel != "") {
        logchannel = `<#${logchannel}>`;
      } else logchannel = `**none set**`;
      let activity: string;

      if (removable.length >= 1 && !guildConfig.disabledCommands.includes('roleLinked')) {
        activity = "🟢";
      } else {
        activity = "🔴";
      }

      //name
      name = "roleLinked configuration";

      //fields
      embedFields.push({
        name: `**Server**:`,
        value: `${interaction.guild.name} (${interaction.guild.id})`,
      });
      embedFields.push({
        name: `**Removable roles**:`,
        value: removable.join(", "),
      });
      embedFields.push({
        name: `**Trigger roles**:`,
        value: trigger.join(", "),
      });
      embedFields.push({ name: `**Bypass roles**:`, value: bypass.join(", ") });
      embedFields.push({ name: `**Logging channel**:`, value: logchannel });
      embedFields.push({ name: `**Active**:`, value: activity });
    } else if (type == "linkReader") {
      let { blocked } = guildConfig;
      if (blocked.length >= 1) blocked = snowflakeToMention(blocked, "CHANNEL");
      if (blocked.length == 0) blocked[0] = "**none set**";

      let activity: string;

      if (interaction.guild.me.permissions.has("MANAGE_WEBHOOKS") && !guildConfig.disabledCommands.includes('linkReader')) {
        activity = "🟢";
      } else {
        activity = "🔴";
      }

      //name
      name = "linkReader configuration";

      //fields
      embedFields.push({
        name: `**Server**:`,
        value: `${interaction.guild.name} (${interaction.guild.id})`,
      });
      embedFields.push({
        name: `**Blocked channels**:`,
        value: blocked.join(", "),
      });
      embedFields.push({ name: `**Active**:`, value: activity });
    } else if (type == "other") {
      let { su } = guildConfig;
      if (su.length >= 1) su = snowflakeToMention(su, "USER");
      if (su.length == 0) su[0] = "**none set**";

      //name
      name = "other configurations";

      //fields
      embedFields.push({
        name: `**Server**:`,
        value: `${interaction.guild.name} (${interaction.guild.id})`,
      });
      embedFields.push({ name: "**Super-users**:", value: su.join(", ") });
    }

    const embed = new MessageEmbed()
      .setFields(embedFields)
      .setTitle(name)
      .setFooter({ text: `requested by ${interaction.user.tag}` });

    interaction.update({ embeds: [embed] });
  },
});
