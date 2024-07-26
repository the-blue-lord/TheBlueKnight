const embeds = require("../../handlers/embeds");

module.exports = class Success {
    // Class constructor //
    constructor(client) {
        // Save the client in a class variable //
        this.client = client;
    }

    // Function to run when the eventi is triggered //
    run(client, interaction, errorId, variables, components){
        // Send a success embed //
        embeds.success(client, interaction, errorId, variables, components);
        return;
    }
}