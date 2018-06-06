import {NativeModules} from 'react-native';
// const DownloadServiceModule = require('NativeModules').DownloadServiceModule;
export default class AndroidDownloader {
    constructor() {
        this.downloader = NativeModules.DownloadServiceModule;
    }

    testFn(){
        this.downloader.initDownloader(2,(data)=>{
            alert('Bla bla'+ data);
        });
    }
}