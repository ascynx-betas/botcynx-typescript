import { Command } from "../../../structures/Commands";

export default new Command({
    name: "devtest",
    aliases: ["dt", "test"],
    usage: `${process.env.botPrefix}test (any flag)`,
    devonly: true,
    
    run: ({request}) => {
        if (request.hasFlag("test-error")) {
            throw new Error("Dev test");
        } else request.send(`found flags: ${request.getFlags()}`);
    } 
})