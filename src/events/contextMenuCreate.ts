import { botcynx } from "..";
import { Event } from "../structures/Event";
import { contextInteraction, MessageContextType, UserContextType } from "../typings/Command";
import { permissions } from "../personal-modules/bitfieldCalculator"
import { CommandInteractionOptionResolver } from "discord.js";

export default new Event('interactionCreate', async (interaction: contextInteraction) => {
    if (interaction.isCommand()) return;
    if (interaction.isButton()) return;
    if (interaction.isContextMenu()) {
        let command: UserContextType | MessageContextType = botcynx.userContextCommands.get(interaction.commandName);
        if (!command) command = botcynx.messageContextCommands.get(interaction.commandName);
        if (!command) return interaction.followUp('You have used a non existant command');

        // if command is ephemeral
        if (command.invisible) {
            if (command.invisible == true) {
                await interaction.deferReply({ ephemeral: true });
            } 
        } else {
            await interaction.deferReply();
        }
        
        // if bot requires permissions
        if (command.botPermissions) {
            const botRequiredPermission = command.botPermissions;
            let botPermission: String[] = permissions(Number(interaction.guild.me.permissions));

            if (!botPermission.includes(botRequiredPermission[0]) &&
             !botPermission.includes("ADMINISTRATOR")
             ) return interaction.followUp({content: `I cannot execute this command due to the lack of ${botRequiredPermission}`});
            
        }
        //if user requires permission
        if (command.userPermissions) {
            const userRequiredPermission = command.userPermissions;
            let userPermissions: String[] = permissions(Number(interaction.guild.members.cache.get(interaction.user.id)));

            if(!userPermissions.includes(userPermissions[0]) &&
             !userPermissions.includes("ADMINISTRATOR") &&
              interaction.user.id != interaction.guild.ownerId &&
               interaction.user.id != process.env.developerId
               ) return interaction.followUp({content: `You cannot use this command as you lack ${userRequiredPermission}`});
        };


        command.run({
            args: interaction.options as CommandInteractionOptionResolver,
            client: botcynx,
            interaction: interaction as contextInteraction,
        })
    } else return
})