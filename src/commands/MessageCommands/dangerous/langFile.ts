import { getUpdaterFile } from "../../../lib/Testlang";
import { Command } from "../../../structures/Commands";

export default new Command({
  name: "getUpdaterFile",
  aliases: ["guf"],
  devonly: true,
  category: "other",

  run: async ({ client, message, args }) => {
    const bufferLang: Buffer = getUpdaterFile();
    message.reply({
      files: [{ attachment: bufferLang, name: "botcynx_lang_file" }],
    });
  },
});
