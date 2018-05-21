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
            progress: 0
        };

        this.onDownloadProgress = this.onDownloadProgress.bind(this);
        this.showVideo = this.showVideo.bind(this);
        this.downloader = new Downloader(this.onDownloadProgress);
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={() => {this.downloader.test('https://d2h2jy22itvgms.cloudfront.net/hls/short_test.m3u8')}}>
                    <Text>setupAssetDownload()</Text>
                </TouchableOpacity>
                <Text>{ this.state.progress}%</Text>
                { this.showVideo() }
            </View>
        );
    }

    showVideo() {
        console.log("Print 1: ", parseFloat(this.state.progress));
        if (parseFloat(this.state.progress) === 100) {
            console.log("Print 2: ", parseFloat(this.state.progress));
            return (
            <Video
                style={{width: this.state.width, height: 190, backgroundColor: 'black'}}
                autoplay={true}
                preload='none'
                loop={false}
                muted={this.state.muted}
                src="https://d2h2jy22itvgms.cloudfront.net/hls/short_test.m3u8"
            />
            );
        }
        return null;
    }

    onDownloadProgress(data) {
        console.log(data);
        this.setState({progress:data});
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
