import React from 'react';
import {StyleSheet, Text, View, Dimensions, Platform, Alert} from 'react-native';
import Video, {DOWNLOAD_STATES, DownloadManager, EVENT_LISTENER_TYPES} from './library/index';
import { Tabs, Button, WhiteSpace, TabBar } from 'antd-mobile-rn';
import _ from 'lodash';

const {width} = Dimensions.get('window');

const VIDEO_IDS = [
    'download1',
    'download2',
    'download3'
];

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
            download: null,
            player: null
        };

        this.downloadPlayer = null;
        this.videoPlayer = null;

        let videos = [];
        _.map(VIDEO_IDS, (videoId, index) => {
            videos.push(_.cloneDeep(videoProps));
            videos[index].videoId = videoId;
        });
        this.state = {activeIndex: 0, videos};

        this.registerDownloadPlayer = this.registerDownloadPlayer.bind(this);
        this.showVideo = this.showVideo.bind(this);
        this.renderVideo = this.renderVideo.bind(this);
        this.download = this.download.bind(this);
        this.updateProgress = this.updateProgress.bind(this);
        this.restoreDownloads = this.restoreDownloads.bind(this);
        this.addEventListener = this.addEventListener.bind(this);
        this.setActive = _.debounce(this.setActive.bind(this), 500);

        DownloadManager.restoreMediaDownloader().then(downloadIds => {
            if(!_.isEmpty(downloadIds)){
                this.restoreDownloads(downloadIds);
            }
        });
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
                'https://d2h2jy22itvgms.cloudfront.net/dash/short_test.mpd',
                'https://bitmovin-a.akamaihd.net/content/playhouse-vr/mpds/105560.mpd',
                'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd'
            ]
        });
        return (
                    <View>
                        <Video
                            ref={(ref) => this.registerVideoPlayer(ref)}
                            style={{width: 300, height: 170, backgroundColor: 'black'}}
                            autoplay
                            loop
                            muted={false}
                            src="https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8"
                            onError={(error) => console.warn(error)}
                            onProgress={data => console.log(data)}
                        />
                        <View style={{width: 300, height: 30, flexDirection: 'row', justifyContent: 'space-evenly'}}>
                            <Button type="primary" size="small" onClick={() => this.videoPlayer.seekTo(20000)}>{'<'}</Button>
                            <Button type="primary" size="small" onClick={() => this.videoPlayer.play()}>Play</Button>
                            <Button type="primary" size="small" onClick={() => this.videoPlayer.stop()}>Stop</Button>
                            <Button type="primary" size="small" onClick={() => this.videoPlayer.pause()}>Pause</Button>
                            <Button type="primary" size="small" onClick={() => this.videoPlayer.seekTo(30000)}>{'>'}</Button>
                        </View>
                    </View>
        );
    }

    registerDownloadPlayer(ref) {
        this.downloadPlayer = ref;
    }

    registerVideoPlayer(ref) {
        this.videoPlayer = ref;
    }

    showVideo() {
        const activeIndex = this.state.activeIndex;
        const download = this.state.videos[activeIndex].download;
        if (download && download.state === DOWNLOAD_STATES.downloaded) {
            return (
                <View>
                    <WhiteSpace size="lg" />
                    <Video
                        ref={(ref) => this.registerDownloadPlayer(ref)}
                        style={{width: 300, height: 170, backgroundColor: 'black'}}
                        autoplay
                        loop
                        muted={false}
                        src={download.downloadID}
                        offline
                        onError={(error) => console.warn(error)}
                        onProgress={data => console.log(data)}
                    />
                    <View style={{width: 300, height: 30, flexDirection: 'row', justifyContent: 'space-evenly'}}>
                        <Button type="primary" size="small" onClick={() => this.downloadPlayer.seekTo(20000)}>{'<'}</Button>
                        <Button type="primary" size="small" onClick={() => this.downloadPlayer.play()}>Play</Button>
                        <Button type="primary" size="small" onClick={() => this.downloadPlayer.stop()}>Stop</Button>
                        <Button type="primary" size="small" onClick={() => this.downloadPlayer.pause()}>Pause</Button>
                        <Button type="primary" size="small" onClick={() => this.downloadPlayer.seekTo(30000)}>{'>'}</Button>
                    </View>
                </View>
            );
        }
    }

    renderVideo(url, index) {
        const progress = _.get(this.state.videos[index], 'download.progress', 0);
        const download = this.state.videos[index].download;
        return (
            <View style={styles.container} key={index}>
                <Button type="primary" size="small" onClick={() => this.download(url, VIDEO_IDS[index])}>Download</Button>
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
            </View>
        );
    }

    download(url, videoId) {
        try {
            const download = DownloadManager.createNewDownload(url, videoId, `Test Download ${videoId.slice(-1)}`, 'https://s1.dmcdn.net/czxuQ/x720-MzM.jpg');
            if(_.has(download, 'downloadID')){
                const newVideos = this.state.videos;
                _.find(newVideos, ['videoId', download.downloadID]).download = download;
                this.setState({videos: newVideos});
                this.addEventListener(download);
                download.start();
            }

        } catch(e) {
            Alert.alert('Download Error', e);
        }

    }

    updateProgress(progress, videoId) {
        _.find( this.state.videos, ['videoId', videoId]).download.progress = progress;
        this.setState({videos: this.state.videos});
    }

    restoreDownloads(downloadIds){
        const downloads = DownloadManager.getDownload(downloadIds);
        if(_.isArray(downloads)){
            _.map(downloads, download => {
                this.addEventListener(download);
                _.find( this.state.videos, ['videoId', download.downloadID]).download = download;
                this.setState({videos: this.state.videos});
            });
        } else if (downloads) {
            const download = downloads;
            this.addEventListener(download);
            _.find( this.state.videos, ['videoId', download.downloadID]).download = download;
            this.setState({videos: this.state.videos});
        }
    }

    addEventListener(download){
        download.addEventListener(EVENT_LISTENER_TYPES.started, () => {
            console.log('Download started', download.state);
        });
        download.addEventListener(EVENT_LISTENER_TYPES.progress, (progress) => this.updateProgress(progress, download.downloadID));
        download.addEventListener(EVENT_LISTENER_TYPES.cancelled, () => {
            this.updateProgress(0, download.downloadID);
            _.find( this.state.videos, ['videoId', download.downloadID]).download = null;
            this.setState({videos: this.state.videos});
        });
        download.addEventListener(EVENT_LISTENER_TYPES.deleted, () => {
            this.updateProgress(0, download.downloadID);
            _.find( this.state.videos, ['videoId', download.downloadID]).download = null;
            this.setState({videos: this.state.videos});
        });
        download.addEventListener(EVENT_LISTENER_TYPES.error, (errorType, errorMessage) => Alert.alert(
            errorType,
            errorMessage
        ));
        download.addEventListener(EVENT_LISTENER_TYPES.finished, () => {
            this.updateProgress(100, download.downloadID);
            _.find( this.state.videos, ['videoId', download.downloadID]).download = download;
            this.setState({videos: this.state.videos});
        });
    }

    setActive(index) {
        this.setState({activeIndex: index});
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
