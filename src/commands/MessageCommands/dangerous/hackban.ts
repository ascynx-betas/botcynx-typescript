import { ChannelType, TextChannel } from "discord.js";
import { isId } from "../../../personal-modules/discordPlugin";
import { Command } from "../../../structures/Commands";

export default new Command({
  name: "hackban",
  aliases: ["dban", "hban", "hb", "cb"],
  devonly: true,
  botPermissions: ["ManageMessages", "KickMembers", "ManageThreads"],

  run: async ({ message, client, args }) => {
    let m = message;
    let user: string = args[0];
    if (isId(user) == false) return message.reply({ content: `invalid user` });
    let id = /[^[0-9]/gi;
    user = user.replace(id, "");

    const member = message.guild.members.cache.get(user);
    if (!member)
      return message.reply({ content: `this user isn't in this guild` });

    const channels = message.guild.channels.cache.filter(
      (c) => c.type === ChannelType.GuildText
    );

    channels.forEach(async (channel) => {
      let messages = await (channel as TextChannel).messages.fetch({
        limit: 50,
      });
      messages = messages.filter((m) => m.author.id == member.id);
      messages.forEach((m) => m.delete().catch(null));
    });
    member
      .kick()
      .then((member) =>
        m.reply({ content: `kicked ${member} and deleted messages / threads` })
      );
  },
});
