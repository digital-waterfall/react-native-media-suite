import React from 'react';
import { StyleSheet, Text, View, Dimensions, Platform, Alert } from 'react-native';
import Video, { DOWNLOAD_STATES, DownloadManager, EVENT_LISTENER_TYPES } from './library/index';
import { Tabs, Button, WhiteSpace } from 'antd-mobile-rn';
import _ from 'lodash';

const { width } = Dimensions.get('window');

const VIDEO_IDS = ['download1', 'download2', 'download3'];

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

        this.player = null;

        let videos = [];
        _.map(VIDEO_IDS, (videoId, index) => {
            videos.push(_.cloneDeep(videoProps));
            videos[index].videoId = videoId;
        });
        this.state = { activeIndex: 0, videos };

        this.registerPlayer = this.registerPlayer.bind(this);
        this.showVideo = this.showVideo.bind(this);
        this.renderDownloadAndVideo = this.renderDownloadAndVideo.bind(this);
        this.download = this.download.bind(this);
        this.updateProgress = this.updateProgress.bind(this);
        this.restoreDownloads = this.restoreDownloads.bind(this);
        this.addEventListener = this.addEventListener.bind(this);
        this.setActive = _.debounce(this.setActive.bind(this), 500);

        DownloadManager.restoreMediaDownloader().then(downloadIds => {
            if (!_.isEmpty(downloadIds)) {
                this.restoreDownloads(downloadIds);
            }
        });

        this.videoURLs = Platform.select({
            ios: [
                'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
                'http://devimages.apple.com/iphone/samples/bipbop/bipbopall.m3u8',
                'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8'
            ],
            android: [
                'https://d2h2jy22itvgms.cloudfront.net/dash/short_test.mpd',
                'https://bitmovin-a.akamaihd.net/content/playhouse-vr/mpds/105560.mpd',
                'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd'
            ]
        });
    }

    render() {
        const tabs = [{ title: 'Download 1' }, { title: 'Download 2' }, { title: 'Stream Video' }];
        return (
            <View style={styles.tabsView}>
                <Tabs
                    tabs={tabs}
                    initialPage={0}
                    onChange={(tab, index) => {
                        this.setActive(index);
                    }}
                >
                    {_.map(this.videoURLs, (url, index) => this.renderDownloadAndVideo(url, index))}
                </Tabs>
                {this.showVideo()}
            </View>
        );
    }

    registerPlayer(ref) {
        this.player = ref;
    }

    showVideo() {
        const activeIndex = this.state.activeIndex;
        if (activeIndex === 2) {
            return null;
        }

        const download = this.state.videos[activeIndex].download;
        if (download && download.state === DOWNLOAD_STATES.downloaded) {
            return (
                <View style={styles.downloadView}>
                    <WhiteSpace size="lg" />
                    <Video
                        ref={ref => this.registerPlayer(ref)}
                        style={styles.mediaPlayer}
                        autoplay
                        loop
                        muted={false}
                        src={download.downloadID}
                        ignoreSilentSwitch
                        onError={error => console.warn(error)}
                        onProgress={data => console.warn(data)}
                    />
                    <View style={styles.mediaButtonView}>
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => this.player.seekTo(20000)}
                        >
                            {'<'}
                        </Button>
                        <Button type="primary" size="small" onClick={() => this.player.play()}>
                            Play
                        </Button>
                        <Button type="primary" size="small" onClick={() => this.player.stop()}>
                            Stop
                        </Button>
                        <Button type="primary" size="small" onClick={() => this.player.pause()}>
                            Pause
                        </Button>
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => this.player.seekTo(30000)}
                        >
                            {'>'}
                        </Button>
                    </View>
                </View>
            );
        }
    }

    renderDownloadAndVideo(url, index) {
        if (index === 2) {
            return (
                <View style={styles.downloadView}>
                    <WhiteSpace size="lg" />
                    <Video
                        ref={ref => this.registerPlayer(ref)}
                        style={styles.mediaPlayer}
                        autoplay
                        loop
                        ignoreSilentSwitch
                        muted={false}
                        src={this.videoURLs[2]}
                        onError={error => console.warn(error)}
                        onProgress={data => console.warn(data)}
                    />
                    <View style={styles.buttonView}>
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => this.player.seekTo(20000)}
                        >
                            {'<'}
                        </Button>
                        <Button type="primary" size="small" onClick={() => this.player.play()}>
                            Play
                        </Button>
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => this.player.setPreferredPeakBitRate(6500000)}
                        >
                            Set
                        </Button>
                        <Button type="primary" size="small" onClick={() => this.player.pause()}>
                            Pause
                        </Button>
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => this.player.seekTo(30000)}
                        >
                            {'>'}
                        </Button>
                    </View>
                </View>
            );
        }
        const progress = _.get(this.state.videos[index], 'download.progress', 0);
        const download = this.state.videos[index].download;
        return (
            <View style={styles.container} key={index}>
                <Button
                    type="primary"
                    size="small"
                    onClick={() => this.download(url, VIDEO_IDS[index])}
                >
                    Download
                </Button>
                <WhiteSpace size="sm" />
                <Text>{Math.floor(progress)}%</Text>
                <WhiteSpace size="sm" />
                <Button
                    type="warning"
                    size="small"
                    disabled={!download}
                    onClick={() => download.delete()}
                >
                    Delete Download
                </Button>
                <WhiteSpace size="sm" />
                <Button
                    type="ghost"
                    size="small"
                    disabled={!download}
                    onClick={() => download.pause()}
                >
                    Pause Download
                </Button>
                <WhiteSpace size="sm" />
                <Button
                    type="ghost"
                    size="small"
                    disabled={!download}
                    onClick={() => download.resume()}
                >
                    Resume Download
                </Button>
                <WhiteSpace size="sm" />
                <Button
                    type="ghost"
                    size="small"
                    disabled={!download}
                    onClick={() => download.cancel()}
                >
                    Cancel Download
                </Button>
            </View>
        );
    }

    download(url, videoId) {
        try {
            const download = DownloadManager.createNewDownload(
                url,
                videoId,
                `Test Download ${videoId.slice(-1)}`,
                'https://s1.dmcdn.net/czxuQ/x720-MzM.jpg'
            );
            if (_.has(download, 'downloadID')) {
                const newVideos = this.state.videos;
                _.find(newVideos, ['videoId', download.downloadID]).download = download;
                this.setState({ videos: newVideos });
                this.addEventListener(download);
                download.start();
            }
        } catch (e) {
            Alert.alert('Download Error', e);
        }
    }

    updateProgress(progress, videoId) {
        _.find(this.state.videos, ['videoId', videoId]).download.progress = progress;
        this.setState({ videos: this.state.videos });
    }

    restoreDownloads(downloadIds) {
        const downloads = DownloadManager.getDownload(downloadIds);
        if (_.isArray(downloads)) {
            _.map(downloads, download => {
                this.addEventListener(download);
                _.find(this.state.videos, ['videoId', download.downloadID]).download = download;
                this.setState({ videos: this.state.videos });
            });
        } else if (downloads) {
            const download = downloads;
            this.addEventListener(download);
            _.find(this.state.videos, ['videoId', download.downloadID]).download = download;
            this.setState({ videos: this.state.videos });
        }
    }

    addEventListener(download) {
        download.addEventListener(EVENT_LISTENER_TYPES.started, () => {
            console.warn('Download isStarted', download.state);
        });
        download.addEventListener(EVENT_LISTENER_TYPES.progress, progress =>
            this.updateProgress(progress, download.downloadID)
        );
        download.addEventListener(EVENT_LISTENER_TYPES.cancelled, () => {
            this.updateProgress(0, download.downloadID);
            _.find(this.state.videos, ['videoId', download.downloadID]).download = null;
            this.setState({ videos: this.state.videos });
        });
        download.addEventListener(EVENT_LISTENER_TYPES.deleted, () => {
            this.updateProgress(0, download.downloadID);
            _.find(this.state.videos, ['videoId', download.downloadID]).download = null;
            this.setState({ videos: this.state.videos });
        });
        download.addEventListener(EVENT_LISTENER_TYPES.error, errorData =>
            Alert.alert(errorData.errorType, errorData.errorMessage)
        );
        download.addEventListener(EVENT_LISTENER_TYPES.finished, () => {
            this.updateProgress(100, download.downloadID);
            _.find(this.state.videos, ['videoId', download.downloadID]).download = download;
            this.setState({ videos: this.state.videos });
        });
    }

    setActive(index) {
        this.setState({ activeIndex: index });
    }
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 40,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        backgroundColor: '#ddd'
    },
    buttonView: {
        width: 300,
        height: 30,
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    mediaButtonView: {
        width: 300,
        height: 30,
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    mediaPlayer: { width: 300, height: 170, backgroundColor: 'black' },
    downloadView: { alignItems: 'center' },
    tabsView: { flex: 1, marginTop: 20 }
});
