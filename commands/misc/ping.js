const Command = require("../../structures/Command");

module.exports = class Ping extends Command{
    constructor(client) {
        super(client, "ping");
    }

    async run(client, interaction) {
        await interaction.deferReply({ephemeral: true});

        if(!this.memberIsAllowed(interaction)) {
            return;
        }
        
        interaction.editReply("Pong!");
        return;
    }
};