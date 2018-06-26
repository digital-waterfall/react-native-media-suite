# react-native-media-suite

Forked from react-native-media-kit

Video(and audio) component for react-native apps, supporting both iOS and Android, with API similar to HTML video.

Supported media types:

* iOS: Should be same as those supported by [AVPlayer](https://developer.apple.com/library/ios/documentation/AVFoundation/Reference/AVPlayer_Class/)


* Android: Shold be same as those supported by [ExoPlayer](https://github.com/google/ExoPlayer)

![](Demo/demo.gif).

## Install

`npm install --save react-native-media-suite@latest `

#### iOS

* Step 1: Right click on **Libraries** and choose 'Add files to "Project Name"'.
* Step 2: Navigate to `project_name/node_modules/react-native-media-suite/ios/` and add the file `react-native-media-suite.xcodeproj`.
* Step 3: Open project settings and at the top choose '**Build Phases**'
* Step 4: Expand the '**Link Binary With Libraries**' section.
* Step 5: Click the + at the bottom of the list
* Step 6: Add the `libreact-native-media-suite.a` file

#### Android

**android/settings.gradle**

```
include ':react-native-media-suite'
project(':react-native-media-suite').projectDir = new File('../node_modules/react-native-media-suite/android')
```

**android/app/build.gradle**

```
dependencies {
    ...
    compile project(':react-native-media-suite')
}
```

**MainActivity.java (or MainApplication on rn 0.29+)**

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



## Documentation

```
import {Video} from 'react-native-media-suite';
...
render() {
  return (
  	<Video
      style={{width: width, height: width / (16/9)}}
      src={'http://v.yoai.com/femme_tampon_tutorial.mp4'}
      autoplay={false}
      preload={'none'}
      loop={false}
      controls={true}
      muted={false}
      poster={'http://static.yoaicdn.com/shoppc/images/cover_img_e1e9e6b.jpg'}
    />
  );
}

```

### Player API

The API is designed to mimic the html [`<video />`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video).

##### Properties

| key                  | value                                    | iOS  | Android |
| -------------------- | ---------------------------------------- | ---- | ------- |
| src                  | the URL of the video                     | OK   | WIP      |
| offline             | the ID of the downloaded asset    | OK   | WIP    |
| autoplay             | true to automatically begins to play. Default is false. | OK   | WIP      |
| preload              | can be 'none', 'auto'. Default is 'none'. | OK   | WIP      |
| loop                 | true to automatically seek back to the start upon reaching the end of the video. Default is 'false'. | OK   | WIP      |
| controls             | true to show controls to allow user to control video playback, including seeking, and pause/resume playback. Default is true. | OK   | WIP      |
| poster               | an image URL indicating a poster frame to show until the user plays. | OK   | WIP      |
| muted                | true to silence the audio. Default is false. | OK   | WIP      |
| onPlayerPaused       |                                          | OK   | WIP      |
| onPlayerPlaying      |                                          | OK   | WIP      |
| onPlayerFinished     |                                          | OK   | WIP      |
| onPlayerBuffering    |                                          | OK   | WIP      |
| onPlayerBufferOK     |                                          | OK   | WIP      |
| onPlayerProgress     |                                          | OK   | WIP      |
| onPlayerError           |                                          | OK   | WIP     |
| onPlayerBufferChange |                                          | OK   | WIP      |

- ***pause***
- ***play***
- ***stop***
- ***seekTo***


For details about the usage of above APIs, check `library/media-player-view.js`.

### Downloader API

The downloader currently only works in iOS, but the Android is speedily on its way.

##### Properties

The following methods can be called on the downloader.

| key                    | value                    | iOS | Android |
|------------------------|--------------------------|-----|---------|
| restoreMediaDownloader |                          | OK  | OK      |
| downloadStream         | url, downloadID, bitRate | OK  | OK      |
| deleteDownloadedStream | downloadID               | OK  | OK      |
| pauseDownload          | downloadID               | OK  | OK      |
| resumeDownload         | downloadID               | OK  | OK      |
| cancelDownload         | downloadID               | OK  | OK      |

Methods can be passed to the constructor to be called when events occur. The following callbacks are supported.

| key                | value                                                                              | iOS | Android |
|--------------------|------------------------------------------------------------------------------------|-----|---------|
| onDownloadFinished | returns: {downloadID: string, downloadLocation: string, size: number of bytes}     | OK  | OK     |
| onDownloadProgress | returns: {downloadID: string, percentComplete: percent as a float}                 | OK  | OK     |
| onDownloadStarted  | returns: {downloadID: string}                                                      | OK  | OK     |
| onDownloadError    | returns: {downloadID: string, error: message as string, errorType: type as string} | OK  | OK     |
| onDownloadCanceled | returns: {downloadID: string}                                                      | OK  | OK     |

## TODO

* Downloading - **W**ork **I**n **P**rogress 
* DRM
* Google Play
* Air Play
