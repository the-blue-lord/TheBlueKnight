const fs = require("fs");
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require("discord.js");
const tickets = require("../handlers/tickets");

// Function to send the modal for the ticket questions //
module.exports.askTicketQuestions = (client, interaction) => {
    // Get the category id of the ticket wich is being opened //
    const ticketCategoryId = interaction.values[0];

    // Retrive the question list from the client configs //
    const questionsList = client.tickets.categories.find(cat => cat.id === ticketCategoryId).questions;

    // Build the modal //
    const modal = new ModalBuilder()
        .setCustomId("asker_" + ticketCategoryId)
        .setTitle(client.language.tickets.questionnaire_title);

    // For each question //
    for(let i = 0; i < questionsList.length; i++) {
        // Create a text input for the user answer //
        const input = new TextInputBuilder()
            .setCustomId("modal_question_" + i)
            .setLabel(questionsList[i].title)
            .setPlaceholder(questionsList[i].question)
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph);

        // Add the input filed to the modal via an action row //
        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);
    }
    
    // Reply the interaction with the modal //
    interaction.showModal(modal);

    return;
};

// Function to run the right command when a Chat input command interaction is triggered //
module.exports.runCommand = (client, interaction) => {
    // If the interaction isn't a chat input command //
    if(!interaction.isChatInputCommand) return;

    // Get the commands folders //
    const commandsFolders = fs.readdirSync("./commands");
    
    // For each command folder //
    commandsFolders.forEach(commandFolder => {
        // Get all the command files and select the .js ones //
        const commands = fs.readdirSync("./commands/" + commandFolder);
        const jsCommands = commands.filter(c => c.split(".").pop() === "js");

        // For each .js command file //
        jsCommands.forEach(command => {
            // If the command to run matches the .js filename //
            if(interaction.commandName + ".js" == command) {
                // Get the command class and an object of that class //
                const commandClass = require("../commands/" + commandFolder + "/" + command);
                const commandObject = new commandClass(client);
                // Run the command object //
                commandObject.run(client, interaction);
            }
        });
    });
};

// Function to open a ticket after the modal questionnaire for ticket opening //
module.exports.openTicket = async (client, interaction) => {
    // Defer the reply to the interaction //
    await interaction.deferReply({ephemeral: true});

    // Get the ticket category //
    const ticketCategoryId = interaction.customId.split("asker_")[1];
    const ticketCategory = client.tickets.categories.find(c => c.id == ticketCategoryId);

    // Open the ticket //
    tickets.open(client, interaction.member, ticketCategory, interaction);

    return;
};