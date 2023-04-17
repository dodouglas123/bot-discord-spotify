const client = require('../../index')
const { EmbedBuilder, ButtonBuilder, ChannelType, ApplicationCommandType, ButtonStyle, ActionRowBuilder, ComponentType, TextInputStyle, TextInputBuilder, ModalBuilder, StringSelectMenuBuilder } = require('discord.js');
const moment = require("moment")
require("moment-duration-format");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: `${__dirname}/../config/users.json` });

client.on("interactionCreate", async (interaction) => {

  if (interaction.isButton()) {
    const button = interaction.customId;
    const sptoken = await db.get(`user_${interaction.user.id}.access_token`)
    if (button.startsWith('adicionar_')) {
      const [, identifier] = button.split('_')

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`adicionar_${identifier}`)
            .setLabel('Adicionar Musicas')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setLabel('IR Para a Playlist')
            .setURL(`https://open.spotify.com/playlist/`)
            .setStyle(ButtonStyle.Link),
        );

      const modal = new ModalBuilder()
        .setCustomId('myModal')
        .setTitle('Adicionar Musica');

      const nome = new TextInputBuilder()
        .setCustomId('nome')
        .setPlaceholder('EX: parecia tempestade')
        .setLabel("Nome da musica (obrigatório)")
        .setStyle(TextInputStyle.Short);

      const artista = new TextInputBuilder()
        .setCustomId('artista')
        .setRequired(false)
        .setPlaceholder('EX: Sony no Beat')
        .setLabel("Nome do artista (opcional)")
        .setStyle(TextInputStyle.Short);

      const firstActionRow = new ActionRowBuilder().addComponents(nome);
      const secondActionRow = new ActionRowBuilder().addComponents(artista);

      modal.addComponents(firstActionRow, secondActionRow);

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
        const artista = submitted.fields.getTextInputValue('artista');
        let musicas;

        if (nome) { musicas = await client.spotifyAPI.SearchMusicbyName(sptoken, nome) }
        if (nome && artista) { musicas = await client.spotifyAPI.SearchMusicbyArtist(sptoken, nome, artista) }
        if (musicas.tracks.total <= 0) return interaction.reply({ content: "Nenhuma musica encontrada", ephemeral: true })

        const resultado = musicas.tracks.items

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

            await client.spotifyAPI.AddtrackstoPlaylist(sptoken, identifier, values)

            const track = await client.spotifyAPI.getTrack(sptoken, values.split(":")[2])

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

      }
    }
  }


  if (interaction.isChatInputCommand()) {
    const cmd = client.slash.get(interaction.commandName);
    if (!cmd) return;

    const roww = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Logar')
          .setURL(`http://localhost:3000/login?state=${interaction.user.id}`)
          .setStyle(ButtonStyle.Link),
      );

    const user = await db.get(`user_${interaction.user.id}`)
    if (!user) return interaction.reply({ components: [roww], content: "voce não tem uma conta logue para se registrar e poder usar o bot" })
    if (user.date <= Date.now()) {
      const ototoken = await client.spotifyAPI.refreshToken(user.refresh_token)

      await db.set(`user_${interaction.user.id}.access_token`, ototoken.access_token)
      await db.set(`user_${interaction.user.id}.date`, Date.now() + 3600000)
    }

    const args = [];
    for (let option of interaction.options.data) {
      if (option.type === "SUB_COMMAND") {
        if (option.name) args.push(option.name);

        option.options?.forEach((x) => {
          if (x.value) args.push(x.value);
        });
      } else if (option.value) args.push(option.value);
    }
    interaction.member = interaction.guild.members.cache.get(interaction.user.id);

    cmd.run({ client, interaction, args });
  }

  if (interaction.isContextMenuCommand()) {
    const command = client.slashCommands.get(interaction.commandName);
    if (command) command.run({ client, interaction });
  }
});