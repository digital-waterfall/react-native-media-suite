import {NativeModules, NativeEventEmitter} from 'react-native';

import Download, { downloadStates }from './download';

export default class DownloadManager {

    constructor(downloadEvents, eventListner) {
        if (DownloadManager.downloader) {
            this.deleteDownloadedStream = this.deleteDownloadedStream.bind(this);
            this.onDownloadProgress = this.onDownloadProgress.bind(this);
            this.onDownloadStarted = this.onDownloadStarted.bind(this);
            this.onDownloadFinished = this.onDownloadFinished.bind(this);
            this.onDownloadError = this.onDownloadError.bind(this);
            this.onDownloadCancelled = this.onDownloadCancelled.bind(this);
            this.pauseDownload = this.pauseDownload.bind(this);
            this.resumeDownload = this.resumeDownload.bind(this);
            this.cancelDownload = this.cancelDownload.bind(this);
            this.downloadStream = this.downloadStream.bind(this);
            this.restoreMediaDownloader = this.restoreMediaDownloader.bind(this);

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
        this.downloader.restoreMediaDownloader();
    }

    startNewDownload(url, downloadID, bitRate) {
        const download = this.downloads.find(download => download.downloadID === downloadID);

        if (download) {
            if (download.failed()) {
                download.remoteURL = url;
                download.state = downloadStates.initialized;
                download.bitrate = bitRate;
                this.downloadStream(url, downloadID, bitRate);
                this.update(download);
                return;
            }
            throw `Download already exists with uuid: ${uuid}`;
        }

        const downloadsLength = this.downloads.push(new Download(downloadID, url, downloadStates.initialized, bitRate));
        this.downloadStream(url, downloadID, bitRate);
        this.update(this.downloads[downloadsLength-1]);
    }

    downloadStream(url, downloadID, bitRate) {
        if (bitRate) {
            this.nativeDownloader.downloadStreamWithBitRate(url, downloadID, bitRate)
        } else {
            this.nativeDownloader.downloadStream(url, downloadID);
        }
    }

    deleteDownloadedStream(downloadID) {
        this.downloader.deleteDownloadedStream(downloadID);
    }

    pauseDownload(downloadID) {
        let download = this.getDownload(downloadID);
        if (!download) return;

        this.nativeDownloader.pauseDownload(downloadID);
        download.state = downloadStates.paused;
        this.update(download);
    }

    resumeDownload(downloadID) {
        let download = this.getDownload(downloadID);
        if (!download) return;

        this.nativeDownloader.resumeDownload(downloadID);
        download.state = downloadStates.downloading;
        this.update(download);
    }

    cancelDownload(downloadID) {
        this.nativeDownloader.cancelDownload(downloadID);
    }

    onDownloadStarted(data) {
        let download = this.getDownload(data.downloadID);
        if (!download) return;

        download.state = downloadStates.started;
        this.update(download);
    }

    onDownloadProgress(data) {
        let download = this.getDownload(data.downloadID);
        if (!download) return;

        download.state = downloadStates.downloading;
        download.progress = data.percentComplete;
        this.update(download);
    }

    onDownloadFinished(data) {
        let download = this.getDownload(data.downloadID);
        if (!download) return;

        download.state = downloadStates.downloaded;
        download.localURL = data.downloadLocation;
        download.fileSize = data.size;
        this.update(download);
    }

    onDownloadError(data) {
        let download = this.getDownload(data.downloadID);
        if (!download) return;

        download.state = downloadStates.failed;
        download.errorType = data.errorType;
        download.errorMessage = data.error;
        console.warn(data.error);
        this.update(download);
    }

    onDownloadCancelled(data) {
        let download = this.getDownload(data.downloadID);
        if (!download) return;

        _.remove(this.downloads, download => download.uuid === data.downloadID);
        this.update();
    }

    update(download) {
        if (download) {
            this.eventListner(download);
            return;
        }

        this.eventListner(this.downloads);

    }

    getDownload(uuid) {
        const download = this.downloads.find(download => download.uuid === uuid);
        if (!download) {
            return null;
        }
        return download;
    }

    isDownloaded(uuid) {
        return !!this.downloads.find(download => download.uuid === uuid);
    }
}

const Downloader = new DownloadManager();
Object.freeze(Downloader);

export  default Downloader;