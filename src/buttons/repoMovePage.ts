import { ButtonResponse } from "../structures/Commands";

export default new ButtonResponse({
    category: "querypage",
    temporary: true,
    run: async({interaction, client}) => {
        const page = interaction.customId.split(":")[1];
        //! TODO need query search cache to allow this to work...
    }
})