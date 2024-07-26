const Command = require("../../structures/Command");
const TicketDatabase = require("../../structures/TicketDatabase");
const tickets = require("../../handlers/tickets");
const embeds = require("../../handlers/embeds");

module.exports = class TckClaim extends Command {
    // Class constructor //
    constructor(client) {
        // Build the command //
        super(client, "tck_claim");
    }

    // Function to run when the command is triggered //
    async run(client, interaction) {
        // Defer the reply to the interaction //
        await interaction.deferReply({ephemeral: true});
        
        // If the user is not allowed to the command, do not execute the command //
        if(!this.memberIsAllowed(interaction)) return;

        // Get the tickets data from the database //
        const ticketsDatabase = new TicketDatabase();
        const ticketsData = ticketsDatabase.data;

        // Get the ticket channel (undefined if it isn't a ticket channel) //
        const channel = interaction.guild.channels.cache.find(c => c.id == (ticketsData[this.getChannelOptionValue(interaction)?.id]?.id || ticketsData[interaction.channel.id]?.id));

        // If the channel is not a ticket, do not execute the command //
        if(!channel) return embeds.error(client, interaction, "no_ticket_channel");

        // If the ticket is already assigned, abort the execution //
        if(ticketsData[channel.id]?.assignee) {
            embeds.error(client, interaction, "ticket_already_assigned");
            return;
        }

        // Assign the ticket to the user //
        tickets.assign(channel, interaction.member, interaction);

        return;
    }
}