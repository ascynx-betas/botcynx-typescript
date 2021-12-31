import { UserContextCommand } from "../../../structures/Commands";
import { MessageEmbed } from 'discord.js'

export default new UserContextCommand({
  name: "getAvatar",
  type: "USER",

  run: async ({ client, interaction }) => {
    const user = await client.users.fetch(interaction.targetId);

    const embed = new MessageEmbed()
      .setAuthor({name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true })})
      .setImage(user.displayAvatarURL({ dynamic: true }));

    interaction
      .followUp({ embeds: [embed], ephemeral: true })
      .catch(() => null);
  },
});
