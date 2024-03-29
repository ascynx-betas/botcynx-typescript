import {
  ApplicationCommandOptionType,
  GuildTextBasedChannel,
  EmbedBuilder,
  Role,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildMember,
} from "discord.js";
import {
  skillAverageCalculator,
  skillLevelCalculator,
} from "../../lib/hypixelSkillCalc";
import { verifyModel } from "../../models/verifyModel";
import {
  getPlayerByUuid,
  getProfiles,
} from "../../lib/HypixelAPIUtils";
import { getUuidbyUsername } from "../../lib/personal-modules/mojang";
import { getSpecifiedProfile } from "../../lib/personal-modules/senither";
import { WhitelistedCommand } from "../../structures/Commands";
import { ProfileMember } from "../../typings/Hypixel";
import { checkHypixelLinked } from "../../lib/utils";
import { botcynx } from "../..";

export default new WhitelistedCommand({
  name: "rolerequest",
  description: "get a role depending on if you follow it's requirement or not",
  options: [
    {
      name: "role",
      description: "the role you want to get",
      required: true,
      type: ApplicationCommandOptionType.Role,
    },
    {
      name: "username",
      description: "your minecraft username",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "profile",
      description: "the profile you want to get the data from",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],
  require: ["hypixelApiKey", "mongooseConnectionString"],
  run: async ({ client, interaction, args }) => {
    let username: string = args.get("username")?.value as string;
    let role = args.get("role")?.role;
    let uuid: any | string;
    let verified: boolean;

    if (!username) {
      //get info from database;

      let userInfo = await verifyModel.findOne({
        userId: interaction.user.id,
      });

      if (!userInfo)
        return interaction.followUp({
          content: `Missing username parameter, you can also verify using the /verify command`,
        });

      uuid = userInfo?.minecraftuuid;
      verified = true;
    } else {
      uuid = (await getUuidbyUsername(username));

      if (typeof uuid != "string") {
        return interaction.followUp({
          content: `Account doesn't exist or couldn't fetch it's uuid`,
        });
      }

      verified = checkHypixelLinked(
        interaction.user,
        (await getPlayerByUuid(uuid))?.player?.socialMedia?.links?.DISCORD
      );
    }

    if (!verified && interaction.user.id != process.env.developerId) {
      //added developer check for testing purposes
      const buttonrow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("See how I can Link My Account")
          .setStyle(ButtonStyle.Link)
          .setURL("https://i.gyazo.com/3a2358687dae9b4333fd2fef932e0a17.mp4")
      );

      return interaction.followUp({
        content: `that account isn't linked to ${interaction.user.tag}`,
        components: [buttonrow],
      });
    }

    if (!uuid) {
      return interaction.followUp({
        content: `Could not get uuid for account with username: ${username}`
      });
    }

    let hypixelData = await getProfiles(uuid);

    if (!hypixelData || hypixelData.size == 0)
      return interaction.followUp({
        content: `Error 404: no informations found. Try again later.`,
      });

    let profile = (args.get("profile")?.value as string)
      ? (args.get("profile")?.value as string).toLowerCase()
      : hypixelData
          .filter(
            (acc) =>
              acc.selected
          )
          .first()
          .cute_name.toLowerCase();

    let member;

    if (args.get("profile") != null) {
      let profiles = hypixelData?.filter(
        (profile) =>
          profile.cute_name.toLowerCase() ==
          (args.get("profile")?.value as string).toLowerCase()
      );
      if (profiles.size < 1)
        return interaction.followUp({
          content: `${args.get("profile")?.value} couldn't be found.`,
          allowedMentions: { parse: [] },
        });
      member = profiles.first().members[uuid];
    } else {
      let profile = hypixelData?.filter((acc) => acc.selected);
      if (profile.size < 1)
        return interaction.followUp({
          content: `Couldn't find a profile for user`,
        });
      member = profile.first().members[uuid];
    }

    if (!newWhitelistedRoles.getRoleFunction(role.id))
      return interaction.followUp({
        content: `${role} isn't in the whitelisted role list`,
        allowedMentions: { parse: [] },
      });

    const handleOtherCategoryRoles = async function () {
      let result = newWhitelistedRoles.hasLowerId(interaction.member, role.id);
      if (result.bool) {
        if (
          await newWhitelistedRoles.getRoleFunction(role.id)({
            member,
            profile: { cute_name: profile, uuid },
          })
        ) {
          await interaction.member.roles.remove(result.role).catch((e) =>
            interaction.followUp({
              content: `Error: couldn't remove <@&${result.role}>`,
              allowedMentions: { parse: [] },
            })
          );

          if (
            newWhitelistedRoles.hasLowerId(interaction.member, role.id, [
              result.role,
            ])
          ) {
            handleOtherCategoryRoles();
          } else return;
        }
      }
      return;
    };

    await handleOtherCategoryRoles();

    if (
      await newWhitelistedRoles.getRoleFunction(role.id)({
        member,
        profile: { cute_name: profile, uuid },
      })
    ) {
      return interaction.member.roles
        .add(role as Role)
        .catch((e) =>
          interaction.followUp({
            content: `Error: couldn't give role ${role}`,
            allowedMentions: { parse: [] },
          })
        )
        .then((e) => {
          interaction.followUp({
            content: `successfully gave role ${role}`,
            allowedMentions: { parse: [] },
          });
          //Logging
          (
            client?.channels?.cache?.get(
              "759097820694970458"
            ) as GuildTextBasedChannel
          )?.send({
            embeds: [
              new EmbedBuilder()
                .setTitle("Added Role")
                .setDescription(
                  `Added role ${role.toString()} to ${interaction.user.toString()}`
                )
                .setTimestamp(Date.now()),
            ],
            allowedMentions: { parse: [] },
          });
        });
    } else {
      return interaction.followUp({
        content: `You don't follow the requirement for ${role}, try using another profile than ${profile}`,
        allowedMentions: { parse: [] },
      });
    }
  },
  register: ({ guild }) => {
    guild.commands.create(botcynx.whitelistedCommands.get("rolerequest"));
  },
});

