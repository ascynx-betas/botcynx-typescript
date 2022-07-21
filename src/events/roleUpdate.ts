import { GuildMember, TextBasedChannel } from "discord.js";
import { botcynx } from "..";
import { configModel } from "../models/config";
import { compare, ct } from "../lib/personal-modules/testFor";
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

    if (
      config.disabledCommands.includes("roleLinked") ||
      (
        await configModel.findOne({ guildId: "global" })
      ).disabledCommands.includes("roleLinked")
    )
      return;

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

    let TSimOld = ct(oldRoles, trigger);
    let TSimNew = ct(newRoles, trigger);

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
      (botcynx.channels.cache.get(logchannel) as TextBasedChannel).send({
        content: `${newMember.user.tag} lost trigger role <@&${differences[0]}>`,
        allowedMentions: { parse: [] },
      });
      // fuse trigger and bypass and then check for them

      bypass = bypass.concat(trigger);
      let compareResult = compare(newRoles, bypass);
      if (compareResult !== false) return;

      let newMemberRemovables = newRoles.filter((x) => removable.includes(x));
      newMemberRemovables.forEach(function (removable) {
        newMember.roles.remove(removable);
        (botcynx.channels.cache.get(logchannel) as TextBasedChannel).send({
          content: `removed <@&${removable}> from ${newMember}(${newMember.user.tag})`,
          allowedMentions: { parse: [] },
        });
      });
    }
  }
);
