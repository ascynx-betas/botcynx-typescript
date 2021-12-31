import { slashCommand } from "../../../structures/Commands";


export default new slashCommand({
    name: 'beans',
    description: 'replies with beans',
    
    run: async({ interaction }) => {
        interaction.followUp({content: `<:bean:884039174678773810>`});
    }
})