class WhitelistedRoles {
  List: {
    [key: string]: {
      [key: string]: (options: {
        member?: ProfileMember;
        profile?: { cute_name: string; uuid: string };
      }) => boolean | Promise<boolean>;
    };
  };

  constructor(list: {
    [key: string]: {
      [key: string]: (options: {
        member?: ProfileMember;
        profile?: { cute_name: string; uuid: string };
      }) => boolean | Promise<boolean>;
    };
  }) {
    this.List = list;
  }

  getRoleFunction(
    RoleId: string
  ): (options: {
    member?: ProfileMember;
    profile?: { cute_name: string; uuid: string };
  }) => boolean | Promise<boolean> {
    for (let category in this.List) {
      let ids: {
        [key: string]: (options: {
          member?: ProfileMember;
          profile?: { cute_name: string; uuid: string };
        }) => boolean | Promise<boolean>;
      } = this.List[category];

      for (let id in ids) {
        if (id != RoleId) continue;
        return ids[id];
      }
    }

    return null;
  }

  hasLowerId(
    member: GuildMember,
    roleId: string,
    ignoreList?: string[]
  ): { bool: boolean; role?: string } {
    if (!ignoreList) ignoreList = [];

    for (let category in this.List) {
      let ids: {
        [key: string]: (options: {
          member?: ProfileMember;
          profile?: { cute_name: string; uuid: string };
        }) => boolean | Promise<boolean>;
      } = this.List[category];

      for (let id in ids) {
        if (!ids[roleId]) break;
        if (
          member.roles.cache.has(id) &&
          id != roleId &&
          !ignoreList.includes(id)
        ) {
          return { bool: true, role: id };
        }
      }
    }

    return { bool: false };
  }
}

