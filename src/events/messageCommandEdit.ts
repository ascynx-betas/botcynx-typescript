import { Message } from "discord.js";
import { botcynx } from "..";
import { configModel } from "../models/config";
import { RequireTest } from "../personal-modules/commandHandler";
import { Event } from "../structures/Event";

export default new Event('messageUpdate', async (oldMessage: Message, newMessage: Message) => {
    // MesssageCommands
    if(newMessage.author.bot ||
        !newMessage.guild ||
        !newMessage.content.toLowerCase().startsWith(process.env.botPrefix)
        ) return;

        const [cmd, ...args] = newMessage.content
        .slice(process.env.botPrefix.length)
        .trim()
        .split(/ +/g);

        let command = botcynx.commands.get(cmd.toLowerCase())
        if (!command) command = botcynx.commands.find((c) => c.aliases?.includes(cmd.toLowerCase()));

        if(!command) return;

        if (command.require) {
            let RequireValue = await RequireTest(command.require);
            if (RequireValue == false) return;
        }

        //doesn't respond after 15 minutes elapsed
        let createdAt = newMessage.createdTimestamp;
        let now = Date.now()
            let time = now - createdAt;
            if (time >= 900000) return;

        const Guildinfo = await configModel.find({
            guildId: newMessage.guildId
        });
        let info = Guildinfo[0];
        const su = info.su;
        if (!su.includes(newMessage.author.id) && newMessage.author.id != process.env.developerId) return; //message commands can only be used by super-users or the developer
        if (command.devonly === true && newMessage.author.id != process.env.developerId) return; //In message commands, devonly means that it can only be used by the set developer.

        await command.run({client: botcynx, message: newMessage, args});
});