import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { ButtonResponse } from "../structures/Commands";
import lilyweight from "lilyweight";

export default new ButtonResponse({
  category: "weight",
  customId: "lily",
  temporary: true,
  require: ["hypixelApiKey"],
  run: async ({ interaction, client }) => {
    const lily = new lilyweight(process.env.hypixelapikey);
    //extract info from embed
    var uuid = interaction.message.embeds[0].thumbnail.url;
    uuid = uuid.slice(28, uuid.length - 4);
    var profilename = interaction.message.embeds[0].author.url;
    profilename = profilename.slice(29, profilename.length);
    const fields = profilename.split("/");
    let profile = fields[1];
    if (profile === "null") {
      let profileName: any = interaction.message.embeds[0].title;
      profileName = profileName.split("``");
      console.log(profileName[1]);
      profile = profileName[1];
    }
    const username = fields[0];
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
    const embed = new MessageEmbed()
      .setDescription(
        `Total weight is **\`\`${
          Math.round(weight.total * 10) / 10
        }\`\`** Current stage is: **\`\`unknown\`\`**\n
                  <:catacombs:914860327978532874> Dungeon weight is \`\`${tcata}\`\`(\`\`${catab}\`\` from F completion, \`\`${catam}\`\` from MM completion and \`\`${catae}\`\` from cata level)
                  <:beheaded:914859571351269447> Slayer weight is \`\`${tslayer}\`\`
                          <:skill:914859774187814932> Skill weight is \`\`${tskill}\`\`(\`\`${skillb}\`\`/\`\`${skillo}\`\` overflow)`
      )
      .setFooter({
        text: `requested by ${interaction.message.interaction.user.username}`,
      })
      .setThumbnail(`https://mc-heads.net/avatar/${uuid}/100`)
      .setTitle(
        `profile: **\`\`${profile}\`\`** username: **\`\`${username}\`\`**`
      )
      .setColor(`RED`)
      .setAuthor({
        name: `${username}'s Lily Weight`,
        url: `https://sky.shiiyu.moe/stats/${username}/${profile}`,
      });
    const buttonrow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(`weight:senither`)
        .setLabel("Press to get senither weight (WIP)")
        .setStyle("SECONDARY")
    );
    interaction.update({ embeds: [embed], components: [buttonrow] });
  },
});
