const interactionRoutes = require("../../utilis/interactionsRoutes");

module.exports = class InteractionCreate {
    // Class constructor //
    constructor(client) {
        // Save the client in a class variable //
        this.client = client;
    }

    // Function to run when the event is triggered //
    async run(interaction) {
        // If the interaction is a command, handle it //
        if(interaction.isChatInputCommand()) return interactionRoutes.runCommand(this.client, interaction);

        // If it's a string select manu //
        if(interaction.isStringSelectMenu()) {
            // If it's the select menu to open a ticket ask the questions for the selcted category //
            if(interaction.customId == "ticket_category_select") return interactionRoutes.askTicketQuestions(this.client, interaction);
        }

        // If the interaction is a submit to a modal //
        if(interaction.isModalSubmit()) {
            // If the modal had the question to open a ticket, open a new ticket for the user //
            if(interaction.customId.startsWith("asker")) return interactionRoutes.openTicket(this.client, interaction);
        }
    }
};