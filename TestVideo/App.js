import React from 'react';
import {StyleSheet, Text, View, Dimensions, TouchableOpacity} from 'react-native';
import  { Downloader }  from './library/index';

const {width, height} = Dimensions.get('window');

export default class App extends React.Component {
    state = {
        muted: false,
        width: width,
        height: width / (16 / 9),
    };

    render() {
        console.log('Downloader: ', Downloader);
        let downloader = new Downloader();
        console.log('Downloader: ', downloader);
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={() => {downloader.test('https://d2h2jy22itvgms.cloudfront.net/hls/269149/trailer.m3u8')}}>
                    <Text>setupAssetDownload()</Text>
                </TouchableOpacity>
                {/*<TouchableOpacity onPress={() => {downloader.startAssetDownload()}}>*/}
                    {/*<Text>startAssetDownload()</Text>*/}
                {/*</TouchableOpacity>*/}
                {/*<MediaPlayer*/}
                    {/*style={{width: this.state.width, height: this.state.height, backgroundColor: 'black'}}*/}
                    {/*autoplay={true}*/}
                    {/*preload='none'*/}
                    {/*loop={true}*/}
                    {/*muted={this.state.muted}*/}
                    {/*src="https://d2h2jy22itvgms.cloudfront.net/hls/269149/trailer.m3u8"*/}
                {/*/>*/}
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
