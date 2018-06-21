import React, {Component} from 'react';
import PropTypes from 'prop-types';

import ReactNative, {
    View,
    requireNativeComponent,
    UIManager,
    NativeModules,
    findNodeHandle
} from 'react-native';

class MediaPlayerView extends Component {
    static defaultProps = {
        autoplay: false,
        offline: false,
        preload: 'auto',
        loop: false,
        ignoreSilentSwitch: true
    };

    constructor(props) {
        super(props);

        this.MediaPlayerView = NativeModules.MediaPlayerView;
        this.play = this.play.bind(this);

        this.state = {
            buffering: false,
            playing: false,
            current: 0,
            total: 0,

            width: 0,
            height: 0

        };
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
                    onPlaybackError={this._onPlaybackError.bind(this)}
                />
            </View>
        );
    }

    _onLayout(e) {
        const {width, height} = e.nativeEvent.layout;
        this.setState({width, height});

        this.props.onLayout && this.props.onLayout(e);
    }

    pause() {
        UIManager.dispatchViewManagerCommand(
            this.RCTMediaPlayerView._nativeTag,
            UIManager.RCTMediaPlayerView.Commands.pause,
            null
        );
    }

    play() {
        UIManager.dispatchViewManagerCommand(
            this.RCTMediaPlayerView._nativeTag,
            UIManager.RCTMediaPlayerView.Commands.play,
            null
        );
    }

    stop() {
        UIManager.dispatchViewManagerCommand(
            this.RCTMediaPlayerView._nativeTag,
            UIManager.RCTMediaPlayerView.Commands.stop,
            null
        );
    }

    seekTo(timeMs) {
        let args = [timeMs];
        UIManager.dispatchViewManagerCommand(
            this.RCTMediaPlayerView._nativeTag,
            UIManager.RCTMediaPlayerView.Commands.seekTo,
            args
        );
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
        let total = event.nativeEvent.total; //in ms

        this.props.onPlayerProgress && this.props.onPlayerProgress(current, total);
    }

    _onPlaybackError(event) {
        const error = event.nativeEvent.error;
        console.log(error);
        this.props.onPlaybackError && this.props.onPlaybackError(error);
    }
}

MediaPlayerView.propTypes = {
    src: PropTypes.string,
    offline: PropTypes.bool,
    autoplay: PropTypes.bool,
    preload: PropTypes.string,
    loop: PropTypes.bool,
    muted: PropTypes.bool,
    ignoreSilentSwitch: PropTypes.bool,
    nativeID: PropTypes.string,
    accessibilityComponentType: PropTypes.string,
    onLayout: PropTypes.bool,
    accessibilityLabel: PropTypes.string,
    importantForAccessibility: PropTypes.string,
    testID: PropTypes.string,
    renderToHardwareTextureAndroid: PropTypes.bool,
    accessibilityLiveRegion: PropTypes.string,

    onPlayerPaused: PropTypes.func,
    onPlayerPlaying: PropTypes.func,
    onPlayerFinished: PropTypes.func,
    onPlayerBuffering: PropTypes.func,
    onPlayerBufferOK: PropTypes.func,
    onPlayerProgress: PropTypes.func,
    onPlayerBufferChange: PropTypes.func,
    onPlaybackError: PropTypes.func
};

const RCTMediaPlayerView = requireNativeComponent('RCTMediaPlayerView', MediaPlayerView);

module.exports = MediaPlayerView;