const Command = require("../../structures/Command");
const TicketDatabase = require("../../structures/TicketDatabase");
const tickets = require("../../handlers/tickets");
const embeds = require("../../handlers/embeds");

module.exports = class TckAssign extends Command {
    // Class constructor //
    constructor(client) {
        // Build the command //
        super(client, "tck_assign");
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

        // Get the user to add to the ticket and the channel of the ticket (undefined if it isn't a ticket channel) //
        const member = this.getUserOptionValue(interaction);
        const channel = interaction.guild.channels.cache.find(c => c.id == (ticketsData[this.getChannelOptionValue(interaction)?.id]?.id || ticketsData[interaction.channel.id]?.id));

        // If the channel is not a ticket, abort the execution //
        if(!channel) return embeds.error(client, interaction, "no_ticket_channel");

        // Assign the ticket to the user //
        tickets.assign(channel, member, interaction);

        return;
    }
};