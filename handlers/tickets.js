const TicketDatabase = require("../structures/TicketDatabase");
const { ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const embeds = require("./embeds");

// Function to open a ticket channel //
module.exports.open = async (client, member, ticketCategory, interaction) => {
    // Get the tickets database //
    const ticketsDatabase = new TicketDatabase();

    // Get the emoji for the ticket category //
    const categoryEmoji = ticketCategory.emoji;

    // If member has prioritizing role, get the VIP emoji //
    const memberIsVip = member.roles.cache.find(r => r.id == client.tickets.priority_role);
    const vipEmoji = memberIsVip ? client.tickets.priority_emoji : "";

    // Concatenate emojis and user's username to create the channel name //
    const ticketChannelName = categoryEmoji + vipEmoji + "・" + member.user.username;

    // Get the guild where the ticket is being opened //
    const guild = client.guilds.cache.get(client.config.general.guild);

    // Create the ticket channel //
    const channel = await guild.channels.create({
        name: ticketChannelName,
        type: ChannelType.GuildText
    });

    // If the user has prioritizing role move the ticket in prioritized category, else move it in the ordinary one //
    if(memberIsVip) await channel.setParent(client.tickets.priority_category_id);
    else await channel.setParent(client.tickets.category_id);

    // Set access permissions to the ticket //
    await channel.permissionOverwrites.create(guild.roles.everyone, { ViewChannel: false, SendMessages: true });
    await channel.permissionOverwrites.create(client.user, { ViewChannel: true, SendMessages: true });
    await channel.permissionOverwrites.create(member.user, { ViewChannel: true, SendMessages: true });
    await client.tickets.authorized_roles.forEach(async role => {
        await channel.permissionOverwrites.create(role, { ViewChannel: true, SendMessages: true });
    });

    // Create the ticket data struct //
    const ticketData = {
        id: channel.id,
        allowedMembers: [member.id],
        isPrioritized: memberIsVip ? true : false
    };

    // Add the data to the database //
    ticketsDatabase.editTicket(channel.id, ticketData);

    // Create an Action Row with a button to the ticket channel //
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel("Ticket")
                .setURL("https://discord.com/channels/" + client.config.general.guild + "/" + channel.id)
                .setStyle(ButtonStyle.Link)
        );

    // Send success embed to confirm the correct ticket creation with the button to the channel //
    embeds.success(client, interaction, "ticket_opened", [
        {
            placeholder: "<ticket-channel>",
            value: "<#" + channel.id + ">"
        }
        ], [row]);

    return;
};

// Function to add a user to a ticket //
module.exports.add = async (channel, member, interaction) => {
    //If channel is not a ticket, abort execution //
    if(!channelIsTicket(channel, interaction)) return;

    // Get the tickets database //
    const ticketsDatabase = new TicketDatabase();
    
    // Update permissions for the user //
    channel.permissionOverwrites.create(member, {ViewChannel: true});
    // Add the user to the allowed members list on the databse //
    ticketsDatabase.allowMember(channel.id, member.id);

    // Send success embed to confirm the success of the execution //
    embeds.success(interaction.client, interaction, "ticket_user_added", [
        {
            placeholder: "<user-added>",
            value: "<@" + member.id + ">"
        },
        {
            placeholder: "<ticket-channel>",
            value: "<#" + channel.id + ">"
        }
    ]);

    return;
};
// Function to remove a user from a ticket //
module.exports.remove = async (channel, member, interaction) => {
    //If channel is not a ticket, abort execution //
    if(!channelIsTicket(channel, interaction)) return;

    // Get the tickets database //
    const ticketsDatabase = new TicketDatabase();

    // Check if the user can be removed //
    for(let i = 0; i < interaction.client.tickets.authorized_roles.length; i++)
        if(member.roles.cache.has(interaction.client.tickets.authorized_roles[i]) || member.id == interaction.client.user.id)
            return memberUnremovable(interaction);

    // Update permissions for the user //
    channel.permissionOverwrites.create(member, {ViewChannel: false});
    // Add the user to the allowed members list on the databse //
    ticketsDatabase.unallowMember(channel.id, member.id);

    // Send success embed to confirm the success of the execution //
    embeds.success(interaction.client, interaction, "ticket_user_removed", [
        {
            placeholder: "<user-removed>",
            value: "<@" + member.id + ">"
        },
        {
            placeholder: "<ticket-channel>",
            value: "<#" + channel.id + ">"
        }
    ]);

    return;
};

// Function to assign a ticket to a user //
module.exports.assign = async (channel, helper, interaction) => {
    //If channel is not a ticket, abort execution //
    if(!channelIsTicket(channel, interaction)) return;
    // If ticket is closed, abort execution //
    if(ticketIsClosed(channel, interaction)) return;

    // Get the tickets database //
    const ticketsDatabase = new TicketDatabase();

    // Assing the ticket to the selected user //
    ticketsDatabase.assignTicket(channel.id, helper.id);

    // Send success embed to confirm the success of the execution //
    embeds.success(interaction.client, interaction, "ticket_assigned", [
        {
            placeholder: "<user-assignee>",
            value: "<@" + helper.id + ">"
        },
        {
            placeholder: "<ticket-channel>",
            value: "<#" + channel.id +">"
        }
    ]);

    return;
};
// Function to unassign a ticket //
module.exports.unassign = async (channel, interaction) => {
    //If channel is not a ticket, abort execution //
    if(!channelIsTicket(channel, interaction)) return;
    // If ticket is closed, abort execution //
    if(ticketIsClosed(channel, interaction)) return;

    // Get the tickets database //
    const ticketsDatabase = new TicketDatabase();

    // Remove assignee property of the ticket in the database //
    ticketsDatabase.assignTicket(channel.id, "undefined");

    // Send success embed to confirm the success of the execution //
    embeds.success(interaction.client, interaction, "ticket_unassigned", [
        {
            placeholder: "<ticket-channel>",
            value: "<#" + channel.id +">"
        }
    ]);

    return;
};

