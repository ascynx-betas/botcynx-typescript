import { GuildMember, TextBasedChannel } from "discord.js";
import { botcynx } from "..";
import { configModel } from "../models/config";
import { compare, ct } from "../personal-modules/testFor";
import { Event } from "../structures/Event";

export default new Event("guildMemberUpdate", async (oldMember: GuildMember, newMember: GuildMember) => {
  let botPermissions = oldMember.guild.me.permissions.toArray();

  if (
    !botPermissions.includes("MANAGE_ROLES") &&
    !botPermissions.includes("ADMINISTRATOR")
  )
    return; //permission check

  const guild = oldMember.guild;
  const config = await configModel.find({
    guildId: guild.id,
  });
  if (config[0].disabledCommands.includes("roleLinked")) return;
  let { trigger, removable, bypass, logchannel } = config[0];

  if (trigger.length == 0 || removable.length == 0) return;
  const oldMemberRoles = oldMember.roles.cache.map((r) => r.id);
  const newMemberRoles = newMember.roles.cache.map((r) => r.id);

  let TriggerSimilaritiesOldmember = ct(oldMemberRoles, trigger);
  let TriggerSimilaritiesNewmember = ct(newMemberRoles, trigger);

  if (
    TriggerSimilaritiesOldmember.breakingcount <
      TriggerSimilaritiesNewmember.breakingcount ||
    (typeof TriggerSimilaritiesOldmember.breakingcount === "undefined" &&
      TriggerSimilaritiesNewmember.breakingcount > 0)
  ) {
    let differences = newMemberRoles.filter((x) => !oldMemberRoles.includes(x));
    return (botcynx.channels.cache.get(logchannel) as TextBasedChannel).send({
      content: `${oldMember.user.tag} now has trigger role <@&${differences[0]}>`,
      allowedMentions: { parse: [] },
    });
  }

  if (
    TriggerSimilaritiesOldmember.breakingcount >
      TriggerSimilaritiesNewmember.breakingcount ||
    (typeof TriggerSimilaritiesNewmember.breakingcount === "undefined" &&
      TriggerSimilaritiesOldmember.breakingcount > 0)
  ) {
    let differences = oldMemberRoles.filter((x) => !newMemberRoles.includes(x));
    (botcynx.channels.cache.get(logchannel) as TextBasedChannel).send({
      content: `${newMember.user.tag} lost trigger role <@&${differences[0]}>`,
      allowedMentions: { parse: [] },
    });
    // fuse trigger and bypass and then check for them

    bypass = bypass.concat(trigger);
    let compareResult = compare(newMemberRoles, bypass);
    if (compareResult !== false) return;

    let newMemberRemovables = newMemberRoles.filter((x) =>
      removable.includes(x)
    );
    newMemberRemovables.forEach(function (removable) {
      newMember.roles.remove(removable);
      (botcynx.channels.cache.get(logchannel) as TextBasedChannel).send({
        content: `removed <@&${removable}> from ${newMember.user.tag}`,
        allowedMentions: { parse: [] },
      });
    });
  }
});
