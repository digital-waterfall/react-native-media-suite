import React from 'react';
import {StyleSheet, Text, View, Dimensions, TouchableOpacity, Platform, Alert} from 'react-native';
import  Video, { DownloadManager, eventListenerTypes }  from './library/index';
import { Tabs, Button, WhiteSpace } from 'antd-mobile-rn';
import _ from 'lodash';

const {width, height} = Dimensions.get('window');

export default class App extends React.Component {
    constructor(props) {
        super(props);

        let videoProps = {
            muted: false,
            width: width,
            height: width / (16 / 9),
            showPlayer: false,
            progress: 0,
            play: false,
            download: null
        };

        this.state = {
            videos: [_.cloneDeep(videoProps), _.cloneDeep(videoProps), _.cloneDeep(videoProps)]
        };

        this.onDownloadProgress = this.onDownloadProgress.bind(this);
        this.registerPLayer = this.registerPLayer.bind(this);
        this.showVideo = this.showVideo.bind(this);
        this.renderVideo = this.renderVideo.bind(this);
        this.download = this.download.bind(this);
        this.updateProgress = this.updateProgress.bind(this);

        DownloadManager.restoreMediaDownloader();
    }

    render() {
        const tabs = [
            { title: 'Video 1' },
            { title: 'Video 2' },
            { title: 'Video 3' },
        ];

        const videoURLs = Platform.select({
            ios: [
                'http://qthttp.apple.com.edgesuite.net/1010qwoeiuryfg/sl.m3u8',
                'http://devimages.apple.com/iphone/samples/bipbop/bipbopall.m3u8',
                'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8'
            ],
            android: [
                'https://bae.sgp1.digitaloceanspaces.com/videos/121/dash/590b546f0d4e3896f611cd51d718e32f.mpd',
                'https://bitmovin-a.akamaihd.net/content/playhouse-vr/mpds/105560.mpd',
                'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd'
            ]
        });

        return (
            <View style={{ flex: 1, marginTop: 20}}>
                <Tabs tabs={tabs} initialPage={0}>
                    {_.map(videoURLs, (url, index) => this.renderVideo(url, index))}
                </Tabs>
            </View>
        );
    }

    renderVideo(url, index) {
        const progress = _.get(this.state.videos[index], 'progress', 0);
        const download = this.state.videos[index].download;
        return (
            <View style={styles.container} key={index}>
                <Button type="primary" size="small" onClick={() => this.download(url, index)}>Download</Button>
                <WhiteSpace size="sm" />
                <Text>{ Math.floor(progress) }%</Text>
                <WhiteSpace size="sm" />
                <Button type="warning" size="small" disabled={!download} onClick={() => download.delete()}>Delete Download</Button>
                <WhiteSpace size="sm" />
                <Button type="ghost" size="small" disabled={!download} onClick={() => download.pause()}>Pause Download</Button>
                <WhiteSpace size="sm" />
                <Button type="ghost" size="small" disabled={!download} onClick={() => download.resume()}>Resume Download</Button>
                <WhiteSpace size="sm" />
                <Button type="ghost" size="small" disabled={!download} onClick={() => download.cancel()}>Cancel Download</Button>
                { this.showVideo() }
            </View>
        );
    }

    download(url, index) {
        try {
            const download = DownloadManager.createNewDownload('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8', `Download${index}`);
            let newVideos = this.state.videos;
            newVideos[index].download = download;
            this.setState({videos: newVideos});
            download.start();
            download.addEventListener(eventListenerTypes.progress, (progress) => this.updateProgress(progress, index));
            download.addEventListener(eventListenerTypes.cancelled, () => {
                this.updateProgress(0, index);
                let newVideos = this.state.videos;
                newVideos[index].download = null;
                this.setState({videos: newVideos});
            });
            download.addEventListener(eventListenerTypes.deleted, () => {
                this.updateProgress(0, index);
                let newVideos = this.state.videos;
                newVideos[index].download = null;
                this.setState({videos: newVideos});
            });
            download.addEventListener(eventListenerTypes.error, (errorType, errorMessage) => Alert.alert(
                errorType,
                errorMessage
            ));
        } catch(e) {
            Alert.alert('Download Error', e);
        }

    }

    updateProgress(progress, index) {
        let newVideos = this.state.videos;
        newVideos[index].progress = progress;
        this.setState({videos: newVideos});
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
                    src="https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"
                    // offline
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
        paddingVertical: 40,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        backgroundColor: '#ddd',
    },
});
