import { configModel } from "../../../models/config";
import { Command } from "../../../structures/Commands";

export default new Command({
  name: "superuser",
  aliases: ["su"],
  category: "other",
  devonly: true,
  require: ["mongooseConnectionString"],
  usage: `${process.env.botPrefix}superuser [user (id or mention)] <flags: -l, -g>`,

  run: async ({ message, client, args, request }) => {
    const user = args[0];

    if (!user)
      return request.send({
        content: `please specify who you want to add or remove`,
      });
    //available flags on this command
    // -l (local, add to current guild) -g (global, add to every guild)

    const Regexp = /[^[0-9]/gi;

    const Id = user.replace(Regexp, "");

    if (Id.length != 18)
      return request.send({
        content: `the Id doesn't follow standards for an id`,
      });

    if (request.getFlags().length == 0 || request.hasFlag("local")) {
      const config = await configModel.find({
        guildId: message.guild.id,
      });
      const guildconfig = config[0];
      const su = guildconfig.su;

      if (su.includes(Id)) {
        //remove

        configModel.updateOne({ guildId: message.guildId }, { $pull: { su: Id } })
          .exec().catch((_err) => {
              return request.send({
                content: `there was an error while removing super user from <@${Id}>`,
                allowedMentions: { parse: ["everyone", "roles"] },
              });
        });

        request.send({
          content: `successfully removed <@${Id}> from ${message.guild.name}'s super user list`,
          allowedMentions: { parse: ["everyone", "roles"] },
        });
      } else {
        //add

        configModel.updateOne({ guildId: message.guildId }, { $addToSet: { su: Id } })
          .exec().catch((_err) => {
            return request.send({
              content: `there was an error while giving super user to <@${Id}>`,
              allowedMentions: { parse: ["everyone", "roles"] }
            })
          });

        request.send({
          content: `successfully added <@${Id}> to ${message.guild.name}'s super user list`,
          allowedMentions: { parse: ["everyone", "roles"] },
        });
      }
    } else if (request.hasFlag("global")) {
      if (message.author.id != process.env.developerId) return;

      const config = await configModel.findOne({ guildId: "global" });
      if (config.su.includes(Id)) {
        //remove

        configModel.updateOne({ guildId: "global" }, { $pull: { su: Id } })
          .exec().catch((_err) => {
            return request.send({
              content: `there was an error while removing super user from <@${Id}>`,
              allowedMentions: { parse: ["everyone", "roles"] }
            });
          });

        request.send({
          content: `successfully removed <@${Id}> from global super user list`,
          allowedMentions: { parse: ["everyone", "roles"] },
        });
      } else {
        //add

        configModel.updateOne({ guildId: "global" }, { $addToSet: { su: Id } })
          .exec().catch((_err) => {
            return request.send({
              content: `there was an error while giving super user to <@${Id}>`,
              allowedMentions: { parse: ["everyone", "roles"] },
            });
          })

        request.send({
          content: `successfully added <@${Id}> to global super user list`,
          allowedMentions: { parse: ["everyone", "roles"] },
        });
      }
    }
  },
});
