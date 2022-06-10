import { Role } from "discord.js";
import { calculateSkillLevel } from "../../lib/constants";
import { verify, verifyModel } from "../../models/verifyModel";
import { getProfiles } from "../../personal-modules/hypixel";
import { getUuidbyUsername } from "../../personal-modules/mojang";
import { getSpecifiedProfile } from "../../personal-modules/senither";
import { WhitelistedCommand } from "../../structures/Commands";
import { profileMember } from "../../typings/Hypixel";

export default new WhitelistedCommand({
   name: "rolerequest",
   description: "get a role depending on if you follow it's requirement or not",
   options: [
    {
        name: "role",
        description: "the role you want to get",
        required: true,
        type: "ROLE"
    },
    {
        name: "username",
        description: "your minecraft username",
        required: false,
        type: "STRING"
    },
    {
        name :"profile",
        description: "the profile you want to get the data from",
        required: false,
        type: "STRING"
    }
   ],
   require: ["hypixelApiKey", "mongooseConnectionString"],
   run: async({client, interaction, args}) => {
    let username: string = args.getString("username");
    let role = args.getRole("role");
    let uuid: string;

    if (!username) {
        //get info from database;

        let userInfo = await verifyModel.findOne({
            userId: interaction.user.id
        });

        if (typeof userInfo == "undefined" || !userInfo) interaction.followUp({content: `Missing username parameter, you can also verify using the /verify command`});

        uuid = userInfo.minecraftuuid;
    } else {
        uuid = (await getUuidbyUsername(username).catch((e) =>  interaction.followUp({content: `couldn't fetch uuid`}))).id;
    }

    let hypixelData = await getProfiles(uuid);

    let profile = args.getString("profile") ? args.getString("profile") : hypixelData.sort((acc, curr) => acc.members[uuid].last_save - curr.members[uuid].last_save).first().cute_name;

    let member = args.getString("profile") ? hypixelData.filter((profile) => profile.cute_name == args.getString("profile")).first().members[uuid] : hypixelData.sort((acc, curr) => acc.members[uuid].last_save - curr.members[uuid].last_save).first().members[uuid];

    if (!whitelistedRoles[role.id]) return interaction.followUp({content: `Role isn't in the whitelisted role list`});

    if (await whitelistedRoles[role.id]({member, profile: {cute_name: profile, uuid}})) {
        return interaction.member.roles.add((role as Role)).catch((e) => interaction.followUp({content: `Missing Permission: cannot give role <@&${role.id}>`, allowedMentions: {parse: []}})).then((e) => {
            interaction.followUp({content: `succesfully gave role <@&${role.id}>`, allowedMentions: {parse: []}})
        })
    } else {
        return interaction.followUp({content: `You don't follow the requirement for <@&${role.id}>`, allowedMentions: {parse: []}});
    }


   },
   register: ({ client, guild }) => {
    guild.commands.create(client.whitelistedCommands.get("rolerequest"));
  },
});


