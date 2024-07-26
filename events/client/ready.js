module.exports = class Ready {
    // Class constructor //
    constructor(client) {
        // Save the client in a class variable //
        this.client = client;
    }

    // Function to run when the event is triggered //
    run(client) {
        // Log to the console the succesfull startup of the bot //
        console.log("[CLIENT] The bot is online");
    }
}