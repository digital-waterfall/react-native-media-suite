import {NativeModules, NativeEventEmitter} from 'react-native';
import _ from 'lodash';

import Download, { downloadStates, eventListenerTypes }from './download';

class DownloadManager {

    constructor() {
        if (!DownloadManager.downloader) {
            this.restoreMediaDownloader = this.restoreMediaDownloader.bind(this);
            this.createNewDownload = this.createNewDownload.bind(this);
            this.deleteDownloaded = this.deleteDownloaded.bind(this);
            this.onDownloadStarted = this.onDownloadStarted.bind(this);
            this.onDownloadProgress = this.onDownloadProgress.bind(this);
            this.onDownloadFinished = this.onDownloadFinished.bind(this);
            this.onDownloadError = this.onDownloadError.bind(this);
            this.onDownloadCancelled = this.onDownloadCancelled.bind(this);
            this.getDownload = this.getDownload.bind(this);
            this.isDownloaded = this.isDownloaded.bind(this);

            this.downloads = [];

            this.nativeDownloader = NativeModules.MediaDownloader;
            const downloaderEvent = new NativeEventEmitter(NativeModules.MediaDownloader);

            downloaderEvent.addListener('onDownloadFinished', this.onDownloadFinished);
            downloaderEvent.addListener('onDownloadProgress', this.onDownloadProgress);
            downloaderEvent.addListener('onDownloadStarted', this.onDownloadStarted);
            downloaderEvent.addListener('onDownloadError', this.onDownloadError);
            downloaderEvent.addListener('onDownloadCancelled', this.onDownloadCancelled);

            DownloadManager.downloader = this;
        }

        return DownloadManager.downloader;
    }

    restoreMediaDownloader() {
        this.nativeDownloader.restoreMediaDownloader();
    }

    createNewDownload(url, downloadID, bitRate) {
        let download = this.downloads.find(download => download.downloadID === downloadID);

        if (download) {
            throw `Download already exists with ID: ${downloadID}`;
        }

        download = new Download(downloadID, url, downloadStates.initialized, bitRate, this.nativeDownloader);
        this.downloads.push(download);
        download.addEventListener(eventListenerTypes.deleted, () => this.deleteDownloaded(download.downloadID));
        return download;
    }

    deleteDownloaded(downloadID) {
        _.remove(this.downloads, download => download.downloadID === downloadID);
    }

    onDownloadStarted(data) {
        let download = this.getDownload(data.downloadID);
        if (!download) return;

        download.onDownloadStarted();
    }

    onDownloadProgress(data) {
        let download = this.getDownload(data.downloadID);
        if (!download) return;

        download.onDownloadProgress(data.percentComplete);
    }

    onDownloadFinished(data) {
        let download = this.getDownload(data.downloadID);
        if (!download) return;

        download.onDownloadFinished(data.downloadLocation, data.size);
    }

    onDownloadError(data) {
        let download = this.getDownload(data.downloadID);
        if (!download) return;

        download.onDownloadError(data.errorType, data.error);
        console.warn(data.error);
    }

    onDownloadCancelled(data) {
        let download = this.getDownload(data.downloadID);
        if (!download) return;

        download.onDownloadCancelled();
        _.remove(this.downloads, download => download.downloadID === data.downloadID);
    }

    getDownload(downloadID) {
        const download = this.downloads.find(download => download.downloadID === downloadID);
        if (!download) {
            return null;
        }
        return download;
    }

    isDownloaded(downloadID) {
        return !!this.downloads.find(download => download.downloadID === downloadID);
    }
}

const downloadManager = new DownloadManager();
Object.freeze(downloadManager);

export  default downloadManager;