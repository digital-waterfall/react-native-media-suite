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

# Documentation

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

### Reference Methods
<details><summary>play()</summary>
<p>

`play()`

Resumes playback.

Example:
```
this.videoRef.play();
```
Platforms: **All**

</p>
</details>

<details><summary>pause()</summary>
<p>

`pause()`

Pauses playback.

Example:
```
this.videoRef.pause();
```
Platforms: **All**

</p>
</details>

<details><summary>seekTo()</summary>
<p>

`seekTo(milliseconds)`

Seek to the specified position represented by milliseconds, milliseconds is a integer value.

Example:
```
this.videoRef.seekTo(33300); //Seek to 33.3 seconds
```
Platforms: **All**

</p>
</details>

<details><summary>presentFullscreenPlayer()</summary>
<p>

`presentFullscreenPlayer()`

Puts the player into fullscreen mode.

On Android, this puts the navigation controls in fullscreen mode. Note this does not put the video into fullscreen, will still need to apply a style that makes the width and height match your screen dimensions to get a fullscreen video.

Example:
```
this.videoRef.presentFullscreenPlayer();
```
Platforms: **Android**

</p>
</details>

<details><summary>dismissFullscreenPlayer()</summary>
<p>

`dismissFullscreenPlayer()`

Takes the player out of fullscreen mode.

Example:
```
this.videoRef.dismissFullscreenPlayer();
```
Platforms: **Android**

</p>
</details>

### Properties
### Configurable props
| Property Name          | Type | Description                              | iOS  | Android |
| ---------------------- | ---- |---------------------------------------- | ---- | ------- |
| `src`                  | string | The URL of the video or downloadID                                                                                                               | :white_check_mark:   | :white_check_mark:      |
| `autoplay`             | boolean | True to automatically begins to play. Default is `false`.                                                                          | :white_check_mark:   | :white_check_mark:      |
| `loop`                 | boolean | `true` to automatically seek back to the start upon reaching the end of the video. Default is `false`.                             | :white_check_mark:   | :white_check_mark:      |
| `muted`                | boolean |`true` to silence the audio. Default is `false`.                                                                                   | :white_check_mark:   | :white_check_mark:      |
| `ignoreSilentSwitch`   | boolean |`true` to ignore the iPhone silent switch when playing audio.                                                              | :white_check_mark:   | :x:      |

### Events
| Property Name                   | Description                              | iOS  | Android |
| ------------------------------- | ---------------------------------------- | ---- | ------- |
| `onPlayerPause`                 | Called when playback is paused.                                                                                                                                                                      | :white_check_mark:          | :white_check_mark:      |
| `onPlayerPlay`                  | Called when playback is resumed or started.                                                                                                                                                          | :white_check_mark:          | :white_check_mark:      |
| `onPlayerEnd`                   | Called when playback is finished.                                                                                                                                                                    | :white_check_mark:          | :white_check_mark:      |
| `onPlayerBuffer`                | Called when the player buffers.                                                                                                                                                                      | :white_check_mark:          | :white_check_mark:      |
| `onPlayerBufferOk`              | Called when the player's buffer is full enough to resume playback without stalling.                                                                                                                  | :white_check_mark:          | :white_check_mark:      |
| `onPlayerProgress`              | Called every second if the player is playing, with the player's current progress.                                                                                                                    | :white_check_mark:          | :white_check_mark:      |
| `onPlayerError`                 | Called when the player has encountered an error.                                                                                                                                                     | :white_check_mark:          | :white_check_mark:      |
| `onPlayerBufferChange`          | Called when the buffered duration changes.                                                                                                                                                           | :white_check_mark:          | :white_check_mark:      |
| `onPlayerLoadStart`             | Called when player loads for the first time.                                                                                                                                                         | :white_check_mark:          | :white_check_mark:      |
| `onPlayerLoad`                  | Called when the player loaded content.                                                                                                                                                               | :white_check_mark:          | :white_check_mark:      |
| `onPlayerSeek`                  | Called when the player is seeking.                                                                                                                                                                   | :x:                         | :white_check_mark:      |
| `onPlayerTimedMetadata`         | Called with The timed metadata encountered most recently by the media stream.                                                                                                                        | :x:                         | :white_check_mark:      |
| `onFullscreenPlayerWillPresent` | Called when the the player will start to go into fullscreen.                                                                                                                                         | :x:                         | :white_check_mark:      |
| `onFullscreenPlayerDidPresent`  | Called when the the player has gone into fullscreen.                                                                                                                                                 | :x:                         | :white_check_mark:      |
| `onFullscreenPlayerWillDismiss` | Called when the the player will start to exit fullscreen.                                                                                                                                            | :x:                         | :white_check_mark:      |
| `onFullscreenPlayerDidDismiss`  | Called when the the player has exited fullscreen.                                                                                                                                                    | :x:                         | :white_check_mark:      |
| `onPlayerReadyForDisplay`       | Called when player is ready for playback to begin.                                                                                                                                                   | :x:                         | :white_check_mark:      |
| `onPlayerRateChange`            | Called when the playback rate has changed.                                                                                                                                                           | :x:                         | :white_check_mark:      |
| `onPlayerAudioFocusChanged`     | Called when the audio focus of the app has changed. (Lost audio focus or received audio focus). See Android's explanation [here](https://developer.android.com/guide/topics/media-apps/audio-focus). | :x:                         | :white_check_mark:      |
| `onPlayerAudioBecomingNoisy`    | Called when the audio becomes noisy. See Android's explanation [here](https://developer.android.com/guide/topics/media-apps/volume-and-earphones#becoming-noisy).                                    | :x:                         | :white_check_mark:      |

