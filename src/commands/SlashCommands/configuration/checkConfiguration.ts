import { SlashCommand } from "../../../structures/Commands";
import {
  ActionRowBuilder,
  Colors,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { emojis } from "../../../lib/emojis";

export default new SlashCommand({
  name: "serverconfig",
  description:
    "Allows a server administrator to see the configuration of the server",
  require: ["mongooseConnectionString"],
  userPermissions: ["ManageRoles"],
  category: "configuration",

  run: async ({ interaction }) => {
    const description = `use the select menu under this message to choose which category of settings you want to see`;
    const embed = new EmbedBuilder()
      .setAuthor({ name: `configuration` })
      .setDescription(description)
      .setColor(Colors.Blue)
      .setTimestamp(Date.now());

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .addOptions([
          {
            label: "roleLinked configuration",
            description: "see configuration for the server about roleLinked",
            value: "roleLinked",
            emoji: emojis.role,
          },
          {
            label: "Link reader configuration",
            description:
              "see the configuration for this server about the link reader feature",
            value: "linkReader",
            emoji: emojis.read,
          },
          {
            label: "other configurations",
            description:
              "configurations that are not classified under the other categories",
            value: "other",
            emoji: "🔧",
          },
        ])
        .setCustomId(`settings`)
    );

    interaction.followUp({
      embeds: [embed],
      allowedMentions: { parse: [] },
      components: [row],
    });
  },
});
