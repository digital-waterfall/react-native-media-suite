import React from 'react';
import {StyleSheet, Text, View, Dimensions, Platform, Alert} from 'react-native';
import  Video, { DownloadManager, eventListenerTypes }  from './library/index';
import { Tabs, Button, WhiteSpace } from 'antd-mobile-rn';
import _ from 'lodash';

const {width} = Dimensions.get('window');

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

        DownloadManager.restoreMediaDownloader();
        this.state = {
            videos: [_.cloneDeep(videoProps), _.cloneDeep(videoProps), _.cloneDeep(videoProps)]
        };
        _.forEach(DownloadManager.downloads, download => {
            if(_.has(download, 'downloadID')){
                const index = download.downloadID.slice(-1);
                this.state.videos[index].download = download;
            }
        });

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
                'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
                'http://devimages.apple.com/iphone/samples/bipbop/bipbopall.m3u8',
                'http://184.72.239.149/vod/smil:BigBuckBunny.smil/playlist.m3u8'
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
                { this.showVideo(index) }
            </View>
        );
    }

    download(url, index) {
        try {
            const download = DownloadManager.createNewDownload(url, `Download${index}`);
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
            download.addEventListener(eventListenerTypes.finished, () => {
                this.updateProgress(100, index);
                let newVideos = this.state.videos;
                newVideos[index].download = DownloadManager.getDownload(download.downloadID);
                this.setState({videos: newVideos});
            });
        } catch(e) {
            Alert.alert('Download Error', e);
        }

    }

    updateProgress(progress, index) {
        let newVideos = this.state.videos;
        newVideos[index].progress = progress;
        this.setState({videos: newVideos});
    }

    showVideo(index) {
        if (_.get(this.state.videos[index], 'download.localURL', undefined)) {
            const player = _.get(this.state.videos[index], 'player', null);
            return (
                <View>
                    <WhiteSpace size="lg" />
                    <Video
                        ref={(ref) => {
                            this.registerPLayer(ref, index)
                        }}
                        style={{width: 300, height: 170, backgroundColor: 'black'}}
                        autoplay
                        loop
                        muted={false}
                        src={this.state.videos[index].download.downloadID}
                        offline
                        onPlaybackError={() => console.log('lol')}
                        onPlayerProgress={data => console.log(data)}
                    />
                    <View style={{width: 300, height: 30, flexDirection: 'row', justifyContent: 'space-evenly'}}>
                        <Button type="primary" size="small" onClick={() => player.seekTo(20000)}>{'<'}</Button>
                        <Button type="primary" size="small" onClick={() => player.play()}>Play</Button>
                        <Button type="primary" size="small" onClick={() => player.stop()}>Stop</Button>
                        <Button type="primary" size="small" onClick={() => player.pause()}>Pause</Button>
                        <Button type="primary" size="small" onClick={() => player.seekTo(30000)}>{'>'}</Button>
                    </View>
                </View>
            );
        }
        let newVideos = this.state.videos;
        if (newVideos[index].player) {
            newVideos[index].player = null;
            this.setState({videos: newVideos});
        }
        return null;
    }

    registerPLayer(ref, index) {
        let newVideos = this.state.videos;
        if (!newVideos[index].player) {
            newVideos[index].player = ref;
            this.setState({videos: newVideos});
        }
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
