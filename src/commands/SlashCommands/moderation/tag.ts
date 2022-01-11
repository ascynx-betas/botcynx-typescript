import { Collection } from "discord.js";
import { ticketBlockedName } from "../../../config";
import { tagModel } from "../../../models/tag";
import { slashCommand } from "../../../structures/Commands";
import { CommandType } from "../../../typings/Command";

export default new slashCommand({
  name: "tag",
  description: "manage tags",
  userPermissions: ["ADMINISTRATOR"],
  category: "other",
  options: [
    {
      name: "delete",
      type: "SUB_COMMAND",
      description: "delete a tag",
      options: [
        {
          name: "name",
          type: "STRING",
          required: true,
          description: "the name of the tag",
        },
      ],
    },
    {
      name: "create",
      type: "SUB_COMMAND",
      description: "create a new tag",
      options: [
        {
          name: "name",
          type: "STRING",
          required: true,
          description: "the name of the tag",
        },
        {
          name: "response",
          type: "STRING",
          required: true,
          description: "what will be said when the command is executed",
        },
        {
          name: "description",
          type: "STRING",
          required: true,
          description: "the description of the command",
        },
      ]
    },
    {
      name: "modify",
      type: "SUB_COMMAND",
      description: "modify a tag",
      options: [
        {
          name: "name",
          type: "STRING",
          required: true,
          description: "the name of the tag",
        },
        {
          name: "response",
          type: "STRING",
          required: false,
          description: "what will be said when the command is executed",
        },
        {
          name: "description",
          type: "STRING",
          required: false,
          description: "the description of the command",
        },
      ]
    },
  ],

  run: async ({ interaction, client }) => {
    const response = interaction.options.getString("response");
    let description = interaction.options.getString("description");
    const name = interaction.options.getString("name");
    const subCommand = interaction.options.getSubcommand();
    const guild = interaction.guild;

    const blacklistedNames = client.ArrayOfSlashCommands.map(
      (c: any) => c.name
    );
    if (subCommand == "create") {
      const TagCommand: CommandType = {
        name: name,
        description: description,
        category: "tag",
        run: async ({ interaction }) => {
          interaction.followUp({
            content: response,
            allowedMentions: { parse: [] },
          });
        },
      };
      client.ArrayOfSlashCommands.set(TagCommand.name, TagCommand);
      let numberOfTags: any = await tagModel.find({
        guildId: guild.id,
      });
      numberOfTags = numberOfTags.length;
      if (numberOfTags >= 2)
        return interaction.followUp({
          content: `you reached the maximum tag limit per server`,
        });

      const existing = await tagModel.find({
        guildId: guild.id,
        name: name,
      });
      if (existing.length == 0) {
        if (blacklistedNames.includes(name))
          return interaction.followUp({
            content: `you cannot name a command the same as a normal command`,
          });
        new tagModel({
          guildId: guild.id,
          name: name,
          description: description,
          text: response,
        }).save();

        return client.guilds.cache
          .get(guild.id)
          .commands.create({name: name, description: description})
          .then(() =>
            interaction.followUp({ content: `created new tag ${name}` })
          ).catch(() => interaction.followUp({content: `I failed to create the tag, please try again later, if it keeps repeating the error contact the developer.`}))
      }
    } else if (subCommand == "delete") {
      //isDelete == true
      interaction.followUp({ content: `this operation may take a while` });
      const existing = await tagModel.find({
        guildId: guild.id,
        name: name,
      });
      if (existing.length < 1)
        return interaction.followUp({ content: `this tag does not exist` });

      if (ticketBlockedName.includes(name))
        return interaction.followUp({
          content: `You cannot delete a non-tag command`,
        });
      await tagModel.deleteOne({
        guildId: guild.id,
        name: name,
      });

      const command = interaction.guild
        .commands.cache.filter(c => c.name === name);
      const commandId = command.map(c => c.id)[0];
      if (typeof commandId == "undefined")
        return interaction.followUp({ content: `command isn't registered` });
      client.guilds.cache
        .get(guild.id)
        .commands.delete(commandId)
        .then(() =>
          interaction.followUp({ content: `successfully deleted ${name}` })
        );
    } else if (subCommand == "modify") {
      if (!description) {
        description = await tagModel.find({
          guildID: guild.id,
          name: name
        })[0].description
      }
      const command = {
        name: name,
        description: description,
      }
      tagModel.updateOne(
        { guildId: guild.id, name: name },
        { $set: { text: response, description: description } }
      );
      const commandId = client.guilds.cache
        .get(guild.id)
        .commands.cache.get(name).id;
      return client.guilds.cache
        .get(guild.id)
        .commands.edit(commandId, command)
        .then(() =>
          interaction.followUp({ content: `modified tag ${name}` })
        );
    }
  },
});
