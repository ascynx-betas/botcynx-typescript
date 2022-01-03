import * as mongoose from "mongoose";

export interface ticket {
  channel: string;
  name: string;
  welcomemessage: string;
  linkedmessage: string;
  guildId: string;
  blocked: string;
}

const schema = new mongoose.Schema<ticket>({
  channel: String,
  name: String,
  welcomemessage: String,
  linkedmessage: String,
  guildId: String,
  blocked: String,
});
const ticketModel = mongoose.model<ticket>("ticket", schema);

export { ticketModel };
