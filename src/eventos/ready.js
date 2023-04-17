const client = require('../../index');
const express = require("express");
const app = express();
const { connect } = require('mongoose');
const SpotifyWebApi = require("spotify-web-api-node")
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: `${__dirname}/../config/users.json` });
const { EmbedBuilder } = require("discord.js")

client.on('ready', () => {
    console.log(`o bot está online!`)
    connect("mongodb+srv://viktoreduardo:741803vl@auth.yr2vw6e.mongodb.net/?retryWrites=true&w=majority").then(() => console.log('Conectado ao MongoDB'))
    
    app.get("/callback", async (req, res) => {
        const { code, state } = req.query
        if (!code) return res.sendStatus(400);

        var credentials = {
            clientId: 'ce0a742dd5fa4ff3beeb1bce39f2b862',
            clientSecret: 'ad28c0fe79ae4c5c92f3df54be283b32',
            redirectUri: 'http://localhost:3000/callback'
        };

        var spotifyApi = new SpotifyWebApi(credentials);

        const result = await spotifyApi.authorizationCodeGrant(code)

        await db.set(`user_${state}`, {
            id: state,
            access_token: result.body['access_token'],
            refresh_token: result.body['refresh_token'],
            date: Date.now() + 3600000
        })
        const user = await client.spotifyAPI.getUser(result.body['access_token'])

        const embed = new EmbedBuilder()
                .setTitle(`Spotify Controller | Novo Membro logado`)
                .setColor('Random')
                .addFields(
                    { name: 'Membro', value: `[${user.display_name}](${user.external_urls.spotify})` },
                    { name: 'Id do Membro', value: `${user.id}` },
                    { name: 'Email', value: `${user.email}` },
                    { name: 'Tipo de conta', value: `${user.product}` }
                )

        client.channels.cache.get('1071512321526083724').send({embeds: [embed]})


        res.sendStatus(200)
    })

    app.get('/login', async (req, res) => {
        const { state } = req.query
        res.redirect(`https://accounts.spotify.com/authorize?client_id=ce0a742dd5fa4ff3beeb1bce39f2b862&response_type=code&redirect_uri=http://localhost:3000/callback&scope=user-read-private%20playlist-read-private%20playlist-read-collaborative%20playlist-modify-private%20playlist-modify-public%20user-read-playback-position%20user-top-read%20user-read-recently-played%20app-remote-control%20user-read-playback-state%20user-modify-playback-state%20user-read-currently-playing%20ugc-image-upload%20user-library-modify%20user-library-read&state=${state}`);
    });

    app.listen('3000', () => {
        console.log(`Running on port 3000`)
    })
});