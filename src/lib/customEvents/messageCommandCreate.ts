import { Message, Collection } from "discord.js";
import { botcynx } from "../..";
import { Event } from "../../structures/Event";
import { ButtonResponseType } from "../../typings/Command";

export default new Event('messageCommandCreate', message => {

    const createdAt = message.createdTimestamp;
    const filter = i => i.message.reference.messageId === message.id; //see if the interaction is linked to the created collector
    const collector = message.channel.createMessageComponentCollector({filter, time: 300000});
    
    collector.on('end', async collected => {
        let messages = collected.map(i => i.message.id);
        let customIds = collected.map(i => i.customId);
        messages = [...new Set(messages)];
        customIds = [...new Set(customIds)];

        if (collected.size == 0) {
            let messages: Collection<string, Message> = await message.channel.messages.fetch({limit: 20});
            messages = messages.filter(m => m.author.id == message.guild.me.id);
            messages = messages.filter(m => m.type == "REPLY");
            messages = messages.filter(m => m.reference?.messageId == message.id);

            const components = messages.map(m => m.components);
            let customIds: string[] = [];
            components.forEach((component) => {
                component.forEach((component) => {
                   let arrOfCustomIds = component.components.map(c => c.customId);
                    arrOfCustomIds.forEach((customId) => {
                        customIds.push(customId);
                    })
                })
            });
            let buttons: ButtonResponseType[] = [];
            customIds.forEach((customId) => {
                let fields = customId.split(':');
                const category = fields[0];
                const Id = fields[1];
                let button = botcynx.buttonCommands.get(category);
                    if (!button) button = botcynx.buttonCommands.get(`${category}:${Id}`);

                if (button) buttons.push(button)
            
            });

            if (buttons.some(m => m.temporary === true) != true) return;

            let messagesArr = messages.map(m => m.id);

            if (!messages || typeof messagesArr[0] == "undefined") return;

            message.channel.messages.cache.get(messagesArr[0]).edit({components: []});

        }

        let messageId = messages[0];
        let customId = customIds[0];

        if (!customId) return;
        const fields = customId.split(":");
        const category = fields[0];
        const Id = fields[1];
        let button = botcynx.buttonCommands.get(category);
            if (!button) button = botcynx.buttonCommands.get(`${category}:${Id}`);
            if (!button) return;
        
        
            if (button.temporary) {
                if (button.temporary == true) message.channel.messages.cache.get(messageId).edit({components: []});
            }
    })
})