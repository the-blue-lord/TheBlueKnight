const Command = require("../../structures/Command");
const tickets = require("../../handlers/tickets");

module.exports = class TckOpen extends Command {
    // Class constructor //
    constructor(client) {
        // Build the command //
        super(client, "tck_open");

        // Add choices in category option //
        this.options.find(option => option.id == "cat").choices = [];
        client.tickets.categories.forEach(category => {
            this.options.find(option => option.id == "cat").choices.push({
                name: category.name,
                value: category.id
            });
        });
    }

    // Function to run when the command is triggered //
    async run(client, interaction) {
        // Defer the reply to the interaction //
        await interaction.deferReply({ephemeral: true});
        
        // If the user is not allowed to the command, do not execute the command //
        if(!this.memberIsAllowed(interaction)) return;

        // Get the member who to open the ticket to and the category of the ticket to open //
        const member = this.getUserOptionValue(interaction);
        const ticketCategory = this.getCategoryOptionValue(interaction);

        // Open the ticket //
        tickets.open(client, member, ticketCategory, interaction);

        return;
    }
};