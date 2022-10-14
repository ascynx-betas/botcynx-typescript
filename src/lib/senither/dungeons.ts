import { Player, ProfileMember } from "../../typings/Hypixel";
import { dungeonSkillRequiredExp } from "../hypixelSkillCalc";

export class DungeonGenerator {
    private static hasDungeonData(dungeons: { dungeon_types: any; player_classes: any; dungeon_journal?: { journal_entries: { [key: string]: number[]; }; }; dungeons_blah_blah?: string[]; selected_dungeon_class?: string; }): boolean {
        return (
            dungeons != undefined &&
            dungeons.player_classes != undefined &&
            dungeons.dungeon_types != undefined &&
            dungeons.dungeon_types.catacombs != undefined &&
            dungeons.dungeon_types.catacombs.experience != undefined &&
            dungeons.dungeon_types.catacombs.tier_completions != undefined
          );
    }

    private static buildDungeonTypeProperties(type: string, dungeon: { times_played: any; experience: any; tier_completions: any; fastest_time: any; best_runs?: { [key: number]: { timestamp: number; score_exploration: number; score_speed: number; score_skill: number; score_bonus: number; dungeon_class: string; teammates: string[]; elapsed_time: number; damage_dealt: number; deaths: number; mobs_killed: number; secrets_found: number; damage_mitigated: number; ally_healing: number; }[]; }; highest_tier_completed?: any; best_score?: any; fastest_time_s_plus?: any; mobs_killed?: any; most_mobs_killed?: any; }, masterDungeon: { times_played?: { [key: number]: number; }; experience?: number; tier_completions: any; fastest_time: any; best_runs?: { [key: number]: { timestamp: number; score_exploration: number; score_speed: number; score_skill: number; score_bonus: number; dungeon_class: string; teammates: string[]; elapsed_time: number; damage_dealt: number; deaths: number; mobs_killed: number; secrets_found: number; damage_mitigated: number; ally_healing: number; }[]; }; highest_tier_completed?: any; best_score?: any; fastest_time_s_plus?: any; mobs_killed?: any; most_mobs_killed?: any; }) {
        const level = this.calculateDungeonLevel(dungeon.experience);

        const dungeonResult = {
            level: level,
            experience: dungeon.experience,
            ...this.calculateDungeonWeight(type, level, dungeon.experience),
            highest_tier_completed: dungeon.highest_tier_completed,
            times_played: this.formatDungeonStatsGroup(dungeon.times_played),
            tier_completions: this.formatDungeonStatsGroup(dungeon.tier_completions),
            best_score: this.formatDungeonStatsGroup(dungeon.best_score),
            fastest_time: this.formatDungeonStatsGroup(dungeon.fastest_time),
            fastest_time_s_plus: this.formatDungeonStatsGroup(dungeon.fastest_time_s_plus),
            mobs_killed: this.formatDungeonStatsGroup(dungeon.mobs_killed),
            most_mobs_killed: this.formatDungeonStatsGroup(dungeon.most_mobs_killed),
      
            master_mode: {
              highest_tier_completed: masterDungeon?.highest_tier_completed || 0,
              tier_completions: this.formatDungeonStatsGroup(masterDungeon?.tier_completions),
              best_score: this.formatDungeonStatsGroup(masterDungeon?.best_score),
              fastest_time: this.formatDungeonStatsGroup(masterDungeon?.fastest_time),
              fastest_time_s_plus: this.formatDungeonStatsGroup(masterDungeon?.fastest_time_s_plus),
              mobs_killed: this.formatDungeonStatsGroup(masterDungeon?.mobs_killed),
              most_mobs_killed: this.formatDungeonStatsGroup(masterDungeon?.most_mobs_killed),
            }
          };


        dungeonResult.best_score = this.formatDungeonScores(dungeonResult.best_score);
        dungeonResult.fastest_time = this.formatDungeonsTime(dungeonResult.fastest_time);
        dungeonResult.fastest_time_s_plus = this.formatDungeonsTime(dungeonResult.fastest_time_s_plus);

        dungeonResult.master_mode.best_score = this.formatDungeonScores(dungeonResult.master_mode.best_score);
        dungeonResult.master_mode.fastest_time = this.formatDungeonsTime(dungeonResult.master_mode.fastest_time);
        dungeonResult.master_mode.fastest_time_s_plus = this.formatDungeonsTime(dungeonResult.master_mode.fastest_time_s_plus);

        return dungeonResult;
    }

    private static formatDungeonStatsGroup(group: {[level: string]: number}) {
        let result = {}

        if (group == undefined) {
          return result;
        }
    
        for (let key of Object.keys(group)) {
          if (key == '0') {
            result['entrance'] = group[key];
          } else {
            result[`tier_${key}`] = group[key];
          }
        };
    
        return result;
    }

    private static formatDungeonScores(scores: any): any {
        for (let key of Object.keys(scores)) {
            let value = scores[key];
            let score = "C";

            if (value >= 300) {
                score = "S+";
            } else if (value >= 270) {
                score = "S";
            } else if (value >= 240) {
                score = "A";
            } else if (value >= 175) {
                score = "B";
            }

            scores[key] = {
                value,
                score
            }
        }

        return scores;
    }

