import { MessageEmbed } from "discord.js";
import { getPlayerByUuid, getStatus } from "../../../personal-modules/hypixel";
import { getUuidbyUsername } from "../../../personal-modules/mojang";
import { slashCommand } from "../../../structures/Commands";

export default new slashCommand({
  name: "stalk",
  description: "Allows to see the activity of a user on hypixel",
  require: ["hypixelApiKey"],
  category: "hypixel",
  cooldown: 2,
  options: [
    {
      name: "username",
      description: "the username of the person you want to stalk",
      required: true,
      type: "STRING",
    },
  ],

  run: async ({ interaction }) => {
    const username = interaction.options.getString("username");

    let uuid = await getUuidbyUsername(username).catch(() => null);

    if (uuid == null) {
      const description = `player not found`;
      const embed = new MessageEmbed()
        .setDescription(description)
        .setTitle(`Error 404: not found`)
        .setThumbnail(`https://http.cat/404`);
      return interaction.followUp({ embeds: [embed] });
    }

    const data = await getStatus(uuid.id).catch(() => null);

    if (data == null) {
      const description = `${uuid.name} never logged on mc.hypixel.net`;
      const embed = new MessageEmbed()
        .setDescription(description)
        .setTitle(`Error 404: not found`)
        .setThumbnail(`https://mc-heads.net/avatar/${username}/100`);
      return interaction.followUp({ embeds: [embed] });
    }

    let offline = !data.session.online;
    let timeSince: string;
    let status: string;
    if (offline == true) {
      //if offline
      const PlayerData = await getPlayerByUuid(uuid.id);
      if (!PlayerData || typeof PlayerData == "undefined")
        return interaction.followUp({
          content: `ERROR: couldn't get player data`,
        }); //! CHANGE THAT ONCE FULL FUNCTION IS WRITTEN
      if (!PlayerData.player?.lastLogin && !PlayerData.player?.lastLogout)
        status = "Appear Offline";
      //player has status set to Appear Offline
      else {
        const timestampSince = Math.round(PlayerData.player.lastLogout / 1000);
        console.log(Date.now(), timestampSince);

        timeSince = `<t:${timestampSince}:R>`;
      }
    }

    if (data.session != null) {
      const gameType = data.session.gameType;
      const gameMode = data.session.mode;
      const map = data.session.map;

      if (data.session.online === null || data.success == false) {
        const description = `${username} never logged on hypixel.net`;

        const embed = new MessageEmbed()
          .setDescription(description)
          .setTitle(`Error 404: couldn't get status information`)
          .setThumbnail(`https://mc-heads.net/avatar/${username}/100`);
        return interaction.followUp({ embeds: [embed] });
      }
      let description: string;
      if (typeof map == "undefined") {
        if (gameType == "SKYBLOCK") {
          //if in skyblock
          const gameModeTranslate = {
            combat_3: "The End",
            dynamic: "Private island",
            combat_2: "Blazing fortress",
            combat_1: "Spider's den",
            hub: "The hub",
            foraging_1: "The park",
            mining_1: "The gold mines",
            mining_2: "Deep caverns",
            mining_3: "Dwarven mines",
            crystal_hollows: "The crystal hollows",
            dungeon_hub: "The dungeon hub",
            farming_1: "The farming islands",
            dungeon: "Dungeons",
          };

          //translate api Ids into island names
          let gameModeTranslated = gameModeTranslate[gameMode];
          if (
            gameModeTranslated == null ||
            typeof gameModeTranslated == "undefined"
          ) {
            gameModeTranslated = "not currently coded in";
            console.log(gameMode, "Unknown skyblock island");
          }

          description = `${uuid.name} is currently online\n in Skyblock in ${gameModeTranslated}`;
        } else if (
          (typeof gameType == "undefined" && typeof offline == undefined) ||
          (offline == true && timeSince != undefined)
        ) {
          description = `${uuid.name} has been offline since ${timeSince}`;
        } else if (offline == true && typeof status != undefined) {
          description = `${uuid.name} is currently in status Appear Offline, I cannot get their current position / last time online`;
        } else
          description = `${uuid.name} is currently online\n Is in ${gameType} in the gamemode ${gameMode}`;
      } else
        description = `${uuid.name} is currently online\n in the game ${gameType} in the gamemode ${gameMode} in the map ${map}`;

      const embed = new MessageEmbed()
        .setAuthor({ name: `${uuid.name}` })
        .setDescription(description)
        .setFooter({ text: `requested by ${interaction.user.tag}` })
        .setColor("RANDOM")
        .setThumbnail(`https://mc-heads.net/avatar/${username}/100`);
      interaction.followUp({ embeds: [embed], allowedMentions: {} });
    }
  },
});
