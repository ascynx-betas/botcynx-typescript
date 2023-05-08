import * as mongoose from "mongoose";

export interface Config {
  name: string;
  guildId: string;
  trigger: Array<string>;
  bypass: Array<string>;
  removable: Array<string>;
  logchannel: string;
  su: Array<string>;
  verify: string;
  blocked: Array<string>;
  disabledCommands: Array<string>;
}

const schema = new mongoose.Schema<Config>({
  name: String,
  guildId: String,
  trigger: Array,
  bypass: Array,
  removable: Array,
  logchannel: String,
  su: Array,
  verify: String,
  blocked: Array,
  disabledCommands: Array,
});
const configModel = mongoose.model<Config>("config", schema);

export { configModel };