    private static formatDungeonsTime(times: any): any {
        for (let key of Object.keys(times)) {
            let seconds = times[key] / 1000;

            times[key] = {
                time: humanizeTime(seconds),
                seconds
            }
        }

        return times;
    }

    private static generateClassProperties(type: string, playerClass: { experience?: number; }) {
        if (!playerClass) {
            playerClass = {};
        };

        const exp = playerClass.experience || 0;
        const level = this.calculateDungeonLevel(exp);

        return {
            level: level,
            experience: exp,
            ...this.calculateDungeonWeight(type, level, exp)
        }
    }

    private static calculateDungeonLevel(experience: number) {
        let level = 0;
    
        for (let toRemoveKey of Object.keys(dungeonSkillRequiredExp)) {
            const toRemove = dungeonSkillRequiredExp[toRemoveKey];
            experience -= toRemove;
            if (experience < 0) {
                return level + (1 - (experience * -1) / toRemove);
            }
            level++;
        }
    
        return Math.min(level, 50);
    }

    private static dungeonLevel50Exp = 569809640;

    private static dungeonWeight = {
        catacombs: 0.0002149604615,
        healer: 0.0000045254834,
        mage: 0.0000045254834,
        berserker: 0.0000045254834,
        archer: 0.0000045254834,
        tank: 0.0000045254834,
    }

    private static level50SkillExp: number = 55172425;

    private static calculateDungeonWeight(type: string, level: number, exp: number) {
        let percentageModifier = this.dungeonWeight[type];

        let base = Math.pow(level, 4.5) * percentageModifier;

        if (exp <= this.dungeonLevel50Exp) {
            return {
                weight: base,
                weight_overflow: 0
            }
        }

        let remaining = exp - this.dungeonLevel50Exp;
        let splitter = (4 * this.level50SkillExp) / base;//! the splitter doesn't seem correct

        return {
            weight: Math.floor(base),
            weight_overflow: Math.pow(remaining / splitter, 0.968)
        };
    }

    public static build(player: Player, profile: ProfileMember) {
        if (!profile?.dungeons) {
            return null;
        }

        const dungeonGroups = profile.dungeons;

        if (!this.hasDungeonData(dungeonGroups)) {
            return null;
        };

        const dungeons: any = {
            selected_class: dungeonGroups.selected_dungeon_class,
            weight: 0,
            weight_overflow: 0,
            secrets_found: player.player.achievements?.skyblock_treasure_hunter,
            classes: {
              healer: this.generateClassProperties('healer', dungeonGroups.player_classes.healer || null),
              mage: this.generateClassProperties('mage', dungeonGroups.player_classes.mage || null),
              berserker: this.generateClassProperties('berserker', dungeonGroups.player_classes.berserk || null),
              archer: this.generateClassProperties('archer', dungeonGroups.player_classes.archer || null),
              tank: this.generateClassProperties('tank', dungeonGroups.player_classes.tank || null),
            },
            types: {
              catacombs: this.buildDungeonTypeProperties(
                'catacombs',
                dungeonGroups.dungeon_types.catacombs,
                dungeonGroups.dungeon_types.master_catacombs
              ),
            },
          };

        dungeons.weight = this.sumDungeonWeight(dungeons, 'weight') + dungeons.types.catacombs.weight;
        dungeons.weight_overflow = this.sumDungeonWeight(dungeons, 'weight_overflow') +   dungeons.types.catacombs.weight_overflow;

        return dungeons;
    }

    private static sumDungeonWeight(dungeons: { classes: { [x: string]: { [x: string]: any; }; }; }, type: string): number {
        return Object.keys(this.dungeonWeight)
            .map((v) => dungeons.classes[v] ? dungeons.classes[v][type] : 0)
            .reduce((acc, curr) => acc + curr);
    }
}
function humanizeTime(time: number): string {
    const seconds = Math.floor(time >= 60 ? time % 60 : time)
    const minutes = Math.floor((time = time / 60) >= 60 ? time % 60 : time)
    const hours = Math.floor((time = time / 60) >= 24 ? time % 24 : time)
    const days = Math.floor((time = time / 24) >= 30 ? time % 30 : time)
    const months = Math.floor((time = time / 30) >= 12 ? time % 12 : time)
    const years = Math.floor(time / 12)
  
    let humanizedTime = []
  
    if (years > 0) {
      humanizedTime.push(years == 1 ? 'a year' : `${years} years`)
    }
  
    if (months > 0) {
      humanizedTime.push(months == 1 ? 'a month' : `${months} months`)
    }
  
    if (days > 0) {
      humanizedTime.push(days == 1 ? 'a day' : `${days} days`)
    }
  
    if (hours > 0) {
      humanizedTime.push(hours == 1 ? 'a hour' : `${hours} hours`)
    }
  
    if (minutes > 0) {
      humanizedTime.push(minutes == 1 ? 'a minute' : `${minutes} minutes`)
    }
  
    if (seconds > 0) {
      humanizedTime.push(seconds == 1 ? 'a second' : `${seconds} seconds`)
    }
  
    if (humanizedTime.length < 2) {
      return humanizedTime.join(', ')
    }
  
    const lastElement = humanizedTime.pop()
  
    return humanizedTime.join(', ') + ` and ${lastElement}`
  }