import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { getUuidbyUsername } from "../personal-modules/mojang";
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

    const IdFields = interaction.customId.split(':');

    let uuid = IdFields[2];
    let speprofile = IdFields[3]
    let username = (await getUuidbyUsername(uuid)).name;
    const profile = await getSpecifiedProfile(uuid, speprofile).catch(
      () => null
    );
    if (profile == null) return;

    const data = await extractWeight(profile);

    const embedFields = data.embedFields;
    const profileName = data.profilename;
    const gameStage = data.gamestage

    const embed = new MessageEmbed()
      .setFields(embedFields)
      .setFooter({
        text: `requested by ${interaction.message.interaction.user.username}`,
      })
      .setColor(`RED`)
      .setAuthor({
        name: `${username}'s senither weight`,
        url: `https://sky.shiiyu.moe/stats/${username}/${profileName}`,
      })
      .setThumbnail(`https://mc-heads.net/avatar/${uuid}/100`)
      .setTitle(
        `profile: **\`\`${profileName}\`\`** username: **\`\`${username}\`\`**\ncurrent stage: **\`\`${gameStage}\`\`**`
      );

    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(`weight:lily:${uuid}:${speprofile}`)
        .setLabel("Press to get lily weight")
        .setStyle("SECONDARY")
    );

    return interaction.update({ embeds: [embed], components: [buttonRow] });
  },
});
