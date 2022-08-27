import { ChannelType, TextChannel } from "discord.js";
import { isId } from "../../../lib/personal-modules/discordPlugin";
import { Command } from "../../../structures/Commands";

export default new Command({
  name: "hackban",
  aliases: ["dban", "hban", "hb", "cb"],
  botPermissions: ["ManageMessages", "KickMembers", "ManageThreads"],
  userPermissions: ["ManageMessages", "KickMembers"],

  run: async ({ message, client, args, request }) => {
    let user: string = args[0];
    if (isId(user) == false) return request.send({ content: `invalid user` });

    let deleteOnly = false;
    if (["-do", "--delete-only"].includes(args[1])) deleteOnly = true;

    //clear junk in id
    let id = /[^[0-9]/gi;
    user = user.replace(id, "");

    const member = message.guild.members.cache.get(user);
    if (!member)
      return request.send({ content: `this user isn't in this guild` });

    const channels = message.guild.channels.cache.filter(
      (c) =>
        c.type === ChannelType.GuildText ||
        c.type === ChannelType.GuildPublicThread ||
        c.type === ChannelType.GuildPrivateThread
    );

    await request.send({
      content: `deleting messages from ${member}`,
      allowedMentions: { parse: [] },
    });

    try {
      let total = 0;
      try {
        for (let i = 0; i < channels.size; i++) {
          let channel = channels.at(i);
          let messages = await (channel as TextChannel).messages.fetch({
            limit: 50,
          });
          messages = messages.filter(
            (m) => m.author.id == member.id && [0, 19, 20].includes(m.type)
          );
          messages.forEach((m) => {
            m.delete().catch(() => null);
            total += 1;
          });
        }
      } catch (e) {
        return request.edit({ content: `Missing permission to delete messages` });
      }

      if (deleteOnly) {
        await request.edit({
          content: `Cleared ${total} message${
            total > 1 ? "s" : ""
          } from ${member}.`,
          allowedMentions: { parse: [] },
        });
      } else {
        member
          .kick()
          .then((member) =>
          request.edit({
              content: `Kicked ${member} and cleared ${total} message${
                total > 1 ? "s" : ""
              }.`,
              allowedMentions: { parse: [] },
            })
          )
          .catch(() => {
            request.edit({
              content: `Couldn't kick ${member} but cleared ${total} message${
                total > 1 ? "s" : ""
              }.`,
              allowedMentions: { parse: [] },
            });
          });
      }
    } catch (ignored) {}
  },
});
