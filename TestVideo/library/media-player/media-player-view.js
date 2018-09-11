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
        this.play = this.play.bind(this);
        this.seekTo = this.seekTo.bind(this);
        this.onSeek = this.onSeek.bind(this);
        this.onLoadStart = this.onLoadStart.bind(this);
        this.onLoad = this.onLoad.bind(this);
        this.onError = this.onError.bind(this);
        this.onProgress = this.onProgress.bind(this);
        this.onBuffer = this.onBuffer.bind(this);
        this.onBufferChange = this.onBufferChange.bind(this);
        this.onBufferOk = this.onBufferOk.bind(this);
        this.onEnd = this.onEnd.bind(this);
        this.onPlay = this.onPlay.bind(this);
        this.onPause = this.onPause.bind(this);
        this.onTimedMetadata = this.onTimedMetadata.bind(this);
        this.onFullscreenPlayerWillPresent = this.onFullscreenPlayerWillPresent.bind(this);
        this.onFullscreenPlayerDidPresent = this.onFullscreenPlayerDidPresent.bind(this);
        this.onFullscreenPlayerWillDismiss = this.onFullscreenPlayerWillDismiss.bind(this);
        this.onFullscreenPlayerDidDismiss = this.onFullscreenPlayerDidDismiss.bind(this);
        this.onReadyForDisplay = this.onReadyForDisplay.bind(this);
        this.onPlaybackStalled = this.onPlaybackStalled.bind(this);
        this.onPlaybackResume = this.onPlaybackResume.bind(this);
        this.onPlaybackRateChange = this.onPlaybackRateChange.bind(this);
        this.onAudioBecomingNoisy = this.onAudioBecomingNoisy.bind(this);
        this.onAudioFocusChanged = this.onAudioFocusChanged.bind(this);
        this.onLayout = this.onLayout.bind(this);
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
                onLayout={this._onLayout.bind(this)}>
                {this.renderPlayer()}
            </View>
        );
    }

    renderPlayer(){
        if(Platform.OS === "ios"){
            return(
                <RCTMediaPlayerView
                    {...this.props}
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
            const  downloads = DownloadManager.getDownload(this.props.src);
            const remoteUrl = _.get(downloads,'remoteURL',this.props.src);
            return(
                <RCTMediaPlayerView
                    src={{uri:remoteUrl}}
                    paused={this.props.paused}
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
                    onPlaybackStalled={this.onPlaybackStalled}
                    onPlaybackResume={this.onPlaybackResume}
                    onPlaybackRateChange={this.onPlaybackRateChange}
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

    presentFullscreenPlayer() {
        this.setNativeProps({ fullscreen: true });
    };

    dismissFullscreenPlayer = () => {
        this.setNativeProps({ fullscreen: false });
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

    onSeek(event) {
        this.props.onSeek && this.props.onSeek(event.nativeEvent);
    };

    onLoadStart(event) {
        this.props.onLoadStart && this.props.onLoadStart(event.nativeEvent);
    };

    onLoad(event) {
        this.props.onLoad && this.props.onLoad(event.nativeEvent);
    };

    onError(event) {
        const error = event.nativeEvent.error;
        console.warn(error);
        this.props.onPlaybackError && this.props.onPlaybackError(error);
    };

    onProgress(event) {
        let current = event.nativeEvent.current; //in ms
        let duration = event.nativeEvent.duration; //in ms

        this.props.onPlayerProgress && this.props.onPlayerProgress(current, duration);
    };

    onEnd(event) {
        this.props.onPlayerFinished && this.props.onPlayerFinished(event.nativeEvent);

        if (this.props.controls) {
            this.setState({
                playing: false,
                buffering: false
            });
        }
    };

    onTimedMetadata(event) {
        this.props.onTimedMetadata && this.props.onTimedMetadata(event.nativeEvent);
    };

    onFullscreenPlayerWillPresent(event) {
        this.props.onFullscreenPlayerWillPresent && this.props.onFullscreenPlayerWillPresent(event.nativeEvent);
    };

    onFullscreenPlayerDidPresent(event) {
        this.props.onFullscreenPlayerDidPresent && this.props.onFullscreenPlayerDidPresent(event.nativeEvent);
    };

    onFullscreenPlayerWillDismiss(event) {
        this.props.onFullscreenPlayerWillDismiss && this.props.onFullscreenPlayerWillDismiss(event.nativeEvent);
    };

    onFullscreenPlayerDidDismiss(event) {
        this.props.onFullscreenPlayerDidDismiss && this.props.onFullscreenPlayerDidDismiss(event.nativeEvent);
    };

    onReadyForDisplay(event) {
        this.props.onReadyForDisplay && this.props.onReadyForDisplay(event.nativeEvent);
    };

    onPlaybackStalled(event) {
        this.props.onPlaybackStalled && this.props.onPlaybackStalled(event.nativeEvent);
    };

    onPlaybackResume(event) {
        this.props.onPlaybackResume && this.props.onPlaybackResume(event.nativeEvent);
    };

    onPlaybackRateChange(event) {
        this.props.onPlaybackRateChange && this.props.onPlaybackRateChange(event.nativeEvent);
    };

    onAudioBecomingNoisy() {
        this.props.onAudioBecomingNoisy && this.props.onAudioBecomingNoisy();
    };

    onAudioFocusChanged(event) {
        this.props.onAudioFocusChanged && this.props.onAudioFocusChanged(event.nativeEvent);
    };

    onBuffer(event) {
        this.props.onPlayerBuffering && this.props.onPlayerBuffering(event.nativeEvent);
        if (this.props.onBuffer) {
            this.props.onBuffer();
        }

        if (this.props.controls) {
            this.setState({
                buffering: true
            });
        }
    };

    onBufferChange(event) {
        this.props.onPlayerBuffering && this.props.onPlayerBuffering(event.nativeEvent);

        if (this.props.controls) {
            this.setState({
                bufferRanges: event.nativeEvent.ranges
            });
        }
    }

    onLayout(event) {
        const {width, height} = event.nativeEvent.layout;
        this.setState({width, height});

        this.props.onLayout && this.props.onLayout(event.nativeEvent);
    }

    pause() {
        if(Platform.OS === "ios") {
            UIManager.dispatchViewManagerCommand(
                this.RCTMediaPlayerView._nativeTag,
                UIManager.RCTMediaPlayerView.Commands.pause,
                null
            );
        }
    }

    play() {
        if(Platform.OS === "ios") {
            UIManager.dispatchViewManagerCommand(
                this.RCTMediaPlayerView._nativeTag,
                UIManager.RCTMediaPlayerView.Commands.play,
                null
            );
        }
    }

    stop() {
        if(Platform.OS === "ios") {
            UIManager.dispatchViewManagerCommand(
                this.RCTMediaPlayerView._nativeTag,
                UIManager.RCTMediaPlayerView.Commands.stop,
                null
            );
        }
    }

    onBufferOk() {
        this.props.onPlayerBufferOK && this.props.onPlayerBufferOK();

        if (this.props.controls) {
            this.setState({
                buffering: false
            });
        }
    }

    onPlay() {
        this.props.onPlayerPlaying && this.props.onPlayerPlaying();

        if (this.props.controls) {
            this.setState({
                buffering: false,
                playing: true
            });
        }
    }

    onPause() {
        this.props.onPlayerPaused && this.props.onPlayerPaused();

        if (this.props.controls) {
            this.setState({
                playing: false
            });
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
    nativeID: PropTypes.string,
    textTracks: PropTypes.array,
    accessibilityComponentType: PropTypes.string,
    onLayout: PropTypes.bool,
    accessibilityLiveRegion: PropTypes.string,
    disableFocus: PropTypes.bool,
    importantForAccessibility: PropTypes.string,
    testID: PropTypes.string,
    accessibilityLabel: PropTypes.string,
    volume: PropTypes.number,
    fullscreen: PropTypes.bool,
    playInBackground: PropTypes.bool,
    paused: PropTypes.bool,
    useTextureView: PropTypes.bool,
    progressUpdateInterval: PropTypes.number,
    selectedTextTrack: PropTypes.any,

    onBuffer: PropTypes.func,
    onError: PropTypes.func,
    onEnd: PropTypes.func,
    onProgress: PropTypes.func,
    onSeek: PropTypes.func,
    controls: PropTypes.bool,
    onLoad: PropTypes.func,
    onFullscreenPlayerWillPresent: PropTypes.func,
    onFullscreenPlayerDidPresent: PropTypes.func,
    onFullscreenPlayerWillDismiss: PropTypes.func,
    onFullscreenPlayerDidDismiss: PropTypes.func,
    currentTime: PropTypes.number,

    onPlayerPaused: PropTypes.func,
    onPlayerPlaying: PropTypes.func,
    onPlayerFinished: PropTypes.func,
    onPlayerBuffering: PropTypes.func,
    onPlayerBufferOK: PropTypes.func,
    onPlayerProgress: PropTypes.func,
    onPlayerBufferChange: PropTypes.func,
    onPlaybackError: PropTypes.func,

    onReadyForDisplay: PropTypes.func,
    onPlaybackStalled: PropTypes.func,
    onPlaybackResume: PropTypes.func,
    onPlaybackRateChange: PropTypes.func,
    onAudioFocusChanged: PropTypes.func,
    onAudioBecomingNoisy: PropTypes.func,

    onVideoLoadStart: PropTypes.func,
    onVideoLoad: PropTypes.func,
    onVideoBuffer: PropTypes.func,
    onVideoError: PropTypes.func,
    onVideoProgress: PropTypes.func,
    onVideoEnd: PropTypes.func,
    onTimedMetadata: PropTypes.func,
    onVideoFullscreenPlayerWillPresent: PropTypes.func,
    onVideoFullscreenPlayerDidPresent: PropTypes.func,
    onVideoFullscreenPlayerWillDismiss: PropTypes.func,
    onVideoFullscreenPlayerDidDismiss: PropTypes.func,


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
