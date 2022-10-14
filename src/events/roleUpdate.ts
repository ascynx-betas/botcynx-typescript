import { Embed, EmbedBuilder, GuildMember, TextBasedChannel } from "discord.js";
import { botcynx } from "..";
import { configModel } from "../models/config";
import { compareTest } from "../lib/personal-modules/testFor";
import { Event } from "../structures/Event";
import { isDisabled } from "../lib/command/commandInhibitors";

export default new Event(
  "guildMemberUpdate",
  async (oldMember: GuildMember, newMember: GuildMember) => {
    let botPermissions = oldMember.guild.members.me.permissions.toArray();

    if (
      !botPermissions.includes("ManageRoles") &&
      !botPermissions.includes("Administrator")
    )
      return; //permission check

    const guild = oldMember.guild;
    const config = await configModel.findOne({
      guildId: guild.id,
    });

    //if (isDisabled({ name: "roleLinked" }, guild)) return;

    //if (
    //  !oldMember.communicationDisabledUntilTimestamp &&
    //  newMember.communicationDisabledUntilTimestamp
    //) {
    //  //user is timeouted
    //
    //  let auditLogs = await newMember.guild.fetchAuditLogs({
    //    type: "MEMBER_UPDATE",
    //  });
    //  auditLogs.entries.filter((log) => log.target.id == oldMember.id);
    //  let log = auditLogs.entries.get(auditLogs.entries.firstKey());
    //  const reason = log.reason;
    //
    //}
    let { trigger, removable, bypass, logchannel } = config;

    if (trigger.length == 0 || removable.length == 0) return;
    const oldRoles = oldMember.roles.cache.map((r) => r.id);
    const newRoles = newMember.roles.cache.map((r) => r.id);

    let TSimOld = compareTest(oldRoles, trigger);
    let TSimNew = compareTest(newRoles, trigger);

    if (
      TSimOld.breakingcount < TSimNew.breakingcount ||
      (typeof TSimOld.breakingcount === "undefined" &&
        TSimNew.breakingcount > 0)
    ) {
      let differences = newRoles.filter((x) => !oldRoles.includes(x));
      return (botcynx.channels.cache.get(logchannel) as TextBasedChannel).send({
        content: `${oldMember.user.tag} now has trigger role <@&${differences[0]}>`,
        allowedMentions: { parse: [] },
      });
    }

    if (
      TSimOld.breakingcount > TSimNew.breakingcount ||
      (typeof TSimNew.breakingcount === "undefined" &&
        TSimOld.breakingcount > 0)
    ) {
      let differences = oldRoles.filter((x) => !newRoles.includes(x));
      const roleDiffs: {bot: boolean, role: string, type: "removable" | "trigger" | "bypass"}[] = [];
      roleDiffs.push({bot: false, role: differences[0], type: "trigger"});
      // fuse trigger and bypass and then check for them

      bypass = bypass.concat(trigger);
      let compareResult = compareTest(newRoles, bypass).success;
      if (compareResult !== false) return;

      let newMemberRemovables = newRoles.filter((x) => removable.includes(x));

      newMemberRemovables.forEach(function (removable) {
        newMember.roles.remove(removable);
        roleDiffs.push({bot: true, role: removable, type: "removable"});
      });

      const embed = new EmbedBuilder();

      embed.setTitle("RoleLinked - Diff");

      for (let i = 0; i < roleDiffs.length; i++) {
        if (i == 24) {
          embed.addFields([{
            name: `- cannot show more.`,
            value: ""
          }]);
          break;
        }
        let modified = roleDiffs[i];
        embed.addFields([{
          name: `- role (${modified.bot ? "auto" : "manual"})`,
          value: `${modified.type == "trigger" ? `${newMember.user.tag} lost trigger role <@&${modified.role}>` : modified.type == "removable" ? `remove <@&${modified.role}> from ${newMember}` : "Error: please report this to the developer!"}`
        }]);
      }


      if (logchannel != null) {
        (botcynx.channels.cache.get(logchannel) as TextBasedChannel).send({
          allowedMentions: {parse: []},
          embeds: [embed]
        });
      }
    }
  }
);
