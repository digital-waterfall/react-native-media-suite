import React, {Component} from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {DownloadManager} from '../index';

import ReactNative, {
    View,
    requireNativeComponent,
    UIManager,
    NativeModules,
    findNodeHandle,
    Platform,
    StyleSheet, ViewPropTypes
} from 'react-native';

export default class MediaPlayerView extends Component {
    static defaultProps = {
        autoplay: false,
        offline: false,
        preload: 'auto',
        loop: false
    };
    constructor(props) {
        super(props);

        this.MediaPlayerView = NativeModules.MediaPlayerView;
        this.play = this.play.bind(this);
    }
    setNativeProps(nativeProps) {
        this._root.setNativeProps(nativeProps);
    }

    _assignRoot = (component) => {
        this._root = component;
    };

    componentDidMount() {
        this.mapViewHandle = findNodeHandle(this.RCTMediaPlayerView);
    }

    componentWillUnmount() {
        this.stop();
    }

    presentFullscreenPlayer = () => {
        this.setNativeProps({ fullscreen: true });
    };

    dismissFullscreenPlayer = () => {
        this.setNativeProps({ fullscreen: false });
    };

    seek = (time) => {
        this.setNativeProps({ seek: time });
    };

    _onLoadStart = (event) => {
        if (this.props.onLoadStart) {
            this.props.onLoadStart(event.nativeEvent);
        }
    };

    _onLoad = (event) => {
        if (this.props.onLoad) {
            this.props.onLoad(event.nativeEvent);
        }
    };

    _onError = (event) => {
        if (this.props.onError) {
            this.props.onError(event.nativeEvent);
        }
    };

    _onProgress = (event) => {
        if (this.props.onProgress) {
            this.props.onProgress(event.nativeEvent);
        }
    };

    _onSeek = (event) => {
        if (this.state.showPoster) {
            this.setState({showPoster: false});
        }

        if (this.props.onSeek) {
            this.props.onSeek(event.nativeEvent);
        }
    };

    _onEnd = (event) => {
        if (this.props.onEnd) {
            this.props.onEnd(event.nativeEvent);
        }
    };
    _onTimedMetadata = (event) => {
        if (this.props.onTimedMetadata) {
            this.props.onTimedMetadata(event.nativeEvent);
        }
    };

    _onFullscreenPlayerWillPresent = (event) => {
        if (this.props.onFullscreenPlayerWillPresent) {
            this.props.onFullscreenPlayerWillPresent(event.nativeEvent);
        }
    };

    _onFullscreenPlayerDidPresent = (event) => {
        if (this.props.onFullscreenPlayerDidPresent) {
            this.props.onFullscreenPlayerDidPresent(event.nativeEvent);
        }
    };

    _onFullscreenPlayerWillDismiss = (event) => {
        if (this.props.onFullscreenPlayerWillDismiss) {
            this.props.onFullscreenPlayerWillDismiss(event.nativeEvent);
        }
    };

    _onFullscreenPlayerDidDismiss = (event) => {
        if (this.props.onFullscreenPlayerDidDismiss) {
            this.props.onFullscreenPlayerDidDismiss(event.nativeEvent);
        }
    };

    _onReadyForDisplay = (event) => {
        if (this.props.onReadyForDisplay) {
            this.props.onReadyForDisplay(event.nativeEvent);
        }
    };

    _onPlaybackStalled = (event) => {
        if (this.props.onPlaybackStalled) {
            this.props.onPlaybackStalled(event.nativeEvent);
        }
    };

    _onPlaybackResume = (event) => {
        if (this.props.onPlaybackResume) {
            this.props.onPlaybackResume(event.nativeEvent);
        }
    };

    _onPlaybackRateChange = (event) => {
        if (this.state.showPoster && (event.nativeEvent.playbackRate !== 0)) {
            this.setState({showPoster: false});
        }

        if (this.props.onPlaybackRateChange) {
            this.props.onPlaybackRateChange(event.nativeEvent);
        }
    };

    _onAudioBecomingNoisy = () => {
        if (this.props.onAudioBecomingNoisy) {
            this.props.onAudioBecomingNoisy();
        }
    };

    _onAudioFocusChanged = (event) => {
        if (this.props.onAudioFocusChanged) {
            this.props.onAudioFocusChanged(event.nativeEvent);
        }
    };

