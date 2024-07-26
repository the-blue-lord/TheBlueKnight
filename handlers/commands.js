const fs = require("fs");
const {REST, Routes} = require("discord.js");

// Commands init //
module.exports.init = async client => {
    // Get the commands folders //
    const commandsFolders = fs.readdirSync("./commands");

    // Create an empty array where to store each command data //
    const commandsData = [];
    
    // For each commands folder //
    commandsFolders.forEach(commandFolder => {
        // Get the list of the files in the folder and select the .js ones //
        const commands = fs.readdirSync("./commands/" + commandFolder);
        const jsCommands = commands.filter(c => c.split(".").pop() === "js");

        // For each .js file//
        jsCommands.forEach(command => {
            // Get the class of the command in the file and crate an object of that class //
            const commandClass = require("../commands/" + commandFolder + "/" + command);
            const commandObject = new commandClass(client);

            // If the command is enabled add its data to the array of commands data //
            if(commandObject.enabled) commandsData.push(commandObject.getData());
        });
    });

    // Uploading the commands that where found //
    const rest = new REST().setToken(client.config.general.token);
    await rest.put(
        Routes.applicationGuildCommands(client.config.general.client, client.config.general.guild),
        { body: commandsData }
    );
};