import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import {
    View,
    requireNativeComponent,
    UIManager,
    NativeModules,
    findNodeHandle,
    Platform,
    StyleSheet,
    ViewPropTypes
} from 'react-native';

import { DownloadManager } from '../index';

export default class MediaPlayerView extends Component {
    static defaultProps = {
        autoplay: false,
        preload: 'auto',
        loop: false,
        rate: 1,
        seek: 0,
        paused: false
    };

    constructor(props) {
        super(props);

        this.state = {
            paused: false
        };

        this.MediaPlayerView = NativeModules.MediaPlayerView;
        this.setReference = this.setReference.bind(this);

        this.onPlayerAudioBecomingNoisy = this.onPlayerAudioBecomingNoisy.bind(this);
        this.onPlayerAudioFocusChanged = this.onPlayerAudioFocusChanged.bind(this);
        this.onPlayerBuffer = this.onPlayerBuffer.bind(this);
        this.onPlayerBufferChange = this.onPlayerBufferChange.bind(this);
        this.onPlayerBufferOk = this.onPlayerBufferOk.bind(this);
        this.onPlayerEnd = this.onPlayerEnd.bind(this);
        this.onPlayerError = this.onPlayerError.bind(this);
        this.onFullscreenPlayerDidDismiss = this.onFullscreenPlayerDidDismiss.bind(this);
        this.onFullscreenPlayerDidPresent = this.onFullscreenPlayerDidPresent.bind(this);
        this.onFullscreenPlayerWillDismiss = this.onFullscreenPlayerWillDismiss.bind(this);
        this.onFullscreenPlayerWillPresent = this.onFullscreenPlayerWillPresent.bind(this);
        this.onPlayerLayout = this.onPlayerLayout.bind(this);
        this.onPlayerLoad = this.onPlayerLoad.bind(this);
        this.onPlayerLoadStart = this.onPlayerLoadStart.bind(this);
        this.onPlayerProgress = this.onPlayerProgress.bind(this);
        this.onPlayerPause = this.onPlayerPause.bind(this);
        this.onPlayerPlay = this.onPlayerPlay.bind(this);
        this.onPlayerRateChange = this.onPlayerRateChange.bind(this);
        this.onPlayerReadyForDisplay = this.onPlayerReadyForDisplay.bind(this);
        this.onPlayerSeek = this.onPlayerSeek.bind(this);
        this.onPlayerTimedMetadata = this.onPlayerTimedMetadata.bind(this);

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
            <View style={this.props.style} onLayout={this.onLayout}>
                {this.renderPlayer()}
            </View>
        );
    }

    renderPlayer() {
        if (Platform.OS === 'ios') {
            const { autoplay, src, preload, loop, muted, ignoreSilentSwitch } = this.props;
            return (
                <RCTMediaPlayerView
                    ref={this.setReference}
                    autoplay={autoplay}
                    src={src}
                    preload={preload}
                    loop={loop}
                    muted={muted}
                    ignoreSilentSwitch={ignoreSilentSwitch}
                    onPlayerPlaying={this.onPlayerPlay}
                    onPlayerProgress={this.onPlayerProgress}
                    onPlayerPaused={this.onPlayerPause}
                    onPlayerBuffering={this.onPlayerBuffer}
                    onPlayerBufferOk={this.onPlayerBufferOk}
                    onPlayerFinished={this.onPlayerEnd}
                    onPlayerBufferChange={this.onPlayerBufferChange}
                    onPlayerError={this.onPlayerError}
                    onPlayerLoadStart={this.onPlayerLoadStart}
                    onPlayerLoad={this.onPlayerLoad}
                    style={styles.backgroundVideoIos}
                />
            );
        } else {
            const { autoplay, src } = this.props;
            const download = DownloadManager.getDownload(src);
            const remoteUrl = _.get(download, 'remoteURL', src);
            let { paused } = this.state;

            if (paused === null && !autoplay) {
                paused = true;
            } else if (autoplay) {
                paused = false;
            }

            return (
                <RCTMediaPlayerView
                    src={{ uri: remoteUrl }}
                    paused={paused}
                    ref={this.setReference}
                    onVideoLoadStart={this.onPlayerLoadStart}
                    onVideoLoad={this.onPlayerLoad}
                    onVideoError={this.onPlayerError}
                    onVideoProgress={this.onPlayerProgress}
                    onVideoSeek={this.onPlayerSeek}
                    onVideoEnd={this.onPlayerEnd}
                    onVideoBuffer={this.onPlayerBuffer}
                    onVideoBufferChange={this.onPlayerBufferChange}
                    onTimedMetadata={this.onPlayerTimedMetadata}
                    onVideoFullscreenPlayerWillPresent={this.onFullscreenPlayerWillPresent}
                    onVideoFullscreenPlayerDidPresent={this.onFullscreenPlayerDidPresent}
                    onVideoFullscreenPlayerWillDismiss={this.onFullscreenPlayerWillDismiss}
                    onVideoFullscreenPlayerDidDismiss={this.onFullscreenPlayerDidDismiss}
                    onReadyForDisplay={this.onPlayerReadyForDisplay}
                    onPlaybackStalled={this.onPlayerPause}
                    onPlaybackResume={this.onPlayerPlay}
                    onPlaybackRateChange={this.onPlayerRateChange}
                    onAudioFocusChanged={this.onPlayerAudioFocusChanged}
                    onAudioBecomingNoisy={this.onPlayerAudioBecomingNoisy}
                    style={styles.backgroundVideoAndroid}
                />
            );
        }
    }

    setNativeProps(nativeProps) {
        this.root.setNativeProps(nativeProps);
    }

    setReference(component) {
        if (Platform.OS === 'ios') {
            this.RCTMediaPlayerView = RCTMediaPlayerView;
        } else {
            this.root = component;
        }
    }

    onPlayerAudioBecomingNoisy() {
        this.props.onPlayerAudioBecomingNoisy && this.props.onPlayerAudioBecomingNoisy();
    }

    onPlayerAudioFocusChanged(event) {
        this.props.onPlayerAudioFocusChanged &&
            this.props.onPlayerAudioFocusChanged(event.nativeEvent);
    }

    onPlayerBuffer(event) {
        this.props.onPlayerBuffer && this.props.onPlayerBuffer(event.nativeEvent);
    }

    onPlayerBufferChange(event) {
        this.props.onPlayerBufferChange &&
            this.props.onPlayerBufferChange(event.nativeEvent.bufferDuration);
    }

    onPlayerBufferOk() {
        this.props.onPlayerBufferOk && this.props.onPlayerBufferOk();
    }

    onPlayerEnd(event) {
        this.props.onPlayerEnd && this.props.onPlayerEnd(event.nativeEvent);
    }

    onPlayerError(event) {
        const error = event.nativeEvent.error;
        console.warn(error);
        this.props.onPlayerError && this.props.onPlayerError(error);
    }

    onFullscreenPlayerDidDismiss(event) {
        this.props.onFullscreenPlayerDidDismiss &&
            this.props.onFullscreenPlayerDidDismiss(event.nativeEvent);
    }

    onFullscreenPlayerDidPresent(event) {
        this.props.onFullscreenPlayerDidPresent &&
            this.props.onFullscreenPlayerDidPresent(event.nativeEvent);
    }

    onFullscreenPlayerWillDismiss(event) {
        this.props.onFullscreenPlayerWillDismiss &&
            this.props.onFullscreenPlayerWillDismiss(event.nativeEvent);
    }

    onFullscreenPlayerWillPresent(event) {
        this.props.onFullscreenPlayerWillPresent &&
            this.props.onFullscreenPlayerWillPresent(event.nativeEvent);
    }

    onPlayerLayout(event) {
        const { width, height } = event.nativeEvent.layout;
        this.setState({ width, height });

        this.props.onPlayerLayout && this.props.onPlayerLayout(event.nativeEvent);
    }

    onPlayerLoad(event) {
        this.props.onPlayerLoad && this.props.onPlayerLoad(event.nativeEvent.duration);
    }

    onPlayerLoadStart() {
        this.props.onPlayerLoadStart && this.props.onPlayerLoadStart();
    }

    onPlayerProgress(event) {
        let current;
        let duration;
        if (Platform.OS === 'ios') {
            current = event.nativeEvent.current; //in ms
            duration = event.nativeEvent.duration; //in ms
        } else {
            current = event.nativeEvent.currentTime;
            duration = event.nativeEvent.seekableDuration;
        }

        this.props.onPlayerProgress && this.props.onPlayerProgress(current, duration);
    }

    onPlayerPause() {
        this.props.onPlayerPause && this.props.onPlayerPause();
    }

    onPlayerPlay() {
        this.props.onPlayerPlay && this.props.onPlayerPlay();
    }

    onPlayerRateChange(event) {
        this.props.onPlayerRateChange && this.props.onPlayerRateChange(event.nativeEvent);
    }

    onPlayerReadyForDisplay(event) {
        this.props.onPlayerReadyForDisplay && this.props.onPlayerReadyForDisplay(event.nativeEvent);
    }

    onPlayerSeek(event) {
        this.props.onPlayerSeek && this.props.onPlayerSeek(event.nativeEvent);
    }

    onPlayerTimedMetadata(event) {
        this.props.onPlayerTimedMetadata && this.props.onPlayerTimedMetadata(event.nativeEvent);
    }

    dismissFullscreenPlayer() {
        this.setNativeProps({ fullscreen: false });
    }

    pause() {
        if (Platform.OS === 'ios') {
            UIManager.dispatchViewManagerCommand(
                this.RCTMediaPlayerView._nativeTag,
                UIManager.RCTMediaPlayerView.Commands.pause,
                null
            );
        } else {
            this.setNativeProps({ paused: true });
        }
    }

    play() {
        if (Platform.OS === 'ios') {
            UIManager.dispatchViewManagerCommand(
                this.RCTMediaPlayerView._nativeTag,
                UIManager.RCTMediaPlayerView.Commands.play,
                null
            );
        } else {
            this.setNativeProps({ paused: false });
        }
    }

    presentFullscreenPlayer() {
        this.setNativeProps({ fullscreen: true });
    }

    seekTo(timeMs) {
        if (Platform.OS === 'ios') {
            let args = [timeMs];
            UIManager.dispatchViewManagerCommand(
                this.RCTMediaPlayerView._nativeTag,
                UIManager.RCTMediaPlayerView.Commands.seekTo,
                args
            );
        } else {
            this.setNativeProps({ seek: timeMs / 1000 });
        }
    }

    stop() {
        if (Platform.OS === 'ios') {
            UIManager.dispatchViewManagerCommand(
                this.RCTMediaPlayerView._nativeTag,
                UIManager.RCTMediaPlayerView.Commands.stop,
                null
            );
        } else {
            this.setNativeProps({ paused: true });
            this.setNativeProps({ seek: 0 });
        }
    }
}

