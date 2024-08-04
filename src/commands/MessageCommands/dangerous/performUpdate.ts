import { Command } from "../../../structures/Commands";
import { exec, execSync } from "child_process";
import { Embed, EmbedBuilder, GuildTextBasedChannel } from "discord.js";
import { escape } from "querystring";

export default new Command({
    name: "update",
    aliases: ["pu", "u"],
    devonly: true,
    category: "other",
    usage: `${process.env.botPrefix} update <branch?>`,

    run: async ({ client, message, args, request }) => {
        let branch = "main";
        if (args.length == 1) {
            branch = args[0];
        }

        exec("git branch", (execErr, stdout, stderr) => {
            if (execErr) {
                request.send({content: `Failed to update: ` + execErr});
                return;
            }

            let splits = stdout.split("\n");

            let currBranch = "main";
            for (let split of splits) {
                //transformations
                split.toLowerCase();
                split.trimEnd();

                if (!split.startsWith("*")) {
                    continue;
                }

                currBranch = split;
            }

            if (currBranch != branch) {
                branch.replaceAll(/[^a-zA-Z0-9_\-\./]/gmi, "");
                let checkoutStdOut = execSync("git checkout " + escape(branch));
                if (checkoutStdOut.toString('utf-8', 0, 5).toLowerCase() == "error") {
                    request.send("Failed to update, could not checkout to branch " + branch);
                    return;
                }
            }

            let pullStdOut = execSync("git pull");
            if (pullStdOut.toString('utf-8').toLowerCase() == "already up to date.") {
                request.send("Local instance is currently up to date");
            }

            let buildStdOut = execSync("npm run build");
            execSync(`pm2 restart botcynx-${process.env.environment}`);
        })
    }
});