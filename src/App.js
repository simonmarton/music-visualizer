import React from 'react';

import './App.css';

import { init, getCurrent } from './spotify';

class App extends React.Component {
  state = {
    imageUrl: null,
    trackUri: null
  };

  async componentDidMount() {
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

    const { uri: prev } = this.state;

    if (prev !== uri) {
      const imageUrl = images[1].url;

      this.setState({ trackUri: uri, imageUrl });
    }
  };

  render() {
    const { trackUri, imageUrl } = this.state;

    return (
      <div className="App">
        <header className="App-header">{trackUri ? <img src={imageUrl} alt="" /> : <p>not playing</p>}</header>
      </div>
    );
  }
}

export default App;
