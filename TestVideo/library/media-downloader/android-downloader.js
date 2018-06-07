import {NativeModules} from 'react-native';

export default class AndroidDownloader {
    constructor() {
        this.downloadStream = this.downloadStream.bind(this);
        this.downloader = NativeModules.DownloadServiceModule;
    }

    downloadStream(url, downloadID) {
        this.downloader.downloadStream(url, downloadID);
    }
}