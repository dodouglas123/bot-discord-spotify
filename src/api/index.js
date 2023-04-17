const axios = require('axios');
const qs = require('qs');

module.exports = class octopiAPI {

    async formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes'

        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }

    async getUserPlaylists(token, user_id) {
        const res = await axios.get(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        if (res.status !== 200)
            throw new Error("Ocorreu um erro ao pegar as playlists do perfil.");

        return res.data;
    }

    async recentlyPlayedTracks(token) {
        const res = await axios.get(`https://api.spotify.com/v1/me/player/recently-played`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        if (res.status !== 200)
            throw new Error("Ocorreu um erro ao pegar as playlists do perfil.");

        return res.data;
    }

    async getUser(token) {
        const res = await axios.get(`https://api.spotify.com/v1/me`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        if (res.status !== 200)
            throw new Error("Ocorreu um erro ao pegar as informacoes do perfil.");

        return res.data;
    }

    async getPlayer(token) {
        const res = await axios.get(`https://api.spotify.com/v1/me/player`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        return res.data;
    }

    async getPlaylists(token, playlist_id) {
        const res = await axios.get(`https://api.spotify.com/v1/playlists/${playlist_id}`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        if (res.status !== 200)
            throw new Error("Ocorreu um erro ao pegar a playlist.");

        return res.data;
    }

    async createPlaylist(token, user_id, name, description, ispublic) {
        const res = await axios({
            method: "POST",
            url: `https://api.spotify.com/v1/users/${user_id}/playlists`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: {
                name: name,
                description: description,
                public: ispublic
            }
        });

        if (res.status !== 201)
            throw new Error("Ocorreu um erro ao pegar a playlist.");

        return res.data;
    }

    async refreshToken(refresh_token) {
        const data = qs.stringify({
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token
        });

        const options = {
            method: 'POST',
            headers: { 'Authorization': 'Basic ' + (new Buffer.from("a:b").toString('base64')), 'Content-Type': 'application/x-www-form-urlencoded' },
            data: data,
            url: `https://accounts.spotify.com/api/token`,
        };

        const res = await axios(options).catch(e => e)

        if (res.status !== 200)
            throw new Error("Ocorreu um erro ao pegar o token.");

        return res.data;
    }

    async SearchMusicbyName(token, nome) {
        const res = await axios.get(`https://api.spotify.com/v1/search?q=track:${nome}&type=track&limit=10`,
            {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

        if (res.status !== 200)
            throw new Error("Ocorreu um erro ao pegar a playlist.");

        return res.data;
    }

    async SearchMusicbyArtist(token, nome, artista) {
        const res = await axios.get(`https://api.spotify.com/v1/search?q=track:${nome}%20artist:${artista}&type=track&limit=10`,
            {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

        if (res.status !== 200)
            throw new Error("Ocorreu um erro ao pegar a playlist.");

        return res.data;
    }

    async AddtrackstoPlaylist(token, playlist_id, tracks) {
        const res = await axios({
            method: "POST",
            url: `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: {
                "uris": [
                    tracks
                ],
                "position": 0
            }
        });

        if (res.status !== 201)
            throw new Error("Ocorreu um erro ao adicionar a playlist.");

        return res.data;
    }

    async getTrack(token, tracks_id) {
        const res = await axios.get(`https://api.spotify.com/v1/tracks/${tracks_id}`,
            {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

        if (res.status !== 200)
            throw new Error("Ocorreu um erro ao buscar a musica.");

        return res.data;
    }

    async getTrackPLaylist(token, playlist_id) {
        const res = await axios.get(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
            {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

        if (res.status !== 200)
            throw new Error("Ocorreu um erro ao buscar as musicas.");

        return res.data;
    }

    async removeTrackPLaylist(token, playlist_id, track) {
        const res = await axios({
            method: "DELETE",
            url: `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: {
                "tracks": [{ "uri": `${track}` }]
            }
        });

        if (res.status !== 200)
            throw new Error("Ocorreu um erro ao buscar as musicas.");

        return res.data;
    }

    async changePlaylistDetails(token, playlist_id, name, description, ispublic) {
        const res = await axios({
            method: "PUT",
            url: `https://api.spotify.com/v1/playlists/${playlist_id}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: {
                name: name,
                description: description,
                public: ispublic
            }
        });

        if (res.status !== 200)
            throw new Error("Ocorreu um erro ao mudara a playlist.");

        return res.data;
    }

    async pausePlayback(token, device_id) {
        const res = await axios({
            method: "post",
            url: `https://api.spotify.com/v1/me/player/pause?device_id=${device_id}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (res.status !== 204)
            throw new Error("Ocorreu um erro ao pausar a musica.");

        return res.data;
    }

    async skipToNext(token, device_id) {
        const res = await axios({
            method: "post",
            url: `https://api.spotify.com/v1/me/player/next?device_id=${device_id}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (res.status !== 204)
            throw new Error("Ocorreu um erro ao pular a musica.");

        return res.data;
    }

    async skipToPrevious(token, device_id) {
        const res = await axios({
            method: "post",
            url: `https://api.spotify.com/v1/me/player/previous?device_id=${device_id}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (res.status !== 204)
            throw new Error("Ocorreu um erro ao adicionar a playlist.");

        return res.data;
    }

    async startPlayback(token, device_id) {
        const res = await axios({
            method: "PUT",
            url: `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (res.status !== 204)
            throw new Error("Ocorreu um erro ao adicionar a playlist.");

        return res.data;
    }

    async setVolume(token, device_id, volume_percent) {
        const res = await axios({
            method: "PUT",
            url: `https://api.spotify.com/v1/me/player/volume?volume_percent=${volume_percent}&device_id=${device_id}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (res.status !== 204)
            throw new Error("Ocorreu um erro ao mudar o volume.");

        return res.data;
    }

    async playbackShuffle(token, device_id, state) {
        const res = await axios({
            method: "PUT",
            url: `https://api.spotify.com/v1/me/player/shuffle?state=${state}&device_id=${device_id}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (res.status !== 204)
            throw new Error("Ocorreu um erro ao deixar as musicas em modo aleatorio.");

        return res.data;
    }

    async saveTracks(token, tracks) {
        const res = await axios({
            method: "PUT",
            url: `https://api.spotify.com/v1/me/tracks?ids=${tracks}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (res.status !== 200)
            throw new Error("Ocorreu um erro ao adicionar a playlist.");

        return res.data;
    }

    async TracksTop(token, timeRangeSlug) { // long_term (varios anos)  medium_term (6 meses) short_term (4 semanas)
        const res = await axios.get(`https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=${timeRangeSlug}`,
            {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

        if (res.status !== 200)
            throw new Error("Ocorreu um erro ao adicionar a playlist.");

        return res.data;
    }

    async savedTracks(token) {
        const res = await axios.get(`https://api.spotify.com/v1/me/tracks?limit=10`,
            {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

        if (res.status !== 200)
            throw new Error("Ocorreu um erro ao adicionar a playlist.");

        return res.data;
    }

    async autoPlay(token, device_id) {
        const res = await axios({
            method: "post",
            url: `https://api.spotify.com/v1/me/player/repeat?state=context&device_id=${device_id}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (res.status !== 204)
            throw new Error("Ocorreu um erro ativa o autoplay.");

        return res.data;
    }

    async AddPlaybackQueue(token, device_id, uri) {
        const res = await axios({
            method: "post",
            url: `https://api.spotify.com/v1/me/player/queue?uri=${uri}&device_id=${device_id}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (res.status !== 204)
            throw new Error("Ocorreu um erro ativa o autoplay.");

        return res.data;
    }
}