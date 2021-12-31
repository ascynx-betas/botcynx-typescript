import { Event } from "../structures/Event";
import { connect } from "mongoose";
import { getKeyInfo } from "../personal-modules/hypixel";

export default new Event("ready", async () => {
    console.log('----Status----')
    console.log('Bot is now online');
    if (!process.env.mongooseConnectionString) return;
    connect(process.env.mongooseConnectionString)
    console.log('connected to MongoDB')
    // send status to console.log depending on 
    if (process.env.developerId) console.log('developer is set in the config');
    if (process.env.environment) console.log(`currently running in ${process.env.environment} environment`);
    if (process.env.guildId) console.log('commands will be registered locally');
    if (process.env.hypixelapikey) {
        console.log('api key exists');
        let data = await getKeyInfo();
        if (data.success === true) console.log('api key is valid');
        if (data.success === false) console.log(`api key is invalid for ${data.cause}`);
    }
    if (process.env.webhookLogLink) console.log('errors will be logged');
    
});