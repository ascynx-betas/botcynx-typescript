import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { ButtonResponse } from "../structures/Commands";
import lilyweight from "lilyweight";
import { EmbedFieldData } from "discord.js";
import { getUuidbyUsername } from "../personal-modules/mojang";

export default new ButtonResponse({
  category: "weight",
  customId: "lily",
  temporary: true,
  require: ["hypixelApiKey"],
  onlyAuthor: true,
  run: async ({ interaction, client }) => {

    let IdFields = interaction.customId.split(":");
    const uuid = IdFields[2];
    const profile = IdFields[3];
    const username = (await getUuidbyUsername(uuid)).name;


    const lily = new lilyweight(process.env.hypixelapikey);
    
    const weight = await lily.getWeight(uuid).catch(() => console.log());
    //calculations
    const skillb = Math.round(weight.skill.base * 10) / 10;
    const skillo = Math.round(weight.skill.overflow * 10) / 10;
    let tskill = skillb + skillo;
    tskill = Math.round(tskill * 10) / 10;

    const catab = Math.round(weight.catacombs.completion.base * 10) / 10;
    const catam = Math.round(weight.catacombs.completion.master * 10) / 10;
    const catae = Math.round(weight.catacombs.experience * 10) / 10;
    const tcata = catab + catam + catae;

    let tslayer = Math.round(weight.slayer * 10) / 10;

    let embedFields: EmbedFieldData[] = [];
      embedFields.push({name: "Total weight: ", value: String(Math.round(weight.total * 10) / 10)});
      embedFields.push({name: "<:catacombs:914860327978532874> Dungeon weight: ", value: `\`\`${tcata}\`\` Total\n\`\`${catab}\`\` from F completion\n\`\`${catam}\`\` from MM completion\n\`\`${catae}\`\` from cata level`});
      embedFields.push({name: "<:beheaded:914859571351269447> Slayer weight: ", value: `\`\`${tslayer}\`\``});
      embedFields.push({name: "<:skill:914859774187814932> Skill weight: ", value: `\`\`${tskill}\`\`(\`\`${skillb}\`\`/\`\`${skillo}\`\` overflow)`});
    const embed = new MessageEmbed()
      .setFields(embedFields)
      .setFooter({
        text: `requested by ${interaction.message.interaction.user.username}`,
      })
      .setThumbnail(`https://mc-heads.net/avatar/${uuid}/100`)
      .setTitle(
        `profile: **\`\`${profile}\`\`** username: **\`\`${username}\`\`**\nCurrent Stage: **\`\`unknown\`\`**`
      )
      .setColor(`RED`)
      .setAuthor({
        name: `${username}'s Lily Weight`,
        url: `https://sky.shiiyu.moe/stats/${username}/${profile}`,
      });
    const buttonrow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(`weight:senither:${uuid}:${profile}`)
        .setLabel("Press to get senither weight")
        .setStyle("SECONDARY")
    );
    interaction.update({ embeds: [embed], components: [buttonrow] });
  },
});
