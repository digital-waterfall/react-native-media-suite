import {NativeModules, NativeEventEmitter, Platform } from 'react-native';
import _ from 'lodash';
import storageService from 'rn-multi-tenant-async-storage';

import Download, { DOWNLOAD_STATES, EVENT_LISTENER_TYPES }from './download';

const tenantKey = 'RNMediaSuite_DownloadManager';

class DownloadManager {

    constructor() {
        if (!DownloadManager.downloader) {
            storageService.addStorageTenant(tenantKey);
            this.tenant = storageService.getStorageTenant(tenantKey);

            this.restoreMediaDownloader = this.restoreMediaDownloader.bind(this);
            this.setMaxSimultaneousDownloads = this.setMaxSimultaneousDownloads.bind(this);
            this.createNewDownload = this.createNewDownload.bind(this);
            this.deleteDownloaded = this.deleteDownloaded.bind(this);
            this.onDownloadStarted = this.onDownloadStarted.bind(this);
            this.onDownloadProgress = this.onDownloadProgress.bind(this);
            this.onDownloadFinished = this.onDownloadFinished.bind(this);
            this.onDownloadError = this.onDownloadError.bind(this);
            this.onDownloadCancelled = this.onDownloadCancelled.bind(this);

            this.addUpdateListener = this.addUpdateListener.bind(this);
            this.callUpdateListeners = this.callUpdateListeners.bind(this);
            this.removeUpdateListener = this.removeUpdateListener.bind(this);

            this.getDownload = this.getDownload.bind(this);
            this.isDownloaded = this.isDownloaded.bind(this);
            this.persistDownload = this.persistDownload.bind(this);

            this.downloads = [];
            this.updateListeners = [];

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
        if (Platform.OS === 'ios') {
            this.nativeDownloader.restoreMediaDownloader();
        }
        return new Promise((resolve, reject) => {
            storageService.getAllKeyValuePairs(this.tenant).then(downloads => {
                let downloadIds = [];
                _.forEach(downloads, download => {
                    const newDownload = new Download(download[1].downloadID, download[1].remoteURL, download[1].state, download[1].bitRate, download[1].title, download[1].assetArtworkURL, this.nativeDownloader, download[1]);
                    newDownload.addEventListener(EVENT_LISTENER_TYPES.deleted, () => this.deleteDownloaded(newDownload.downloadID));
                    this.downloads.push(newDownload);
                    console.log('Downloads', this.downloads);
                    downloadIds.push(download[1].downloadID);
                });
                resolve(downloadIds);
            }, error => {
                reject(error);
            });
        });
    }

    setMaxSimultaneousDownloads(maxSimultaneousDownloads) {
        if (Platform.OS === 'ios') {
            if (typeof maxSimultaneousDownloads !== 'number' || (maxSimultaneousDownloads % 1) !== 0) {
                throw 'maxSimultaneousDownloads should be of type integer.'
            }
            this.nativeDownloader.setMaxSimultaneousDownloads(maxSimultaneousDownloads);
        }
    }

    createNewDownload(url, downloadID, title, assetArtworkURL,  bitRate = 0) {
        let download = this.downloads.find(download => download.downloadID === downloadID);

        if (download) {
            throw `Download already exists with ID: ${downloadID}`;
        }
        download = new Download(downloadID, url, DOWNLOAD_STATES.initialized, bitRate, title, assetArtworkURL, this.nativeDownloader);
        this.downloads.push(download);
        download.addEventListener(EVENT_LISTENER_TYPES.deleted, (data) => this.deleteDownloaded(data));
        this.persistDownload(download);
        return download;
    }

    deleteDownloaded(downloadID) {
        _.remove(this.downloads, download => download.downloadID === downloadID);
        storageService.removeItem(this.tenant, downloadID);
    }

    onDownloadStarted(data) {
        let download = this.getDownload(data.downloadID);
        if (!download) return;

        download.onDownloadStarted();
        this.persistDownload(download);
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
        this.persistDownload(download);
    }

    onDownloadError(data) {
        let download = this.getDownload(data.downloadID);
        if (!download) return;

        download.onDownloadError(data.errorType, data.error);
        console.warn(data.error);
        this.persistDownload(download);
    }

    onDownloadCancelled(data) {
        let download = this.getDownload(data.downloadID);
        if (!download) return;

        download.onDownloadCancelled();
        _.remove(this.downloads, download => download.downloadID === data.downloadID);
        storageService.removeItem(this.tenant, data.downloadID);
    }

    addUpdateListener(listener, options) {
        if (!options.downloadIDs) {
            this.updateListeners.push({downloadIDs: null, listener: listener});
        } else {
            this.updateListeners.push({downloadIDs: options.downloadIDs, listener});
        }
        if (options.updateImmediately) this.callUpdateListeners();
    }

    callUpdateListeners(downloadID) {
        // TODO: Call listeners that are listening to all downloads
        _.forEach(this.updateListeners, listenerObject => {
            if (_.isArray(listenerObject.downloadIDs)) {
                if (_.includes([listenerObject.downloadIDs], downloadID)) {
                    const downloads = [];
                    _.forEach(listenerObject.downloadIDs, downloadID => downloads.push({downloadID :this.getDownload(downloadID)}));
                    listenerObject.listener(downloads);
                }
            } else {
                if (listenerObject.downloadIDs === downloadID) listenerObject.listener(this.getDownload(downloadID));
            }
        });
    }

    removeUpdateListener(listener) {
        _.remove(this.updateListeners, listenerObject => listenerObject.listener === listener);
    }

    getDownload(downloadIDs) {
        const matchedDownloads = _.filter(this.downloads, download => {
            if(_.isArray(downloadIDs)){
                return _.indexOf(downloadIDs, download.downloadID) !== -1;
            }
            return download.downloadID === downloadIDs
        });
        if(_.isEmpty(matchedDownloads)){
            return null;
        }
        if(_.size(matchedDownloads) === 1){
            return matchedDownloads[0];
        }
        return matchedDownloads;
    }

    isDownloaded(downloadID) {
        return !!this.downloads.find(download => download.downloadID === downloadID);
    }

    persistDownload(download) {
        storageService.setItem(this.tenant, download.downloadID, {
            downloadID: download.downloadID,
            remoteURL: download.remoteURL,
            state: download.state,
            bitRate: download.bitRate,
            title: download.title,
            assetArtworkURL: download.assetArtworkURL,
            progress: download.progress,
            localURL: download.localURL,
            fileSize: download.fileSize,
            errorType: download.errorType,
            errorMessage: download.errorMessage,
            startedTimeStamp: download.startedTimeStamp,
            finishedTimeStamp: download.finishedTimeStamp,
            erroredTimeStamp: download.erroredTimeStamp,
            progressTimeStamp: download.progressTimeStamp
        });
    }
}

const downloadManager = new DownloadManager();
Object.freeze(downloadManager);

export  default downloadManager;