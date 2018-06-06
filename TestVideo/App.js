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
        this.downloader = new Downloader({
            onDownloadProgress: this.onDownloadProgress,
            onDownloadError: (data) => console.log(data),
            onDownloadStarted: (data) => console.log(data),
            onDownloadFinished: (data) => console.log(data),
            onDownloadCanceled: (data) => console.log(data)
        });
        console.log('Downloader',this.downloader);
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={() => {console.log('Setup download service.')}}>
                    <Text>setupAssetDownload()</Text>
                </TouchableOpacity>
                <Text>{ this.state.progress }%</Text>
            </View>
        );
    }

    renderVideo() {
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
    }
});