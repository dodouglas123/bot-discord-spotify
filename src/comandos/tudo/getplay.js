const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ApplicationCommandType, ComponentType, ButtonStyle, ButtonBuilder, TextInputStyle } = require('discord.js');
const moment = require("moment")
require("moment-duration-format");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: `${__dirname}/../../config/users.json` });

module.exports = {
    name: 'getplay',
    description: 'pega as suas playLists.',
    type: ApplicationCommandType.ChatInput,

    run: async ({ client, interaction }) => {
        const sptoken = await db.get(`user_${interaction.user.id}.access_token`)
        const user = await client.spotifyAPI.getUser(sptoken)

        const playlists = await client.spotifyAPI.getUserPlaylists(sptoken, user.id);


        const playMenu = playlists.items.filter(a => a.owner.id === user.id).map(playlists => {

            return {
                label: `${playlists.name}`,
                value: playlists.id,
                emoji: '🎵'
            }
        })

        const Embed = new EmbedBuilder()
            .setTitle(`Gerenciamento de Playlist`)
            .setDescription(`Você está controlando a conta [${user.display_name}](${user.external_urls.spotify}) \`\`(${user.id})\`\``)
            .setColor('Random')

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder({
                    placeholder: "Selecione a playlist",
                    customId: "selectordershipmenty",
                    options: playMenu,
                })
            );

        interaction.reply({ embeds: [Embed], components: [row] }).then(ch => {

            const collector = ch.createMessageComponentCollector({ componentType: ComponentType.StringSelect });

            collector.on('collect', async i => {

                const values = i.values[0];

                const play = await client.spotifyAPI.getPlaylists(sptoken, values)

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`editar_${values}`)
                            .setLabel('Editar o Nome')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId(`ver_${values}`)
                            .setLabel('Ver as musicas')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId(`mudar_${values}`)
                            .setLabel('Mudar para privada|publica')
                            .setStyle(ButtonStyle.Primary)
                    );

                const embed = new EmbedBuilder()
                    .setTitle(`Playlist | ${play.name}`)
                    .setDescription(`Clique nos botões para editar sua playlist.`)
                    .setThumbnail(`${play.images[0]?.url || "https://www.google.com/"}`)
                    .addFields(
                        { name: `Dono`, value: `[${play.owner.display_name}](${play.owner.href})` },
                        { name: `Quantidade de Musicas`, value: `${play.tracks.items.length}` },
                        { name: `Publica`, value: `${play.public ? "Sim" : "Não"}` },
                        { name: `Descrição`, value: `${play.description ? play.description : "Não tem"}` },
                        { name: `Seguidores`, value: `${play.followers.total}` },
                        { name: `Colaborativa`, value: `${play.collaborative ? "Sim" : "Não"}` },
                    )
                    .setColor(`Random`)

                await i.update({ embeds: [embed], components: [row] }).then(msg => {

                    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button });

                    collector.on('collect', async i => {
                        const button = i.customId;
                        const [, identifier] = button.split('_')

                        if (button.startsWith('mudar_')) {
                            const playlist = await client.spotifyAPI.getPlaylists(sptoken, identifier)

                            await client.spotifyAPI.changePlaylistDetails(sptoken, identifier, playlist.name, playlist.description, !playlist.play.public)

                            row.components[2].setDisabled(true);

                            msg.edit({ components: [row] })

                            i.followUp({ content: "alterado com sucesso!", ephemeral: true })
                        }

                        if (button.startsWith('ver_')) {
                            const playlist = await client.spotifyAPI.getPlaylists(sptoken, identifier)

                            const resultado = playlist.tracks.items.slice(0, 20);

                            const play = resultado.map((musica, indice) => {
                                return {
                                    texto: `**${indice + 1}**-Nome: [${musica.track.name}](${musica.track.external_urls.spotify})\nDuração: ${moment.duration(musica.track.duration_ms).format("hh:mm:ss")}\nAutores: ${musica.track.album.artists.map(a => `[${a.name}](${a.external_urls.spotify})`).map(a => a).join(", ")}\nAdicionada: ${moment(musica.added_at).format("DD/MM/YYYY")}`
                                }
                            })

                            const embed = new EmbedBuilder()
                                .setDescription(`${play.map(a => a.texto).map(sexo => sexo).join("\n\n")}`)

                            row.components[1].setDisabled(true);

                            i.update({ components: [row], embeds: [embed] })
                        }


                        if (button.startsWith('editar_')) {
                            const modal = new ModalBuilder()
                                .setCustomId('myModal')
                                .setTitle('Mudar Nome');

                            const nome = new TextInputBuilder()
                                .setCustomId('nome')
                                .setPlaceholder('EX: parecia tempestade')
                                .setLabel("Nome da musica (obrigatório)")
                                .setStyle(TextInputStyle.Short);

                            const firstActionRow = new ActionRowBuilder().addComponents(nome);

                            modal.addComponents(firstActionRow);

                            await interaction.showModal(modal);

                            const submitted = await interaction.awaitModalSubmit({
                                filter: int => int.user.id === interaction.user.id,
                                time: 60000,
                            }).catch(error => {
                                console.error(error)
                                return null
                            })

                            if (submitted) {
                                const nome = submitted.fields.getTextInputValue('nome');

                                const playlist = await client.spotifyAPI.getPlaylists(sptoken, identifier)

                                await client.spotifyAPI.changePlaylistDetails(sptoken, identifier, nome, playlist.description, playlist.play.public)

                                row.components[0].setDisabled(true);

                                msg.edit({ components: [row] })

                                submitted.followUp({ content: "alterado com sucesso!", ephemeral: true })
                            }
                        }
                    })
                })
            })
        })
    }
}