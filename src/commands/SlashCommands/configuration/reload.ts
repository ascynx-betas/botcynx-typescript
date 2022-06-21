import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { configModel } from "../../../models/config";
import { ct } from "../../../lib/personal-modules/testFor";
import { slashCommand } from "../../../structures/Commands";

export default new slashCommand({
  name: "reload",
  description: "runs the configuration of the current server",
  require: ["mongooseConnectionString"],
  userPermissions: ["ManageRoles"],
  botPermissions: ["ManageRoles"],
  category: "configuration",
  options: [
    {
      name: "testrun",
      description: "test run of the command",
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
  ],

  run: async ({ interaction }) => {
    let isTestRun = interaction.options.getBoolean("testrun") || false;

    const guild = interaction.guild;
    const guildId = guild.id;

    const config = await configModel.find({
      guildId: guildId,
    });
    let removable: string[] = config[0].removable;
    let r: string[] = config[0].removable;

    if (removable.length < 1)
      return interaction.followUp({
        content: `there's no removable roles, set some then come back later`,
      });
    let bypass = config[0].bypass || [];
    let trigger = config[0].trigger || [];
    bypass = bypass.concat(trigger); // fuse trigger and bypass arrays
    let affectedMembers: string[] = [];

    await guild.members.fetch();

    removable.forEach(function (removable) {
      const members = guild.members.cache.filter((m) =>
        m.roles.cache.has(removable)
      ); // get all members that have the selected role

      members.forEach(function (member) {
        let roles = guild.members.cache
          .get(member.id)
          .roles.cache.map((r) => r.id);
        if (roles.includes(removable)) {
          let has;
          if (bypass.length > 0) {
            has = ct(roles, bypass);
          } else {
            has = { success: false };
          }
          if (has.success === false) {
            if (isTestRun == false) {
              guild.members.cache
                .get(member.id)
                .roles.remove(removable)
                .catch();
              affectedMembers.push(String(member));
            } else if (isTestRun == true) {
              affectedMembers.push(String(member));
            }
          }
        }
      });
      let index = r.indexOf(removable);
      if (index >= r.length - 1) {
        const affectedString =
          affectedMembers.join("\n") || "**no members were affected**";
        let description: string;

        if (isTestRun == true)
          description = `Test run\n **Affected members**:\n${affectedString}`;
        if (isTestRun == false)
          description = `**Affected members**:\n${affectedString}`;

        const embed = new EmbedBuilder()
          .setDescription(description)
          .setTitle("**results**")
          .setFooter({ text: `purge executed by ${interaction.user.tag}` });

        return interaction.followUp({ embeds: [embed] });
      }
      if (index >= r.length - 1)
        return interaction.followUp({
          content: `the command seems to have run into an error`,
        });
    });
  },
});
