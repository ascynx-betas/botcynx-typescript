import { EmbedBuilder } from "discord.js";
import { Command } from "../../../structures/Commands";
import { inspect } from "util";
import * as lib from "../../../lib/index";
import fetch from "node-fetch";
import { LoggerFactory } from "../../../lib/index";
import sh from "sh";

const ExecLogger = LoggerFactory.getLogger("EVAL");

export default new Command({
  name: "exec",
  aliases: ["eval", "ev", "e", "ex", "execute", "evaluate"],
  devonly: true,
  category: "other",
  usage: `(flags: "async", "sudo", "silent", "attachment") ${process.env.botPrefix}exec <if flags doesn't have attachment, code in message content else in message attachment>`,
  advancedFlags: true,

  run: async ({ client, message, args, request }) => {
    if (args.length == 0 && request.getFlags().length == 0) return;

    const token = process.env.botToken;
    const mongooseConnectionString = process.env.mongooseConnectionString;
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

    const removeSensitiveInfo = (text: string) => {
      let regex = new RegExp(
        `(.*${token}.*|.*${hypixelapikey}.*|.*${logwb}.*|.*${gitToken}.*|.*${mongooseConnectionString}.*)`, "g"
      );

      return text.replaceAll(regex, "[REDACTED INFORMATION]");
    };
    const cut = function (text: string) {
      let length = text.length;
      const toAppend = `\n${length} char left`;

      let newLength = length - (1024 - toAppend.length);
      text = text.slice(0, (1024 - (toAppend.length + 18)));
      text = text.concat(toAppend.replace(length.toString(), newLength.toString()));
      
      return text;
    };

    let activeFlags: string[] = [];
    let code: string[] | string = args;
    if (request.getFlags().length > 0) {
      for (let possibleFlag of ["async", "sudo", "silent", "attachment"]) {
        if (request.hasFlag(possibleFlag)) {
          activeFlags.push(possibleFlag);
        }
      }
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

    if (/.+sh\.?.*/.test(message.content) && !activeFlags.includes("sudo") && lib.userIsDev(message.author)) {
      return await request.send({
        content: `No using command outside of sudo mode`
      })
    }

    if (activeFlags.includes("attachment")) {
      for (const [, { url }] of message.attachments) {
        const parsedURL = new URL(url);
        if (!parsedURL.pathname.endsWith(".txt") && !parsedURL.pathname.endsWith(".js"))
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
      cleaned = removeSensitiveInfo(cleaned);
      let cool = code;
      if (cool.includes("client") && cool.includes("config"))
        throw Error("nope");
      let hastebin: string;
      if (cool.length > 1000) cool = cut(cool);
      if (cleaned.length > 1000) {
        hastebin = await lib.HasteUtils.post(cleaned);
        cleaned = cut(cleaned);
      }

      cool = `\`\`\`js\n ${cool}\n\`\`\``;
      cleaned = `\`\`\`js\n ${cleaned}\n\`\`\``;

      if (activeFlags.includes("sudo")) {
        ExecLogger.warn("Received code evaluation with sudo flag.");
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
      console.log(err);
      let hastebin;
      let cool = code;
      cool = removeSensitiveInfo(cool);
      cool = `\`\`\`js\n${cool}\n\`\`\``;
      err = `\`\`\`\n${err}\n\`\`\``;
      if (cool.length > 1000) cool = cut(cool);
      if (err.length > 1000) {
        hastebin = await lib.HasteUtils.post(err);
        err = cut(err);
      }

      if (activeFlags.includes("sudo")) {
        ExecLogger.warn(
          "Received code evaluation with sudo flag leading to an error."
        );
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
