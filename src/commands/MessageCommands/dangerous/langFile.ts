import { LocalizationHandler } from "../../../lib/Lang";
import { Command } from "../../../structures/Commands";

export default new Command({
  name: "getUpdaterFile",
  aliases: ["guf"],
  devonly: true,
  category: "other",

  run: async ({ client, message, args }) => {
    const bufferLang: Buffer = LocalizationHandler.getInstance().toBuffer();
    message.reply({
      files: [{ attachment: bufferLang, name: "botcynx_lang_file" }],
    });
  },
});
