import { slashCommand } from "../../../structures/Commands";
import {
  ApplicationCommandOptionType,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
} from "discord.js";
import { verifyModel } from "../../../models/verifyModel";
import { getUuidbyUsername } from "../../../lib/personal-modules/mojang";
import { getPlayerByUuid } from "../../../lib/personal-modules/hypixel";
import {
  extractWeight,
  getFatterProfile,
  getSpecifiedProfile,
} from "../../../lib/personal-modules/senither";
import { uuid } from "../../../typings/ApiInterface";
import { coolPeopleUUID, coolTypeToEmojis } from "../../../lib/coolPeople";

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
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "profile",
      description: "the profile you want to see the weight of",
      required: false,
      type: ApplicationCommandOptionType.String,
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
      uuid = (uuid as uuid).id;
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
      data = await getSpecifiedProfile(uuid as string, profile).catch(
        () => null
      );

      if (!data || data == null) {
        const embed = new EmbedBuilder()
          .setDescription(`player not found or profile provided does not exist`)
          .setFooter({ text: `requested by ${interaction.user.tag}` })
          .setAuthor({ name: `Error 404: not found` })
          .setThumbnail(`https://http.cat/404`);
        return interaction.followUp({ embeds: [embed] });
      }
    } else {
      data = await getFatterProfile(uuid as string).catch(() => null);

      if (!data || data == null) {
        const embed = new EmbedBuilder()
          .setDescription(`player not found or profile provided does not exist`)
          .setFooter({ text: `requested by ${interaction.user.tag}` })
          .setAuthor({ name: `Error 404: not found` })
          .setThumbnail(`https://http.cat/404`);
        return interaction.followUp({ embeds: [embed] });
      }
    }

    const result = await extractWeight(data);
    if (result == null) {
      const embed = new EmbedBuilder()
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
    const gameStage = result.gamestage;


    let displayName: string;
    if (coolPeopleUUID[uuid as string]) {
      displayName = coolTypeToEmojis[coolPeopleUUID[uuid as string]];
    };

    const embed = new EmbedBuilder()
      .setFields(embedFields)
      .setFooter({ text: `requested by ${interaction.user.tag}` })
      .setAuthor({
        name: `${username}'s senither weight`,
        url: `https://sky.shiiyu.moe/stats/${username}/${profilename}`,
      })
      .setThumbnail(`https://mc-heads.net/avatar/${uuid}/100`)
      .setTitle(
        `profile: **\`\`${profilename}\`\`** username: ${displayName ? displayName + " " : ""}**\`\`${username}\`\`**\ncurrent stage: **\`\`${gameStage}\`\`**`
      );

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`weight:lily:${uuid}:${profilename}`)
        .setLabel("Press to get lily weight")
        .setStyle(ButtonStyle.Secondary)
    );

    interaction
      .followUp({
        embeds: [embed],
        components: [buttonRow],
        allowedMentions: { parse: [] },
      })
      .catch(() => null);
  },
});
