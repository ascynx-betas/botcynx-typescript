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
    {
      name: "delete",
      type: "BOOLEAN",
      description: "if it deletes the tag or not",
      required: false,
    },
  ],

  run: async ({ interaction, client }) => {
    const response = interaction.options.getString("response");
    const description =
      interaction.options.getString("description") || "no description";
    const name = interaction.options.getString("name");
    const isDeleteCommand = interaction.options.getBoolean("delete") || false;
    const guild = interaction.guild;

    const blacklistedNames = client.ArrayOfSlashCommands.map(
      (c: any) => c.name
    );
    if (isDeleteCommand == false) {
      if (!response)
        return interaction.followUp({
          content: `if you want to create a new tag please specify it's response`,
        });
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
      const slashCommands: any = new Collection();
      client.guilds.cache
        .get(guild.id)
        .commands.cache.forEach(function (command) {
          slashCommands.set(command.name, command);
        });
      client.ArrayOfSlashCommands.set(TagCommand.name, TagCommand);
      slashCommands.set(TagCommand.name, TagCommand);
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
          .commands.create(slashCommands)
          .then(() =>
            interaction.followUp({ content: `created new tag ${name}` })
          );
      } else {
        tagModel.updateOne(
          { guildId: guild.id, name: name },
          { $set: { text: response, description: description } }
        );
        const commandId = client.guilds.cache
          .get(guild.id)
          .commands.cache.get(name).id;
        return client.guilds.cache
          .get(guild.id)
          .commands.edit(commandId, slashCommands)
          .then(() =>
            interaction.followUp({ content: `modified tag ${name}` })
          );
      }
    } else {
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

      const commandId = client.guilds.cache
        .get(guild.id)
        .commands.cache.get(name)?.id;
      if (typeof commandId == "undefined")
        return interaction.followUp({ content: `command isn't registered` });
      client.guilds.cache
        .get(guild.id)
        .commands.delete(commandId)
        .then(() =>
          interaction.followUp({ content: `successfully deleted ${name}` })
        );
    }
  },
});
