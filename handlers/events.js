const fs = require("fs");


// Events init //
module.exports.init = client => {
    // Get the events folders //
    const eventFolders = fs.readdirSync("./events");
    
    // For each event folder //
    eventFolders.forEach(eventFolder => {
        // Get all the files in the folder and select the .js ones//
        const events = fs.readdirSync("./events/" + eventFolder);
        const jsEvents = events.filter(e => e.split(".").pop() == "js");

        // For each .js file (containing an event class) //
        jsEvents.forEach(event => {
            // Get the event class and create an object of that class //
            const eventClass = require("../events/" + eventFolder + "/" + event);
            const eventObject = new eventClass(client);

            // Get the unique identifier name of the event from the filename //
            const eventName = event.split(".")[0];

            // When the event is triggered run the function linked to it //
            client.on(eventName, (...args) => eventObject.run(...args));
        });
    });

    return;
};