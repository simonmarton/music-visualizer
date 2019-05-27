const SpotifyWebApi = require('spotify-web-api-js');
const qs = require('query-string');

export const getAccessToken = () => {
  const scopes = 'user-read-currently-playing user-read-playback-state';

  const clientId = 'fed64962289c4e5f8a81c5ea0fb46f39';
  const redirect_uri = window.location.origin; //'http://localhost:3000';

  const url =
    'https://accounts.spotify.com/authorize' +
    '?response_type=token' +
    '&client_id=' +
    clientId +
    '&scope=' +
    encodeURIComponent(scopes) +
    '&redirect_uri=' +
    encodeURIComponent(redirect_uri);

  window.location.href = url;
};

export const init = () => {
  let { access_token: token } = qs.parse(window.location.hash);

  if (token) {
    window.location.hash = '';
    localStorage.setItem('token', token);
  } else {
    token = localStorage.getItem('token');
  }

  if (!token) {
    console.error('init no token');
    return getAccessToken();
  }
};

const getApi = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.error('getApi no token');
    return getAccessToken();
  }

  const api = new SpotifyWebApi();
  api.setAccessToken(token);

  return api;
};

export const getCurrent = async () => {
  const api = getApi();
  try {
    const { item, ...rest } = await api.getMyCurrentPlayingTrack();

    // console.log('getCurrent', item, rest);

    return item;
  } catch (err) {
    console.error('getCurrent error', err);
    getAccessToken();
  }
};

/* 
getAudioFeaturesForTrack returns
{
  "danceability": 0.735,
  "energy": 0.578,
  "key": 5,
  "loudness": -11.84,
  "mode": 0,
  "speechiness": 0.0461,
  "acousticness": 0.514,
  "instrumentalness": 0.0902,
  "liveness": 0.159,
  "valence": 0.636,
  "tempo": 98.002,
  "type": "audio_features",
  "id": "06AKEBrKUckW0KREUWRnvT",
  "uri": "spotify:track:06AKEBrKUckW0KREUWRnvT",
  "track_href": "https://api.spotify.com/v1/tracks/06AKEBrKUckW0KREUWRnvT",
  "analysis_url": "https://api.spotify.com/v1/audio-analysis/06AKEBrKUckW0KREUWRnvT",
  "duration_ms": 255349,
  "time_signature": 4
}
*/

export const getFeatures = async trackId => {
  const api = getApi();
  try {
    const features = await api.getAudioFeaturesForTrack(trackId);

    return features;
  } catch (err) {
    console.error('getFeatures error', err);
    getAccessToken();
  }
};
