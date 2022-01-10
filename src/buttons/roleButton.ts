import { ButtonResponse } from "../structures/Commands";

export default new ButtonResponse({
    category: "role",
    botPermissions:["MANAGE_ROLES"],
    run: async({ interaction, client }) => {
        const fields = interaction.customId.split(':');
        const roleId = fields[1];
        const member = interaction.guild.members.cache.get(interaction.user.id);
        const role = interaction.guild.roles.cache.get(roleId);

        if (interaction.guild.me.roles.highest.position <= role.position) return interaction.reply({content: `I cannot give you ${role}`, ephemeral: true})

        if (member.roles.cache.has(roleId)) {
            member.roles.remove(roleId).then((member) => interaction.reply({content: `${member.nickname}, you lost ${role}`, ephemeral: true}));

        } else member.roles.add(roleId).then((member) => interaction.reply({content: `${member.nickname}, you gained ${role}`, ephemeral: true}));
        
    }
})