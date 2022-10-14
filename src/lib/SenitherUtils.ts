import { Collection } from "discord.js";
import { Profile, ProfileMember, Player, ProfilePet } from "../typings/Hypixel";
import { getPlayerByUuid, getProfiles, HypixelError } from "./HypixelAPIUtils";
import { DungeonGenerator } from "./senither/dungeons";
import { PetGenerator } from "./senither/pets";
import { SkillGenerator } from "./senither/skills";
import { SlayerGenerator } from "./senither/slayers";


//integrated version of https://github.com/Senither/hypixel-skyblock-facade/ 
export class Senither {
    public static async getProfiles(uuid: string) {
        let player = await getPlayerByUuid(uuid);
        let data = await this.parseSkyblockProfiles(uuid, player);

        return {
            status: 200,
            data: data.map((profile) => this.mergeSkyblockProfileAndPlayer(profile, player))
        }
    }

    private static sumMainWeigh(stats: { skills: { [x: string]: number; }; slayers: { [x: string]: number; }; dungeons: { [x: string]: number; }; }, type: string) {
        let weight = 0;

        if (stats.skills != null) {
            weight += stats.skills[type];
        }

        if (stats.slayers != null) {
            weight += stats.slayers[type];
        }

        if (stats.dungeons != null) {
            weight += stats.dungeons[type];
        }

        return weight;
    }

    public static async parseSkyblockProfiles(uuid: string, player: Player) {
        let data: Collection<string, Profile>;
        try {
        data = await getProfiles(uuid);
        } catch (error) {
            if (error instanceof HypixelError) {
                //couldn't find profiles
                return null;
            }
        }

        const result = [];
        const minUUID = uuid.replace(/-/g, "");

        for (let pData of data) {
            let profileData = pData[1];
            if (profileData.last_save == null) {
                continue;
            }

            const profile: ProfileMember = profileData["members"][minUUID];

            //slayers = broken, dungeons might be as well.
            result.push({
                id: profileData.profile_id,
                name: profileData.cute_name,
                last_save_at: {
                    time: profileData.last_save,
                    date: new Date(profileData.last_save)
                },
                weight: 0,
                weight_overflow: 0,
                fairy_souls: profile?.fairy_souls_collected || 0,
                skills: SkillGenerator.build(player, profile),
                slayers: SlayerGenerator.build(profile),
                dungeons: DungeonGenerator.build(player, profile),
                pets: PetGenerator.build(profile),
                coins: {
                    bank: profileData["banking"] != null ? profileData?.banking?.balance : null,
                    purse: profile?.coin_purse || null
                }
            });
        }

        if (result.length == 0) {
            return null;
        }

        for (let stats of result) {
            stats.weight = this.sumMainWeigh(stats, "weight");
            stats.weight_overflow = this.sumMainWeigh(stats, "weight_overflow");
        }

        return result;
    }

    public static mergeSkyblockProfileAndPlayer(profile: { id: any; name: any; last_save_at: any; weight: any; weight_overflow: any; fairy_souls: any; skills: any; slayers: any; dungeons: any; pets: any; coins: { bank: any; purse: any; }; }, player: Player) {
        return {
            id: profile.id,
            name: profile.name,
            username: player.player.displayname,
            last_save_at: profile.last_save_at,
            weight: profile.weight,
            weight_overflow: profile.weight_overflow,
            fairy_souls: profile.fairy_souls,
            skills: profile.skills,
            slayers: profile.slayers,
            dungeons: profile.dungeons,
            pets: profile.pets,
            coins: {
              total: (profile.coins?.bank || 0) + (profile.coins?.purse || 0),
              bank: profile.coins?.bank,
              purse: profile.coins?.purse,
            },
          }
    }
}