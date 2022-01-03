import { MessageEmbed } from "discord.js";
import { Command } from "../../../structures/Commands";
import { inspect } from "util";

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

    const clean = async (text: string) => {
      if (text && text.constructor.name == "Promise") text = await text;

      if (typeof text !== "string") text = inspect(text, { depth: 1 });

      // Replace symbols with character code alternatives
      text = text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));

      // Send off the cleaned up result
      return text;
    };
    const c = function (text: string) {
      let length = text.length;
      length = length - 998;
      text = text.slice(0, 998);
      text = text.concat(`\n${length} char left\n\`\`\``);
      return text;
    };

    try {
      let Cregexp = /process\.env\.?/gim;
      let r = Cregexp.test(args.join(" "));
      if (r === true) throw Error("not happening m8");
      let evaled = eval(args.join(" "));
      let cleaned = await clean(evaled);
      cleaned = cleaned.replace(
        new RegExp(
          [token, mongooseConnectionString, hypixelapikey, logwb].join("|"),
          "gi"
        ),
        ""
      );
      let cool = args.join(" ");
      if (cool.includes("client") && cool.includes("config"))
        throw Error("nope");
      cool = `\`\`\`js\n ${cool}\n\`\`\``;
      cleaned = `\`\`\`js\n ${cleaned}\n\`\`\``;

      if (cool.length > 1000) cool = c(cool);
      if (cleaned.length > 1000) cleaned = c(cleaned);

      const embed = new MessageEmbed()
        .setFields([
          { name: "**input:**", value: cool },
          { name: "**output:**", value: cleaned },
        ])
        .setAuthor({ name: "Success ✅" });

      message.channel.send({ embeds: [embed] });
    } catch (err) {
      let cool = args.join(" ");
      cool = `\`\`\`js\n${cool}\n\`\`\``;
      err = `\`\`\`\n${err}\n\`\`\``;
      if (cool.length > 1000) cool = c(cool);
      if (err.length > 1000) err = c(err);
      const embed = new MessageEmbed()
        .setFields([
          { name: "**input:**", value: cool },
          { name: "**output:**", value: err },
        ])
        .setAuthor({ name: "Error ❌" });
      message.channel.send({ embeds: [embed] });
    }
  },
});
