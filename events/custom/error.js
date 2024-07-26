const embeds = require("../../handlers/embeds");

module.exports = class Error {
    // Class constructor //
    constructor(client) {
        // Save the client in a class variable //
        this.client = client;
    }

    // Function to run when the event is triggered //
    run(client, interaction, errorId){
        // Send an error embed //
        embeds.error(client, interaction, errorId);
        return;
    }
}