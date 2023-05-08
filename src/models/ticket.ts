import * as mongoose from "mongoose";

export interface Ticket {
  channel: string;
  name: string;
  welcomemessage: string;
  linkedmessage: string;
  guildId: string;
  blocked: string;
}

const schema = new mongoose.Schema<Ticket>({
  channel: String,
  name: String,
  welcomemessage: String,
  linkedmessage: String,
  guildId: String,
  blocked: String,
});
const ticketModel = mongoose.model<Ticket>("ticket", schema);

export { ticketModel };
