import React from 'react';

import './App.css';

import { init, getCurrent, getFeatures } from './spotify';
import * as colors from './colors';

import Visualization from './Visualization';

class App extends React.Component {
  state = {
    imageUrl: null,
    trackUri: null,
    gradient: {}
  };

  async componentDidMount() {
    // const url = 'https://m.blog.hu/ro/rockstation/image/pinkfloyd/220px-Dark_Side_of_the_Moon.png';
    const url =
      'https://res.cloudinary.com/teepublic/image/private/s--xOe3riPn--/t_Preview/b_rgb:191919,c_limit,f_jpg,h_630,q_90,w_630/v1493396845/production/designs/1537037_1.jpg';

    init();

    this.interval = setInterval(this.poll, 2000);
    this.poll();
  }

  poll = async () => {
    const track = await getCurrent();

    if (!track) {
      this.setState({ imageUrl: null, trackUri: null });
      return;
    }

    const {
      uri,
      album: { images }
    } = track;

    const { trackUri: prev } = this.state;

    if (prev !== uri) {
      console.log('song changed', track);
      const features = await getFeatures(track.id);

      const color = '#' + ((Math.max(Math.random(), 0.3) * 0xffffff) << 0).toString(16);
      // const color = Math.random() < 0.5 ? 'red' : 'blue';
      console.log({ color });

      console.log('bpm', features.tempo);
      const imageUrl = images[1].url;
      const [start, end] = await colors.getColors(imageUrl);

      this.setState({ gradient: { start, end } });

      const tempoMs = 60000 / features.tempo;

      clearInterval(this.tempoInterval);
      this.tempoInterval = setInterval(() => {
        // console.log('beat', features.tempo, Date.now());
      }, tempoMs);

      this.setState({ trackUri: uri, imageUrl, features, color });
    }
  };

  render() {
    const {
      trackUri,
      imageUrl,
      features,
      color,
      gradient: { start, end }
    } = this.state;

    // linear-gradient(${start}, ${end})`

    return (
      <div className="App" style={{ background: start }}>
        <header className="App-header">{trackUri ? <img src={imageUrl} alt="" /> : <p>not playing</p>}</header>
        {/* {trackUri && <Visualization tempo={features.tempo} color={color} />} */}
      </div>
    );
  }
}

export default App;
