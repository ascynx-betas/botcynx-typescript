import { slashCommand } from "../../../structures/Commands";


export default new slashCommand({
    name: 'ping',
    description: 'replies with pong',
    run: async({ interaction, client }) => {
        interaction.followUp({content: ` ${client.ws.ping}ms!`});
    }
})