import React, {Component} from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import ReactNative, {
    View,
    requireNativeComponent,
    UIManager,
    NativeModules,
    findNodeHandle,
    Platform,
    StyleSheet, ViewPropTypes
} from 'react-native';

import {DownloadManager} from '../index';

export default class MediaPlayerView extends Component {
    static defaultProps = {
        autoplay: false,
        offline: false,
        preload: 'auto',
        loop: false,
        rate: 1,
        seek: 0,
        paused: false
    };

    constructor(props) {
        super(props);

        this.MediaPlayerView = NativeModules.MediaPlayerView;
        this.assignRoot = this.assignRoot.bind(this);

        this.onAudioBecomingNoisy = this.onAudioBecomingNoisy.bind(this);
        this.onAudioFocusChanged = this.onAudioFocusChanged.bind(this);
        this.onBuffer = this.onBuffer.bind(this);
        this.onBufferChange = this.onBufferChange.bind(this);
        this.onBufferOk = this.onBufferOk.bind(this);
        this.onEnd = this.onEnd.bind(this);
        this.onError = this.onError.bind(this);
        this.onFullscreenPlayerDidDismiss = this.onFullscreenPlayerDidDismiss.bind(this);
        this.onFullscreenPlayerDidPresent = this.onFullscreenPlayerDidPresent.bind(this);
        this.onFullscreenPlayerWillDismiss = this.onFullscreenPlayerWillDismiss.bind(this);
        this.onFullscreenPlayerWillPresent = this.onFullscreenPlayerWillPresent.bind(this);
        this.onLayout = this.onLayout.bind(this);
        this.onLoad = this.onLoad.bind(this);
        this.onLoadStart = this.onLoadStart.bind(this);
        this.onProgress = this.onProgress.bind(this);
        this.onPause = this.onPause.bind(this);
        this.onPlay = this.onPlay.bind(this);
        this.onRateChange = this.onRateChange.bind(this);
        this.onReadyForDisplay = this.onReadyForDisplay.bind(this);
        this.onSeek = this.onSeek.bind(this);
        this.onTimedMetadata = this.onTimedMetadata.bind(this);

        this.dismissFullscreenPlayer = this.dismissFullscreenPlayer.bind(this);
        this.pause = this.pause.bind(this);
        this.play = this.play.bind(this);
        this.presentFullscreenPlayer = this.presentFullscreenPlayer.bind(this);
        this.seekTo = this.seekTo.bind(this);
        this.stop = this.stop.bind(this);
    }

    componentDidMount() {
        this.mapViewHandle = findNodeHandle(this.RCTMediaPlayerView);
    }

    componentWillUnmount() {
        this.stop();
    }

    render() {
        return (
            <View
                style={this.props.style}
                onLayout={this.onLayout}>
                {this.renderPlayer()}
            </View>
        );
    }

    renderPlayer(){
        if(Platform.OS === "ios") {
            const { autoplay, src, offline, preload, loop, muted, ignoreSilentSwitch } = this.props;
            return(
                <RCTMediaPlayerView
                    autoplay={autoplay}
                    src={src}
                    offline={offline}
                    preload={preload}
                    loop={loop}
                    muted={muted}
                    ignoreSilentSwitch={ignoreSilentSwitch}
                    ref={(RCTMediaPlayerView) => this.RCTMediaPlayerView = RCTMediaPlayerView}
                    style={{flex: 1, alignSelf: 'stretch'}}
                    onPlayerPlaying={this.onPlay}
                    onPlayerProgress={this.onProgress}
                    onPlayerPaused={this.onPause}
                    onPlayerBuffering={this.onBuffer}
                    onPlayerBufferOK={this.onBufferOk}
                    onPlayerFinished={this.onEnd}
                    onPlayerBufferChange={this.onBufferChange}
                    onPlaybackError={this.onError}
                />
            );
        } else {
            const  download = DownloadManager.getDownload(this.props.src);
            const remoteUrl = _.get(download,'remoteURL',this.props.src);
            const { paused } = this.state;
            return(
                <RCTMediaPlayerView
                    src={{uri:remoteUrl}}
                    paused={paused}
                    ref={this.assignRoot}
                    onVideoLoadStart={this.onLoadStart}
                    onVideoLoad={this.onLoad}
                    onVideoError={this.onError}
                    onVideoProgress={ this.onProgress}
                    onVideoSeek={this.onSeek}
                    onVideoEnd={this.onEnd}
                    onVideoBuffer={this.onBuffer}
                    onTimedMetadata={this.onTimedMetadata}
                    onVideoFullscreenPlayerWillPresent={this.onFullscreenPlayerWillPresent}
                    onVideoFullscreenPlayerDidPresent={this.onFullscreenPlayerDidPresent}
                    onVideoFullscreenPlayerWillDismiss={this.onFullscreenPlayerWillDismiss}
                    onVideoFullscreenPlayerDidDismiss={this.onFullscreenPlayerDidDismiss}
                    onReadyForDisplay={this.onReadyForDisplay}
                    onPlaybackStalled={this.onPause}
                    onPlaybackResume={this.onPlay}
                    onPlaybackRateChange={this.onRateChange}
                    onAudioFocusChanged={this.onAudioFocusChanged}
                    onAudioBecomingNoisy={this.onAudioBecomingNoisy}
                    style={styles.backgroundVideo}
                />
            );
        }
    }

