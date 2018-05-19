import {NativeModules, NativeEventEmitter} from 'react-native';

export default class Downloader {

    constructor() {
        this.test = this.test.bind(this);
        console.log('NativeModules.MediaDownloader: ', NativeModules.MediaDownloader);
        this.downloader = NativeModules.MediaDownloader;
        const myModuleEvt = new NativeEventEmitter(NativeModules.MediaDownloader);
        myModuleEvt.addListener('testEvent1', (data) => console.log(data));
        myModuleEvt.addListener('testEvent2', (data) => console.log(data));
        myModuleEvt.addListener('testEvent3', (data) => console.log(data));
    }

     test(url) {
        this.downloader.setupAssetDownload(url);
    }
}