# Downloader Manager API

Please note this documentation is VERY out of date and is in the progress of being updated.

The download manager manages downloads. It persists details to storage and handles update listeners.

<details><summary>restoreMediaDownloader()</summary>
<p>

```
restoreMediaDownloader()
```

Restores the downloader. Should be called when app starts. Returns a `Promise` object, if the promise resolves it will return all the downloaded contents IDs.

Platforms: **All**

---
</p>
</details>

<details><summary>setMaxSimultaneousDownloads()</summary>
<p>

```
setMaxSimultaneousDownloads(maxSimultaneousDownloads: integer)
```

Sets the maximum number of downloads that can download concurrently.

| Name                     | Type    | Required | Description                                    |
|--------------------------|---------|----------|------------------------------------------------|
| maxSimultaneousDownloads | integer | Yes      | The maximum simultaneous downloads.            |
**Platforms:** iOS (Android is fixed at 2).

---
</p>
</details>

<details><summary>createNewDownload()</summary>
<p>

```
createNewDownload(url: string, downloadID: string, title: string, assetArtworkURL: string, bitRate: number)
```

Creates a new download. Returns a `Promise` object, if the promise resolves it will return a new `Download` object. _Please note: You need to still start the download using the `start()` method of the `Download` object._

| Name                     | Type    | Required | Description                                    |
|--------------------------|---------|----------|------------------------------------------------|
| url                      | string  | Yes      | The url of the HLS or Dash manifest file to be played.            |
| downloadID               | string  | Yes      | The ID to be assigned to the download.                            |
| title                    | string  | Yes      | The title of the asset being downloaded.                          |
| assetArtworkURL          | string  | Yes      | The url of the artwork to save. May be null.                      |
| bitRate                  | string  | No       | The bitrate of the asset to download.                             |

**Platforms:** All

---
</p>
</details>

<details><summary>addUpdateListener()</summary>
<p>

```
addUpdateListener(listener: ?(() => \[Download\]), options: Object)
```

Adds an update listener for a particular download or list of downloads.

| Name                     | Type    | Required | Description                                    |
|--------------------------|---------|----------|------------------------------------------------|
| downloadID               | listener: ?(() => \[Download\])  | Yes      | The callback called when the download or any of the downlods in the array are updated.                          |
| options                  | Object | Yes       | Options that can be passed when adding an update listener. The options that can be given are `downloadIDs: string[]` and `updateImmediately: boolean`. `downloadIDs` is an array of the downloads which should be listened to. `updateImmediately` calls the listener directly after it has been added.

**Platforms:** All

---
</p>
</details>

<details><summary>removeUpdateListener()</summary>
<p>

```
removeUpdateListener(listener: ?(() => \[Download\]))
```

Removes an update listener.

| Name                     | Type    | Required | Description                                    |
|--------------------------|---------|----------|------------------------------------------------|
| downloadID               | listener: ?(() => \[Download\])  | Yes      | The callback function that should be removed. (The same callback function that was added using addUpdateListener)). |

**Platforms:** All

---
</p>
</details>

<details><summary>getDownload()</summary>
<p>

```
getDownload(downloadIDs: string[], returnWithLabels: boolean)
```

Retrieves all the `download` objects with the given IDs.

| Name                     | Type    | Required | Description                                    |
|--------------------------|---------|----------|------------------------------------------------|
| downloadIDs              | string[]  | Yes      | The download IDs of the `download` objects to be retrieved.  |
| returnWithLabels              | boolean  | No      | Boolean indicating whether the downloads returned should be labeled with their download IDs. |

**Platforms:** All

---
</p>
</details>

<details><summary>isDownloaded()</summary>
<p>

```
isDownloaded(downloadID: string)
```

Retrieves all the `download` objects with the given IDs.

| Name                     | Type    | Required | Description                                    |
|--------------------------|---------|----------|------------------------------------------------|
| downloadID              | string  | Yes      | The download ID of the download to be checked. |

**Platforms:** All

---
</p>
</details>

For details about the usage of above APIs, check [`library/media-downloader/download-manager.js`](library/media-downloader/media-downloader.js).

## TODO

- [ ] Downloading
- [ ] DRM
- [ ] Google Play
- [ ] Air Play