    setNativeProps(nativeProps) {
        this.root.setNativeProps(nativeProps);
    }

    assignRoot(component) {
        this.root = component;
    };

    onAudioBecomingNoisy() {
        this.props.onAudioBecomingNoisy && this.props.onAudioBecomingNoisy();
    };

    onAudioFocusChanged(event) {
        this.props.onAudioFocusChanged && this.props.onAudioFocusChanged(event.nativeEvent);
    };

    onBuffer(event) {
        this.props.onBuffer && this.props.onBuffer(event.nativeEvent);
    };

    onBufferChange(event) {
        this.props.onBufferChange && this.props.onBufferChange(event.nativeEvent);
    }

    onBufferOk() {
        this.props.onBufferOk && this.props.onBufferOk();
    }

    onEnd(event) {
        this.props.onEnd && this.props.onEnd(event.nativeEvent);
    };

    onError(event) {
        const error = event.nativeEvent.error;
        console.warn(error);
        this.props.onError && this.props.onError(error);
    };

    onFullscreenPlayerDidDismiss(event) {
        this.props.onFullscreenPlayerDidDismiss && this.props.onFullscreenPlayerDidDismiss(event.nativeEvent);
    };

    onFullscreenPlayerDidPresent(event) {
        this.props.onFullscreenPlayerDidPresent && this.props.onFullscreenPlayerDidPresent(event.nativeEvent);
    };

    onFullscreenPlayerWillDismiss(event) {
        this.props.onFullscreenPlayerWillDismiss && this.props.onFullscreenPlayerWillDismiss(event.nativeEvent);
    };

    onFullscreenPlayerWillPresent(event) {
        this.props.onFullscreenPlayerWillPresent && this.props.onFullscreenPlayerWillPresent(event.nativeEvent);
    };

    onLayout(event) {
        const {width, height} = event.nativeEvent.layout;
        this.setState({width, height});

        this.props.onLayout && this.props.onLayout(event.nativeEvent);
    }

    onLoad(event) {
        this.props.onLoad && this.props.onLoad(event.nativeEvent);
    };

    onLoadStart(event) {
        this.props.onLoadStart && this.props.onLoadStart(event.nativeEvent);
    };

    onProgress(event) {
        let current = event.nativeEvent.current; //in ms
        let duration = event.nativeEvent.duration; //in ms

        this.props.onProgress && this.props.onProgress(current, duration);
    };

    onPause() {
        this.props.onPause && this.props.onPause();
    }

    onPlay() {
        this.props.onPlay && this.props.onPlay();
    }

    onRateChange(event) {
        this.props.onRateChange && this.props.onRateChange(event.nativeEvent);
    };

    onReadyForDisplay(event) {
        this.props.onReadyForDisplay && this.props.onReadyForDisplay(event.nativeEvent);
    };

    onSeek(event) {
        this.props.onSeek && this.props.onSeek(event.nativeEvent);
    };

