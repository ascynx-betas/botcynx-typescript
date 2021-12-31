import { MessageEmbed } from "discord.js";
import { verifyModel } from "../../../models/verifyModel";
import { getPlayerByUuid, getStatus } from "../../../personal-modules/hypixel";
import { getUuidbyUsername } from "../../../personal-modules/mojang";
import { slashCommand } from "../../../structures/Commands";


export default new slashCommand({
    name: 'hypixel',
    description: 'send informations about a user',
    options: [
        {
            name: "username",
            description: "ign of the player",
            type: "STRING",
            required: false,
        },
    ],
    
    run: async({ interaction }) => {
        let username = interaction.options.getString('username');
        let uuid: any;
        if (!username) {
            //!GET INFORMATION FROM DATABASE

            const userId = interaction.user.id;

            const userInfo = await verifyModel.find({
                userId: userId,
            });
            let info = userInfo[0];

            if (!userInfo?.length) return interaction.followUp({
                content: `please provide the username parameter or verify using the /verify command`,
            });

            uuid = info.minecraftuuid; //update uuid when info is received
        }

        if (typeof uuid === "undefined") {
            uuid = await getUuidbyUsername(username).catch(() => null);

            if (uuid == null) return interaction.followUp({content: `couldn't fetch uuid`});

            uuid = uuid.id;
        } else {
            const data = await getPlayerByUuid(uuid).catch(() => null);
            username = data.player?.displayname;

            if (!username) return interaction.followUp({content: `it seems as though the player doesn't exist on the hypixel api`})
        }
        let isVerified: boolean;

        //if verified
        const verified = await verifyModel.find({
            minecraftuuid: uuid,
        });

        if (typeof verified === "undefined" || !verified || verified.length == 0) {
            isVerified = false;
        } else isVerified = true;

        let discord: any = await getPlayerByUuid(uuid).catch(() => null);
            discord = discord.player.socialMedia.links.DISCORD;

            if (!discord) discord = "couldn't fetch discord";
        
        let status = await getStatus(uuid).catch(() => null);
            status = status.session.online;
            if (status == false) status = `🔴`;
            if (status == true) status = `🟢`;

            if (uuid === null || username === null) return interaction.followUp({content: `player not found`})


            let description: string;
            if (uuid) {
                description = `username: ${username}\n UUID: ${uuid}\n Linked discord account: ${discord}\n online: ${status}\n verified: ${isVerified}`;


            } else {
                description = `username: ${username}\n UUID: ${verified[0].minecraftuuid}\n Linked discord account: ${discord}\n online: ${status}\n verified: ${isVerified}`;


            }

            let embed = new MessageEmbed()
                .setTitle(`Informations about ${username}`)
                .setColor('RANDOM')
                .setDescription(description)
                .setFooter({text: `requested by ${interaction.user.tag}`})
                .setThumbnail(`https://mc-heads.net/avatar/${username}/100`)

                interaction.followUp({embeds: [embed]})

            //create embed / send it
    }

})