export const whitelistedRoles: {[key: string]: (options: {member?: profileMember, profile?: {cute_name: string, uuid: string}}) => boolean | Promise<boolean>} = {
    //slayer roles
    "904674428569391114": function(options) {
        //Revenant student
        return options.member.slayer_bosses.zombie.xp >= 100000;
    },
    "904674474455097375": function(options) {
        //Revant Mercenary
        return options.member.slayer_bosses.zombie.xp >= 300000;
    },
    "904674523796865054": function(options) {
        //Master of the revenants
        return options.member.slayer_bosses.zombie.xp >= 1000000;
    },
    "904674586262655006": function(options) {
        //Tarantula student
        return options.member.slayer_bosses.spider.xp >= 100000;
    },
    "904674619863232532": function(options) {
        //Tarantula Mercenary
        return options.member.slayer_bosses.spider.xp >= 300000;
    },
    "904674655565131816": function(options) {
        //Tarantula Master
        return options.member.slayer_bosses.spider.xp >= 1000000;
    },
    "904674724431413259": function(options) {
        //Wolf student
        return options.member.slayer_bosses.wolf.xp >= 100000;
    },
    "904674753233690646": function(options) {
        //Wolf Mercenary
        return options.member.slayer_bosses.wolf.xp >= 300000;
    },
    "904674783826964480": function (options) {
        //Wolf master
        return options.member.slayer_bosses.wolf.xp >= 1000000;
    },
    "913896494225047613": function (options) {
        //Void student
        return options.member.slayer_bosses.enderman.xp >= 100000;
    },
    "913896688974962749": function (options) {
        //Void mercenary
        return options.member.slayer_bosses.enderman.xp >= 300000;
    },
    "913896846387191868": function (options) {
        //Void master
        return options.member.slayer_bosses.enderman.xp >= 1000000;
    },
    "984772580093353994": function (options) {
        //Blaze student
        return options.member.slayer_bosses.blaze.xp >= 100000;
    },
    "984774668013666304": function (options) {
        //Blaze Mercenary
        return options.member.slayer_bosses.blaze.xp >= 300000;
    },
    "984774669360062464": function (options) {
        //Blaze master
        return options.member.slayer_bosses.blaze.xp >= 1000000;
    },
    "904674855436320788": function (options) {
        //Maxed Aatrox
        return options.member.slayer_bosses.zombie.xp >= 1000000 &&
         options.member.slayer_bosses.wolf.xp >= 1000000 &&
          options.member.slayer_bosses.spider.xp >= 1000000 &&
           options.member.slayer_bosses.enderman.xp >= 1000000 &&
            options.member.slayer_bosses.blaze.xp >= 1000000
    },

    //skill average roles

    "909003858586525756": function (options) {
        //25 skill avg
        let skill_alchemy = calculateSkillLevel(options.member.experience_skill_alchemy);
        let skill_mining = calculateSkillLevel(options.member.experience_skill_mining);
        let skill_enchanting = calculateSkillLevel(options.member.experience_skill_enchanting);
        let skill_farming = calculateSkillLevel(options.member.experience_skill_farming);
        let skill_fishing = calculateSkillLevel(options.member.experience_skill_fishing);
        let skill_foraging = calculateSkillLevel(options.member.experience_skill_foraging);
        let skill_taming = calculateSkillLevel(options.member.experience_skill_taming);

        let average = ((skill_alchemy + skill_mining + skill_enchanting + skill_farming + skill_fishing + skill_foraging + skill_taming) / 7);

        return average > 25;
    },
    "904672951293603860": function (options) {
        //30 skill avg
        let skill_alchemy = calculateSkillLevel(options.member.experience_skill_alchemy);
        let skill_mining = calculateSkillLevel(options.member.experience_skill_mining);
        let skill_enchanting = calculateSkillLevel(options.member.experience_skill_enchanting);
        let skill_farming = calculateSkillLevel(options.member.experience_skill_farming);
        let skill_fishing = calculateSkillLevel(options.member.experience_skill_fishing);
        let skill_foraging = calculateSkillLevel(options.member.experience_skill_foraging);
        let skill_taming = calculateSkillLevel(options.member.experience_skill_taming);

        let average = ((skill_alchemy + skill_mining + skill_enchanting + skill_farming + skill_fishing + skill_foraging + skill_taming) / 7);

        return average > 30;
    },
    "904673033069920256": function (options) {
        //35 skill avg
        let skill_alchemy = calculateSkillLevel(options.member.experience_skill_alchemy);
        let skill_mining = calculateSkillLevel(options.member.experience_skill_mining);
        let skill_enchanting = calculateSkillLevel(options.member.experience_skill_enchanting);
        let skill_farming = calculateSkillLevel(options.member.experience_skill_farming);
        let skill_fishing = calculateSkillLevel(options.member.experience_skill_fishing);
        let skill_foraging = calculateSkillLevel(options.member.experience_skill_foraging);
        let skill_taming = calculateSkillLevel(options.member.experience_skill_taming);

        let average = ((skill_alchemy + skill_mining + skill_enchanting + skill_farming + skill_fishing + skill_foraging + skill_taming) / 7);

        return average > 35;
    },
    "904673068704755742": function (options) {
        //40 skill avg
        let skill_alchemy = calculateSkillLevel(options.member.experience_skill_alchemy);
        let skill_mining = calculateSkillLevel(options.member.experience_skill_mining);
        let skill_enchanting = calculateSkillLevel(options.member.experience_skill_enchanting);
        let skill_farming = calculateSkillLevel(options.member.experience_skill_farming);
        let skill_fishing = calculateSkillLevel(options.member.experience_skill_fishing);
        let skill_foraging = calculateSkillLevel(options.member.experience_skill_foraging);
        let skill_taming = calculateSkillLevel(options.member.experience_skill_taming);

        let average = ((skill_alchemy + skill_mining + skill_enchanting + skill_farming + skill_fishing + skill_foraging + skill_taming) / 7);

        return average > 40;
    },
    "904673130914648064": function (options) {
        //45 skill avg
        let skill_alchemy = calculateSkillLevel(options.member.experience_skill_alchemy);
        let skill_mining = calculateSkillLevel(options.member.experience_skill_mining);
        let skill_enchanting = calculateSkillLevel(options.member.experience_skill_enchanting);
        let skill_farming = calculateSkillLevel(options.member.experience_skill_farming);
        let skill_fishing = calculateSkillLevel(options.member.experience_skill_fishing);
        let skill_foraging = calculateSkillLevel(options.member.experience_skill_foraging);
        let skill_taming = calculateSkillLevel(options.member.experience_skill_taming);

        let average = ((skill_alchemy + skill_mining + skill_enchanting + skill_farming + skill_fishing + skill_foraging + skill_taming) / 7);

        return average > 45;
    },
    "904673169976229888": function (options) {
        //50 skill avg
        let skill_alchemy = calculateSkillLevel(options.member.experience_skill_alchemy);
        let skill_mining = calculateSkillLevel(options.member.experience_skill_mining);
        let skill_enchanting = calculateSkillLevel(options.member.experience_skill_enchanting);
        let skill_farming = calculateSkillLevel(options.member.experience_skill_farming);
        let skill_fishing = calculateSkillLevel(options.member.experience_skill_fishing);
        let skill_foraging = calculateSkillLevel(options.member.experience_skill_foraging);
        let skill_taming = calculateSkillLevel(options.member.experience_skill_taming);

        let average = ((skill_alchemy + skill_mining + skill_enchanting + skill_farming + skill_fishing + skill_foraging + skill_taming) / 7);

        return average > 50;
    },
    "904673232563617847": function (options) {
        //55 skill avg
        let skill_alchemy = calculateSkillLevel(options.member.experience_skill_alchemy);
        let skill_mining = calculateSkillLevel(options.member.experience_skill_mining);
        let skill_enchanting = calculateSkillLevel(options.member.experience_skill_enchanting);
        let skill_farming = calculateSkillLevel(options.member.experience_skill_farming);
        let skill_fishing = calculateSkillLevel(options.member.experience_skill_fishing);
        let skill_foraging = calculateSkillLevel(options.member.experience_skill_foraging);
        let skill_taming = calculateSkillLevel(options.member.experience_skill_taming);

        let average = ((skill_alchemy + skill_mining + skill_enchanting + skill_farming + skill_fishing + skill_foraging + skill_taming) / 7);

        return average > 55;
    },

    //dungeoneering roles
    "904673982958166017": function (options) {
        //level 25

        return calculateSkillLevel(options.member.dungeons.dungeon_types.catacombs.experience) > 25;
    },
    "904674017003311104": function (options) {
        //level 30

        return calculateSkillLevel(options.member.dungeons.dungeon_types.catacombs.experience) > 30;
    },
    "904674065351065610": function (options) {
        //level 35

        return calculateSkillLevel(options.member.dungeons.dungeon_types.catacombs.experience) > 35;
    },
    "904674116697747456": function (options) {
        //level 40

        return calculateSkillLevel(options.member.dungeons.dungeon_types.catacombs.experience) > 40;
    },
    "904674249783017492": function (options) {
        //level 45

        return calculateSkillLevel(options.member.dungeons.dungeon_types.catacombs.experience) > 45;
    },
    "904674295970680832": function (options) {
        //level 50

        return calculateSkillLevel(options.member.dungeons.dungeon_types.catacombs.experience) > 50;
    },

    //weight roles
    "904671809339818015": async function (options) {
        //early game
        //0 - 2000
        const profile = await getSpecifiedProfile(options.profile.uuid, options.profile.cute_name);
        return (profile.data.weight + profile.data.weight_overflow) > 0;
    },
    "904672037556080650": async function (options) {
        //mid game
        //2000 - 7000
        const profile = await getSpecifiedProfile(options.profile.uuid, options.profile.cute_name);
        return (profile.data.weight + profile.data.weight_overflow) > 2000;
    },
    "904672117411414037": async function (options) {
        //late game
        //7000 - 10000
        const profile = await getSpecifiedProfile(options.profile.uuid, options.profile.cute_name);
        return (profile.data.weight + profile.data.weight_overflow) > 7000;
    },
    "904672174676275230": async function (options) {
        //early end game
        //10000 - 15000
        const profile = await getSpecifiedProfile(options.profile.uuid, options.profile.cute_name);
        return (profile.data.weight + profile.data.weight_overflow) > 10000;
    },
    "904672222663307275": async function (options) {
        //end game
        //15000 - 30000
        const profile = await getSpecifiedProfile(options.profile.uuid, options.profile.cute_name);
        return (profile.data.weight + profile.data.weight_overflow) > 15000;
    },
    "904672273024299038": async function (options) {
        //mammoth
        //30000+
        const profile = await getSpecifiedProfile(options.profile.uuid, options.profile.cute_name);
        return (profile.data.weight + profile.data.weight_overflow) > 30000;
    }
};


//roleId: function (member: profileMember => {}): boolean