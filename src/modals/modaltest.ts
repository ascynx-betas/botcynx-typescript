import { MessageEmbed } from "discord.js";
import { sendInfoWebhook } from "../lib/utils";
import { modalResponse } from "../structures/Commands";

export default new modalResponse({
    name: "modaltest",
    once: false,

    run: async ({modal, client}) => {
       if (modal.customId == "modaltest") {
           const test = modal.getTextInputValue("test");

           const embed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle("Received Modal")
            .setDescription("Sent by " + modal.user.tag)
            .addField("test", test, true);

            await sendInfoWebhook({embed: embed});
            modal.reply({content: "successfully submitted", ephemeral: true})
       }
    }
})