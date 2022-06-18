import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
} from "discord.js";
import { setButtonRows } from "../../../personal-modules/discordPlugin";
import { slashCommand } from "../../../structures/Commands";

export default new slashCommand({
  name: "bot-info",
  description: "gives informations about the bot and it's creator",
  category: "information",

  run: async ({ interaction, client }) => {
    const interactionCommands: any = client.ArrayOfSlashCommands.concat(
      client.commands
    );
    let types: string[] = interactionCommands.map((c) => c.category || "other");
    types = [...new Set(types)];
    const description = `
    **bot Mention**: ${client.user} **developer**: ${
      client.users.cache.get(process.env.developerId).tag
    } (${process.env.developerId})\nin ${
      client.guilds.cache.size
    } guilds, serving ${client.users.cache.size} users\n
    [**ToS and privacy policy**](https://ascynx-betas.github.io/botcynx-webpage/html/PrivacyandTos.html)`;
    let arrayOfButtons: ButtonBuilder[] = [];
    types.forEach(function (type) {
      const button = new ButtonBuilder()
        .setCustomId(`info:${type}`)
        .setLabel(`${type}`)
        .setStyle(ButtonStyle.Secondary);

      arrayOfButtons.push(button as ButtonBuilder);
    });
    if (arrayOfButtons.length >= 25)
      return interaction.followUp({
        content: `there are too many categories to create enough buttons`,
      });
    let components: ActionRowBuilder<ButtonBuilder>[] = await setButtonRows(
      arrayOfButtons
    );

    const embed = new EmbedBuilder()
      .setDescription(description)
      .setTitle("Information")
      .setFooter({ text: `requested by ${interaction.user.tag}` });

    interaction.followUp({
      embeds: [embed],
      components: components,
      allowedMentions: { parse: [] },
    });
  },
});
