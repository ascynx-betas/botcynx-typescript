import { Player, ProfileMember } from "../../typings/Hypixel";
import { calculateSkillLevel, defaultSkillRequiredExp, runeCraftingSkillExp, skillLevelCalculator } from "../hypixelSkillCalc";

export class SkillGenerator {
    private static level50SkillExp: number = 55172425;
    private static level60SkillExp: number = 111672425;

    private static calculateSkillWeight(skillGroup: {exponent: number, divider: number, maxLevel :number}, level: number, experience: number): {weight: number, weight_overflow: number} {
        if (skillGroup.exponent == undefined || skillGroup.divider == undefined) {
            return {
                weight: 0,
                weight_overflow: 0,
            }
        }

        let maxSkillLevelXP = skillGroup.maxLevel == 60 ? this.level60SkillExp : this.level50SkillExp;

        let base = Math.pow(level * 10, 0.5 + skillGroup.exponent + level / 100) / 1250;
        if (experience > maxSkillLevelXP) {
            base = Math.round(base);
        }

        if (experience <= maxSkillLevelXP) {
            return {
                weight: base,
                weight_overflow: 0
            }
        }

        return {
            weight: base,
            weight_overflow: Math.pow((experience - maxSkillLevelXP) / skillGroup.divider, 0.968)
        }
    }

    private static calculateSkillProperties(skill: string, experience: number) {
        const skillGroup: {exponent: number, divider: number, maxLevel :number} = skillGroups[skill];

        const experienceGroup: number[] = skill == 'runecrafting' ? runeCraftingSkillExp : defaultSkillRequiredExp;

        const level = calculateSkillLevel(experience, experienceGroup, skillGroup.maxLevel);

        return {
            level: level,
            experience: experience,
            ...this.calculateSkillWeight(skillGroup, level, experience)
        };
    }

    public static build(player: Player, profile: ProfileMember) {
        let usingAchievements = false;
        let p = player.player;

        let experience = {
            mining: profile?.experience_skill_mining || 0,
            foraging: profile?.experience_skill_foraging || 0,
            enchanting: profile?.experience_skill_enchanting || 0,
            farming: profile?.experience_skill_farming || 0,
            combat: profile?.experience_skill_combat || 0,
            fishing: profile?.experience_skill_fishing || 0,
            alchemy: profile?.experience_skill_alchemy || 0,
            taming: profile?.experience_skill_taming || 0,
            carpentry: profile?.experience_skill_carpentry || 0,
            runecrafting: profile?.experience_skill_runecrafting || 0,
        };

        if (this.sumGroup(experience) == 0) {
            usingAchievements = true;
            experience = {
                mining: skillLevelCalculator(p.achievements?.skyblock_excavator),
                foraging: skillLevelCalculator(p.achievements?.skyblock_excavator),
                enchanting: skillLevelCalculator(p.achievements?.skyblock_excavator),
                farming: skillLevelCalculator(p.achievements?.skyblock_excavator),
                combat: skillLevelCalculator(p.achievements?.skyblock_excavator),
                fishing: skillLevelCalculator(p.achievements?.skyblock_excavator),
                alchemy: skillLevelCalculator(p.achievements?.skyblock_excavator),
                taming: skillLevelCalculator(p.achievements?.skyblock_excavator),
                carpentry: 0,
                runecrafting: 0,
              }

              if (this.sumGroup(experience) == 0) {
                return null;
              }
        }
        
        let skills: any = {
            apiEnabled: !usingAchievements,
            average_skills: 0,
            weight: 0,
            weight_overflow: 0,
            mining: this.calculateSkillProperties('mining', experience.mining),
            foraging: this.calculateSkillProperties('foraging', experience.foraging),
            enchanting: this.calculateSkillProperties('enchanting', experience.enchanting),
            farming: this.calculateSkillProperties('farming', experience.farming),
            combat: this.calculateSkillProperties('combat', experience.combat),
            fishing: this.calculateSkillProperties('fishing', experience.fishing),
            alchemy: this.calculateSkillProperties('alchemy', experience.alchemy),
            taming: this.calculateSkillProperties('taming', experience.taming),
            carpentry: this.calculateSkillProperties('carpentry', experience.carpentry),
            runecrafting: this.calculateSkillProperties('runecrafting', experience.runecrafting),
        }

        skills.average_skills = this.calculateSkillAverage(skills);
        skills.weight = this.sumSkillWeight(skills, 'weight');
        skills.weight_overflow = this.sumSkillWeight(skills, 'weight_overflow');

        return skills;
    }

    private static sumSkillWeight(skills: any, type: 'weight' | 'weight_overflow') {
        return weightSkills.map(v => skills[v][type]).reduce((acc, curr) => acc + curr);
    }

    private static calculateSkillAverage(skills: any) {
        return (
            (skills.mining.level +
              skills.foraging.level +
              skills.enchanting.level +
              skills.farming.level +
              skills.combat.level +
              skills.fishing.level +
              skills.alchemy.level +
              skills.taming.level) /
            8
          )
    }


    private static sumGroup(object: any) {
        let total = 0;
        for (let key of Object.keys(object)) {
            total += object[key];
        }

        return total;
    }
}

const weightSkills: string[] = ['mining', 'foraging', 'enchanting', 'farming', 'combat', 'fishing', 'alchemy', 'taming']

const skillGroups = {
    // Maxes out mining at 1,750 points at 60.
    mining: {
      exponent: 1.18207448,
      divider: 259634,
      maxLevel: 60,
    },
    // Maxes out foraging at 850 points at level 50.
    foraging: {
      exponent: 1.232826,
      divider: 259634,
      maxLevel: 50,
    },
    // Maxes out enchanting at 450 points at level 60.
    enchanting: {
      exponent: 0.96976583,
      divider: 882758,
      maxLevel: 60,
    },
    // Maxes out farming at 2,200 points at level 60.
    farming: {
      exponent: 1.217848139,
      divider: 220689,
      maxLevel: 60,
    },
    // Maxes out combat at 1,500 points at level 60.
    combat: {
      exponent: 1.15797687265,
      divider: 275862,
      maxLevel: 60,
    },
    // Maxes out fishing at 2,500 points at level 50.
    fishing: {
      exponent: 1.406418,
      divider: 88274,
      maxLevel: 50,
    },
    // Maxes out alchemy at 200 points at level 50.
    alchemy: {
      exponent: 1.0,
      divider: 1103448,
      maxLevel: 50,
    },
    // Maxes out taming at 500 points at level 50.
    taming: {
      exponent: 1.14744,
      divider: 441379,
      maxLevel: 50,
    },
    // Sets up carpentry and runecrafting without any weight components.
    carpentry: {
      maxLevel: 50,
    },
    runecrafting: {
      maxLevel: 25,
    },
}