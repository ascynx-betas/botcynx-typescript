import { GuildTextBasedChannel, MessageEmbed } from "discord.js";
import { botcynx } from "..";
import { hasScamLink, safe } from "../lib/cache/scamlink";
import { similarityDetection } from "../lib/utils";
import { isLink } from "../personal-modules/testFor";
import { Event } from "../structures/Event";
//TODO rename the event to raid / scamlink detector
export default new Event('messageCreate', (message) => {

    if (message.author.bot || !message.guild) return;

    let Data: {isScamLink: boolean, cause: string} = {isScamLink: false, cause: ''};
    
    //if in scamLink database
    Data.isScamLink = hasScamLink(message.content);
    if (Data.isScamLink == true) Data = {isScamLink: Data.isScamLink, cause: 'Link detected in known database'};


    //common server scam method
    if (message.content.includes('@everyone') || message.content.includes('@here')) {
      if (message.content.split(' ').some(w => isLink(w))) {
        if (!message.member.permissions.toArray().includes('MENTION_EVERYONE')) Data = {isScamLink: true, cause: 'Common scam detection'};
      }
  }

  //similarity based automod
  (message.content.split(' ').filter(w => isLink(w))).forEach((word) => {
    safe.forEach((safeword) => {
      const testFields = word.split('/').filter(f => f != '');

      const result = similarityDetection(testFields[1], safeword);
      if (result.result == true && result.percentage >= 60 && !safe.some(w => w == testFields[1])) Data = {isScamLink: true, cause: `similarity based automod: ${word} is ${Math.floor(Math.round(result.percentage / 10) * 10)}% the same as ${safeword}`};

    });
  
  });
  
  //if ping spam raid
  if (message.mentions.users.size >= 5) Data = {isScamLink: true, cause: 'Spam mention'};

    if (Data.isScamLink == true) {
        const embed = new MessageEmbed()
            .setAuthor({name: "BOT ⚠️ "+ message.author.tag + " (" + message.author.id + ")"})
            .setDescription(`Triggered Raid / scam link detector: [here](https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id})\n\t${message.cleanContent}\n**Cause:** \`\`\`${Data.cause}\`\`\``)
            .setFooter({text: "triggered in: " + message.guild.name})
            .setColor('DARK_RED');

      (botcynx.channels.cache.get('903281241594413176') as GuildTextBasedChannel).send({
        embeds: [embed]
      }) 
    }
})