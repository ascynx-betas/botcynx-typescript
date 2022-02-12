import { EmbedFieldData, MessageEmbed } from "discord.js";
import { coolPeopleUUId, coolTypeToEmojis } from "../../../lib/coolPeople";
import { verifyModel } from "../../../models/verifyModel";
import { getPlayerByUuid, getStatus } from "../../../personal-modules/hypixel";
import { getUuidbyUsername } from "../../../personal-modules/mojang";
import { slashCommand } from "../../../structures/Commands";

export default new slashCommand({
  name: "hypixel",
  description: "send informations about a user",
  require: ["hypixelApiKey", "mongooseConnectionString"],
  category: "hypixel",
  cooldown: 2,
  options: [
    {
      name: "username",
      description: "ign of the player",
      type: "STRING",
      required: false,
    },
  ],

  run: async ({ interaction, client }) => {
    let username = interaction.options.getString("username");
    let uuid: any;
    if (!username) {
      //!GET INFORMATION FROM DATABASE

      const userId = interaction.user.id;

      const userInfo = await verifyModel.find({
        userId: userId,
      });
      let info = userInfo[0];

      if (!userInfo?.length)
        return interaction.followUp({
          content: `please provide the username parameter or verify using the /verify command`,
        });

      uuid = info.minecraftuuid; //update uuid when info is received
    }

    if (typeof uuid === "undefined") {
      uuid = await getUuidbyUsername(username).catch(() => null);

      if (uuid == null)
        return interaction.followUp({ content: `couldn't fetch uuid` });

      uuid = uuid.id;
    } else {
      const data = await getPlayerByUuid(uuid).catch(() => null);
      username = data.player?.displayname;

      if (!username)
        return interaction.followUp({
          content: `it seems as though the player doesn't exist on the hypixel api`,
        });
    }
    let isVerified: boolean;

    //if verified
    const verified = await verifyModel.find({
      minecraftuuid: uuid,
    });

    if (typeof verified === "undefined" || !verified || verified.length == 0) {
      isVerified = false;
    } else isVerified = true;

    let discord: any = await getPlayerByUuid(uuid).catch(() => null);
    if (discord) {
      discord = discord?.player?.socialMedia?.links?.DISCORD;
      let isInCache = client.users.cache.filter((u) => u.tag === discord);
      if (isInCache.size > 0) {
        let user = isInCache.map((u) => u.toString());
        discord = discord + " - " + user;
      }
    }
    if (!discord) discord = "couldn't fetch discord";
    let coolRank: string;
    let displayName: string;
    if (typeof coolPeopleUUId[uuid] != "undefined") {
      coolRank = coolPeopleUUId[uuid];
      coolRank = coolTypeToEmojis[coolRank];
      displayName = coolRank + " " + username;
    }

    let status = await getStatus(uuid).catch(() => null);
    status = status.session.online;

    if (uuid === null || username === null)
      return interaction.followUp({ content: `player not found` });

    let embedFields: EmbedFieldData[] = [];
    embedFields.push({
      name: "username:",
      value: displayName || username || "Error",
    });
    embedFields.push({
      name: "Linked discord account:",
      value: discord || "no linked accounts",
    });
    embedFields.push({
      name: "online:",
      value: `${status ? "🟢" : "🔴"}` || "Error",
    });
    embedFields.push({
      name: "verified",
      value: `${isVerified ? "🟢" : "🔴"}` || "Error",
    });

    if (uuid) {
      embedFields.splice(1, 0, { name: "UUID:", value: uuid || "Error" });
    } else {
      embedFields.splice(1, 0, {
        name: "UUID:",
        value: verified[0].minecraftuuid || "Error",
      });
    }

    let embed = new MessageEmbed()
      .setTitle(`Informations about ${displayName || username || "Error"}`)
      .setColor("RANDOM")
      .setFields(embedFields)
      .setFooter({ text: `requested by ${interaction.user.tag}` })
      .setThumbnail(`https://mc-heads.net/avatar/${username}/100`);

    interaction.followUp({ embeds: [embed] });

    //create embed / send it
  },
});
