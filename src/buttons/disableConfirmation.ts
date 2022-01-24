import { MessageEmbed } from "discord.js";
import { configModel } from "../models/config";
import { ButtonResponse } from "../structures/Commands";

export default new ButtonResponse({
    category: 'disable',
    temporary: true,
    onlyAuthor: true,

    run: async({interaction, client}) => {
        const fields = interaction.customId.split(':');
        const command = fields[1];
        const flag = fields[2];

        if (flag == "local") {
            const config = await configModel.find({guildId: interaction.guild.id});
            const guildConfig = config[0]
            if (guildConfig.disabledCommands.includes(command)) {
    
                configModel.updateOne({guildId: interaction.guild.id}, {$pull: { disabledCommands: command}}, function(err) {
                    if (err) {
                        const embed = new MessageEmbed()
                            .setDescription('there was an error while removing the command from disabled commands')
                            .setTitle('Error')
                            .setFooter({text: `E`})
                        return interaction.update({embeds: [embed], components: []})
                }
                });

                const embed = new MessageEmbed()
                    .setTitle('Success')
                    .setDescription(`successfully removed ${command} from disabled commands`)

                interaction.update({embeds: [embed], components: []});
            } else {

                configModel.updateOne({
                    guildId: interaction.guild.id,
                }, {$addToSet: { disabledCommands: command}}, function(err) {
                    if (err) {
                    const embed = new MessageEmbed()
                            .setDescription('there was an error while disabling that command')
                            .setTitle('Error')
                            .setFooter({text: `E`})
                        return interaction.update({embeds: [embed], components: []})
                        }});
            
                const embed = new MessageEmbed()
                    .setTitle('Success')
                    .setDescription(`successfully added ${command} to disabled commands`)

                interaction.update({embeds: [embed], components: []});

            }
        } else if (flag == "global") {
            if (interaction.user.id != process.env.developerId) return interaction.update({content: `You cannot modify the global configuration`})

            const config = await configModel.find({guildId: "global"});
            const globalConfig = config[0];

            if (globalConfig.disabledCommands.includes(command)) {
                //remove command

                configModel.updateOne({guildId: 'global'}, {$pull: { disabledCommands: command}}, function (err) {
                    if (err) {
                        const embed = new MessageEmbed()
                        .setDescription('there was an error while removing the command from disabled commands')
                        .setTitle('Error')
                        .setFooter({text: `E`})
                        return interaction.update({embeds: [embed], components: []})
                }
            })

            const embed = new MessageEmbed()
                    .setTitle('Success')
                    .setDescription(`successfully removed ${command} from global disabled commands`)

            interaction.update({embeds: [embed], components: []});

            } else {
                //add command

                configModel.updateOne({guildId: 'global'}, {$addToSet: { disabledCommands: command}}, function (err) {
                    if (err) {
                        const embed = new MessageEmbed()
                            .setDescription('there was an error while disabling that command')
                            .setTitle('Error')
                            .setFooter({text: `E`})
                        return interaction.update({embeds: [embed], components: []})
                    }
                })

                const embed = new MessageEmbed()
                    .setTitle('Success')
                    .setDescription(`successfully added ${command} to global disabled commands`)

            interaction.update({embeds: [embed], components: []});
            }
        }
        
    }
})