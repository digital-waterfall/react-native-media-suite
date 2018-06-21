import React from 'react';
import {StyleSheet, Text, View, Dimensions, TouchableOpacity, Platform} from 'react-native';
import  Video, { Downloader }  from './library/index';

const {width, height} = Dimensions.get('window');

// const videoUri = `https://d2h2jy22itvgms.cloudfront.net/${
//     Platform.OS === 'ios' ? 'hls' : 'dash'
//     }/269149/trailer.${Platform.OS === 'ios' ? 'm3u8' : 'mpd'}`;
const videoUri = 'https://d2h2jy22itvgms.cloudfront.net/dash/short_test.mpd';

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            muted: false,
            width: width,
            height: width / (16 / 9),
            showPlayer: false,
            progress: 0,
            play: false
        };

        this.onDownloadProgress = this.onDownloadProgress.bind(this);
        this.registerPLayer = this.registerPLayer.bind(this);
        this.showVideo = this.showVideo.bind(this);
        this.downloader = new Downloader({
            onDownloadProgress: this.onDownloadProgress,
            onDownloadError: (data) => console.log('downloadError',data),
            onDownloadStarted: (data) => console.log('downloadStarted',data),
            onDownloadFinished: (data) => console.log('downloadFinished',data),
            onDownloadCanceled: (data) => console.log('downloadCancelled',data)
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={() => {this.downloader.downloadStream('269149', videoUri)}}>
                    <Text>setupAssetDownload()</Text>
                </TouchableOpacity>
                <Text>{ this.state.progress}%</Text>
                <TouchableOpacity onPress={() => {this.setState({showPlayer: true});}}>
                    <Text>showVideo()</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {this.downloader.deleteDownloadedStream('269149')}}>
                    <Text>deleteDownloadedStream()</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {this.downloader.pauseDownload('269149')}}>
                    <Text>pauseDownload()</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {this.downloader.resumeDownload('269149')}}>
                    <Text>resumeDownload()</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {this.downloader.cancelDownload('269149')}}>
                    <Text>cancelDownload()</Text>
                </TouchableOpacity>
                { this.showVideo() }
            </View>
        );
    }

    showVideo() {
        if (this.state.showPlayer) {
            return (
                <View>
                <Video
                    ref={(ref) => {
                        this.registerPLayer(ref)
                    }}
                    style={{width: this.state.width, height: 190, backgroundColor: 'black'}}
                    autoplay={true}
                    // preload='auto'
                    loop={true}
                    muted={this.state.muted}
                    src={videoUri}
                    offline
                    onPlaybackError={() => console.log('lol')}
                    onPlayerProgress={data => console.log(data)}
                />
                <TouchableOpacity onPress={() => this.player.play()}>
                    <Text>play()</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.player.pause()}>
                    <Text>pause()</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.player.seekTo(30000)}>
                    <Text>forwardTo(30)</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.player.seekTo(20000)}>
                    <Text>backwardTO(20)</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.player.stop()}>
                    <Text>stop()</Text>
                </TouchableOpacity>
                </View>
            );
        }
        return null;
    }

    registerPLayer(ref) {
        this.player = ref;
    }

    onDownloadProgress(data) {
        console.log(data);
        this.setState({progress:data.percentComplete});
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
