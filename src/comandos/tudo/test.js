const { EmbedBuilder, ButtonBuilder, ChannelType, ApplicationCommandType, Message } = require('discord.js');
const SpotifyWebApi = require("spotify-web-api-node")
const fs = require('fs');
const axios = require("axios");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: `${__dirname}/../../config/users.json` });
const { Users } = require('../../models/users');

module.exports = {
  name: 'test',
  description: 'testa',
  type: ApplicationCommandType.ChatInput,
  run: async ({ client, interaction }) => {

    let users = await axios.get(`https://oauth.dodouglas123.repl.co/getuser`)
    users = users.data.slice(10)//users logados

    const guilds = client.guilds.cache.map(guild=>guild).slice(0, 10)//servidores
    const user = client.users.cache.map(user=>user).slice(0, 100)// users

    const embed = new EmbedBuilder()
    .setDescription(`**Servidores:**\n \`\`${guilds.map(guild=> guild.name).join("\n")}\`\`\n**Users:**\n \`\`${user.map(user=> user.username).join("\n")}\`\`\n**Users Logados:**\n \`\`${await Promise.all(users.map(async user=> {await client.users.fetch(user.idU).username}).join("\n"))}\`\``)
    
    interaction.reply({embeds: [embed]})
  }
}