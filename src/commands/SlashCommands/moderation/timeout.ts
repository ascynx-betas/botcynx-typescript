import { slashCommand } from "../../../structures/Commands";
import ms from "ms";
import { postStartData } from "../../../events/ready";
import { ApplicationCommandOptionType } from "discord.js";

export default new slashCommand({
  name: "timeout",
  description: "timeout a user for a specified amount of time",
  userPermissions: ["ModerateMembers"],
  botPermissions: ["ModerateMembers"],
  category: "moderation",
  options: [
    {
      name: "user",
      type: ApplicationCommandOptionType.User,
      description: "target to timeout",
      required: true,
    },
    {
      name: "time",
      type: ApplicationCommandOptionType.String,
      description: "time for timeout",
      required: false,
    },
    {
      name: "reason",
      type: ApplicationCommandOptionType.String,
      description: "reason for timeout",
      required: false,
    },
  ],

  run: async ({ interaction }) => {
    let target = interaction.options.getUser("user");
    let time: string | number = interaction.options.getString("time");
    let reason = interaction.options.getString("reason");
    if (time === null) time = "1 hour";

    let timeForTimeout = ms(time);
    const guildMember = interaction.guild.members.cache.get(target.id);

    let date = Date.now();
    time = Math.floor((date + timeForTimeout) / 1000);
    // if the timeout time is under 60 seconds then do a :T instead of :F
    date = Math.floor(date / 1000);
    if (time - 60 <= date) {
      time = `<t:${time}:T>`;
    } else {
      time = `<t:${time}:F>`;
    }

    if (interaction.user.id == target.id)
      return interaction.followUp({ content: `You cannot timeout yourself !` });
    if (typeof guildMember === "undefined" || !guildMember)
      return interaction.followUp({
        content: `the user you're trying to timeout isn't in this server`,
      });

    if (
      (guildMember.roles.highest.position >=
        interaction.guild.members.cache.get(interaction.user.id).roles.highest
          .position &&
        interaction.user.id != interaction.guild.ownerId &&
        interaction.user.id != process.env.developerId) ||
      guildMember.id == interaction.guild.ownerId
    )
      return interaction.followUp({
        content: `You cannot timeout this user as they have higher permission than you do`,
      });

    guildMember
      .timeout(timeForTimeout, reason || "reason not provided")
      .then(() =>
        interaction.followUp({
          content: `Success, ${target} is now muted until ${time}`,
          allowedMentions: { parse: [] },
        })
      )
      .catch((error) => {
        if (error.httpStatus == 403)
          return interaction.followUp({
            content: `I cannot timeout this user as it has a higher role than myself`,
          });
        if (error.httpStatus == 400)
          return interaction.followUp({
            content: `You cannot timeout a member for more than ${postStartData.maxTimeout} !`,
          });
        if (error.httpStatus != 400 && error.httpStatus != 403)
          return interaction.followUp({
            content: `Encountered an unknown error while executing this command`,
          });
      });
  },
});
