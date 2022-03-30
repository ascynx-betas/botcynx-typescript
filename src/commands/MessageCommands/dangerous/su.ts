import { configModel } from "../../../models/config";
import { Command } from "../../../structures/Commands";

export default new Command({
  name: "superuser",
  aliases: ["su"],
  category: "other",
  devonly: true,
  require: ["mongooseConnectionString"],

  run: async ({ message, client, args }) => {
    const user = args[0];
    const flags = args[1];

    if (!user)
      return message.reply({
        content: `please specify who you want to add or remove`,
      });
    //available flags on this command
    // -l (local, add to current guild) -g (global, add to every guild)

    const Regexp = /[^[0-9]/gi;

    const Id = user.replace(Regexp, "");

    if (Id.length != 18)
      return message.channel.send({
        content: `the Id doesn't follow standards for an id`,
      });

    if (!flags || flags == "-l") {
      const config = await configModel.find({
        guildId: message.guild.id,
      });
      const guildconfig = config[0];
      const su = guildconfig.su;

      if (su.includes(Id)) {
        //remove

        configModel.updateOne(
          {
            guildId: message.guild.id,
          },
          { $pull: { su: `${Id}` } },
          function (err) {
            if (err)
              return message.reply({
                content: `there was an error while removing super user from <@${Id}>`,
                allowedMentions: { parse: [] },
              });
          }
        );

        message.reply({
          content: `successfully removed <@${Id}> from ${message.guild.name}'s super user list`,
        });
      } else {
        //add

        configModel.updateOne(
          {
            guildId: message.guild.id,
          },
          { $addToSet: { su: `${Id}` } },
          function (err) {
            if (err)
              return message.reply({
                content: `there was an error while giving super user to <@${Id}>`,
                allowedMentions: { parse: [] },
              });
          }
        );

        message.reply({
          content: `successfully added <@${Id}> to ${message.guild.name}'s super user list`,
        });
      }
    } else if (flags == "-g") {
      if (message.author.id != process.env.developerId) return;

      const config = await configModel.findOne({ guildId: "global" });
      if (config.su.includes(Id)) {
        //remove

        configModel.updateOne(
          {
            guildId: "global",
          },
          { $pull: { su: `${Id}` } },
          function (err) {
            if (err)
              return message.reply({
                content: `there was an error while removing super user from <@${Id}>`,
                allowedMentions: { parse: [] },
              });
          }
        );

        message.reply({
          content: `successfully removed <@${Id}> from global super user list`,
        });
      } else {
        //add

        configModel.updateOne(
          {
            guildId: "global",
          },
          { $addToSet: { su: `${Id}` } },
          function (err) {
            if (err)
              return message.reply({
                content: `there was an error while giving super user to <@${Id}>`,
                allowedMentions: { parse: [] },
              });
          }
        );

        message.reply({
          content: `successfully added <@${Id}> to global super user list`,
        });
      }
    } else {
      return message.reply({ content: `I cannot process that flag` });
    }
  },
});
