declare global {
    namespace NodeJS {
        interface ProcessEnv {
            botToken: string;
            guildId: string;
            environment: "dev" | "prod" | "debug";
            webhookLogLink?: string;
            developerId: string;
            hypixelapikey?: string;
            mongooseConnectionString?: string;
            botPrefix?: string;
        }
    }
}

export {};