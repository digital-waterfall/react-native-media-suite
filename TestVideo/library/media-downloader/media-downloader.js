import {NativeModules, NativeEventEmitter} from 'react-native';

export default class Downloader {

    constructor() {
        this.test = this.test.bind(this);
        console.log('NativeModules.MediaDownloader: ', NativeModules.MediaDownloader);
        this.downloader = NativeModules.MediaDownloader;
        const myModuleEvt = new NativeEventEmitter(NativeModules.MediaDownloader);
        myModuleEvt.addListener('onDownloadFinished', (data) => console.log(data));
        myModuleEvt.addListener('onDownloadProgress', (data) => console.log(data));
        myModuleEvt.addListener('onDownloadStarted', (data) => console.log(data));
    }

     test(url) {
        this.downloader.setupAssetDownload(url);
    }
}
