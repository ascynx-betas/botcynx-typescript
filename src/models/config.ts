import * as mongoose from 'mongoose';

export interface config {
    name: string,
    guildId: string,
    trigger: Array<string>,
    bypass: Array<string>,
    removable: Array<string>,
    logchannel: string,
    su: Array<string>,
    verify: string,
    blocked: Array<string>,
}

const schema = new mongoose.Schema<config>({
    name: String,
    guildId: String,
    trigger: Array,
    bypass: Array,
    removable: Array,
    logchannel: String,
    su: Array,
    verify: String,
    blocked: Array, 
    });
const configModel = mongoose.model<config>('config', schema);

export { configModel };