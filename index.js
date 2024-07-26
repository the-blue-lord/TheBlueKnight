const fs = require("fs");
const JsonDatabase = require("./structures/JsonDatabase");
require("dotenv").config();

const BotClient = require("./structures/BotClient");

// Client init //
const client = new BotClient();
client.login(process.env.TOKEN);

const pingdatabase = new JsonDatabase("databases/ghost_ping.jsdb", "databasesBackups");
pingdatabase.editElement([], "enabled", false);

// Handlers init //
const handlers = fs.readdirSync("./handlers");
const jsHandlers = handlers.filter(h => h.split(".").pop() === "js");
jsHandlers.forEach(handler => {
    require("./handlers/" + handler).init(client);
});