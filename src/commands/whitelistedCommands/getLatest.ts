import { ApplicationCommandOptionType, Embed, EmbedBuilder } from "discord.js";
import { WhitelistedCommand } from "../../structures/Commands";
import { createHash } from "crypto";
import fetch from "node-fetch";
import { botcynx } from "../..";
import { Loader, getProject, getVersionFromHash } from "../../lib";

export default new WhitelistedCommand({
    name: "modrinth",
    description: "Get the latest mod from the modrinth api from a provided jar",
    cooldown: 60,
    category: "other",
    options: [
        {
            name: "jar",
            description: "the file you want the latest version of",
            type: ApplicationCommandOptionType.Attachment,
            required: true
        },
        {
            name: "loader",
            description: "The Loader used",
            type:  ApplicationCommandOptionType.String,
            choices: [
                {
                    name: "Fabric",
                    value: "fabric"
                },
                {
                    name: "Forge",
                    value: "forge"
                },
                {
                    name: "Quilt",
                    value: "quilt"
                }
            ],
            required: true
        },
        {
            name: "version",
            description: "the minecraft version you want to check for",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    invisible: true,

    run: async ({ interaction, client }) => {
        const file = interaction.options.get("jar")?.attachment;
        if (!file.name.endsWith("jar")) {
            interaction.reply({content: "The file provided is not a jar", ephemeral: true});
            return;
        }

        let loader = interaction.options.get("loader")?.value as string;
        let minecraftversion = interaction.options.get("version")?.value as string;
        if (minecraftversion && !minecraftversion.match(/\d\.\d{1,2}(?:\.\d{1,2})?/)) {
            interaction.reply({content: `The Minecraft version is not valid`});
            return;
        }

        const res = await fetch(file.url, { headers: { "user-agent": client.userAgent } });

        let hash = "";
        try {
            const fileBuffer = await res.buffer();
            hash = createHash("sha512").update(fileBuffer).digest("hex");
        } catch (e) {
            //failed to get the file or hash
            interaction.followUp({
                content: "Couldn't get hash of attachment.",
                ephemeral: true
            });
            return;
        }

        const versionData = await getVersionFromHash(hash, Loader.fromString(loader.toUpperCase()), minecraftversion);
        if (versionData === null) {
            interaction.followUp({
                content: `Couldn't find mod on Modrinth`,
                ephemeral: true
            });
            return;
        }

        const projectData = await getProject(versionData.project_id);

        const embed = new EmbedBuilder();

        embed.addFields(
            {name: "Mod Name", value: projectData.title, inline: true},
            {name: "Last Version", value: `[${versionData.version_number}](${versionData.files[0].url})`, inline: true},
            {name: "Modrinth Page", value: `[${projectData.title}](https://modrinth.com/mod/${projectData.slug})`}
        );
        embed.setFooter({text: versionData.date_published});

        interaction.followUp({
            embeds: [embed],
            ephemeral: true
        });
    },
    register: ({ guild }) => {
        guild.commands.create(botcynx.whitelistedCommands.get("modrinth"));
    }
})