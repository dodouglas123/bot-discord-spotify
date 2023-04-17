const { EmbedBuilder, ButtonBuilder, ChannelType, ApplicationCommandType, ButtonStyle, ActionRowBuilder, ComponentType, TextInputStyle, TextInputBuilder, ModalBuilder, StringSelectMenuBuilder } = require('discord.js');
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: `${__dirname}/../../config/users.json` });


module.exports = {
    name: 'criar',
    description: 'cria uma playlist',
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'privado',
        description: 'Coloque para se ele e publica ou privada',
        type: 3,
        choices: [{
            name: 'publica',
            value: 'true'
        },
        {
            name: 'privada',
            value: 'false'
        }],
        required: true
    },
    {
        name: 'nome',
        description: 'Escolha o nome da sua playlist',
        type: 3,
        required: true
    },
    {
        name: 'descricao',
        description: 'Escolha uma descricao para a sua playlist',
        type: 3,
        required: false
    }],

    run: async ({ client, interaction }) => {
        const sptoken = await db.get(`user_${interaction.user.id}.access_token`)
        const user = await client.spotifyAPI.getUser(sptoken)
        const nome = await interaction.options.getString('nome');
        const description = await interaction.options.getString('descricao');
        const choice = await interaction.options.getString('privado');

        const playlist = await client.spotifyAPI.createPlaylist(sptoken, user.id, nome, description, choice)

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`adicionar_${playlist.id}`)
                    .setLabel('Adicionar Musicas')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel('IR Para a Playlist')
                    .setURL(`https://open.spotify.com/playlist/`)
                    .setStyle(ButtonStyle.Link),
            );

        const Embed = new EmbedBuilder()
            .setTitle(`Playlist Criada Com Sucesso | ${nome}`)
            .setColor('Random')

        interaction.reply({ embeds: [Embed], components: [row] })
    }
}