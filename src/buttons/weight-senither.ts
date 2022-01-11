import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
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
    let uuid = interaction.message.embeds[0].thumbnail.url;
    uuid = uuid.slice(28, uuid.length - 4);
    let profilename = interaction.message.embeds[0].author.url;
    profilename = profilename.slice(29, profilename.length);
    const fields = profilename.split("/");
    const speprofile = fields[1];
    const username = fields[0];
    const profile = await getSpecifiedProfile(uuid, speprofile).catch(
      () => null
    );
    if (profile == null) return;

    const data = await extractWeight(profile);

    const description = data.description;
    const profileName = data.profilename;

    const embed = new MessageEmbed()
      .setDescription(description)
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
        `profile: **\`\`${profileName}\`\`** username: **\`\`${username}\`\`**`
      );

    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("weight:lily")
        .setLabel("Press to get lily weight (WIP)")
        .setStyle("SECONDARY")
    );

    return interaction.update({ embeds: [embed], components: [buttonRow] });
  },
});