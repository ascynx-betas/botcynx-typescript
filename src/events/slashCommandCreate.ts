import { botcynx } from "..";
import { CommandInteractionOptionResolver } from "discord.js";
import { Event } from "../structures/Event";
import { botcynxInteraction } from "../typings/Command";
import { permissions } from "../personal-modules/bitfieldCalculator"
import { RequireTest } from "../personal-modules/commandHandler";

export default new Event('interactionCreate', async (interaction: botcynxInteraction) => {
    // slashCommands
    if (interaction.isContextMenu()) return;
    if (interaction.isButton()) return;

    if (interaction.isCommand()) {
        await interaction.deferReply();
        const command = botcynx.slashCommands.get(interaction.commandName);
        if(!command) return interaction.followUp('You have used a non existant command');

        if(command.devonly) {
            if (interaction.member.id != process.env.developerId) {
                return interaction.followUp({content: `Command is a dev only command, and is currently not available to other users.`})
            }
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

        if (command.require) {
            let RequireValue = await RequireTest(command.require);
            if (RequireValue == false) return interaction.followUp({content: `the client in which this command has been called, doesn't have the required values to execute this command`});
        }


        command.run({
            args: interaction.options as CommandInteractionOptionResolver,
            client: botcynx,
            interaction: interaction as botcynxInteraction,
        })
    } else return
})