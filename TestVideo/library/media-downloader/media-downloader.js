import {NativeModules} from 'react-native';

export default class Downloader {

    constructor() {
        this.setupAssetDownload = this.setupAssetDownload.bind(this);
        this.downloader = NativeModules.MediaDownloader;
    }

     setupAssetDownload(url) {
        this.downloader.setupAssetDownload(url);
    }

    startAssetDownload() {
        this.downloader.startAssetDownload();
    }
}
