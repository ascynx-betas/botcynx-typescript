import * as mongoose from 'mongoose';

export interface verify {
    userId: string,
    minecraftuuid: string,
    labels: Array<string>,
    oldlinked: Array<string>,
}

const schema = new mongoose.Schema<verify>({
    userId: String,
    minecraftuuid: String,
    labels: Array,
    oldlinked: Array,
    });
const verifyModel = mongoose.model<verify>('verify', schema);

export { verifyModel };