import React from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Platform } from 'react-native';
import MediaPlayerView, {Downloader} from './library/index';
const videoUri = `https://d2h2jy22itvgms.cloudfront.net/${
    Platform.OS === 'ios' ? 'hls' : 'dash'
    }/269149/trailer.${Platform.OS === 'ios' ? 'm3u8' : 'mpd'}`;
const {width, height} = Dimensions.get('window');

export default class App extends React.Component {
    constructor(props){
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
        this.showVideo = this.showVideo.bind(this);
        this.downloader = new Downloader({
            onDownloadProgress: this.onDownloadProgress,
            onDownloadError: (data) => console.log(data),
            onDownloadStarted: (data) => console.log(data),
            onDownloadFinished: (data) => console.log(data),
            onDownloadCanceled: (data) => console.log(data)
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={() => {this.downloader.downloadStream(videoUri, '269149')}}>
                    <Text>setupAssetDownload()</Text>
                </TouchableOpacity>
                <Text>{ this.state.progress}%</Text>
                <TouchableOpacity onPress={() => {this.setState({showPlayer: true});}}>
                    <Text>showVideo()</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {this.downloader.deleteDownloadedStream('269149')}}>
                    <Text>deleteDownloadedStream()</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {this.downloader.pauseDownload('269149', videoUri)}}>
                    <Text>pauseDownload()</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {this.downloader.resumeDownload('269149', videoUri)}}>
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
                            this.player = ref
                        }}
                        style={{width: this.state.width, height: 190, backgroundColor: 'black'}}
                        autoplay={true}
                        preload='auto'
                        loop={true}
                        muted={this.state.muted}
                        src="269149"
                    />
                    <TouchableOpacity onPress={() => {
                        if (this.state.play) {
                            this.setState({play: false});
                            this.player.pause();
                        } else {
                            this.setState({play: true});
                            this.player.play();
                        }
                    }}>
                        <Text>play()</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return null;
    }

    onDownloadProgress(data) {
        console.log('Download progress',data);
        this.setState({progress:data.percentComplete});
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    }
});