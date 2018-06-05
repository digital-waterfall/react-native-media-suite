import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import MediaPlayerView from './library/index';
const videoUri = `https://d2h2jy22itvgms.cloudfront.net/${
    Platform.OS === 'ios' ? 'hls' : 'dash'
    }/269149/trailer.${Platform.OS === 'ios' ? 'm3u8' : 'mpd'}`;

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
          <MediaPlayerView
              ref={(ref) => {
                  this.player = ref
              }}
              style={{width: 200, height: 150, backgroundColor: 'black'}}
              autoplay={true}
              preload='auto'
              loop={true}
              muted={false}
              src={videoUri}
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