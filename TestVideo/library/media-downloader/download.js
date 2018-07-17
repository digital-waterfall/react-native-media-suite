import _ from 'lodash';

export const DOWNLOAD_STATES = Object.freeze({
    initialized: 'INITIALIZED',
    started: 'STARTED',
    downloading: 'DOWNLOADING',
    downloaded: 'DOWNLOADED',
    paused: 'PAUSED',
    failed: 'FAILED',
    deleted: 'DELETED'
});

export const EVENT_LISTENER_TYPES = Object.freeze({
    started: 'STARTED',
    progress: 'PROGRESS',
    finished: 'FINISHED',
    error: 'ERROR',
    cancelled: 'CANCELLED',
    deleted: 'DELETED'
});

export default class Download {
    constructor(downloadID, remoteURL, state, bitRate, nativeDownloader, restoreDownloadFields) {
        this.downloadID = downloadID.toString();
        this.remoteURL = remoteURL;
        this.state = state;
        this.bitRate = bitRate || 0;

        this.nativeDownloader = nativeDownloader;

        this.eventListeners = [];

        this.startedTimeStamp = null;
        this.finishedTimeStamp = null;
        this.erroredTimeStamp = null;
        this.progressTimeStamp = null;

        this.restoreDownload = this.restoreDownload.bind(this);
        this.start = this.start.bind(this);
        this.pause = this.pause.bind(this);
        this.resume = this.resume.bind(this);
        this.cancel = this.cancel.bind(this);
        this.delete = this.delete.bind(this);
        this.isDeleted = this.isDeleted.bind(this);
        this.destructor = this.destructor.bind(this);
        this.addEventListener = this.addEventListener.bind(this);
        this.removeEventListener = this.removeEventListener.bind(this);
        this.callEventListeners = this.callEventListeners.bind(this);

        this.onDownloadStarted = this.onDownloadStarted.bind(this);
        this.onDownloadProgress = this.onDownloadProgress.bind(this);
        this.onDownloadFinished = this.onDownloadFinished.bind(this);
        this.onDownloadCancelled = this.onDownloadCancelled.bind(this);

        this.initialized = this.initialized.bind(this);
        this.started = this.started.bind(this);
        this.downloading = this.downloading.bind(this);
        this.downloaded = this.downloaded.bind(this);
        this.cancelled = this.cancelled.bind(this);
        this.paused = this.paused.bind(this);
        this.failed = this.failed.bind(this);

        if (restoreDownloadFields) {
            this.restoreDownload(restoreDownloadFields);
        }
    }
    
    restoreDownload(downloadFields) {
        this.downloadID = downloadFields.downloadID;
            this.remoteURL = downloadFields.remoteURL;
            this.state = downloadFields.state;
            this.bitRate = downloadFields.bitRate;
            this.progress = downloadFields.progress;
            this.localURL = downloadFields.localURL;
            this.fileSize = downloadFields.fileSize;
            this.errorType = downloadFields.errorType;
            this.errorMessage = downloadFields.errorMessage;
            this.startedTimeStamp = downloadFields.startedTimeStamp;
            this.finishedTimeStamp = downloadFields.finishedTimeStamp;
            this.erroredTimeStamp = downloadFields.erroredTimeStamp;
            this.progressTimeStamp = downloadFields.progressTimeStamp;
    }

    start() {
        this.isDeleted('start');

        if (this.bitRate) {
            this.nativeDownloader.downloadStreamWithBitRate(this.remoteURL, this.downloadID, this.bitRate)
        } else {
            this.nativeDownloader.downloadStream(this.remoteURL, this.downloadID);
        }
    }

    pause() {
        this.isDeleted('pause');

        this.nativeDownloader.pauseDownload(this.downloadID);
        this.state = DOWNLOAD_STATES.paused;
    }

    resume() {
        this.isDeleted('resume');

        this.nativeDownloader.resumeDownload(this.downloadID);
        this.state = DOWNLOAD_STATES.downloading;
    }

    cancel() {
        this.isDeleted('cancel');

        this.nativeDownloader.cancelDownload(this.downloadID);
    }

    delete() {
        this.isDeleted('deleted');

        this.nativeDownloader.deleteDownloadedStream(this.downloadID);
        this.callEventListeners(EVENT_LISTENER_TYPES.deleted);
        this.destructor();
    }

    isDeleted(type) {
        console.warn('isDeleted called by:', type);
        if (this.state === DOWNLOAD_STATES.deleted || !this.state) throw 'Download has been deleted.'
    }

    addEventListener(type, listener) {
        this.isDeleted('addEventListener');

        this.eventListeners.push({type, listener});
    }

    removeEventListener(listener) {
        this.isDeleted('removeEventListener');
        _.remove(this.eventListeners, eventListener => eventListener === listener);
    }

    callEventListeners(type, data) {
        _.forEach(this.eventListeners, eventListener => {if(eventListener.type === type){return eventListener.listener(data)} });
    }

    destructor() {
        this.downloadID = undefined;
        this.remoteURL = undefined;
        this.state = DOWNLOAD_STATES.deleted;
        this.bitRate = undefined;
        this.progress = undefined;
        this.localURL = undefined;
        this.fileSize = undefined;
        this.errorType = undefined;
        this.errorMessage = undefined;

        this.nativeDownloader = undefined;
    }

    onDownloadStarted() {
        this.isDeleted('onDownloadStarted');

        this.state = DOWNLOAD_STATES.started;
        this.startedTimeStamp = Date.now();

        this.callEventListeners(EVENT_LISTENER_TYPES.started);
    }

    onDownloadProgress(progress) {
        this.isDeleted();

        this.state = DOWNLOAD_STATES.downloading;
        this.progress = progress;

        this.callEventListeners(EVENT_LISTENER_TYPES.progress, progress);
    }

    onDownloadFinished(downloadLocation, size) {
        this.isDeleted();

        this.state = DOWNLOAD_STATES.downloaded;
        this.localURL = downloadLocation;
        this.fileSize = size;
        this.finishedTimeStamp = Date.now();

        this.callEventListeners(EVENT_LISTENER_TYPES.finished, {downloadLocation, size});
    }

    onDownloadError(errorType, errorMessage) {
        this.isDeleted();

        this.state = DOWNLOAD_STATES.failed;
        this.errorType = errorType;
        this.errorMessage = errorMessage;
        this.erroredTimeStamp = Date.now();

        this.callEventListeners(EVENT_LISTENER_TYPES.error, {errorType, errorMessage});
    }

    onDownloadCancelled() {
        this.isDeleted();

        this.callEventListeners(EVENT_LISTENER_TYPES.cancelled);

        this.destructor();
    }

    initialized() {
        this.isDeleted();

        return this.state === DOWNLOAD_STATES.initialized;
    }

    started() {
        this.isDeleted();

        return this.state === DOWNLOAD_STATES.started;
    }

    downloading() {
        this.isDeleted();

        return this.state === DOWNLOAD_STATES.downloading;
    }

    downloaded() {
        this.isDeleted();

        return this.state === DOWNLOAD_STATES.downloaded;
    }

    cancelled() {
        this.isDeleted();

        return this.state === DOWNLOAD_STATES.cancelled;
    }

    paused() {
        this.isDeleted();

        return this.state === DOWNLOAD_STATES.paused;
    }

    failed() {
        this.isDeleted();

        return this.state === DOWNLOAD_STATES.failed;
    }
}