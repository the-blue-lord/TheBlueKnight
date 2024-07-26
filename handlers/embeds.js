const { EmbedBuilder } = require("discord.js");

// Function to send success embeds //
module.exports.success = async (client, interaction, successId, variables = [], components = []) => {
    // Fetch the success data from the yml file //
    const success = client.successes.embeds.find(s => s.id == successId);

    // Get the color of the embed (green by default) //
    const color = success.color || "#00ff00";
    // Get the description of the embed //
    let embedDescription = success.description;

    // Substitute every placeholder with the proper value //
    variables.forEach(variable => {
        embedDescription = embedDescription.replaceAll(variable.placeholder, variable.value);
    });

    // Build the embed //
    const embed = new EmbedBuilder()
        .setTitle(success.title)
        .setDescription(embedDescription)
        .setFooter({
            text: client.successes.footer,
            iconURL: client.user.displayAvatarURL()
        })
        .setColor(color);

    // If the timestamp is enabled set it in the embed //
    if(success.timestamp) embed.setTimestamp();

    // Reply the interaction with the embed //
    await interaction.editReply({
        embeds: [embed],
        components: components
    });
};

// Function to send error embeds //
module.exports.error = async (client, interaction, errorId) => {
    // Fetch the error data from the yml file //
    const error = client.errors.embeds.find(e => e.id == errorId);

    // Get the color of the embed (red by default) //
    let color = error.color || "#ff0000";

    // Build the embed //
    const embed = new EmbedBuilder()
        .setTitle(error.title)
        .setDescription(error.description)
        .setFooter({
            text: client.errors.footer,
            iconURL: client.user.displayAvatarURL()
        })
        .setColor(color);

    // If the timestamp is enabled set it in the embed //
    if(error.timestamp) embed.setTimestamp();
    
    // Reply the interaction with the embed //
    await interaction.editReply({
        embeds: [embed]
    });

    return;
}



module.exports.init = client => {return;};