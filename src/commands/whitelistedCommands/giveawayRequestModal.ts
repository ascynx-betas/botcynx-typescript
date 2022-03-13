import { Modal, showModal, TextInputComponent } from "discord-modals";
import { WhitelistedCommand } from "../../structures/Commands";

export default new WhitelistedCommand({
    name: "giveawayrequest",
    description: "send a new giveaway request",
    isModalCommand: true,

    run: async({ interaction, client, args }) => {


        let modal = new Modal()
            .setCustomId("giveawayrequest:" + interaction.guild.id)
            .setTitle("Giveaway Request (minimum: 5m coins)")
            .addComponents(
                new TextInputComponent()
                    .setCustomId("item")
                    .setLabel("Items or moners")
                    .setStyle("LONG")
                    .setMinLength(10)
                    .setMaxLength(200)
                    .setRequired(true)
                    .setDefaultValue("5 MILLERS SKYBLOCK COINS")
            ).addComponents(
                new TextInputComponent()
                        .setCustomId("username")
                        .setLabel("Minecraft username (if ≄ discord)")
                        .setStyle("SHORT")
                        .setMinLength(1)
                        .setMaxLength(16)
                        .setRequired(false)
            );

            showModal(modal, {client, interaction});

            
    }
})