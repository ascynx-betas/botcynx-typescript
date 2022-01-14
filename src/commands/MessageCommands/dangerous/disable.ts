import { configModel } from "../../../models/config";
import { Command } from "../../../structures/Commands";

export default new Command({
    name: "disable",
    aliases: ["d", "enable"],
    
    run: async({ message, client, args }) => {
        const target = (args[0]);
        const flags = (args[1]);
        //available flags: -l local(current guild) -g global(every guild)

        //events that can be disabled: linkReader and roleLinked
        //commands that can be disabled: all
        const commands = (client.ArrayOfSlashCommands.concat(client.commands)).map((c: any) => c.name);

        if (!commands.includes(target) && target != "linkReader" && target != "roleLinked") return message.reply({content: `you cannot disable ${target} as it is not an available command / event`}); //doesn't exist

        if (target == "disable" || target == "exec") return message.reply({content: `sorry but you cannot disable that command.`})


        if (!flags || flags == "-l") {
        const config = await configModel.find({guildId: message.guild.id});
        const guildConfig = config[0]
        if (guildConfig.disabledCommands.includes(target)) {

            configModel.updateOne({guildId: message.guild.id}, {$pull: { disabledCommands: target}}, function(err) {
                if (err) return message.reply({content: `there was an error while removing the command from disabled commands`})
            })

            message.reply({content: `successfully removed ${target} from disabled commands`})
        } else {

            configModel.updateOne({
                guildId: message.guild.id,
            }, {$addToSet: { disabledCommands: target}}, function(err) {
                if (err) return message.reply({content: `there was an error while disabling that command`})
            });
        
            message.reply({content: `successfully added ${target} to disabled commands`})
        }
    } else if (flags == "-g") {
        return message.reply({content: `global config is not currently available`})
    } else {
        return message.reply({content: `there is no such command flag`})
    }

    }
})