// Function to close a ticket //
module.exports.close = async (channel, member, interaction) => {

    //If channel is not a ticket, abort execution //
    if(!channelIsTicket(channel, interaction)) return;
    // If ticket is closed, abort execution //
    if(ticketIsClosed(channel, interaction)) return;

    // Get the tickets database //
    const ticketsDatabase = new TicketDatabase();

    // Get the closed ticket channel name //
    const newChannelName = interaction.client.tickets.closed_emoji + channel.name;

    // Change the ticket name //
    await channel.setName(newChannelName);
    // Change the channel category to the closed tickets one //
    await channel.setParent(interaction.client.tickets.closed_category_id);

    // Store the closer of the ticket in the database //
    ticketsDatabase.data[channel.id].closer = member.id;
    ticketsDatabase.pushEdits();

    // Update permissions for closed tickets //
    await channel.permissionOverwrites.create(channel.guild.roles.everyone, { ViewChannel: false, SendMessages: false });
    await ticketsDatabase.data[channel.id].allowedMembers.forEach(async memberId => await channel.permissionOverwrites.create(memberId, {ViewChannel: true, SendMessages: false}));
    await channel.permissionOverwrites.create(interaction.client.user, { ViewChannel: true });
    await interaction.client.tickets.authorized_roles.forEach(async roleId => await channel.permissionOverwrites.create(roleId, { ViewChannel: true }));

    // Send success embed to confirm the success of the execution //
    embeds.success(interaction.client, interaction, "ticket_closed", [
        {
            placeholder: "<ticket-channel>",
            value: "<#" + channel.id + ">"
        }
    ]);

    return;
};
// Function to reopen a closed ticket //
module.exports.reopen = async (channel, interaction) => {
    //If channel is not a ticket, abort execution //
    if(!channelIsTicket(channel, interaction)) return;
    // If ticket is open, abort execution //
    if(ticketIsOpen(channel, interaction)) return;

    // Get the tickets database //
    const ticketsDatabase = new TicketDatabase();

    // Get the closed ticket channel name //
    const newChannelName = channel.name.replaceAll(interaction.client.tickets.closed_emoji, "");
    
    // Change channel name //
    await channel.setName(newChannelName);

    // Delete the closer property of the ticket in the database //
    ticketsDatabase.data[channel.id].closer = undefined;
    ticketsDatabase.pushEdits();

    // Move the ticket channel to the right category //
    if(ticketsDatabase.data[channel.id].isPrioritized) await channel.setParent(interaction.client.tickets.priority_category_id);
    else await channel.setParent(interaction.client.tickets.category_id);

    // Update permissions for open tickets //
    await channel.permissionOverwrites.create(channel.guild.roles.everyone, { ViewChannel: false, SendMessages: true });
    await ticketsDatabase.data[channel.id].allowedMembers.forEach(async memberId => await channel.permissionOverwrites.create(memberId, {ViewChannel: true, SendMessages: true}));
    await channel.permissionOverwrites.create(interaction.client.user, { ViewChannel: true, SendMessages: true });
    await interaction.client.tickets.authorized_roles.forEach(async roleId => await channel.permissionOverwrites.create(roleId, { ViewChannel: true, SendMessages: true }));

    // Send success embed to confirm the success of the execution //
    embeds.success(interaction.client, interaction, "ticket_reopened", [
        {
            placeholder: "<ticket-channel>",
            value: "<#" + channel.id + ">"
        }
    ]);

    return;
};

// Function to delete a ticket //
module.exports.delete = async (channel, interaction) => {
    //If channel is not a ticket, abort execution //
    if(!channelIsTicket(channel, interaction)) return;

    // Get the tickets database //
    const ticketsDatabase = new TicketDatabase();

    // Delete the ticket data from the database //
    ticketsDatabase.deleteTicket(channel.id);

    // Send success embed to confirm the success of the execution //
    await embeds.success(interaction.client, interaction, "ticket_deleted", [
        {
            placeholder: "<ticket-channel>",
            value: "<#" + channel.id + ">"
        }
    ]);

    // Delete the channel //
    channel.delete();

    return;
};



// Function to check if a given channel is a ticket channel //
function channelIsTicket(channel, interaction) {
    if(!new TicketDatabase().data[channel.id]) {
        embeds.error(interaction.client, interaction, "no_ticket_channel");
        return false;
    }
    return true;
}

// Function to check if ticket is closed //
function ticketIsClosed(channel, interaction) {
    if(new TicketDatabase().data[channel.id].closer) {
        embeds.error(interaction.client, interaction, "closed_ticket");
        return true;
    }

    return false;
}

// Function to check if ticket is open //
function ticketIsOpen(channel, interaction) {
    if(!new TicketDatabase().data[channel.id].closer) {
        embeds.error(interaction.client, interaction, "unclosed_ticket");
        return true;
    }

    return false;
}

// Function to trigger when trying to remove an unremovable user //
function memberUnremovable(interaction) {
    embeds.error(interaction.client, interaction, "member_unremovable");
    return;
}



module.exports.init = client => {return;};