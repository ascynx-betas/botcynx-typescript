import { botcynx } from "..";
import { Event } from "../structures/Event";
import { permissions } from "../personal-modules/bitfieldCalculator";
import {
  BaseGuildTextChannel,
  EmbedFieldData,
  GuildChannel,
  Message,
  MessageActionRow,
  MessageActionRowComponent,
  MessageButton,
  MessageButtonStyle,
  MessageEmbed,
  ThreadChannel,
} from "discord.js";
import lilyweight from "lilyweight";
import {
  extractWeight,
  getSpecifiedProfile,
} from "../personal-modules/senither";
import { testfor } from "../personal-modules/testFor";
import { ticketModel } from "../models/ticket";
import {
  infoEmbedCreation,
  permOverride,
  SetActiveButton,
  setButtonRows,
} from "../personal-modules/discordPlugin";

export default new Event("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) return;
  if (interaction.isContextMenu()) return;
  //don't forget to add buttonInteraction once it's necessary
  if (interaction.isButton()) {
    if (interaction.message.author.id != botcynx.user.id) return;
    //do a if for each types of buttons
    let current = Date.now();
    let creation = (interaction.message as Message).createdTimestamp;
    let time = current - creation;

    if (interaction.customId.startsWith("weight")) {
      //weight Buttons
      if (time >= 900000) {
        const buttonRow = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId(interaction.customId)
            .setLabel("Timed out")
            .setStyle("DANGER")
            .setDisabled(true)
        );

        return interaction.update({ components: [buttonRow] });
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
            .setCustomId(`weight senither`)
            .setLabel("Press to get senither weight (WIP)")
            .setStyle("SECONDARY")
        );
        interaction.update({ embeds: [embed], components: [buttonrow] });
        return;
      }
      //weight senither
      if (interaction.customId == "weight senither") {
        //extract from embed
        let uuid = interaction.message.embeds[0].thumbnail.url;
        uuid = uuid.slice(28, uuid.length - 4);
        let profilename = interaction.message.embeds[0].author.url;
        profilename = profilename.slice(29, profilename.length);
        const fields = profilename.split("/");
        const speprofile = fields[1];
        const username = fields[0];
        const profile = await getSpecifiedProfile(uuid, speprofile).catch(
          () => null
        );
        if (profile == null) return;

        const data = await extractWeight(profile);

        const description = data.description;
        const profileName = data.profilename;

        const embed = new MessageEmbed()
          .setDescription(description)
          .setFooter({
            text: `requested by ${interaction.message.interaction.user.username}`,
          })
          .setColor(`RED`)
          .setAuthor({
            name: `${username}'s senither weight`,
            url: `https://sky.shiiyu.moe/stats/${username}/${profileName}`,
          })
          .setThumbnail(`https://mc-heads.net/avatar/${uuid}/100`)
          .setTitle(
            `profile: **\`\`${profileName}\`\`** username: **\`\`${username}\`\`**`
          );

        const buttonRow = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId("weight lily")
            .setLabel("Press to get lily weight (WIP)")
            .setStyle("SECONDARY")
        );

        return interaction.update({ embeds: [embed], components: [buttonRow] });
      }
    } else if (interaction.customId.startsWith("info")) {
      //Timeout
      if (time >= 900000) {
        const buttonRow = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId(interaction.customId)
            .setLabel("Timed out")
            .setStyle("DANGER")
            .setDisabled(true)
        );

        return interaction.update({ components: [buttonRow] });
      }

      //info categories
      const interactionCommands: any = botcynx.ArrayOfSlashCommands.concat(
        botcynx.commands
      );
      let types: string[] = interactionCommands.map(
        (c) => c.category || "other"
      );
      types = [...new Set(types)];
      let category: string[] | string = interaction.customId.split(" ");
      category = category[1];
      let arrayOfButtons: MessageActionRowComponent[] = [];
      let messageComponents = interaction.message.components.map(
        (c) => c.components
      );
      messageComponents = messageComponents[0].concat(messageComponents[1]);
      let idArray = messageComponents.map((c) => c.customId);
      const buttonStyles = await SetActiveButton(interaction.customId, idArray);
      types.forEach(function (type, index) {
        const button = new MessageButton()
          .setCustomId(`info ${type}`)
          .setLabel(`${type}`)
          .setStyle(buttonStyles[index]);

        arrayOfButtons.push(button);
      });
      if (arrayOfButtons.length >= 25)
        return interaction.followUp({
          content: `there are too many categories to create enough buttons`,
        });
      let components: MessageActionRow[] = await setButtonRows(arrayOfButtons);

      let beans = infoEmbedCreation(category);
      let { fields, title } = beans;
      let embed: MessageEmbed;
      embed = new MessageEmbed().addFields(fields).setTitle(title);

      //update embed and set current button to PRIMARY style
      interaction.update({ embeds: [embed], components: components });
    } else if (interaction.customId.startsWith("close")) {
      //close ticket button
      const thread = interaction.channel;
      if (interaction.channel.type === "GUILD_PRIVATE_THREAD") {
        interaction
          .reply({ content: `Locking thread...`, ephemeral: true })
          .then(() => (thread as ThreadChannel).setLocked())
          .then(() => (thread as ThreadChannel).setArchived());
      } else if (interaction.channel.type === "GUILD_PUBLIC_THREAD") {
        interaction
          .reply({ content: `Locking thread...`, ephemeral: true })
          .then(() => (thread as ThreadChannel).setLocked())
          .then(() => (thread as ThreadChannel).setArchived());
      } else
        return interaction.reply({
          content: `this channel is not a thread`,
          ephemeral: true,
        });
    } else if (interaction.customId.startsWith("ticket")) {
      //ticket open buttons
      const guildId = interaction.guild.id;
      const guild = interaction.guild;
      const channel = interaction.channel;
      const customId = interaction.customId;
      let target = interaction.user;

      const success = testfor(
        global.bot.ticketBlockedNames,
        interaction.customId
      );
      if (success != true) {
        let fields = customId.split(" ");
        const buttonRow = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId("close")
            .setLabel("close ticket")
            .setStyle("PRIMARY")
        );

        const config = await ticketModel.find({
          guildId: guildId,
          name: fields[1],
        });
        const permissionOverwrites = (
          channel as GuildChannel
        ).permissionOverwrites.cache.map((any) => any);
        let blacklisted: string;
        await permOverride(permissionOverwrites).then((permission) => {
          let list = permission.permlist;
          let denied = permission.denied;
          let result: number;
          list.forEach(function (list, index) {
            if (list.includes(`<@&${target.id}>`)) return (result = index);
          });

          if (typeof result !== "undefined") {
            let userPermissions = permissions(Number(denied[result]));
            if (userPermissions.includes("SEND_MESSAGES_IN_THREADS"))
              return (blacklisted = "blacklisted");
          }
        });
        if (blacklisted == "blacklisted") return;
        if (guild.features.includes("PRIVATE_THREADS")) {
          const thread = await (channel as BaseGuildTextChannel).threads.create(
            {
              name: `${interaction.user.tag}-${fields[1]}`,
              autoArchiveDuration: 1440,
              type: "GUILD_PRIVATE_THREAD",
              reason: "created new private ticket",
            }
          );
          (thread as ThreadChannel).send({
            content: `${config[0].welcomemessage || "undefined"}`,
            components: [buttonRow],
          });
          (thread as ThreadChannel).members.add(`${interaction.user.id}`);
        } else {
          const thread = await (channel as BaseGuildTextChannel).threads.create(
            {
              name: `${interaction.user.tag}-${fields[1]}`,
              autoArchiveDuration: 1440,
              type: "GUILD_PUBLIC_THREAD",
              reason: "created new public ticket",
            }
          );
          (thread as ThreadChannel).send({
            content: `${config[0].welcomemessage || "undefined"}`,
            components: [buttonRow],
          });
          (thread as ThreadChannel).members.add(`${interaction.user.id}`);
        }
      }
    }
  }
});
