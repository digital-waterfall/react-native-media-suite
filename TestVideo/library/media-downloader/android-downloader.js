import {NativeModules} from 'react-native';

export default class AndroidDownloader {
    constructor() {
        this.startDownload = this.startDownload.bind(this);
        this.getProgress = this.getProgress.bind(this);
        this.downloader = NativeModules.DownloadServiceModule;
    }

    startDownload(url, downloadID) {
        this.downloader.startDownload(url, downloadID);
    }

    getProgress(url) {
        const that = this;
        return new Promise(function(resolve){
            that.downloader.getProgress(url, (data)=>{
                resolve(data);
            });
        });
    }

    getDownloadedStreams(url){
        const that = this;
        return new Promise(function(resolve){
            that.downloader.getCachedStreamFile(url, (data)=>{
                resolve(data);
            });
        });

    }
}