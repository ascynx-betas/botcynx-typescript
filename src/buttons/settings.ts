import { MessageEmbed } from "discord.js";
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
    let description: string;

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

      //join information together
      removable.join(", ");
      trigger.join(", ");
      bypass.join(", ");

      description = `roleLink configuration\n
            server: ${interaction.guild.name}/${interaction.guild.id}\n
            removable roles: ${removable}\n
            trigger roles: ${trigger}\n
            bypass roles: ${bypass}\n
            Logging channel: ${logchannel}`;
    } else if (type == "linkReader") {
      let { blocked } = guildConfig;
      if (blocked.length >= 1) blocked = snowflakeToMention(blocked, "CHANNEL");
      if (blocked.length == 0) blocked[0] = "**none set**";
      blocked.join(", ");

      description = `link reader configuration\n
            server: ${interaction.guild.name}/${interaction.guild.id}\n
            blocked channels: ${blocked}`;
    } else if (type == "other") {
      let { su } = guildConfig;
      if (su.length >= 1) su = snowflakeToMention(su, "USER");
      if (su.length == 0) su[0] = "**none set**";
      su.join(", ");

      description = `non-categorized configuration\n
            server: ${interaction.guild.name}/${interaction.guild.id}\n
            super users: ${su}`;
    }

    const embed = new MessageEmbed()
      .setDescription(description)
      .setTitle("configuration")
      .setFooter({ text: `requested by ${interaction.user.tag}` });

    interaction.update({ embeds: [embed] });
  },
});
