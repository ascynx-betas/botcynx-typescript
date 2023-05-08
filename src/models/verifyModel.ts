import * as mongoose from "mongoose";

export interface Verify {
  userId: string;
  minecraftuuid: string;
  labels: Array<string>;
  oldlinked: Array<string>;
}

const schema = new mongoose.Schema<Verify>({
  userId: String,
  minecraftuuid: String,
  labels: Array,
  oldlinked: Array,
});
const verifyModel = mongoose.model<Verify>("verify", schema);

export { verifyModel };
