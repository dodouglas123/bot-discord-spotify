const { EmbedBuilder, ButtonBuilder, ChannelType, ApplicationCommandType, ButtonStyle, ActionRowBuilder, ComponentType, TextInputStyle, TextInputBuilder, ModalBuilder, StringSelectMenuBuilder } = require('discord.js');
const moment = require("moment")
require("moment-duration-format");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: `${__dirname}/../../config/users.json` });

module.exports = {
    name: 'perfil',
    description: 'Veja seu perfil no spotify.',
    type: ApplicationCommandType.ChatInput,

    run: async ({ client, interaction }) => {
        interaction.reply("Aguarde consultando dados")
        const sptoken = await db.get(`user_${interaction.user.id}.access_token`)
        const user = await client.spotifyAPI.getUser(sptoken)
        const player = await client.spotifyAPI.getPlayer(sptoken)
        const playlists = await client.spotifyAPI.getUserPlaylists(sptoken, user.id);
        const favoritos = await client.spotifyAPI.savedTracks(sptoken)
        const ultima = await client.spotifyAPI.recentlyPlayedTracks(sptoken)

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`pular`)
                    .setLabel('Pular')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`voltar`)
                    .setLabel('Voltar')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`autoplay`)
                    .setLabel('AutoPlay')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`shuffle`)
                    .setLabel('Aleatorio')
                    .setStyle(ButtonStyle.Success),
            );

        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`fila`)
                    .setLabel('Fila')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`mais`)
                    .setLabel('+10 Volume')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`menos`)
                    .setLabel('-10 Volume')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`pausar`)
                    .setLabel('Pausar')
                    .setStyle(ButtonStyle.Secondary)
            );

        const rowoff = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`favoritos`)
                    .setLabel('Favoritos')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`maisescultado`)
                    .setLabel('Musicas Mais Escutadas')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel('Seu Perfil')
                    .setURL(`${user.external_urls.spotify}`)
                    .setStyle(ButtonStyle.Link),
            );
        if (player) {
            const Embedd = new EmbedBuilder()
                .setTitle(`Seu perfil | ${user.display_name}`)
                .setThumbnail(`${user?.images[0]?.url || "https://www.google.com/"}`)
                .addFields(
                    { name: `Nome`, value: `[${player.item.name}](${player.item.external_urls.spotify})` },
                    { name: `Dispositivo`, value: `${player.device.name}` },
                    { name: `Volume`, value: `${player.device.volume_percent}/100` },
                    { name: `Modo de reprodução`, value: `Aleatorio: ${player.shuffle_state ? "Ligado" : "Desligado"}\nRepetir: ${player.shuffle_state !== "off" ? "Ligado" : "Desligado"}` },
                    { name: `Duração`, value: `${moment.duration(player.progress_ms).format("hh:mm:ss")} / ${moment.duration(player.item.duration_ms).format("hh:mm:ss")}` },
                    { name: `Artistas`, value: `${player.item.album.artists.map(a => `[${a.name}](${a.external_urls.spotify})`).map(a => a).join(", ")}` },
                )
                .setColor('Random')

            interaction.editReply({ embeds: [Embedd], components: [row, row1], content: `` }).then(msg => {
                const filter = (i) => {
                    i.user.id === interaction.user.id;
                };
                const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, filter });

                collector.on('collect', async i => {
                    const button = i.customId;

                    switch (button) {
                        case 'pular': {
                            await client.spotifyAPI.skipToNext(sptoken, player.device.id)
                            i.reply({ content: "Musica pulada com sucesso!", ephemeral: true })

                            const Embed = new EmbedBuilder()
                                .setTitle(`Seu perfil | ${user.display_name}`)
                                .setThumbnail(`${user?.images[0]?.url || "https://www.google.com/"}`)
                                .addFields(
                                    { name: `Nome`, value: `[${player.item.name}](${player.item.external_urls.spotify})` },
                                    { name: `Dispositivo`, value: `${player.device.name}` },
                                    { name: `Volume`, value: `${player.device.volume_percent}/100` },
                                    { name: `Modo de reprodução`, value: `Aleatorio: ${player.shuffle_state ? "Ligado" : "Desligado"}\nRepetir: ${player.shuffle_state !== "off" ? "Ligado" : "Desligado"}` },
                                    { name: `Duração`, value: `${moment.duration(player.progress_ms).format("hh:mm:ss")} / ${moment.duration(player.item.duration_ms).format("hh:mm:ss")}` },
                                    { name: `Artistas`, value: `${player.item.album.artists.map(a => `[${a.name}](${a.external_urls.spotify})`).map(a => a).join(", ")}` },
                                )
                                .setColor('Random')


                            msg.edit({ embeds: [Embed] })
                        }

                            break;

                        case 'pausar': {
                            await client.spotifyAPI.pausePlayback(sptoken, player.device.id)

                            i.reply({ content: "Musica pausada com sucesso!", ephemeral: true })

                            const Embed = new EmbedBuilder()
                                .setTitle(`Seu perfil | ${user.display_name}`)
                                .setThumbnail(`${user?.images[0]?.url || "https://www.google.com/"}`)
                                .addFields(
                                    { name: `Nome`, value: `[${player.item.name}](${player.item.external_urls.spotify})` },
                                    { name: `Dispositivo`, value: `${player.device.name}` },
                                    { name: `Volume`, value: `${player.device.volume_percent}/100` },
                                    { name: `Modo de reprodução`, value: `Aleatorio: ${player.shuffle_state ? "Ligado" : "Desligado"}\nRepetir: ${player.shuffle_state !== "off" ? "Ligado" : "Desligado"}` },
                                    { name: `Duração`, value: `${moment.duration(player.progress_ms).format("hh:mm:ss")} / ${moment.duration(player.item.duration_ms).format("hh:mm:ss")}` },
                                    { name: `Artistas`, value: `${player.item.album.artists.map(a => `[${a.name}](${a.external_urls.spotify})`).map(a => a).join(", ")}` },
                                )
                                .setColor('Random')


                            msg.edit({ embeds: [Embed] })

                        }

                            break;

                        case 'autoplay': {
                            await client.spotifyAPI.autoPlay(sptoken, player.device.id)

                            i.reply({ content: "Modo autoPlay setado com sucesso!", ephemeral: true })

                            const Embed = new EmbedBuilder()
                                .setTitle(`Seu perfil | ${user.display_name}`)
                                .setThumbnail(`${user?.images[0]?.url || "https://www.google.com/"}`)
                                .addFields(
                                    { name: `Nome`, value: `[${player.item.name}](${player.item.external_urls.spotify})` },
                                    { name: `Dispositivo`, value: `${player.device.name}` },
                                    { name: `Volume`, value: `${player.device.volume_percent}/100` },
                                    { name: `Modo de reprodução`, value: `Aleatorio: ${player.shuffle_state ? "Ligado" : "Desligado"}\nRepetir: ${player.shuffle_state !== "off" ? "Ligado" : "Desligado"}` },
                                    { name: `Duração`, value: `${moment.duration(player.progress_ms).format("hh:mm:ss")} / ${moment.duration(player.item.duration_ms).format("hh:mm:ss")}` },
                                    { name: `Artistas`, value: `${player.item.album.artists.map(a => `[${a.name}](${a.external_urls.spotify})`).map(a => a).join(", ")}` },
                                )
                                .setColor('Random')


                            msg.edit({ embeds: [Embed] })
                        }

                            break;

                        case 'shuffle': {
                            await client.spotifyAPI.playbackShuffle(sptoken, player.device.id, !player.shuffle_state)

                            i.reply({ content: "Modo aleatorio setado com sucesso!", ephemeral: true })

                            const Embed = new EmbedBuilder()
                                .setTitle(`Seu perfil | ${user.display_name}`)
                                .setThumbnail(`${user?.images[0]?.url || "https://www.google.com/"}`)
                                .addFields(
                                    { name: `Nome`, value: `[${player.item.name}](${player.item.external_urls.spotify})` },
                                    { name: `Dispositivo`, value: `${player.device.name}` },
                                    { name: `Volume`, value: `${player.device.volume_percent}/100` },
                                    { name: `Modo de reprodução`, value: `Aleatorio: ${player.shuffle_state ? "Ligado" : "Desligado"}\nRepetir: ${player.shuffle_state !== "off" ? "Ligado" : "Desligado"}` },
                                    { name: `Duração`, value: `${moment.duration(player.progress_ms).format("hh:mm:ss")} / ${moment.duration(player.item.duration_ms).format("hh:mm:ss")}` },
                                    { name: `Artistas`, value: `${player.item.album.artists.map(a => `[${a.name}](${a.external_urls.spotify})`).map(a => a).join(", ")}` },
                                )
                                .setColor('Random')


                            msg.edit({ embeds: [Embed] })
                        }

                            break;

                        case 'mais': {
                            await client.spotifyAPI.setVolume(sptoken, player.device.id, player.device.volume_percent + 10)

                            i.reply({ content: "Volume almetada com sucesso!", ephemeral: true })

                            const Embed = new EmbedBuilder()
                                .setTitle(`Seu perfil | ${user.display_name}`)
                                .setThumbnail(`${user?.images[0]?.url || "https://www.google.com/"}`)
                                .addFields(
                                    { name: `Nome`, value: `[${player.item.name}](${player.item.external_urls.spotify})` },
                                    { name: `Dispositivo`, value: `${player.device.name}` },
                                    { name: `Volume`, value: `${player.device.volume_percent}/100` },
                                    { name: `Modo de reprodução`, value: `Aleatorio: ${player.shuffle_state ? "Ligado" : "Desligado"}\nRepetir: ${player.shuffle_state !== "off" ? "Ligado" : "Desligado"}` },
                                    { name: `Duração`, value: `${moment.duration(player.progress_ms).format("hh:mm:ss")} / ${moment.duration(player.item.duration_ms).format("hh:mm:ss")}` },
                                    { name: `Artistas`, value: `${player.item.album.artists.map(a => `[${a.name}](${a.external_urls.spotify})`).map(a => a).join(", ")}` },
                                )
                                .setColor('Random')


                            msg.edit({ embeds: [Embed] })

                        }

                            break;

                        case 'menos': {
                            await client.spotifyAPI.setVolume(sptoken, player.device.id, player.device.volume_percent - 10)

                            i.reply({ content: "Volume abaixado com sucesso!", ephemeral: true })

                            const Embed = new EmbedBuilder()
                                .setTitle(`Seu perfil | ${user.display_name}`)
                                .setThumbnail(`${user?.images[0]?.url || "https://www.google.com/"}`)
                                .addFields(
                                    { name: `Nome`, value: `[${player.item.name}](${player.item.external_urls.spotify})` },
                                    { name: `Dispositivo`, value: `${player.device.name}` },
                                    { name: `Volume`, value: `${player.device.volume_percent}/100` },
                                    { name: `Modo de reprodução`, value: `Aleatorio: ${player.shuffle_state ? "Ligado" : "Desligado"}\nRepetir: ${player.shuffle_state !== "off" ? "Ligado" : "Desligado"}` },
                                    { name: `Duração`, value: `${moment.duration(player.progress_ms).format("hh:mm:ss")} / ${moment.duration(player.item.duration_ms).format("hh:mm:ss")}` },
                                    { name: `Artistas`, value: `${player.item.album.artists.map(a => `[${a.name}](${a.external_urls.spotify})`).map(a => a).join(", ")}` },
                                )
                                .setColor('Random')


                            msg.edit({ embeds: [Embed] })
                        }

                            break;

                        case 'voltar': {
                            await client.spotifyAPI.skipToPrevious(sptoken, player.device.id)

                            i.reply({ content: "Musica voltada com sucesso!", ephemeral: true })

                            const Embed = new EmbedBuilder()
                                .setTitle(`Seu perfil | ${user.display_name}`)
                                .setThumbnail(`${user?.images[0]?.url || "https://www.google.com/"}`)
                                .addFields(
                                    { name: `Nome`, value: `[${player.item.name}](${player.item.external_urls.spotify})` },
                                    { name: `Dispositivo`, value: `${player.device.name}` },
                                    { name: `Volume`, value: `${player.device.volume_percent}/100` },
                                    { name: `Modo de reprodução`, value: `Aleatorio: ${player.shuffle_state ? "Ligado" : "Desligado"}\nRepetir: ${player.shuffle_state !== "off" ? "Ligado" : "Desligado"}` },
                                    { name: `Duração`, value: `${moment.duration(player.progress_ms).format("hh:mm:ss")} / ${moment.duration(player.item.duration_ms).format("hh:mm:ss")}` },
                                    { name: `Artistas`, value: `${player.item.album.artists.map(a => `[${a.name}](${a.external_urls.spotify})`).map(a => a).join(", ")}` },
                                )
                                .setColor('Random')


                            msg.edit({ embeds: [Embed] })

                        }

                            break;

                        case 'fila': {
                            i.reply({ content: "Ainda esta sendo feito", ephemeral: true })
                           /* const modal = new ModalBuilder()
                                .setCustomId('myModal')
                                .setTitle('Adicionar Musica');

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
                                const musicas = await client.spotifyAPI.SearchMusicbyName(sptoken, nome)
                                if (musicas.tracks.total <= 0) return interaction.reply({ content: "Nenhuma musica encontrada", ephemeral: true })

                                const resultado = musicas.tracks.items;

                                const playMenu = resultado.map((musica, indice) => {

                                    return {
                                        label: `${indice + 1}-${musica.name}`,
                                        value: musica.uri,
                                        emoji: '🎵'
                                    }
                                })

                                const rowmusica = new ActionRowBuilder()
                                    .addComponents(
                                        new StringSelectMenuBuilder({
                                            placeholder: "Selecione a Musica",
                                            customId: "selectordershipmenty",
                                            options: playMenu,
                                        })
                                    );

                                const play = resultado.map((musica, indice) => {

                                    return {
                                        texto: `**${indice + 1}**-Nome: [${musica.name}](${musica.external_urls.spotify})\nDuração: ${moment.duration(musica.duration_ms).format("y [anos] M [meses] d [dias] h [horas] m [minutos] e s [segundos]").replace("minsutos", "minutos")}\nAutores: ${musica.artists.map(a => `[${a.name}](${a.external_urls.spotify})`).map(a => a).join(", ")}\nLançada: ${musica.album.album.release_date}`
                                    }
                                })

                                const embed = new EmbedBuilder()
                                    .setDescription(`${play.map(a => a.texto).map(sexo => sexo).join("\n\n")}`)

                                submitted.deferUpdate()
                                interaction.editReply({ embeds: [embed], components: [rowmusica] }).then(ch3 => {

                                    const collector = ch3.createMessageComponentCollector({ componentType: ComponentType.StringSelect });

                                    collector.on('collect', async i2 => {
                                        const values = i2.values[0];

                                        const track = await client.spotifyAPI.getTrack(sptoken, values.split(":")[2])

                                        await client.spotifyAPI.AddPlaybackQueue(sptoken, player.device.id, values)

                                        const embeds = new EmbedBuilder()
                                            .setTitle(`Musica | ${track.name}`)
                                            .addFields(
                                                { name: `Artistas`, value: `${track.artists.map(a => `[${a.name}](${a.external_urls.spotify})`).map(a => a).join(", ")}` },
                                                { name: `Duração`, value: `${moment.duration(track.duration_ms).format("y [anos] M [meses] d [dias] h [horas] m [minutos] e s [segundos]").replace("minsutos", "minutos")}` },
                                                { name: `Lançamento`, value: `${track.album.release_date}` },
                                            )

                                        i2.update({ embeds: [embeds], components: [row] })
                                    })
                                })
                            }*/
                        }
                            break;

                    }


                })
            })
        } else {
            const Embed = new EmbedBuilder()
                .setTitle(`Seu perfil | ${user.display_name}`)
                .setThumbnail(`${user?.images[0]?.url || "https://www.google.com/"}`)
                .addFields(
                    { name: `Suas Playlists`, value: `${playlists.items.filter(a => a.owner.id === user.id).length}`, inline: true },
                    { name: `Total de Playlists`, value: `${playlists.total}`, inline: true },
                    { name: `Total de Favoritos`, value: `${favoritos.total}` },
                    { name: `Seguidores`, value: `${user.followers.total}` },
                    { name: `Tipo da conta`, value: `${user.product}` },
                    { name: `Última musica escutada`, value: `${ultima.items.length === 0 ? `[${ultima.items[0].track.name}](${ultima.items[0].track.external_urls.spotify}) \`\`${moment.duration(ultima.items[0].track.duration_ms).format("hh:mm:ss")}\`\`` : `Nenhuma`} `, inline: true },
                )
                .setColor('Random')

            interaction.editReply({ embeds: [Embed], components: [rowoff], content: `` }).then(msg => {
                const filter = (i) => i.user.id == interaction.user.id;

                const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, filter });

                collector.on('collect', async i => {
                    const button = i.customId;

                    if (button === 'favoritos') {
                        const favoritos = await client.spotifyAPI.savedTracks(sptoken)
                            
                        const Embed = new EmbedBuilder()
                            .setAuthor({ name: 'Suas Musicas Favorias'})
                            .setDescription(`${favoritos.items > 1 ? `${favoritos.items.map((a, indice) => `**${indice + 1}** ${a.track.name} \`\`${moment.duration(a.track.duration_ms).format("hh:mm:ss")}\`\``).map(a => a).join("\n ")}` : `Nenhuma`}`)
                        msg.edit({ embeds: [Embed], components: [] })
                        i.deferUpdate()
                    }

                    if (button === 'maisescultado') {
                        const musicas = await client.spotifyAPI.TracksTop(sptoken, "short_term");
                        const Embed = new EmbedBuilder()
                            .setAuthor({ name: 'Suas Musicas Mais Escultadas'})
                            .setDescription(`${musicas.items.map((a, indice) => `**${indice + 1}** ${a.name} \`\`${moment.duration(a.duration_ms).format("hh:mm:ss")}\`\``).map(a => a).join("\n ")}`)
                        msg.edit({ embeds: [Embed], components: [] })
                        i.deferUpdate()

                    }


                })
            })
        }

    }
}