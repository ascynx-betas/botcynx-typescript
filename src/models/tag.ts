import * as mongoose from "mongoose";

export interface Tag {
  name: string;
  guildId: string;
  description: string;
  text: string;
}

const schema = new mongoose.Schema<Tag>({
  name: String,
  guildId: String,
  description: String,
  text: String,
});
const tagModel = mongoose.model<Tag>("tag", schema);

export { tagModel };
