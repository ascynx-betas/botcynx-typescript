import { GuildTextBasedChannel } from "discord.js";
import { MessageContextCommand } from "../../../structures/Commands";

export default new MessageContextCommand({
    name: "rawData",
    type: "MESSAGE",
    category: "other",
    userPermissions: ["MANAGE_MESSAGES"],

    run: async ({ interaction, client }) => {
        (interaction.channel as GuildTextBasedChannel).messages.fetch(interaction.targetId).then(async message => {
            try {
                const channel = await interaction.user.createDM(true);

                channel.send({content: `${JSON.stringify(message.toJSON())}`});
            } catch (e) {console.log(e)};
        });

        interaction.followUp({content: "Done!", ephemeral: true});
    }
})