MediaPlayerView.propTypes = {
    resizeMode: PropTypes.number,
    src: PropTypes.string,
    autoplay: PropTypes.bool,
    preload: PropTypes.string,
    loop: PropTypes.bool,
    muted: PropTypes.bool,
    ignoreSilentSwitch: PropTypes.bool,
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
    paused: PropTypes.bool,

    onAudioBecomingNoisy: PropTypes.func,
    onAudioFocusChanged: PropTypes.func,
    onPlayerBuffer: PropTypes.func,
    onPlayerBufferChange: PropTypes.func,
    onPlayerBuffering: PropTypes.func,
    onPlayerBufferOk: PropTypes.func,
    onPlayerError: PropTypes.func,
    onPlayerEnd: PropTypes.func,
    onFullscreenPlayerDidDismiss: PropTypes.func,
    onFullscreenPlayerDidPresent: PropTypes.func,
    onFullscreenPlayerWillDismiss: PropTypes.func,
    onFullscreenPlayerWillPresent: PropTypes.func,
    onPlayerLayout: PropTypes.func,
    onPlayerLoad: PropTypes.func,
    onPlayerLoadStart: PropTypes.func,
    onPlayerProgress: PropTypes.func,
    onPlayerPause: PropTypes.func,
    onPlayerPlay: PropTypes.func,
    onPlayerRateChange: PropTypes.func,
    onPlayerReadyForDisplay: PropTypes.func,
    onPlayerSeek: PropTypes.func,
    onPlayerTimedMetadata: PropTypes.func,

    /* Required by react-native */
    scaleX: PropTypes.number,
    scaleY: PropTypes.number,
    translateX: PropTypes.number,
    translateY: PropTypes.number,
    rotation: PropTypes.number,
    ...ViewPropTypes
};

let styles = StyleSheet.create({
    backgroundVideoAndroid: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },
    backgroundVideoIos: {
        flex: 1,
        alignSelf: 'stretch'
    }
});

const RCTMediaPlayerView = requireNativeComponent('RCTMediaPlayerView', MediaPlayerView, {
    nativeOnly: {
        src: true,
        seek: true,
        fullscreen: true
    }
});
