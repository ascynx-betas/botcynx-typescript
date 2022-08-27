import { EmbedBuilder } from "discord.js";
import { Command } from "../../../structures/Commands";
import { inspect } from "util";
import * as lib from "../../../lib/index";
import fetch from "node-fetch";

export default new Command({
  name: "exec",
  aliases: ["eval", "ev", "e", "ex", "execute", "evaluate"],
  devonly: true,
  category: "other",
  usage: `(flags: "async", "sudo", "silent", "attachment") ${process.env.botPrefix}exec <if flags doesn't have attachment, code in message content else in message attachment>`,

  run: async ({ client, message, args, request }) => {
    if (args.length == 0) return;

    const token = process.env.botToken;
    let mongooseConnectionString = process.env.mongooseConnectionString;
    const hypixelapikey = process.env.hypixelapikey;
    const logwb = process.env.webhookLogLink;
    const gitToken = process.env.githubToken;

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
    let possibleFlags: string = args.at(args.length - 1);
    if (possibleFlags.startsWith("-")) {
      (code as string[]).splice(code.length - 1, 1);
      let flagList = ["async", "sudo", "silent", "attachment"];
      let flags = possibleFlags.split("-");
      flags.forEach((flag: string) => {
        if (flagList.includes(flag)) activeFlags.push(flag);
      });
    }
    if (
      activeFlags.includes("attachment") &&
      message.attachments.map((c) => c).length == 0
    )
      return await request.send({
        content: `when using the attachment flag, please include code in attachment`,
      });

    if (
      badPhrases.some((p) =>
        new RegExp(`.*${p}.*`, "gi").test(message.content)
      ) &&
      !activeFlags.includes("sudo")
    ) {
      return await request.send({
        content: `This eval has been blocked by smooth brain protection™️`,
      });
    }

    if (activeFlags.includes("attachment")) {
      for (const [, { url }] of message.attachments) {
        if (!url.endsWith(".txt") && !url.endsWith(".js"))
          return await request.send({
            content: `when using the attachment flag, please attach a .js / .txt file`,
          });

        code = await (await fetch(url)).text();
      }
    }

    code = activeFlags.includes("attachment")
      ? (code as string)
      : (code as string[]).join(" ");

    if (activeFlags.includes("async")) code = "(async () => {" + code + "})()";

    try {
      let Cregexp = /process\.env\.?/gim;
      let r = Cregexp.test(code);
      if (r === true && !activeFlags.includes("sudo"))
        throw Error("not happening m8");
      let evaled = eval(code);
      let cleaned = await clean(evaled);
      cleaned = cleaned.replace(
        new RegExp(
          [
            token,
            mongooseConnectionString,
            hypixelapikey,
            logwb,
            gitToken,
          ].join("|"),
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
      if (cleaned.length > 1000) {
        hastebin = await lib.haste(cleaned);
        cleaned = cut(cleaned);
      }
      if (!activeFlags.includes("silent")) {
        const embed = new EmbedBuilder()
          .setFields([
            { name: "**input:**", value: cool },
            {
              name: `**output: Type: (${
                cleaned.split(" ")[1] != "<ref" &&
                cleaned.split(" ")[2] != "*1>"
                  ? typeof evaled
                  : cleaned.split(" ")[3]
              })**`,
              value: cleaned,
            },
          ])
          .setAuthor({
            name: `Success ✅${
              activeFlags.length > 0
                ? ` - Active flags: ${activeFlags.join(", ")} `
                : ""
            }`,
          })
          .setFooter({ text: hastebin || `beans` });
          request.send({ embeds: [embed] });
      }
    } catch (err) {
      let hastebin;
      let cool = code;
      cool = `\`\`\`js\n${cool}\n\`\`\``;
      err = `\`\`\`\n${err}\n\`\`\``;
      if (cool.length > 1000) cool = cut(cool);
      if (err.length > 1000) {
        hastebin = await lib.haste(err);
        err = cut(err);
      }
      const embed = new EmbedBuilder()
        .setFields([
          { name: "**input:**", value: cool },
          { name: "**output:**", value: err },
        ])
        .setAuthor({
          name: `Error ❌${
            activeFlags.length > 0
              ? `- Active flags: ${activeFlags.join(", ")}`
              : ""
          }`,
        })
        .setFooter({ text: hastebin || `beans` });
        request.send({ embeds: [embed] });
    }
  },
});
