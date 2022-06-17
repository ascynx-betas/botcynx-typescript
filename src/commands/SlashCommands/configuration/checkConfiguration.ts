import { slashCommand } from "../../../structures/Commands";
import { ActionRowBuilder, Colors, EmbedBuilder, SelectMenuBuilder } from "discord.js";

export default new slashCommand({
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

    const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .addOptions([
          {
            label: "roleLinked configuration",
            description: "see configuration for the server about roleLinked",
            value: "roleLinked",
            emoji: "<:role:930783993991933993>",
          },
          {
            label: "Link reader configuration",
            description:
              "see the configuration for this server about the link reader feature",
            value: "linkReader",
            emoji: "<:read:930784208048242708>",
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
