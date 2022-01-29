import { MessageEmbed } from "discord.js";
import { Command } from "../../../structures/Commands";
import { inspect } from "util";
import { haste } from "../../../lib/haste";

//!You can access modules using /app/personal-modules/{module}.js
export default new Command({
  name: "exec",
  aliases: ["eval", "ev", "e", "ex", "execute", "evaluate"],
  devonly: true,
  category: "other",

  run: async ({ client, message, args }) => {
    const token = process.env.botToken;
    let mongooseConnectionString = process.env.mongooseConnectionString;
    const hypixelapikey = process.env.hypixelapikey;
    const logwb = process.env.webhookLogLink;
    const badPhrases = ["delete", "destroy"];

    const clean = async (text: string) => {
      if (text && text.constructor.name == "Promise") text = await text; //don't remove the await

      if (typeof text !== "string") text = inspect(text, { depth: 5 });

      // Replace symbols with character code alternatives
      text = text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));

      // Send off the cleaned up result
      return text;
    };
    const cut = function (text: string) {
      let length = text.length;
      length = length - 998;
      text = text.slice(0, 998);
      text = text.concat(`\n${length} char left\n\`\`\``);
      return text;
    };

    let activeFlags: string[] = [];
      let code: string[] | string = args;
      let possibleFlags: string = args.at(args.length-1);
      if (possibleFlags.startsWith("-")) {
        (code as string[]).splice(code.length-1, 1);
        let flagList = ["async", "sudo", "silent"];
        let flags = possibleFlags.split('-');
        flags.forEach((flag: string) => {
          if (flagList.includes(flag)) activeFlags.push(flag)
        })
      }
      if (badPhrases.some((p) => code.includes(p)) && !activeFlags.includes('sudo')) {
        return await message.reply({content: `This eval has been blocked by smooth brain protection™️`});
      }

      code = (code as string[]).join(" ")

      if (activeFlags.includes('async')) code = "(async () => {" + code + "})()";

    try {


      let Cregexp = /process\.env\.?/gim;
      let r = Cregexp.test(code);
      if (r === true) throw Error("not happening m8");
      let evaled = eval(code);
      let cleaned = await clean(evaled);
      cleaned = cleaned.replace(
        new RegExp(
          [token, mongooseConnectionString, hypixelapikey, logwb].join("|"),
          "gi"
        ),
        ""
      );
      let cool = code;
      if (cool.includes("client") && cool.includes("config"))
        throw Error("nope");
      cool = `\`\`\`js\n ${cool}\n\`\`\``;
      cleaned = `\`\`\`js\n ${cleaned}\n\`\`\``;
        let hastebin;
      if (cool.length > 1000) cool = cut(cool);
      if (cleaned.length > 1000) {hastebin = await haste(cleaned); cleaned = cut(cleaned)};
      if (!activeFlags.includes('silent'))  {
      const embed = new MessageEmbed()
        .setFields([
          { name: "**input:**", value: cool },
          { name: "**output:**", value: cleaned },
        ])
        .setAuthor({ name: "Success ✅" + " - Active flags: " + activeFlags.join(", ")})
        .setFooter({text: (hastebin || `beans`)});
      message.channel.send({ embeds: [embed] });
        }

    } catch (err) {
      let hastebin;
      let cool = code;
      cool = `\`\`\`js\n${cool}\n\`\`\``;
      err = `\`\`\`\n${err}\n\`\`\``;
      if (cool.length > 1000) cool = cut(cool);
      if (err.length > 1000) {hastebin = await haste(err); err = cut(err)};
      const embed = new MessageEmbed()
        .setFields([
          { name: "**input:**", value: cool },
          { name: "**output:**", value: err },
        ])
        .setAuthor({ name: "Error ❌" + " - Active flags: " + activeFlags.join(", ")})
        .setFooter({text: (hastebin || `beans`)});
      message.channel.send({ embeds: [embed] });
    }
  },
});
