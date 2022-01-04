import * as mongoose from "mongoose";

export interface tag {
  name: string;
  guildId: string;
  description: string;
  text: string;
}

const schema = new mongoose.Schema<tag>({
  name: String,
  guildId: String,
  description: String,
  text: String,
});
const tagModel = mongoose.model<tag>("tag", schema);

export { tagModel };
