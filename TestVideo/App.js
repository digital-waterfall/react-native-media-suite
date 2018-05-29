import React from 'react';
import {StyleSheet, Text, View, Dimensions, TouchableOpacity} from 'react-native';
import  Video, { Downloader }  from './library/index';

const {width, height} = Dimensions.get('window');

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
        this.showVideo = this.showVideo.bind(this);
        this.downloader = new Downloader({onDownloadProgress: this.onDownloadProgress});
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={() => {this.downloader.test('https://d2h2jy22itvgms.cloudfront.net/hls/short_test.m3u8', 's1h2o3r4t')}}>
                    <Text>setupAssetDownload()</Text>
                </TouchableOpacity>
                <Text>{ this.state.progress}%</Text>
                <TouchableOpacity onPress={() => {this.setState({showPlayer: true});}}>
                    <Text>showVideo()</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {this.downloader.deleteDownloadedStream('https://d2h2jy22itvgms.cloudfront.net/hls/short_test.m3u8')}}>
                    <Text>deleteDownloadedStream()</Text>
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
                    src="https://d2h2jy22itvgms.cloudfront.net/hls/short_test.m3u8"
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
        console.log(data);
        // this.setState({progress:data});
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
