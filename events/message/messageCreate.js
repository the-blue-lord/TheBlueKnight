const JsonDatabase = require("../../structures/JsonDatabase");

module.exports = class MessageCreate {
    constructor(client) {
        this.client = client;
    }

    async run(message) {
        const pingdatabase = new JsonDatabase("databases/ghost_ping.jsdb", "databasesBackups");
        if(!pingdatabase.data.enabled) return;

        if(message.mentions.users.size == 0) return;

        message.delete();
        console.log("[GHOST PING] Message deleted for ping");

        return;
    }
};