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
import { uuid } from "../../../typings/ApiInterface";
import { coolPeopleUUId, coolTypeToEmojis } from "../../../lib/coolPeople";

export default new slashCommand({
  name: "weight",
  description: "get the weight of someone",
  require: ["hypixelApiKey", "mongooseConnectionString"],
  category: "hypixel",
  cooldown: 2,
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
    let uuid: uuid | string;
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
      uuid = await getUuidbyUsername(username);
      if (uuid == null)
        return interaction.followUp({
          content: `please enter the username of the person you want to see the weight of`,
        });
      uuid = uuid.id;
    } else {
      const data = await getPlayerByUuid(uuid as string).catch(() => null);

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

      data = await getSpecifiedProfile(uuid as string, profile).catch(
        () => null
      );

      if (typeof data == "undefined" || !data || data == null) {
        const embed = new MessageEmbed()
          .setDescription(`player not found or profile provided does not exist`)
          .setFooter({ text: `requested by ${interaction.user.tag}` })
          .setAuthor({ name: `Error 404: not found` })
          .setThumbnail(`https://http.cat/404`);
        return interaction.followUp({ embeds: [embed] });
      }
    } else {
      data = await getFatterProfile(uuid as string).catch(() => null);

      if (typeof data == "undefined" || !data || data == null) {
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

    const embedFields = result.embedFields;
    const profilename = result.profilename;
    const gameStage = result.gamestage

    let coolRank: string;
    
    let displayName: string = username;
    if (typeof coolPeopleUUId[(uuid as string)] != "undefined") {
      coolRank = coolPeopleUUId[(uuid as string)];
      coolRank = coolTypeToEmojis[coolRank];
      displayName = coolRank

    }

    const embed = new MessageEmbed()
      .setFields(embedFields)
      .setFooter({ text: `requested by ${interaction.user.tag}` })
      .setAuthor({
        name: `${username}'s senither weight`,
        url: `https://sky.shiiyu.moe/stats/${username}/${profilename}`,
      })
      .setThumbnail(`https://mc-heads.net/avatar/${uuid}/100`)
      .setTitle(
        `profile: **\`\`${profilename}\`\`** username: ${displayName} **\`\`${username}\`\`**\ncurrent stage: **\`\`${gameStage}\`\`**`
      );

    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(`weight:lily`)
        .setLabel("Press to get lily weight")
        .setStyle("SECONDARY")
    );

    interaction
      .followUp({ embeds: [embed], components: [buttonRow] })
      .catch(() => null);
  },
});
