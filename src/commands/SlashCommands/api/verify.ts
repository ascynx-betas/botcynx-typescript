import { ApplicationCommandOptionType } from "discord.js";
import { verifyModel } from "../../../models/verifyModel";
import { getPlayerByUuid } from "../../../lib/HypixelAPIUtils";
import { getUuidbyUsername } from "../../../lib/personal-modules/mojang";
import { SlashCommand } from "../../../structures/Commands";
import { checkHypixelLinked } from "../../../lib/utils";

export default new SlashCommand({
  name: "verify",
  description: "verifies or update the user's discord info into the database",
  require: ["hypixelApiKey", "mongooseConnectionString"],
  category: "hypixel",
  cooldown: 5,
  options: [
    {
      name: "username",
      description: "the minecraft username",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "action",
      description: "the action that will be executed by the bot",
      type: ApplicationCommandOptionType.String,
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

  run: async ({ interaction }) => {
    const username = interaction.options.getString("username");
    const userTag = interaction.user.tag;
    const userId = interaction.user.id;
    const action = interaction.options.getString("action");

    let uuid: string = await getUuidbyUsername(username).catch(() => null);
    if (uuid == null)
      return interaction.followUp({
        content: `Either account does not exist or I couldn't retrieve it from the API`,
      });

    if (!uuid)
      return interaction.followUp({
        content: `Either account does not exist or I couldn't retrieve it from the API`,
      });

    const uuidInfo = await verifyModel.find({
      minecraftuuid: uuid,
    });
    let info = uuidInfo[0];

    let discord = await getPlayerByUuid(uuid);
    let discordLinked = discord?.player?.socialMedia?.links?.DISCORD;

    if (!discordLinked)
      return interaction.followUp({
        content: `please link hypixel to your discord account\nyou can link it by following the steps in this video: https://i.gyazo.com/3a2358687dae9b4333fd2fef932e0a17.mp4`,
      });

    if (action == "verify" || !action) {
      //verify code

      if (uuidInfo.length > 0)
        return interaction.followUp({
          content: `that account is already linked, if you want to change the linked account, use the update action`,
        });

      if (checkHypixelLinked(interaction.user, discordLinked)) {
        new verifyModel({
          userId: userId,
          uuid,
        })
          .save()
          .catch((e) => {
            return interaction.followUp({
              content: `There was an error while trying to save the data, please try again`,
            });
          })
          .then(() => {
            return interaction.followUp({
              content: `added ${userTag} as ${username} in database`,
              allowedMentions: { parse: [] },
            });
          });
      } else {
        return interaction.followUp({
          content: `please link hypixel to your discord account\nyou can link it by following the steps in this video: https://i.gyazo.com/3a2358687dae9b4333fd2fef932e0a17.mp4`,
        });
      }
    } else {
      //update command

      if ((uuidInfo.length = 0))
        return interaction.followUp({
          content: `You haven't verified yet, please use the /verify command`,
        });
      if (userId == info?.userId)
        return interaction.followUp({
          content: `your account is already linked to that minecraft account`,
        });

      if (checkHypixelLinked(interaction.user, discordLinked)) {
        verifyModel
          .updateOne(
            { minecraftuuid: `${uuid}` },
            {
              $set: { userId: `${userId}` },
              function(err: any) {
                if (err)
                  return interaction.followUp({
                    content: `there was an error while trying to update, please try again later`,
                  });
              },
            }
          )
          .then(() => {
            return interaction.followUp({
              content: `successfully updated linked account`,
            });
          });
      } else {
        return interaction.followUp({
          content: `please link hypixel to your discord account\nyou can link it by following the steps in this video: https://i.gyazo.com/3a2358687dae9b4333fd2fef932e0a17.mp4`,
        });
      }
    }
  },
});