export const newWhitelistedRoles: WhitelistedRoles = new WhitelistedRoles({
  RevenantSlayer: {
    "904674428569391114": function (options) {
      //Revenant student
      return options?.member?.slayer_bosses?.zombie.xp >= 100000;
    },
    "904674474455097375": function (options) {
      //Revenant Mercenary
      return options?.member?.slayer_bosses?.zombie.xp >= 300000;
    },
    "904674523796865054": function (options) {
      //Master of the revenants
      return options?.member?.slayer_bosses?.zombie.xp >= 1000000;
    },
  },
  TarantulaSlayer: {
    "904674586262655006": function (options) {
      //Tarantula student
      return options?.member?.slayer_bosses?.spider.xp >= 100000;
    },
    "904674619863232532": function (options) {
      //Tarantula Mercenary
      return options?.member?.slayer_bosses?.spider?.xp >= 300000;
    },
    "904674655565131816": function (options) {
      //Tarantula Master
      return options?.member?.slayer_bosses?.spider?.xp >= 1000000;
    },
  },
  WolfSlayer: {
    "904674724431413259": function (options) {
      //Wolf student
      return options?.member?.slayer_bosses?.wolf?.xp >= 100000;
    },
    "904674753233690646": function (options) {
      //Wolf Mercenary
      return options?.member?.slayer_bosses?.wolf?.xp >= 300000;
    },
    "904674783826964480": function (options) {
      //Wolf master
      return options?.member?.slayer_bosses?.wolf?.xp >= 1000000;
    },
  },
  EndermanSlayer: {
    "913896494225047613": function (options) {
      //Void student
      return options?.member?.slayer_bosses?.enderman?.xp >= 100000;
    },
    "913896688974962749": function (options) {
      //Void mercenary
      return options?.member?.slayer_bosses?.enderman?.xp >= 300000;
    },
    "913896846387191868": function (options) {
      //Void master
      return options?.member?.slayer_bosses?.enderman?.xp >= 1000000;
    },
  },
  BlazeSlayer: {
    "984772580093353994": function (options) {
      //Blaze student
      return options?.member?.slayer_bosses?.blaze?.xp >= 100000;
    },
    "984774668013666304": function (options) {
      //Blaze Mercenary
      return options?.member?.slayer_bosses?.blaze?.xp >= 300000;
    },
    "984774669360062464": function (options) {
      //Blaze master
      return options?.member?.slayer_bosses?.blaze?.xp >= 1000000;
    },
  },
  MaxedSlayer: {
    "904674855436320788": function (options) {
      //Maxed Aatrox
      return (
        options?.member?.slayer_bosses?.zombie?.xp >= 1000000 &&
        options?.member?.slayer_bosses?.wolf?.xp >= 1000000 &&
        options?.member?.slayer_bosses?.spider?.xp >= 1000000 &&
        options?.member?.slayer_bosses?.enderman?.xp >= 1000000 &&
        options?.member?.slayer_bosses?.blaze?.xp >= 1000000
      );
    },
  },
  SkillAverage: {
    "909003858586525756": function (options) {
      //25 skill avg
      let average = skillAverageCalculator(options?.member);

      return average >= 25;
    },
    "904672951293603860": function (options) {
      //30 skill avg
      let average = skillAverageCalculator(options?.member);

      return average >= 30;
    },
    "904673033069920256": function (options) {
      //35 skill avg
      let average = skillAverageCalculator(options?.member);

      return average >= 35;
    },
    "904673068704755742": function (options) {
      //40 skill avg
      let average = skillAverageCalculator(options?.member);

      return average >= 40;
    },
    "904673130914648064": function (options) {
      //45 skill avg
      let average = skillAverageCalculator(options?.member);

      return average >= 45;
    },
    "904673169976229888": function (options) {
      //50 skill avg
      let average = skillAverageCalculator(options?.member);

      return average >= 50;
    },
    "904673232563617847": function (options) {
      //55 skill avg
      let average = skillAverageCalculator(options?.member);

      return average >= 55;
    },
  },
  Dungeoneering: {
    "904673982958166017": function (options) {
      //level 25

      return (
        skillLevelCalculator(
          options?.member?.dungeons?.dungeon_types?.catacombs?.experience,
          0,
          "dungeoneering"
        ) >= 25
      );
    },
    "904674017003311104": function (options) {
      //level 30

      return (
        skillLevelCalculator(
          options?.member?.dungeons?.dungeon_types?.catacombs?.experience,
          0,
          "dungeoneering"
        ) >= 30
      );
    },
    "904674065351065610": function (options) {
      //level 35

      return (
        skillLevelCalculator(
          options?.member?.dungeons?.dungeon_types?.catacombs?.experience,
          0,
          "dungeoneering"
        ) >= 35
      );
    },
    "904674116697747456": function (options) {
      //level 40

      return (
        skillLevelCalculator(
          options?.member?.dungeons?.dungeon_types?.catacombs?.experience,
          0,
          "dungeoneering"
        ) >= 40
      );
    },
    "904674249783017492": function (options) {
      //level 45

      return (
        skillLevelCalculator(
          options?.member?.dungeons?.dungeon_types?.catacombs?.experience,
          0,
          "dungeoneering"
        ) >= 45
      );
    },
    "904674295970680832": function (options) {
      //level 50

      return (
        skillLevelCalculator(
          options?.member?.dungeons?.dungeon_types?.catacombs?.experience,
          0,
          "dungeoneering"
        ) >= 50
      );
    },
  },
  Weight: {
    "904671809339818015": async function (options) {
      //early game
      //0 - 2000
      const profile = await getSpecifiedProfile(
        options?.profile?.uuid,
        options?.profile?.cute_name
      );
      return profile?.data?.weight + profile?.data?.weight_overflow >= 0;
    },
    "904672037556080650": async function (options) {
      //mid game
      //2000 - 7000
      const profile = await getSpecifiedProfile(
        options?.profile?.uuid,
        options?.profile?.cute_name
      );
      return profile?.data?.weight + profile?.data?.weight_overflow >= 2000;
    },
    "904672117411414037": async function (options) {
      //late game
      //7000 - 10000
      const profile = await getSpecifiedProfile(
        options?.profile?.uuid,
        options?.profile?.cute_name
      );
      return profile?.data?.weight + profile?.data?.weight_overflow >= 7000;
    },
    "904672174676275230": async function (options) {
      //early end game
      //10000 - 15000
      const profile = await getSpecifiedProfile(
        options?.profile?.uuid,
        options?.profile?.cute_name
      );
      return profile?.data?.weight + profile?.data?.weight_overflow >= 10000;
    },
    "904672222663307275": async function (options) {
      //end game
      //15000 - 30000
      const profile = await getSpecifiedProfile(
        options?.profile?.uuid,
        options?.profile?.cute_name
      );
      return profile?.data?.weight + profile?.data?.weight_overflow >= 15000;
    },
    "904672273024299038": async function (options) {
      //mammoth
      //30000+
      const profile = await getSpecifiedProfile(
        options?.profile?.uuid,
        options?.profile?.cute_name
      );
      return profile?.data?.weight + profile?.data?.weight_overflow >= 30000;
    },
  },
  TestRoles: {
    "908268556670619668": async function (options) {
      //level calc for mining exp
      let test = skillLevelCalculator(options?.member?.experience_skill_mining);
      console?.log(test);
      return test >= 0;
    },
    "903022294765568042": async function (options) {
      //weight calc
      const profile = await getSpecifiedProfile(
        options?.profile?.uuid,
        options?.profile?.cute_name
      );
      console.log("weight: " + (profile?.data?.weight + profile?.data?.weight_overflow));
      return profile?.data?.weight + profile?.data?.weight_overflow >= 10000;
    },
    "903022232270413875": async function (options) {
      //slayer test (revenant 7)
      console?.log(options?.member?.slayer_bosses?.zombie?.xp >= 100000);
      return options?.member?.slayer_bosses?.zombie?.xp >= 100000;
    },
    "901834684588249139": async function (options) {
      //test for dungeon xp
      const s = skillLevelCalculator(
        options?.member?.dungeons?.dungeon_types?.catacombs?.experience,
        0,
        "dungeoneering"
      );
      console.log(s);
      return s >= 35;
    },
    "785826436481155152": async function (options) {
      //test for skill average
      //50 skill avg
      let average = skillAverageCalculator(options?.member);

      console.log(average);

      return average >= 35;
    },
  },
});
