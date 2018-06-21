import {NativeModules, NativeEventEmitter} from 'react-native';

export default class Downloader {

    constructor(downloadEvents) {
        this.deleteDownloadedStream = this.deleteDownloadedStream.bind(this);
        this.onDownloadProgress = this.onDownloadProgress.bind(this);
        this.onDownloadStarted = this.onDownloadStarted.bind(this);
        this.onDownloadFinished = this.onDownloadFinished.bind(this);
        this.onDownloadError = this.onDownloadError.bind(this);
        this.onDownloadCanceled = this.onDownloadCanceled.bind(this);
        this.pauseDownload = this.pauseDownload.bind(this);
        this.resumeDownload = this.resumeDownload.bind(this);
        this.cancelDownload = this.cancelDownload.bind(this);
        this.downloadStream = this.downloadStream.bind(this);
        this.restoreMediaDownloader = this.restoreMediaDownloader.bind(this);

        this.downloadEvents = downloadEvents || {};

        this.downloader = NativeModules.MediaDownloader;
        const downloaderEvent = new NativeEventEmitter(NativeModules.MediaDownloader);

        downloaderEvent.addListener('onDownloadFinished', this.onDownloadFinished);
        downloaderEvent.addListener('onDownloadProgress', this.onDownloadProgress);
        downloaderEvent.addListener('onDownloadStarted', this.onDownloadStarted);
        downloaderEvent.addListener('onDownloadError', this.onDownloadError);
        downloaderEvent.addListener('onDownloadCanceled', this.onDownloadCanceled);
    }

    restoreMediaDownloader() {
        this.downloader.restoreMediaDownloader();
    }

    downloadStream(downloadID, url, bitRate) {
        if (bitRate) {
            this.downloader.downloadStreamWithBitRate(url, downloadID, bitRate)
        } else {
            this.downloader.downloadStream(url, downloadID);
        }
    }

    deleteDownloadedStream(downloadID) {
        this.downloader.deleteDownloadedStream(downloadID);
    }

    pauseDownload(downloadID) {
        this.downloader.pauseDownload(downloadID);
    }

    resumeDownload(downloadID) {
        this.downloader.resumeDownload(downloadID);
    }

    cancelDownload(downloadID) {
        this.downloader.cancelDownload(downloadID);
    }

    onDownloadProgress(data) {
        if (this.downloadEvents.onDownloadProgress) this.downloadEvents.onDownloadProgress({downloadID: data.downloadID, percentComplete: data.percentComplete});
    }

    onDownloadStarted(data) {
        if (this.downloadEvents.onDownloadStarted) this.downloadEvents.onDownloadStarted({downloadID: data.downloadID});
    }

    onDownloadFinished(data) {
        if (this.downloadEvents.onDownloadFinished) this.downloadEvents.onDownloadFinished({downloadID: data.downloadID, downloadLocation: data.downloadLocation, size: data.size});
    }

    onDownloadError(data) {
        if (this.downloadEvents.onDownloadError) this.downloadEvents.onDownloadError({downloadID: data.downloadID, error: data.error, errorType: data.errorType});
    }

    onDownloadCanceled(data) {
        if (this.downloadEvents.onDownloadCanceled) this.downloadEvents.onDownloadCanceled({downloadID: data.downloadID});
    }
}