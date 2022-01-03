import { slashCommand } from "../../../structures/Commands";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { verifyModel } from "../../../models/verifyModel";
import { getUuidbyUsername } from "../../../personal-modules/mojang";
import { getPlayerByUuid } from "../../../personal-modules/hypixel";
import {
  extractWeight,
  getFatterProfile,
  getSpecifiedProfile,
} from "../../../personal-modules/senither";

export default new slashCommand({
  name: "weight",
  description: "get the weight of someone",
  require: ["hypixelApiKey", "mongooseConnectionString"],
  category: "hypixel",
  options: [
    {
      name: "username",
      description: "the user you want the see the profiles of",
      required: false,
      type: "STRING",
    },
    {
      name: "profile",
      description: "the profile you want to see the weight of",
      required: false,
      type: "STRING",
    },
  ],

  run: async ({ interaction }) => {
    let username: string = interaction.options.getString("username");
    let profile: string = interaction.options.getString("profile");
    let uuid: string;
    let data: any;

    if (!username) {
      const userInfo = await verifyModel.find({
        userId: interaction.user.id,
      });
      uuid = userInfo[0]?.minecraftuuid;

      if (!uuid)
        return interaction.followUp({
          content: `please enter the username of the person you want to see the weight of`,
        });
    }

    if (typeof uuid == "undefined") {
      uuid = (await getUuidbyUsername(username)).id;
      if (uuid == null)
        return interaction.followUp({
          content: `please enter the username of the person you want to see the weight of`,
        });
    } else {
      const data = await getPlayerByUuid(uuid).catch(() => null);

      if (!data)
        return interaction.followUp({
          content: `error while trying to fetch username`,
        });

      username = data.player.displayname;
    }

    if (profile) {
      profile = profile.toLowerCase();

      if (
        profile != "apple" &&
        profile != "banana" &&
        profile != "blueberry" &&
        profile != "coconut" &&
        profile != "cucumber" &&
        profile != "grapes" &&
        profile != "kiwi" &&
        profile != "lemon" &&
        profile != "lime" &&
        profile != "mango" &&
        profile != "orange" &&
        profile != "papaya" &&
        profile != "pear" &&
        profile != "pineapple" &&
        profile != "pomegranate" &&
        profile != "raspberry" &&
        profile != "strawberry" &&
        profile != "tomato" &&
        profile != "watermelon" &&
        profile != "zucchini" &&
        profile != "peach"
      ) {
        const embed = new MessageEmbed()
          .setDescription(
            `${profile} doesn't seem to match any possible profile names, if you feel like that's an error, please contact the developer`
          )
          .setFooter({ text: `requested by ${interaction.user.tag}` })
          .setAuthor({ name: `Error 501: blocked request` })
          .setThumbnail(`https://http.cat/501`);
        return interaction.followUp({ embeds: [embed] });
      }

      data = await getSpecifiedProfile(uuid, profile).catch(() => null);

      if (typeof data == "undefined" || !data) {
        const embed = new MessageEmbed()
          .setDescription(`player not found or profile provided does not exist`)
          .setFooter({ text: `requested by ${interaction.user.tag}` })
          .setAuthor({ name: `Error 404: not found` })
          .setThumbnail(`https://http.cat/404`);
        return interaction.followUp({ embeds: [embed] });
      }
    } else {
      data = await getFatterProfile(uuid).catch(() => null);

      if (typeof data == "undefined" || !data) {
        const embed = new MessageEmbed()
          .setDescription(`player not found or profile provided does not exist`)
          .setFooter({ text: `requested by ${interaction.user.tag}` })
          .setAuthor({ name: `Error 404: not found` })
          .setThumbnail(`https://http.cat/404`);
        return interaction.followUp({ embeds: [embed] });
      }
    }

    const result = await extractWeight(data);
    if (result == null) {
      const embed = new MessageEmbed()
        .setDescription(`this profile doesn't have api on`)
        .setFooter({ text: `requested by ${interaction.user.tag}` })
        .setAuthor({ name: `Error 404: not found` })
        .setThumbnail(`https://http.cat/404`);
      return interaction.followUp({
        content: `https://sky.shiiyu.moe/resources/video/enable-api.webm`,
        embeds: [embed],
      });
    }

    const description = result.description;
    const profilename = result.profilename;

    const embed = new MessageEmbed()
      .setDescription(description)
      .setFooter({ text: `requested by ${interaction.user.tag}` })
      .setAuthor({
        name: `${username}'s senither weight`,
        url: `https://sky.shiiyu.moe/stats/${username}/${profilename}`,
      })
      .setThumbnail(`https://mc-heads.net/avatar/${uuid}/100`)
      .setTitle(
        `profile: **\`\`${profilename}\`\`** username: **\`\`${username}\`\`**`
      );

    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(`weight lily`)
        .setLabel("Press to get lily weight (WIP)")
        .setStyle("SECONDARY")
    );

    interaction
      .followUp({ embeds: [embed], components: [buttonRow] })
      .catch(() => null);
  },
});
