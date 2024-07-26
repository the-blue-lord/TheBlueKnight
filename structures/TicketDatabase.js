const JsonDatabase = require("./JsonDatabase");

module.exports = class TicketDatabase extends JsonDatabase {
    constructor(filePath, bckupdirPath) {
        super("databases/tickets_data.jsdb", "databasesBackups");
    }

    fetchTicket(ticketId) {
        return this.data[ticketId];
    }

    editTicket(ticketId, ticketData) {
        this.data[ticketId] = ticketData;

        this.pushEdits();
        return;
    }

    allowMember(ticketId, memberId) {
        const ticket = this.fetchTicket(ticketId);
        if(ticket.allowedMembers.includes(memberId)) return;
        ticket.allowedMembers.push(memberId);

        this.editTicket(ticketId, ticket);
        return;
    }
    
    unallowMember(ticketId, memberId) {
        const ticket = this.fetchTicket(ticketId);
        const memberIndex = ticket.allowedMembers.indexOf(memberId);
        if(memberIndex == -1) return;
        ticket.allowedMembers.splice(memberIndex, 1);

        this.editTicket(ticketId, ticket);
        return;
    }

    assignTicket(ticketId, asigneeId) {
        this.data[ticketId].assignee = asigneeId;

        this.pushEdits();
        return;
    }

    closeTicket(ticketId, closerId = " < unknown > ") {
        this.data[ticketId].closer = closerId;
        
        this.pushEdits();
        return;
    }

    deleteTicket(ticketId) {
        this.data[ticketId] = undefined;

        this.pushEdits();
        return;
    }
}