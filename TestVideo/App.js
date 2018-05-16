import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import MediaPlayerView  from './library/MediaPlayerView.js';

const {width, height} = Dimensions.get('window');

export default class App extends React.Component {
    state = {
        muted: false,
        width: width,
        height: width / (16/9),
    };

  render() {
    return (
      <View style={styles.container}>
          <Text>Hi</Text>
          <MediaPlayerView
              style={{width: this.state.width, height: this.state.height, marginTop: 50, backgroundColor: 'black'}}
              autoplay={true}
              preload='none'
              loop={true}
              muted={this.state.muted}
              src="https://d2h2jy22itvgms.cloudfront.net/hls/269149/trailer.m3u8"
          />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
