import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
} from "discord.js";
import { getUsername } from "../personal-modules/mojang";
import {
  extractWeight,
  getSpecifiedProfile,
} from "../personal-modules/senither";
import { ButtonResponse } from "../structures/Commands";

export default new ButtonResponse({
  category: "weight",
  customId: "senither",
  temporary: true,
  require: ["hypixelApiKey"],
  onlyAuthor: true,
  run: async ({ interaction, client }) => {
    const IdFields = interaction.customId.split(":");

    let uuid = IdFields[2];
    let speprofile = IdFields[3];
    let username = await getUsername(uuid);
    const profile = await getSpecifiedProfile(uuid, speprofile).catch(
      () => null
    );
    if (profile == null) return;

    const data = await extractWeight(profile);

    const embedFields = data.embedFields;
    const profileName = data.profilename;
    const gameStage = data.gamestage;

    const embed = new EmbedBuilder()
      .setFields(embedFields)
      .setFooter({
        text: `requested by ${interaction.message.interaction.user.username}`,
      })
      .setColor(Colors.Red)
      .setAuthor({
        name: `${username}'s senither weight`,
        url: `https://sky.shiiyu.moe/stats/${username}/${profileName}`,
      })
      .setThumbnail(`https://mc-heads.net/avatar/${uuid}/100`)
      .setTitle(
        `profile: **\`\`${profileName}\`\`** username: **\`\`${username}\`\`**\ncurrent stage: **\`\`${gameStage}\`\`**`
      );

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`weight:lily:${uuid}:${speprofile}`)
        .setLabel("Press to get lily weight")
        .setStyle(ButtonStyle.Secondary)
    );

    return interaction.update({
      embeds: [embed],
      components: [buttonRow],
      allowedMentions: { parse: [] },
    });
  },
});
