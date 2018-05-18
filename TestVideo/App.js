import React from 'react';
import {StyleSheet, Text, View, Dimensions, TouchableOpacity} from 'react-native';
import Downloader from './library/media-downloader/media-downloader';
import MediaPlayer from './library/media-player/media-player-view';

const {width, height} = Dimensions.get('window');

export default class App extends React.Component {
    state = {
        muted: false,
        width: width,
        height: width / (16 / 9),
    };

    render() {
        console.log(this.state.downloader);
        let downloader = new Downloader();
        return (
            <MediaPlayer style={styles.container}>
                {/*<TouchableOpacity onPress={() => {downloader.setupAssetDownload('https://d2h2jy22itvgms.cloudfront.net/hls/269149/trailer.m3u8')}}>*/}
                    {/*<Text>setupAssetDownload()</Text>*/}
                {/*</TouchableOpacity>*/}
                {/*<TouchableOpacity onPress={() => {downloader.startAssetDownload()}}>*/}
                    {/*<Text>startAssetDownload()</Text>*/}
                {/*</TouchableOpacity>*/}
                <MediaPlayer
                    style={{width: this.state.width, height: this.state.height, backgroundColor: 'black'}}
                    autoplay={true}
                    preload='none'
                    loop={true}
                    muted={this.state.muted}
                    src="https://d2h2jy22itvgms.cloudfront.net/hls/269149/trailer.m3u8"
                />
            </MediaPlayer>
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
