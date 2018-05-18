import {NativeModules} from 'react-native';

export default class Downloader {

    constructor() {
        this.test = this.test.bind(this);
        console.log('NativeModules.MediaDownloader: ', NativeModules.MediaDownloader);
        this.downloader = NativeModules.MediaDownloader;
    }

     test(url) {
        this.downloader.test();
    }
}