    onTimedMetadata(event) {
        this.props.onTimedMetadata && this.props.onTimedMetadata(event.nativeEvent);
    };

    dismissFullscreenPlayer() {
        this.setNativeProps({ fullscreen: false });
    };

    pause() {
        if (Platform.OS === "ios") {
            UIManager.dispatchViewManagerCommand(
                this.RCTMediaPlayerView._nativeTag,
                UIManager.RCTMediaPlayerView.Commands.pause,
                null
            );
        } else {
            this.setState({paused:true});
        }
    }

    play() {
        if (Platform.OS === "ios") {
            UIManager.dispatchViewManagerCommand(
                this.RCTMediaPlayerView._nativeTag,
                UIManager.RCTMediaPlayerView.Commands.play,
                null
            );
        } else {
            this.setState({paused:false});
        }
    }

    presentFullscreenPlayer() {
        this.setNativeProps({ fullscreen: true });
    };

    seekTo(timeMs) {
        if (Platform.OS === "ios") {
            let args = [timeMs];
            UIManager.dispatchViewManagerCommand(
                this.RCTMediaPlayerView._nativeTag,
                UIManager.RCTMediaPlayerView.Commands.seekTo,
                args
            );
        } else {
            this.setNativeProps({ seek: timeMs });
        }
    }

    stop() {
        if (Platform.OS === "ios") {
            UIManager.dispatchViewManagerCommand(
                this.RCTMediaPlayerView._nativeTag,
                UIManager.RCTMediaPlayerView.Commands.stop,
                null
            );
        } else {
            this.setState({ paused: true });
            this.setNativeProps({ seek: 0});
        }
    }
}

MediaPlayerView.propTypes = {
    resizeMode: PropTypes.number,
    src: PropTypes.string,
    offline: PropTypes.bool,
    autoplay: PropTypes.bool,
    preload: PropTypes.string,
    loop: PropTypes.bool,
    muted: PropTypes.bool,
    ignoreSilentSwitch: PropTypes.oneOf(['ignore', 'obey']),
    repeat: PropTypes.bool,
    rate: PropTypes.number,
    seek: PropTypes.number,
    renderToHardwareTextureAndroid: PropTypes.bool,
    textTracks: PropTypes.array,
    accessibilityComponentType: PropTypes.string,
    accessibilityLiveRegion: PropTypes.string,
    disableFocus: PropTypes.bool,
    importantForAccessibility: PropTypes.string,
    accessibilityLabel: PropTypes.string,
    volume: PropTypes.number,
    fullscreen: PropTypes.bool,
    playInBackground: PropTypes.bool,
    useTextureView: PropTypes.bool,
    progressUpdateInterval: PropTypes.number,
    currentTime: PropTypes.number,

    selectedTextTrack: PropTypes.any,
    onBuffer: PropTypes.func,
    onBufferChange: PropTypes.func,
    onBuffering: PropTypes.func,
    onBufferOk: PropTypes.func,
    onError: PropTypes.func,
    onEnd: PropTypes.func,
    onFullscreenPlayerDidDismiss: PropTypes.func,
    onFullscreenPlayerDidPresent: PropTypes.func,
    onFullscreenPlayerWillDismiss: PropTypes.func,
    onFullscreenPlayerWillPresent: PropTypes.func,
    onLayout: PropTypes.func,
    onLoad: PropTypes.func,
    onLoadStart: PropTypes.func,
    onProgress: PropTypes.func,
    onPause: PropTypes.func,
    onPlay: PropTypes.func,
    onRateChange: PropTypes.func,
    onReadyForDisplay: PropTypes.func,
    onSeek: PropTypes.func,
    onTimedMetadata: PropTypes.func,

    /* Required by react-native */
    scaleX: PropTypes.number,
    scaleY: PropTypes.number,
    translateX: PropTypes.number,
    translateY: PropTypes.number,
    rotation: PropTypes.number,
    ...ViewPropTypes
};

let styles = StyleSheet.create({
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
});

const RCTMediaPlayerView = requireNativeComponent('RCTMediaPlayerView', MediaPlayerView,{
    nativeOnly: {
        src: true,
        seek: true,
        fullscreen: true,
    },
});
