import { UserContextCommand } from "../../../structures/Commands";
import {
  ApplicationCommandType,
  EmbedBuilder,
  UserContextMenuCommandInteraction,
} from "discord.js";

export default new UserContextCommand({
  name: "getAvatar",
  type: ApplicationCommandType.User,
  category: "information",

  run: async ({ client, interaction }) => {
    const user = await client.users.fetch(
      (interaction as UserContextMenuCommandInteraction).targetId
    );

    const embed = new EmbedBuilder()
      .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL({ forceStatic: false }),
      })
      .setImage(user.displayAvatarURL({ forceStatic: false }));

    (interaction as UserContextMenuCommandInteraction)
      .followUp({ embeds: [embed], ephemeral: true })
      .catch(() => null);
  },
});
