import { Command } from "../../../structures/Commands";


export default new Command ({
    name: 'ping',
    run: async({ message, client, args }) => {
        if (args.length > 0) throw Error('beans')
        message.reply({content: ` ${client.ws.ping}ms!`});
    }
})