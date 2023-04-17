const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./src/config/config.json');
const spotifyAPI = require("./src/api/index");

var client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

module.exports = client;
client.slash = new Collection();
client.spotifyAPI = new spotifyAPI();

require('./src/handler')(client);
client.login(token);