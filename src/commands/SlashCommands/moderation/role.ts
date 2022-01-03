import { slashCommand } from "../../../structures/Commands";

export default new slashCommand({
  name: "role",
  description: "adds or removes a role from the target",
  userPermissions: ["MANAGE_ROLES"],
  botPermissions: ["MANAGE_ROLES"],
  category: "moderation",
  options: [
    {
      name: "role",
      description: "the role that will be added or removed",
      type: "ROLE",
      required: true,
    },
    {
      name: "user",
      description: "the target of the command",
      type: "USER",
      required: true,
    },
  ],

  run: async ({ interaction, client }) => {
    const role = interaction.options.getRole("role");
    const target = interaction.options.getUser("user");
    const roleId = role.id;

    const guildMember = interaction.guild.members.cache.get(target.id);
    if (role.managed === true)
      return interaction.followUp({
        content: `that role is either managed by a bot or discord`,
      });
    const guildClient = interaction.guild.members.cache.get(client.user.id);

    if (!guildMember.roles.cache.has(roleId)) {
      //add role
      if (
        role.position >= interaction.member.roles.highest.position &&
        interaction.member.id != interaction.guild.ownerId &&
        interaction.member.id != process.env.developerId
      )
        return interaction.followUp({
          content: `you do not have the required permission to give this role`,
        });
      if (role.position >= guildClient.roles.highest.position)
        return interaction.followUp({
          content: `I do not have the required permissions to add that role`,
        });

      guildMember.roles
        .add(roleId)
        .then(() =>
          interaction.followUp({
            content: `${role} was added to ${target}`,
            allowedMentions: { parse: [] },
          })
        )
        .catch(() =>
          interaction.followUp({
            content: ` I don't have permission to give that role`,
          })
        );
    } else {
      //remove role
      if (
        role.position >= interaction.member.roles.highest.position &&
        interaction.member.id != interaction.guild.ownerId &&
        interaction.member.id != process.env.developerId
      )
        return interaction.followUp({
          content: `you do not have the required permission to give this role`,
        });
      if (
        role.position >= guildClient.roles.highest.position ||
        guildMember.id == interaction.guild.ownerId
      )
        return interaction.followUp({
          content: `I do not have the required permissions to add that role`,
        });

      guildMember.roles
        .remove(roleId)
        .then(() =>
          interaction.followUp({
            content: `${role} was removed from ${target}`,
            allowedMentions: { parse: [] },
          })
        )
        .catch(() =>
          interaction.followUp({
            content: `I don't have permission to give that role`,
          })
        );
    }
  },
});
