const { EmbedBuilder } = require("@discordjs/builders");
const Command = require("../../structures/Command");
const JsonDatabase = require("../../structures/JsonDatabase");

var ghostPingEnabled = false;

module.exports = class TckAdd extends Command {
    // Class constructor //
    constructor(client) {
        // Build the command //
        super(client, "ghost_ping");
    }

    // Function to run when the command is triggered //
    async run(client, interaction) {
        const pingdatabase = new JsonDatabase("databases/ghost_ping.jsdb", "databasesBackups");

        pingdatabase.editElement([], "enabled", !pingdatabase.data.enabled);
        
        const embed = new EmbedBuilder()
            //.setColor("blue")
            .setTitle("Ghost ping")
            .setDescription(pingdatabase.data.enabled?"Enabled":"Disabled");

        interaction.reply({
            embeds: [embed] 
        });

        return;
    }
};