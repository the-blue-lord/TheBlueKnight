const fs = require("fs");
const yaml = require("yaml");
require("dotenv").config();

const { Client, GatewayIntentBits, Partials } = require("discord.js");

module.exports = class BotClient extends Client {
    // Class constructor //
    constructor() {
        // Build the standard BotClient from discord API //
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.MessageContent
            ],

            partials: [
                Partials.Message,
                Partials.Channel,
                Partials.Reaction,
                Partials.User,
                Partials.GuildMember
            ]
        });

        // Add the hidden environment variables to the data provided by config.yml //
        const config = yaml.parse(fs.readFileSync("./configs/config.yml", "utf8"));
        config.general = {};
        config.general.token = process.env.TOKEN;
        config.general.guild = process.env.GUILD_ID;
        config.general.client = process.env.CLIENT_ID;

        // Add configuration options to the bot class //
        this.commands = yaml.parse(fs.readFileSync("./configs/commands.yml", "utf8"));
        this.config = config;
        this.errors = yaml.parse(fs.readFileSync("./configs/errors.yml", "utf8"));
        this.language = yaml.parse(fs.readFileSync("./configs/language.yml", "utf8"));
        this.successes = yaml.parse(fs.readFileSync("./configs/successes.yml", "utf8"));
        this.tickets = yaml.parse(fs.readFileSync("./configs/tickets.yml", "utf8"));
    }

    // Function to init the bot //
    init() {
        // Use the login function provided by discord API //
        super.login(this.config.general.token);
    }
};
