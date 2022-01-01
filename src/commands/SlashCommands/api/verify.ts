import { verifyModel } from "../../../models/verifyModel";
import { getPlayerByUuid } from "../../../personal-modules/hypixel";
import { getUuidbyUsername } from "../../../personal-modules/mojang";
import { slashCommand } from "../../../structures/Commands";


export default new slashCommand({
    name: 'verify',
    description: 'verifies or update the user\'s discord info into the database',
    require:["hypixelApiKey", "mongooseConnectionString"],
    options: [
        {
          name: "username",
          description: "the minecraft username",
          type: "STRING",
          required: true,
        },
        {
          name: "action",
          description: "the action that will be executed by the bot",
          type: "STRING",
          required: false,
          choices: [
            {
              name: "verify",
              value: "verify",
            },
            {
              name: "update",
              value: "update",
            },
          ],
        },
      ],
    
    run: async({ interaction }) => {
        const username = interaction.options.getString('username');
        const userTag = interaction.user.tag;
        const userId = interaction.user.id;
        const action = interaction.options.getString('action');


        let uuid: any = await getUuidbyUsername(username).catch(() => null);
            uuid = uuid.id;

                if (!uuid) return interaction.followUp({content: `username is not valid`})

                const uuidInfo = await verifyModel.find({
                    minecraftuuid: uuid,
                });
                let info = uuidInfo[0];

        let discord: any = await getPlayerByUuid(uuid).catch(() => null);
            discord = discord.player.socialMedia.links.DISCORD;

            if (!discord) return interaction.followUp({content: `please link discord to your discord account\nyou can link it by following the steps in this video: https://i.gyazo.com/3a2358687dae9b4333fd2fef932e0a17.mp4`});

            if (action == "verify" || !action) {
                //verify code

                if (uuidInfo.length > 0) return interaction.followUp({content: `that account is already linked, if you want to change the linked account, use the update action`});

                if (discord == userTag) {
                    new verifyModel({
                        userId: userId,
                        uuid,
                    }).save();
                    interaction.followUp({content: `added ${userTag} as ${username} in database`});

                }
            } else {
                //update command

                if (uuidInfo.length = 0) return interaction.followUp({content: `You haven't verified yet, please use the /verify command`});
                if (userId == info?.userId) return interaction.followUp({content: `your account is already linked to that minecraft account`})

                if (userTag == discord) {
                    verifyModel.updateOne(
                    { minecraftuuid: `${uuid}`},
                    { $set: { userId: `${userId}`},
                        function(err: any) {
                            if (err) return interaction.followUp({content: `there was an error while trying to update, please try again later`});
                        }
                    });

                    interaction.followUp({content: `successfully updated linked account`})
                }
            }
    }
})