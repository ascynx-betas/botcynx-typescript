import { EmbedFieldData, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { searchRepositories } from "../../lib/repoPull";
import { WhitelistedCommand } from "../../structures/Commands";

export default new WhitelistedCommand({
    name:"find-repo",
    description: "Search for mods on github",
    cooldown: 60,
    options: [
        {
            name: "query",
            description: "the query you want to use",
            type: "STRING",
            required: true,
        }
    ],

    run: async({interaction, client}) => {
        const queryParameter = interaction.options.getString('query');

        const query = encodeURIComponent(queryParameter);

        const data = await searchRepositories(query);
        if (!data.items || data.items == null) return interaction.followUp({content: `there are no results for that query`})
        if (data.total_count >= 5) data.items = data.items.slice(0, 5);

        data.items.sort((a, b) => b.stargazers_count - a.stargazers_count);

        let items: {name: string, owner: string, description: string, repoURL: string, stars: number}[] = [];
        data.items.forEach((item) => {
            let description: string;
            if (item.description?.length <= 200) description = item.description;
                else if (item.description?.length >= 200) {
                    item.description = item.description.slice(0, 200);
                    description = item.description + "... "
                } else description = "no description set";
                

            let name = item.name;
            let owner = item.owner.login;
            let repoURL = item.html_url;
            let stargazers = item.stargazers_count;

            items.push({description: description, name: name, owner: owner, repoURL: repoURL, stars: stargazers});

        });

        let fields: EmbedFieldData[] = [];
        let buttonFields: MessageButton[] = [];

        items.forEach((item) => {
            fields.push({name: `${item.owner}/${item.name} - ${item.stars} ⭐`, value: `${item.description}`});
            buttonFields.push(new MessageButton().setStyle("LINK").setURL(item.repoURL).setLabel(item.name));

        });


            const embed = new MessageEmbed()
                .setTitle(`${items.length === 1? `${items[0].name}`: `results for ${queryParameter}`}`)
                .setFields(fields)
                .setFooter({text: `requested by ${interaction.user.tag}`});

            const actionRow = new MessageActionRow().addComponents(buttonFields);
            
            interaction.followUp({embeds: [embed], components: [actionRow]});

        


    }
})