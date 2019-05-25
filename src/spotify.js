const SpotifyWebApi = require('spotify-web-api-js');
const qs = require('query-string');

export const getAccessToken = () => {
  const scopes = 'user-read-currently-playing user-read-playback-state';

  const clientId = 'fed64962289c4e5f8a81c5ea0fb46f39';
  const redirect_uri = 'http://localhost:3000';

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
    const { item } = await api.getMyCurrentPlayingTrack();

    return item;
  } catch (err) {
    console.error('getCurrent error', err);
    getAccessToken();
  }
};
