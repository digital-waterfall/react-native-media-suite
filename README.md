React Native Media Suite
========================

Forked from [react-native-media-kit](https://www.npmjs.com/package/react-native-media-kit)

This is a video and audio component for react-native apps, supporting both iOS and Android, with API similar to HTML video.

Supported media types:

* iOS: Should be the same as those supported by [AVPlayer](https://developer.apple.com/library/ios/documentation/AVFoundation/Reference/AVPlayer_Class/)
* Android: Should be the same as those supported by [ExoPlayer](https://github.com/google/ExoPlayer)

![](video-playing.gif)

## Installation

Using npm:
```
$ npm install --save react-native-media-suite
```

or using yarn:
```
$ yarn add react-native-media-suite
```

For each platform (iOS/Android) you plan to use, follow one of the options for the corresponding platform.

<details><summary>iOS</summary>
<p>

### Standard Method
Run `$ react-native link react-native-media-suite` to link the react-native-media-suite library. You only need to do this once, it will link both Android and iOS

### Manually
1. Right click on **Libraries** and choose 'Add files to "Project Name"'.
2. Navigate to `project_name/node_modules/react-native-media-suite/ios/` and add the file `react-native-media-suite.xcodeproj`.
3. Open project settings and at the top choose '**Build Phases**'
4. Expand the '**Link Binary With Libraries**' section.
5. Click the + at the bottom of the list
6. Add the `libreact-native-media-suite.a` file
</p>
</details>

<details><summary>Android</summary>
<p>

### Standard Method
Run `$ react-native link react-native-media-suite` to link the react-native-media-suite library. You only need to do this once, it will link both Android and iOS.

### Manually
##### `android/settings.gradle`

```
include ':react-native-media-suite'
project(':react-native-media-suite').projectDir = new File('../node_modules/react-native-media-suite/android')
```

##### `android/app/build.gradle`

```
dependencies {
    ...
    compile project(':react-native-media-suite')
}
```

##### `android/app/src/main/java/.../MainApplication.java` (or `MainActivity.java` on RN <= 0.29)

```
import za.co.digitalwaterfall.reactnativemediasuite.MediaSuitePackage;
...
protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new MediaKitPackage()
    );
}
```
</p>
</details>

## Documentation

### Video Player API

```
import Video from 'react-native-media-suite';

render() {
    return (
        <Video
            src="https://bitmovin-a.akamaihd.net/content/playhouse-vr/mpds/105560.mpd"
            ref={ref => this.videoRef = ref}
            style={styles.videoStyle}
            onError={this.videoError}                // Callback when video cannot be loaded
            onProgress={this.videoProgress}          // Callback called every second to give info about playback
        />
    );
}

var styles = StyleSheet.create({
  videoStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
```

### Properties
#### Configurable props
| Property Name          | Type | Description                              | iOS  | Android |
| ---------------------- | ---- |---------------------------------------- | ---- | ------- |
| `src`                  | string | The URL of the video or downloadID                                                                                                               | :white_check_mark:   | :white_check_mark:      |
| `autoplay`             | boolean | True to automatically begins to play. Default is `false`.                                                                          | :white_check_mark:   | :white_check_mark:      |
| `loop`                 | boolean | `true` to automatically seek back to the start upon reaching the end of the video. Default is `false`.                             | :white_check_mark:   | :white_check_mark:      |
| `ignoreSilentSwitch`   | boolean | An image URL indicating a poster frame to show until the user plays.                                                               | :white_check_mark:   | :x:      |
| `muted`                | boolean |`true` to silence the audio. Default is `false`.                                                                                   | :white_check_mark:   | :white_check_mark:      |

#### Events
| Property Name          | Description                              | iOS  | Android |
| ---------------------- | ---------------------------------------- | ---- | ------- |
| `onPlayerPaused`       |                                                                                                                                    | :white_check_mark:   | :x:      |
| `onPlayerPlaying`      |                                                                                                                                    | :white_check_mark:   | :x:      |
| `onPlayerFinished`     |                                                                                                                                    | :white_check_mark:   | :x:      |
| `onPlayerBuffering`    |                                                                                                                                    | :white_check_mark:   | :x:      |
| `onPlayerBufferOK`     |                                                                                                                                    | :white_check_mark:   | :x:      |
| `onPlayerProgress`     |                                                                                                                                    | :white_check_mark:   | :x:      |
| `onPlayerError`        |                                                                                                                                    | :white_check_mark:   | :x:      |
| `onPlayerBufferChange` |                                                                                                                                    | :white_check_mark:   | :x:      |

##### Reference Methods

- `pause()`
- `play()`
- `stop()`
- `seekTo()`


For details about the usage of above APIs, check [`library/media-player/media-player-view.js`](library/media-player/media-player-view.js).

### Downloader API

##### Initialisation

Methods can be passed to the constructor to be called when events occur. The following callbacks are supported.

```
import { Downloader } from 'react-native-media-suite';
...
const downloader = new Downloader({
    onDownloadFinished: eventData => console.log(`eventData: ${eventData}`),
    onDownloadProgress: eventData => console.log(`eventData: ${eventData}`),
    onDownloadStarted: eventData => console.log(`eventData: ${eventData}`),
    onDownloadError: eventData => console.log(`eventData: ${eventData}`),
    onDownloadCancelled: eventData => console.log(`eventData: ${eventData}`)
});
```

| Method Name          | Evocation Property                                                                                  | iOS | Android  |
|----------------------|-----------------------------------------------------------------------------------------------------|-----|----------|
| `onDownloadFinished` | `{ `**`downloadID`**`: string, `**`downloadLocation`**`: string, `**`size`**`: integer (bytes) }`   | :white_check_mark:  | :white_check_mark:      |
| `onDownloadProgress` | `{ `**`downloadID`**`: string, `**`percentComplete`**`: float }`                                    | :white_check_mark:  | :white_check_mark:      |
| `onDownloadStarted`  | `{ `**`downloadID`**`: string }`                                                                    | :white_check_mark:  | :white_check_mark:      |
| `onDownloadError`    | `{ `**`downloadID`**`: string, `**`error`**`: string, `**`errorType`**`: string }`                  | :white_check_mark:  | :white_check_mark:      |
| `onDownloadCanceled` | `{ `**`downloadID`**`: string }`                                                                    | :white_check_mark:  | :white_check_mark:      |

##### Methods

```
downloader.restoreMediaDownloader();
downloader.downloadStream('someMediaUrl', 'someDownloadId', );
downloader.deleteDownloadedStream('someDownloadId');
downloader.pauseDownload('someDownloadId');
downloader.resumeDownload('someDownloadId');
downloader.cancelDownload('someDownloadId');
```

| Method Name              | Properties               | iOS | Android |
|--------------------------|--------------------------|-----|---------|
| `restoreMediaDownloader` |                                                                                                 | :white_check_mark:  | :white_check_mark:      |
| `downloadStream`         | url: `string`, downloadID: `string`, bitRate: `integer` (Optional - defaults to max bit-rate)   | :white_check_mark:  | :white_check_mark:      |
| `deleteDownloadedStream` | downloadID: `string`                                                                            | :white_check_mark:  | :white_check_mark:      |
| `pauseDownload`          | downloadID: `string`                                                                            | :white_check_mark:  | :white_check_mark:      |
| `resumeDownload`         | downloadID: `string`                                                                            | :white_check_mark:  | :white_check_mark:      |
| `cancelDownload`         | downloadID: `string`                                                                            | :white_check_mark:  | :white_check_mark:      |

For details about the usage of above APIs, check [`library/media-downloader/download-manager.js`](library/media-downloader/media-downloader.js).

## TODO

- [ ] Downloading
- [ ] DRM
- [ ] Google Play
- [ ] Air Play