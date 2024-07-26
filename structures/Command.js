const embeds = require("../handlers/embeds");

// Class for a generic command //
module.exports = class Command {
    // Constructor of the command //
    constructor(client, commandId) {
        // Get the command data //
        this.command = client.commands.find(command => command.id == commandId);

        // Use the command data to initialize the class variables //
        this.name = this.command.name;
        this.description = this.command.description;

        this.options = this.command.options;

        this.enabled = this.command.enabled;

        this.whitelist = this.command.whitelist;
        this.blacklist = this.command.blacklist;
        this.unlisted = this.command.unlisted;

        this.client = client;
    }

    // Function to get the data of the command to use for initializing the command in the guild //
    getData()  {
        const data = {
            name: this.name,
            description: this.description,
            options: this.options
        };

        return data;
    }

    // Function to check if a member is allowed to run the command //
    memberIsAllowed(interaction) {
        if(this.whitelist) {
            for(let i = 0; i < this.whitelist.length; i++) {
                if(interaction.member.roles.cache.has(this.whitelist[i])) {
                    return true;
                }
            }
        }

        if(this.blacklist) {
            for(let i = 0; i < this.blacklist.length; i++) {
                if(interaction.member.roles.cache.has(this.blacklist[i])) {
                    embeds.error(this.client, interaction, "blacklisted_for_command");
                    return false;
                }
            }
        }

        if(!this.unlisted) {
            embeds.error(this.client, interaction, "unallowed_for_command");
        }

        return this.unlisted;
    }

    // Functions to get the Discord API objects corresponding to the values inputted in the command //
    getUserOptionValue(interaction) {
        const memberOption = this.options.find(option => option.id == "mbr");
        const memberId = interaction.options.get(memberOption?.name)?.value;
        const member = interaction.guild.members.cache.find(member => member.id == memberId);

        return member;
    }
    getChannelOptionValue(interaction) {
        const channelOption = this.options.find(option => option.id == "chn");
        const channelId = interaction.options.get(channelOption?.name)?.value;
        const channel = interaction.guild.channels.cache.find(channel => channel.id == channelId);

        return channel;
    }
    getCategoryOptionValue(interaction) {
        const categoryOption = this.options.find(option => option.id == "cat");
        const categoryId = interaction.options.get(categoryOption?.name)?.value;
        const category = interaction.client.tickets.categories.find(category => category.id == categoryId);

        return category;
    }
};