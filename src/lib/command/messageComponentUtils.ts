import { APIButtonComponent, Collection, Message, MessageActionRowComponent, MessageType } from "discord.js";
import { ButtonResponseType, botcynxInteraction } from "../../typings/Command";
import { botcynx } from "../..";

export function getButtonResponseOf(component: MessageActionRowComponent): ButtonResponseType {
    let fields = component.customId.split(":");
    const category = fields[0];
    const id = fields[1];
    let button = botcynx.buttonCommands.get(category);
    if (!button) button = botcynx.buttonCommands.get(`${category}:${id}`);

    return button;
}

function filterTemporaryComponents(message: Message<boolean>) {
    const actionRows = message.components;
    let newComponents = [];
    if (actionRows.length == 0) return [];
    for (const actionRow of actionRows) {
        const currLineComponents = actionRow.components;
        if (currLineComponents.length == 0) continue;

        for (const component of currLineComponents) {
            if (component.customId) {
                //the ternary condition is required because it needs to be a boolean, undefined behaviour go brrrr
                (component.data as APIButtonComponent).disabled = ((component?.data?.disabled ? true : false) || getButtonResponseOf(component)?.temporary);
            }
        }
        if (!currLineComponents.every((v) => v?.disabled)) newComponents.push(actionRow);
    }
    return newComponents;
}

export async function messageOnEndCollection(message: Message<boolean>, collected: Collection<string, unknown>) {
    if (collected.size == 0) {
        let messages: Collection<string, Message> =
            await message.channel.messages.fetch({ limit: 20 });
            messages = messages.filter((m) => m?.author?.id === botcynx.user.id);
            messages = messages.filter((m) => m?.type == MessageType.Reply);
            messages = messages.filter((m) => m?.reference?.messageId == message.id);

            let m = messages.first();
            if (m.components.length == 0) return;
            const filteredComponents = filterTemporaryComponents(m);
    
            m?.edit({ components: filteredComponents}).catch(null);
    } else {
        botcynx.emitLater("messageCommandCreate", message);
    }
}

export async function interactionOnEndCollection(interaction: botcynxInteraction, collected: Collection<string, unknown>) {
    if (collected.size == 0) {
        let message = await interaction.fetchReply();

        if (message.components.length == 0) return;
        const filteredComponents = filterTemporaryComponents(message);
    
        message?.edit({ components: filteredComponents}).catch(null);
    } else {
        botcynx.emitLater("interactionCommandCreate", interaction);
    }
}