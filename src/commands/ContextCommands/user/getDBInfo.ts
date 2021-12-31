import { UserContextCommand } from "../../../structures/Commands";
import { MessageEmbed } from 'discord.js'
import { verifyModel } from "../../../models/verifyModel";
import * as hypixel from '../../../personal-modules/hypixel'

export default new UserContextCommand({
  name: "getUUID",
  type: "USER",
  invisible:true,
  run: async ({ client, interaction }) => {
      //TODO make it work
    const user = await client.users.fetch(interaction.targetId);
    const userId = user.id
    let specificity: string;

    const userInfo = await verifyModel.find({
        userId: userId,
    });
    const info = userInfo[0];
    if (!userInfo?.length) return interaction.followUp({content: `user isn't verified, please tell them to use the /verify command`, ephemeral: true});
    const uuid: string = info.minecraftuuid;
    if (typeof uuid === 'undefined') return interaction.followUp({content: `couldn't fetch uuid`, ephemeral: true});
    const data = await hypixel.getPlayerByUuid(uuid)
    if (data.success === false) return interaction.followUp({content: `couldn't fetch data`, ephemeral: true})
    const username = data.player.displayname;
    if (info.labels.length > 0) {
        const labellist = info.labels;
        if (labellist.includes("pog person")) {
            specificity = "<a:hypersquish:910587055313133608>";
          } else if (labellist.includes("owner")) {
            specificity = "<a:macroing:903652184766427187>";
          } else if (labellist.includes("scammer")) {
            specificity = "<a:LdanceFast:911214913270210580>";
          }
          return interaction.followUp({
              content: `${specificity || ""} ${user.tag}'s username is \`\`${username}\`\` their uuid is ${uuid} and they have the label(s) ${labellist.join(', ')}`,
              ephemeral: true,
          })
    } else {
        return interaction.followUp({
            content: `${user.tag}'s username is \`\`${username}\`\` and their uuid is ${uuid}`,
            ephemeral: true,
        })
    }
  },
});
