import { Collection, Message } from "discord.js";
import { botcynx } from "../..";
import { Event } from "../../structures/Event";
import { botcynxInteraction, ButtonResponseType } from "../../typings/Command";

export default new Event('interactioncommandCreate', (interaction: botcynxInteraction) => {
    const filter = i => i.message.interaction.id === interaction.id;
    const collector = interaction.channel.createMessageComponentCollector({filter, time: 30000});

    collector.on('end', async collected => {
        let messages = collected.map(i => i.message.id);
        let customIds = collected.map(i => i.customId);
        messages = [...new Set(messages)];
        customIds = [...new Set(customIds)];

        if (collected.size == 0) {
            let messages: Collection<string, Message> = await interaction.channel.messages.fetch({limit: 20});
            messages = messages.filter(m => m.interaction?.id == interaction.id);

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

            interaction.channel.messages.cache.get(messagesArr[0]).edit({components: []});

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
                if (button.temporary == true) interaction.channel.messages.cache.get(messageId).edit({components: []});
            }
    })
})
