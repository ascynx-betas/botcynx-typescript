import { botcynx } from "..";
import { Event } from "../structures/Event";
import { permissions } from "../personal-modules/bitfieldCalculator"
import { CommandInteractionOptionResolver, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import lilyweight from 'lilyweight'
import { extractWeight, getSpecifiedProfile } from "../personal-modules/senither";
import { profile } from "console";


export default new Event('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) return;
    if (interaction.isContextMenu()) return;
    //don't forget to add buttonInteraction once it's necessary
    if (interaction.isButton()) {
        if (interaction.message.author.id != botcynx.user.id) return;
        //do a if for each types of buttons
        let current = Date.now();
        let creation = (interaction.message as Message).createdTimestamp;
            let time = current - creation;

        if (interaction.customId.startsWith('weight')) {
            //weight Buttons
            if (time >= 900000) {
                const buttonRow = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId(interaction.customId)
                        .setLabel('Timed out')
                        .setStyle('DANGER')
                        .setDisabled(true));

                return interaction.update({components: [buttonRow]})           
            }

            //weight lily
            if (interaction.customId == "weight lily") {
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
                profileName = profileName.split('``');
                console.log(profileName[1])
                profile = profileName[1]
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
                .setFooter({text: `requested by ${interaction.message.interaction.user.username}`})
                .setThumbnail(`https://mc-heads.net/avatar/${uuid}/100`)
                .setTitle(
                  `profile: **\`\`${profile}\`\`** username: **\`\`${username}\`\`**`
                )
                .setColor(`RED`)
                .setAuthor({
                  name:`${username}'s Lily Weight`,
                  url:`https://sky.shiiyu.moe/stats/${username}/${profile}`
                });
              const buttonrow = new MessageActionRow().addComponents(
                new MessageButton()
                  .setCustomId(`weight senither`)
                  .setLabel("Press to get senither weight (WIP)")
                  .setStyle("SECONDARY")
              );
              interaction.update({ embeds: [embed], components: [buttonrow] });
              return;
            }
            //weight senither
            if (interaction.customId == "weight senither") {
                const senither = require("../personal-modules/senither");
                //extract from embed
                let uuid = interaction.message.embeds[0].thumbnail.url;
                uuid = uuid.slice(28, uuid.length - 4);
                let profilename = interaction.message.embeds[0].author.url;
                profilename = profilename.slice(29, profilename.length);
                const fields = profilename.split("/");
                const speprofile = fields[1];
                const username = fields[0];
             const profile = await 
                getSpecifiedProfile(uuid, speprofile).catch(() => null)
                if (profile == null) return;

                const data = await extractWeight(profile);

                const description = data.description;
                const profileName = data.profilename;

                    const embed = new MessageEmbed()
                        .setDescription(description)
                        .setFooter({text: `requested by ${interaction.message.interaction.user.username}`})
                        .setColor(`RED`)
                        .setAuthor({name: `${username}'s senither weight`, url: `https://sky.shiiyu.moe/stats/${username}/${profileName}`})
                        .setThumbnail(`https://mc-heads.net/avatar/${uuid}/100`)
                        .setTitle(`profile: **\`\`${profileName}\`\`** username: **\`\`${username}\`\`**`);

                        const buttonRow = new MessageActionRow().addComponents(
                            new MessageButton()
                                .setCustomId('weight lily')
                                .setLabel("Press to get lily weight (WIP)")
                                .setStyle('SECONDARY'));

                                return interaction.update({ embeds: [embed], components: [buttonRow]});
                 }
        } else if (interaction.customId.startsWith('info')) {
            //Timeout
            if (time >= 900000) {
                const buttonRow = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId(interaction.customId)
                        .setLabel('Timed out')
                        .setStyle('DANGER')
                        .setDisabled(true));

                return interaction.update({components: [buttonRow]})           
            }

            //info categories
            return console.log('triggered info button handler')

        } else if (interaction.customId.startsWith('close')) {
            //close ticket button
            return console.log('triggered close ticket button handler')

        } else if (interaction.customId.startsWith('ticket')) {
            //ticket open buttons
            return console.log('triggered open ticket button handler')

        }
    }


});