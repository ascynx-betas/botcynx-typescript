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

    if (!isDisabled({name: "roleLinked"}, guild)) return;

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
      const roleDiffs: RoleDiff[] = [];
      
      for (let diff of differences) {
        let type: "trigger" | "removable" | "bypass" = trigger.includes(diff) ? "trigger" : removable.includes(diff) ? "removable" : bypass.includes(diff) ? "bypass" : null;

        if (type == null) continue;
        roleDiffs.push({
          bot: false,
          role: diff,
          type: type,
          removed: false
        });
      };

      const embed = RoleDiffEmbedCreator(roleDiffs, newMember);
      
      return send(logchannel, embed);
    }

    if (
      TSimOld.breakingcount > TSimNew.breakingcount ||
      (typeof TSimNew.breakingcount === "undefined" &&
        TSimOld.breakingcount > 0)
    ) {
      let differences = oldRoles.filter((x) => !newRoles.includes(x));
      const roleDiffs: RoleDiff[] = [];
      roleDiffs.push({bot: false, role: differences[0], type: "trigger", removed: true});
      
      // fuse trigger and bypass and then check for them
      bypass = bypass.concat(trigger);

      let compareResult = compareTest(newRoles, bypass).success;
      if (compareResult !== false) {
        const embed = RoleDiffEmbedCreator(roleDiffs, newMember);
        embed.setTitle("RoleLinked - Diff");

        send(logchannel, embed);
        return;
      };

      let newMemberRemovables = newRoles.filter((x) => removable.includes(x));

      newMemberRemovables.forEach(function (removable) {
        newMember.roles.remove(removable);
        roleDiffs.push({bot: true, role: removable, type: "removable", removed: true});
      });

      const embed = RoleDiffEmbedCreator(roleDiffs, newMember);
      embed.setTitle("RoleLinked - Diff");


      send(logchannel, embed);
    }
  }
);

function send(logchannel: string, embed: Embed | EmbedBuilder) {
  if (logchannel != null && embed != null) {
    return (botcynx.channels.cache.get(logchannel) as TextBasedChannel).send({
      allowedMentions: {parse: []},
      embeds: [embed]
    });
  }
}

function RoleDiffEmbedCreator(roleDiff: RoleDiff[], member: GuildMember) {
  const embed = new EmbedBuilder();

  embed.setTitle("Diff");

  for (let i = 0; i < roleDiff.length; i++) {
    if (i == 24) {
      embed.addFields([{
        name: "Reached Diff limit",
        value: ""
      }]);
      break;
    }
    let modified = roleDiff[i];
    embed.addFields([{
      name: `${modified.removed ? "-" : "+"} role (${modified.bot ? "auto" : "manual"})`,
      value: `${modified.type == "trigger" ? `${member.user.tag} ${modified.removed ? "lost" : "now has"} trigger role <@&${modified.role}>` : modified.type == "removable" ? `removed <@&${modified.role}> from ${member}` : "Error: please report this to the developer!"}`
    }]);
  }

  return embed;
}

export type RoleDiff = {
  bot: boolean,
  role: string,
  type: "removable" | "trigger" | "bypass",
  removed?: boolean
}
