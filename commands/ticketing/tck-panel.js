const Command = require("../../structures/Command");
const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const embeds = require("../../handlers/embeds");

module.exports = class TckPanel extends Command {
    // Class constructor //
    constructor(client) {
        // Build the command //
        super(client, "tck_panel");
    }

    async run(client, interaction) {
        // Defer the reply to the interaction //
        await interaction.deferReply();

        // If the member is not allowed to run the command, abort the execution //
        if(!this.memberIsAllowed(interaction)) return;

        // Build the panel //
        const panel = buildPanel(client, interaction);

        // If there is no panel, abort the execution //
        if(!panel) return;

        // Send the panel with the select menu //
        interaction.editReply({
            embeds: [panel.embed],
			components: [panel.row],
            ephemeral: false
        });
        
        return;
    }
};

// Function to build the panel embed and select menu //
function buildPanel(client, interaction) {
    // Get the embed and the select menu //
    const panelEmbed = getPanelEmbed(client, interaction);
    const panelRow = getselectMenuRow(client, interaction);

    // If there was an error building the embed or the select menu row return undefined //
    if(!panelEmbed || !panelRow) return undefined;

    // Create the panel //
    const panel = {
        embed: panelEmbed,
        row: panelRow
    }

    // Return the panel //
    return panel;
};

// Function to build the panel embed //
function getPanelEmbed(client, interaction) {
    // Get the embed title and description from client configs //
    const title = client.language.tickets.panel_title;
    const description = client.language.tickets.panel_message;

    // If there is no title send an error message and return undefined //
    if(!title) {
        embeds.error(client, interaction, "no_panel_title");
        return undefined;
    }

    // If there is no description send an error message and return undefined //
    if(!description) {
        embeds.error(client, interaction, "no_panel_description");
        return undefined;
    }

    // Build the embed //
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(client.config.panel.color);

    if(client.config.panel.timestamp) {
        embed.setTimestamp();
    }

    // Return embed //
    return embed;
}

// Function to build the panel selct menu row //
function getselectMenuRow(client, interaction) {
    // Create a new row and a new string select menu //
    const row = new ActionRowBuilder();
    const selectMenu = new StringSelectMenuBuilder().setCustomId("ticket_category_select");

    // Get the categories list from client config //
    const categories = client.tickets.categories;

    // If there are no categories send error message and return undefined //
    if(!categories) {
        embeds.error(client, interaction, "no_categories");
        return undefined;
    }

    //For each category //
    categories.forEach(category => {
        // Add the catagoey details to the select menu //
        selectMenu.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(category.name)
                .setDescription(category.description)
                .setEmoji(category.emoji)
                .setValue(category.id)
        );
    });

    // Add select menu to the row //
    row.addComponents(selectMenu);

    // Return the row //
    return row;
}