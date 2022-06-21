import {
  ApplicationCommandOptionType,
  GuildChannel,
  GuildTextBasedChannel,
  EmbedBuilder,
  ThreadChannel,
  Colors,
} from "discord.js";
import { permOverride } from "../../../lib/personal-modules/discordPlugin";
import { slashCommand } from "../../../structures/Commands";
import * as bitfieldCalc from "../../../lib/personal-modules/bitfieldCalculator";
import { ticketModel } from "../../../models/ticket";

export default new slashCommand({
  name: "ticket",
  description: "allows to modify ticket config / execute ticket commands",
  require: ["mongooseConnectionString"],
  userPermissions: ["ManageThreads"],
  botPermissions: ["ManageThreads"],
  category: "ticket",
  options: [
    {
      name: "del",
      description: "delete a configuration",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "config-name",
          description:
            "the name of the config, only needed for the del sub-command",
          required: true,
          type: ApplicationCommandOptionType.String,
        },
      ],
    },
    {
      name: "add",
      description: "add a user to the current thread",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "target of the action",
          required: true,
          type: ApplicationCommandOptionType.User,
        },
      ],
    },
    {
      name: "block",
      description:
        "block a user from speaking in any of the current channel's threads",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "target of the action",
          required: true,
          type: ApplicationCommandOptionType.User,
        },
      ],
    },
    {
      name: "close",
      description: "closes a thread",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "modify",
      description: "modify a ticket message",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "edit",
          description: "what will be modified",
          required: true,
          type: ApplicationCommandOptionType.String,
          choices: [
            {
              name: "description",
              value: "description",
            },
            {
              name: "welcome message",
              value: "welcome_message",
            },
          ],
        },
        {
          name: "change",
          description: "to what will it be changed",
          required: true,
          type: ApplicationCommandOptionType.String,
        },
      ],
    },
  ],

  run: async ({ interaction, client }) => {
    const action = interaction.options.getSubcommand();
    const config = interaction.options.getString("config-name");
    const target = interaction.options.getUser("user");
    const change = interaction.options.getString("change");
    const edit = interaction.options.getString("edit");
    const guildId = interaction.guild.id;
    const channel = interaction.channel;

    if (action != "del") {
      if (interaction.channel.isThread() === false && action != "modify") {
        return interaction.followUp({
          content: `the channel in which you executed this action is not a thread`,
        });
      } else {
        if (action == "close") {
          const thread = interaction.channel;
          interaction
            .followUp({ content: `Locking thread...` })
            .then(() => (thread as ThreadChannel).setLocked())
            .then(() => (thread as ThreadChannel).setArchived());
        } else if (action == "add") {
          const thread = interaction.channel;

          if (typeof target == "undefined")
            return interaction.followUp({
              content: `please enter a valid user`,
            });
          (thread as ThreadChannel).members.add(target.id).then(() =>
            interaction.followUp({
              content: `successfully added ${target.tag} to the current thread`,
            })
          );
        } else if (action == "block") {
          if (!target || typeof target === "undefined") {
            //if no target specified
            const parentChannel = interaction.guild.channels.cache.get(
              (channel as ThreadChannel).parentId
            );
            const permissions = (
              parentChannel as GuildChannel
            ).permissionOverwrites.cache.map((any) => any);

            await permOverride(permissions).then((permissions) => {
              let denied = permissions.denied;
              let result = [];
              let permBed = [];
              denied.forEach(function (denied) {
                const deniedPermission = bitfieldCalc.permissions(
                  Number(denied)
                );

                if (deniedPermission.includes("SendMessagesInThreads")) {
                  return result.push(true);
                } else return result.push(false);
              });
              let index = 0;
              do {
                if (result[index] === true) {
                  permBed.push(permissions.permlist[index]);
                  index += 1;
                } else {
                  index += 1;
                }
              } while (index !== permissions.permlist.length);

              const description = permBed.join("\n");
              const embed = new EmbedBuilder()
                .setDescription(description)
                .setTitle(`Blocked users`);
              interaction.followUp({ embeds: [embed] });
            });
          } else {
            //if specified

            const parentChannel = interaction.guild.channels.cache.get(
              (channel as ThreadChannel).parentId
            );
            const permissions = (
              parentChannel as GuildChannel
            ).permissionOverwrites.cache.map((any) => any);

            await permOverride(permissions).then((permissions) => {
              if (permissions.permlist.includes(`<@${target.id}>`)) {
                /**
                 * if exists
                 * TODO detect if multiple permissions, if there is multiple just change the permission override
                 */

                (parentChannel as GuildChannel).permissionOverwrites.delete(
                  target.id,
                  `target of ticket block command`
                );
                return interaction.editReply({
                  content: `${target.tag} is now unblocked`,
                });
              } else {
                (parentChannel as GuildChannel).permissionOverwrites.create(
                  target.id,
                  {
                    SendMessagesInThreads: false,
                  }
                );
                return interaction.editReply({
                  content: `**${target.tag}** is now blocked from speaking in threads`,
                });
              }
            });
          }
        } else if (action == "modify") {
          if (
            typeof config === "undefined" ||
            !config ||
            typeof edit === "undefined" ||
            !edit ||
            typeof change === "undefined" ||
            !change
          )
            return interaction.followUp({
              content: `please specify configuration name`,
            });
          const ticket = await ticketModel.find({
            guildId: guildId,
            name: config,
          });
          if (ticket.length === 0)
            return interaction.followUp({
              content: `specified ticket id does not exist, please enter a real ticket id`,
            });

          if (edit === "description") {
            const embed = new EmbedBuilder()
              .setColor(Colors.Red)
              .setDescription(
                `${
                  change ||
                  "press create to enter in contact with staff members"
                }`
              );

            await (
              interaction.guild.channels.cache.get(
                ticket[0].channel
              ) as GuildTextBasedChannel
            ).messages
              .fetch(ticket[0].linkedmessage)
              .then((message) =>
                message.edit({ embeds: [embed] }).then(() => {
                  return interaction.followUp({ content: `edited message` });
                })
              );
          } else if (edit === "welcome_message") {
            ticketModel.updateOne(
              { guildId: `${guildId}, name: ${config}` },
              { $set: { welcomemessage: `${change || undefined}` } },
              function (err: any) {
                if (err)
                  return interaction.followUp({
                    content: `there was an error while trying to update, please try again later`,
                  });
              }
            );
            return interaction.followUp({
              content: `successfully changed welcome message`,
            });
          }
        } else {
          interaction.followUp({
            content: `I have no idea how you did that, but I haven't coded this, ;-;`,
          });
        }
      }
    } else {
      //code of del
      let userId = interaction.user.id;
      let guild = interaction.guild;
      let guildMember = guild.members.fetch(userId);
      let userPermission = bitfieldCalc.permissions(
        Number((await guildMember).permissions)
      );

      if (
        !userPermission.includes("Administrator") &&
        userId !== guild.ownerId &&
        userId !== process.env.developerId
      )
        return interaction.followUp({
          content: `you do not have required permission`,
        });

      if (!config)
        return interaction.followUp({
          content: `please specify configuration name`,
        });

      if (config == "config" || config.includes(`info`) || config == "close")
        return interaction.followUp({ content: `you cannot delete ${config}` });

      const existing = await ticketModel.find({
        name: config,
        guildId: guildId,
      });
      if (existing.length == 0)
        return interaction.followUp({ content: `ticket does not exist` });
      ticketModel
        .deleteOne({ guildId: guildId, name: config })
        .then(async () => {
          const message = await (
            interaction.guild.channels.cache.get(
              existing[0].channel
            ) as GuildTextBasedChannel
          ).messages.fetch(existing[0].linkedmessage);
          if (!message)
            return interaction.followUp({
              content: `I could not delete the linked message, please do it yourself`,
            });
          message
            .delete()
            .then(() =>
              interaction.followUp({ content: `successfully deleted` })
            );
        });
    }
  },
});
