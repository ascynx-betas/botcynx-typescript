import { WhitelistedCommand } from "../../structures/Commands";
import { Modal, showModal, TextInputComponent } from "discord-modals"

export default new WhitelistedCommand({
    name:"modaltest",
    description: "a test for modals",
    isModalCommand: true,

    run: async ({client, interaction}) => {
        let modal = new Modal()
            .setCustomId("modaltest")
            .setTitle("ModalTest")
            .addComponents(
                new TextInputComponent()
                    .setCustomId("test")
                    .setLabel("test")
                    .setStyle("SHORT")
                    .setMinLength(2)
                    .setMaxLength(20)
                    .setRequired(true)
                    .setDefaultValue("test ?")
            );

            showModal(modal, {client, interaction});
        }
})