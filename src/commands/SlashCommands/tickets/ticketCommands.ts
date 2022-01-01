import { GuildChannel, GuildTextBasedChannel, Message, MessageEmbed, TextChannel, ThreadChannel } from "discord.js";
import { permOverride } from "../../../personal-modules/discordPlugin";
import { slashCommand } from "../../../structures/Commands";
import * as bitfieldCalc from '../../../personal-modules/bitfieldCalculator'
import { ticketModel } from "../../../models/ticket";

export default new slashCommand({
    name: "ticket",
  description: "allows to modify ticket config / execute ticket commands",
  require:["mongooseConnectionString"],
  userPermissions: ["MANAGE_THREADS"],
  botPermissions: ["MANAGE_THREADS"],
  options: [
    {
      name: "sub-command",
      description: "the sub-command to execute",
      required: true,
      type: "STRING",
      choices: [
        {
          name: "del",
          value: "del",
        },
        {
          name: "add",
          value: "add",
        },
        {
          name: "close",
          value: "close",
        },
        {
          name: "block",
          value: "block",
        },
        {
          name: "modify",
          value: "modify",
        },
      ],
    },
    {
      name: "config-name",
      description:
        "the name of the config, only needed for the del sub-command",
      required: false,
      type: "STRING",
    },
    {
      name: "user",
      description: "target of the action",
      required: false,
      type: "USER",
    },
    {
      name: "edit",
      description: "what will be modified",
      required: false,
      type: "STRING",
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
      description: "to what it's changed",
      required: false,
      type: "STRING",
    },
  ],

  run: async ({ interaction, client }) => {
      const action = interaction.options.getString('sub-command');
      const config = interaction.options.getString('config-name');
      const target = interaction.options.getUser('user');
      const change = interaction.options.getString('change');
      const edit = interaction.options.getString('edit');
      const guildId = interaction.guild.id;
      const channel = interaction.channel;

      if (action != "del") {
        if (interaction.channel.isThread() === false && action != "modify") {
          return interaction.followUp({content: `the channel in which you executed this action is not a thread`});
        
        } else {
          if (action == "close") {
            const thread = interaction.channel;
            interaction.followUp({content: `Locking thread...`})
              .then(() => (thread as ThreadChannel).setLocked())
              .then(() => (thread as ThreadChannel).setArchived());
          } else if (action == "add") {
            const thread = interaction.channel;

            if (typeof target == "undefined") return interaction.followUp({content: `please enter a valid user`});
            (thread as ThreadChannel).members.add(target.id).then(() => interaction.followUp({content: `successfully added ${target.tag} to the current thread`}));
          } else if (action == "block") {
            if (!target || typeof target === "undefined") {
              //if no target specified
              const parentChannel = interaction.guild.channels.cache.get((channel as ThreadChannel).parentId);
              const permissions = (parentChannel as GuildChannel).permissionOverwrites.cache.map(any => any);

            await permOverride(permissions).then((permissions) => {
              let denied = permissions.denied;
              let result = [];
              let permBed = [];
              denied.forEach(function (denied) {
                const deniedPermission = bitfieldCalc.permissions(Number(denied));

                if (deniedPermission.includes('SEND_MESSAGES_IN_THREADS')) {
                  return result.push(true);
                } else return result.push(false);
              })
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
              const embed = new MessageEmbed()
                .setDescription(description)
                .setTitle(`Blocked users`)
                interaction.followUp({ embeds: [embed]})
            });
            } else {
              //if specified

              const parentChannel = interaction.guild.channels.cache.get((channel as ThreadChannel).parentId);
              const permissions = (parentChannel as GuildChannel).permissionOverwrites.cache.map(any => any);

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
                    content: `${target.tag} is now unblocked`
                  });
                } else {
                  (parentChannel as GuildChannel).permissionOverwrites.create(target.id, {
                    SEND_MESSAGES_IN_THREADS: false,
                  });
                  return interaction.editReply({content: `**${target.tag}** is now blocked from speaking in threads`});
                }
              });
            }
            } else if (action == "modify") {
              if (typeof config === "undefined" || !config || typeof edit === "undefined" || !edit || typeof change === "undefined" || !change) return interaction.followUp({content: `please specify configuration name`});
              const ticket = await ticketModel.find({
                guildId: guildId,
                name: config,
              });
              if (ticket.length === 0) return interaction.followUp({content: `specified ticket id does not exist, please enter a real ticket id`});

              if (edit === "description") {
                const embed = new MessageEmbed()
                  .setColor("RANDOM")
                  .setDescription(`${change || "press create to enter in contact with staff members"}`);

                  await (interaction.guild.channels.cache.get(ticket[0].channel) as GuildTextBasedChannel)
                    .messages.fetch(ticket[0].linkedmessage)
                    .then((message) => message.edit({embeds: [embed]}).then(() => {
                      return interaction.followUp({content: `edited message`});
                    })
                  );
              } else if (edit === "welcome_message") {
                ticketModel.updateOne({ guildId: `${guildId}, name: ${config}`},
                { $set: { welcomemessage: `${change || undefined}`}},
                function (err: any) {
                  if (err) return interaction.followUp({content: `there was an error while trying to update, please try again later`});
                });
                return interaction.followUp({content: `successfully changed welcome message`});
              }
            } else {
              interaction.followUp({content: `I have no idea how you did that, but I haven't coded this, ;-;`})
            }
          }
        } else {
          //code of del
          let userId = interaction.user.id;
          let guild = interaction.guild;
          let guildMember = guild.members.fetch(userId);
          let userPermission = bitfieldCalc.permissions(Number((await guildMember).permissions));

          if (!userPermission.includes('ADMINISTRATOR') && userId !== guild.ownerId && userId !== process.env.developerId) return interaction.followUp({content: `you do not have required permission`});

          if (!config) return interaction.followUp({content: `please specify configuration name`});

          if (config == "config" || config.includes(`info`) || config == "close") return interaction.followUp({content: `you cannot delete ${config}`});

          const existing = await ticketModel.find({
            name: config,
            guildId: guildId,
          });
          if (existing.length == 0) return interaction.followUp({content: `ticket does not exist`});
          ticketModel.deleteOne({guildId: guildId, name: config})
            .then(() => {
              const message = (interaction.guild.channels.cache.get(existing[0].channel) as GuildTextBasedChannel).messages.cache.get(existing[0].linkedmessage)
              if (!message) return interaction.followUp({content: `I could not delete the linked message, please do it yourself`})
              message.delete().then(() => interaction.followUp({content: `successfully deleted`}))})
        }
      }
})