    _onBuffer = (event) => {
        if (this.props.onBuffer) {
            this.props.onBuffer(event.nativeEvent);
        }
    };

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
                    onPlayerPlaying={this._onPlayerPlaying.bind(this)}
                    onPlayerProgress={this._onPlayerProgress.bind(this)}
                    onPlayerPaused={this._onPlayerPaused.bind(this)}
                    onPlayerBuffering={this._onPlayerBuffering.bind(this)}
                    onPlayerBufferOK={this._onPlayerBufferOK.bind(this)}
                    onPlayerFinished={this._onPlayerFinished.bind(this)}
                    onPlayerBufferChange={this._onPlayerBufferChange.bind(this)}
                    onPlaybackError={this._onPlaybackError.bind(this)}/>
            );
        } else {
            const  downloads = DownloadManager.getDownload(this.props.src);
            const remoteUrl = _.get(downloads,'remoteURL',this.props.src);
            return(
                <RCTMediaPlayerView
                    src={{uri:remoteUrl}}
                    paused={this.props.paused}
                    ref={this._assignRoot}
                    onVideoLoadStart={ this._onLoadStart.bind(this)}
                    onVideoLoad={ this._onLoad.bind(this)}
                    onVideoError={this._onError.bind(this)}
                    onVideoProgress={ this._onProgress.bind(this)}
                    onVideoSeek={ this._onSeek.bind(this)}
                    onVideoEnd={ this._onEnd.bind(this)}
                    onVideoBuffer={ this._onBuffer.bind(this)}
                    onTimedMetadata={ this._onTimedMetadata.bind(this)}
                    onVideoFullscreenPlayerWillPresent={ this._onFullscreenPlayerWillPresent.bind(this)}
                    onVideoFullscreenPlayerDidPresent={ this._onFullscreenPlayerDidPresent}
                    onVideoFullscreenPlayerWillDismiss={ this._onFullscreenPlayerWillDismiss.bind(this)}
                    onVideoFullscreenPlayerDidDismiss={ this._onFullscreenPlayerDidDismiss.bind(this)}
                    onReadyForDisplay={ this._onReadyForDisplay.bind(this)}
                    onPlaybackStalled={ this._onPlaybackStalled.bind(this)}
                    onPlaybackResume={ this._onPlaybackResume.bind(this)}
                    onPlaybackRateChange={ this._onPlaybackRateChange.bind(this)}
                    onAudioFocusChanged={ this._onAudioFocusChanged.bind(this)}
                    onAudioBecomingNoisy={ this._onAudioBecomingNoisy.bind(this)}
                    style={styles.backgroundVideo}
                />
            );
        }
    }


    _onLayout(e) {
        const {width, height} = e.nativeEvent.layout;
        this.setState({width, height});

        this.props.onLayout && this.props.onLayout(e);
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

    seekTo(timeMs) {
        if(Platform.OS === "ios") {
            let args = [timeMs];
            UIManager.dispatchViewManagerCommand(
                this.RCTMediaPlayerView._nativeTag,
                UIManager.RCTMediaPlayerView.Commands.seekTo,
                args
            );
        }
    }

    _onPlayerBuffering() {
        this.props.onPlayerBuffering && this.props.onPlayerBuffering();

        if (this.props.controls) {
            this.setState({
                buffering: true
            });
        }
    }

    _onPlayerBufferChange(e) {
        this.props.onPlayerBuffering && this.props.onPlayerBuffering(e);

        if (this.props.controls) {
            this.setState({
                bufferRanges: e.nativeEvent.ranges
            });
        }
    }

    _onPlayerBufferOK() {
        this.props.onPlayerBufferOK && this.props.onPlayerBufferOK();

        if (this.props.controls) {
            this.setState({
                buffering: false
            });
        }
    }

    _onPlayerPlaying() {
        this.props.onPlayerPlaying && this.props.onPlayerPlaying();

        if (this.props.controls) {
            this.setState({
                buffering: false,
                playing: true
            });
        }
    }

    _onPlayerPaused() {
        this.props.onPlayerPaused && this.props.onPlayerPaused();

        if (this.props.controls) {
            this.setState({
                playing: false
            });
        }
    }

    _onPlayerFinished() {
        this.props.onPlayerFinished && this.props.onPlayerFinished();

        if (this.props.controls) {
            this.setState({
                playing: false,
                buffering: false
            });
        }
    }

    _onPlayerProgress(event) {
        let current = event.nativeEvent.current; //in ms
        let duration = event.nativeEvent.duration; //in ms

        this.props.onPlayerProgress && this.props.onPlayerProgress(current, duration);
    }

    _onPlaybackError(event) {
        const error = event.nativeEvent.error;
        console.log(error);
        this.props.onPlaybackError && this.props.onPlaybackError(error);
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

    /* Native only */
    seek: PropTypes.number,
    fullscreen: PropTypes.bool,
    onVideoLoadStart: PropTypes.func,
    onVideoLoad: PropTypes.func,
    onVideoBuffer: PropTypes.func,
    onVideoError: PropTypes.func,
    onVideoProgress: PropTypes.func,
    onVideoSeek: PropTypes.func,
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

MediaPlayerView.defaultProps = {
    rate:1,
    seek:0,
    paused:false
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
