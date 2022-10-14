import { ProfileMember, Slayer } from "../../typings/Hypixel";

export class SlayerGenerator {
    public static build(profile: ProfileMember) {
        if (!profile?.slayer_bosses) {
            return null;
        }

        const slayers: any = {
            total_coints_spent: this.getTotalSpentOnSlayers(profile.slayer_bosses),
            total_experience: this.calculateTotalCombinedSlayerExperience(profile.slayer_bosses),
            weight: 0,
            weight_overflow: 0,
            bosses: {
                revenant: this.generateSlayerStatsResponse('revenant', profile.slayer_bosses.zombie || null),
                tarantula: this.generateSlayerStatsResponse('tarantula', profile.slayer_bosses.spider || null),
                sven: this.generateSlayerStatsResponse('sven', profile.slayer_bosses.wolf || null),
                enderman: this.generateSlayerStatsResponse('enderman', profile.slayer_bosses.enderman || null),
            }
        };

        slayers.weight = this.sumWeight(slayers, 'weight');
        slayers.weight_overflow = this.sumWeight(slayers, 'weight_overflow');

        return slayers;
    }

    private static generateSlayerStatsResponse(type: string, slayer?: Slayer) {
        if (slayer == null) {
            slayer = {};
        }

        const experience = slayer.xp || 0;

        return {
            level: this.calculateSlayerLevel(experience),
            experience:experience,
            ...this.calculateSlayerWeight(type, experience),
            kills: {
                tier_1: slayer.boss_kills_tier_0 || 0,
                tier_2: slayer.boss_kills_tier_1 || 0,
                tier_3: slayer.boss_kills_tier_2 || 0,
                tier_4: slayer.boss_kills_tier_3 || 0,
                tier_5: slayer.boss_kills_tier_4 || 0, 
            }
        }
    }

    private static sumWeight(slayers: any, type: string): number {
        return Object.keys(this.slayerWeights)
            .map((v) => slayers.bosses[v][type])
            .reduce((acc, curr) => acc + curr);
    }

    private static SlayerExperience = [5, 15, 200, 1000, 5000, 20000, 100000, 400000, 1000000];

    private static slayerWeights: {[key: string]: {divider: number, modifier: number}} = {
        revenant: {
          divider: 2208,
          modifier: 0.15,
        },
        tarantula: {
          divider: 2118,
          modifier: 0.08,
        },
        sven: {
          divider: 1962,
          modifier: 0.015,
        },
        enderman: {
          divider: 1430,
          modifier: .017,
        }
    }

    private static calculateSlayerLevel(exp: number) {
        for (let level = 0; level < this.SlayerExperience.length; level++) {
            let req = this.SlayerExperience[level];

            if (exp < req) {
                let lastReq = level == 0 ? 0 : this.SlayerExperience[level-1];

                return level + (exp - lastReq) / (req - lastReq);
            }
        }
        return 9;
    }

    private static calculateSlayerWeight(type: string, exp: number) {
        const slayerWeight = this.slayerWeights[type];

        if (exp <= 1000000) {
            return {
                weight: exp == 0 ? 0: exp / slayerWeight.divider,
                weight_overflow: 0
            }
        }

        let base = 1000000 / slayerWeight.divider;
        let remaining = exp - 1000000;


        let mod = slayerWeight.modifier;
        let overflow = 0;
        
        while (remaining > 0 ) {
            let left = Math.min(remaining, 1000000);

            overflow += Math.pow(left / (slayerWeight.divider * (1.5 + mod)), 0.942);
            mod += slayerWeight.modifier;
            remaining -= left;
        }

        return {
            weight: base,
            weight_overflow: overflow
        }
    }

    private static getTotalSpentOnSlayers(slayers: Slayer_bosses) {
        let totalMin = 0;
        let totalMax = 0;

        for (let type of Object.keys(slayers)) {
            const slayer = slayers[type];

            totalMin += (slayer.boss_kills_tier_0 || 0) * 50;
            totalMin += (slayer.boss_kills_tier_1 || 0) * 1000;
            totalMin += (slayer.boss_kills_tier_2 || 0) * 5000;
            totalMin += (slayer.boss_kills_tier_3 || 0) * 25000;
            totalMin += (slayer.boss_kills_tier_4 || 0) * 50000;

            totalMax += (slayer.boss_kills_tier_0 || 0) * 100;
            totalMax += (slayer.boss_kills_tier_1 || 0) * 2000;
            totalMax += (slayer.boss_kills_tier_2 || 0) * 10000;
            totalMax += (slayer.boss_kills_tier_3 || 0) * 50000;
            totalMax += (slayer.boss_kills_tier_4 || 0) * 100000;
        }

        return ((totalMin + totalMax) / 2);//return average spent
    }

    private static calculateTotalCombinedSlayerExperience(slayers: Slayer_bosses) {
        let totalXp = 0;

        for (let type of Object.keys(slayers)) {
            totalXp += slayers[type].xp || 0;
        }

        return totalXp;
    }
}

type Slayer_bosses = {
    zombie: Slayer;
    spider: Slayer;
    wolf: Slayer;
    enderman: Slayer;
    blaze: Slayer;
  };