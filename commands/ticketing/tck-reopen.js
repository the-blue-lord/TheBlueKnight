const Command = require("../../structures/Command");
const TicketDatabase = require("../../structures/TicketDatabase");
const tickets = require("../../handlers/tickets");
const embeds = require("../../handlers/embeds");

module.exports = class TckReopen extends Command {
    // Class constructor //
    constructor(client) {
        // Build the command //
        super(client, "tck_reopen");
    }

    // Function to run when the command is triggered //
    async run(client, interaction) {
        // Defer the reply to the interaction //
        await interaction.deferReply({ephemeral: true});
        
        // If the user is not allowed to the command, abort the execution //
        if(!this.memberIsAllowed(interaction)) return;

        // Get the tickets data from the database //
        const ticketsDatabase = new TicketDatabase();
        const ticketsData = ticketsDatabase.data;

        // Get the ticket channel (undefined if it isn't a ticket channel) //
        const channel = interaction.guild.channels.cache.find(c => c.id == (ticketsData[this.getChannelOptionValue(interaction)?.id]?.id || ticketsData[interaction.channel.id]?.id));

        // If the channel is not a ticket, abort the execution //
        if(!channel) return embeds.error(client, interaction, "no_ticket_channel");

        // Reopen the ticket //
        tickets.reopen(channel, interaction);

        return;
    }
};