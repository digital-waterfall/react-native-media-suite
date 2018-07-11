import _ from 'lodash';

export const downloadStates = Object.freeze({
    initialized: 'INITIALIZED',
    started: 'STARTED',
    downloading: 'DOWNLOADING',
    downloaded: 'DOWNLOADED',
    paused: 'PAUSED',
    failed: 'FAILED',
    deleted: 'DELETED'
});

export const eventListenerTypes = Object.freeze({
    started: 'STARTED',
    progress: 'PROGRESS',
    finished: 'FINISHED',
    error: 'ERROR',
    cancelled: 'CANCELLED',
    deleted: 'DELETED'
});

export default class Download {
    constructor(downloadID, remoteURL, state, bitRate, nativeDownloader) {
        this.downloadID = downloadID;
        this.remoteURL = remoteURL;
        this.state = state;
        this.bitRate = bitRate || 0;

        this.nativeDownloader = nativeDownloader;

        this.startedListeners = [];
        this.progressListeners = [];
        this.finishedListeners = [];
        this.errorListeners = [];
        this.cancelledListeners = [];
        this.deletedListeners = [];

        this.startedTimeStamp = null;
        this.finishedTimeStamp = null;
        this.erroredTimeStamp = null;

        this.start = this.start.bind(this);
        this.pause = this.pause.bind(this);
        this.resume = this.resume.bind(this);
        this.cancel = this.cancel.bind(this);
        this.delete = this.delete.bind(this);
        this.isDeleted = this.isDeleted.bind(this);
        this.destructor = this.destructor.bind(this);
        this.addEventListener = this.addEventListener.bind(this);

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
    }

    start() {
        this.isDeleted();

        if (this.bitRate) {
            this.nativeDownloader.downloadStreamWithBitRate(this.remoteURL, this.downloadID, this.bitRate)
        } else {
            this.nativeDownloader.downloadStream(this.remoteURL, this.downloadID);
        }
    }

    pause() {
        this.isDeleted();

        this.nativeDownloader.pauseDownload(this.downloadID);
        this.state = downloadStates.paused;
    }

    resume() {
        this.isDeleted();

        this.nativeDownloader.resumeDownload(this.downloadID);
        this.state = downloadStates.downloading;
    }

    cancel() {
        this.isDeleted();

        this.nativeDownloader.cancelDownload(this.downloadID);
    }

    delete() {
        this.isDeleted();

        this.nativeDownloader.deleteDownloadedStream(this.downloadID);
        _.forEach(this.deletedListeners, listener => listener());
        this.destructor();
    }

    isDeleted() {
        if (this.state === downloadStates.deleted || !this.state) throw 'Download has been deleted.'
    }

    addEventListener(type, listener) {
        this.isDeleted();

        switch (type.toUpperCase()) {
            case eventListenerTypes.started:
                this.startedListeners.push(listener);
                break;
            case eventListenerTypes.progress:
                this.progressListeners.push(listener);
                break;
            case eventListenerTypes.finished:
                this.finishedListeners.push(listener);
                break;
            case eventListenerTypes.error:
                this.errorListeners.push(listener);
                break;
            case eventListenerTypes.cancelled:
                this.cancelledListeners.push(listener);
                break;
            case eventListenerTypes.deleted:
                this.deletedListeners.push(listener);
                break;
            default:
                throw 'Unknown event type passed to addEventListener';
        }
    }

    destructor() {
        this.downloadID = undefined;
        this.remoteURL = undefined;
        this.state = downloadStates.deleted;
        this.bitRate = undefined;
        this.progress = undefined;
        this.localURL = undefined;
        this.fileSize = undefined;
        this.errorType = undefined;
        this.errorMessage = undefined;

        this.nativeDownloader = undefined;
    }

    onDownloadStarted() {
        this.isDeleted();

        this.state = downloadStates.started;
        this.startedTimeStamp = Date.now();

        _.forEach(this.startedListeners, listener => listener());
    }

    onDownloadProgress(progress) {
        this.isDeleted();

        this.state = downloadStates.downloading;
        this.progress = progress;

        _.forEach(this.progressListeners, listener => listener(progress));
    }

    onDownloadFinished(downloadLocation, size) {
        this.isDeleted();

        this.state = downloadStates.downloaded;
        this.localURL = downloadLocation;
        this.fileSize = size;
        this.finishedTimeStamp = Date.now();

        _.forEach(this.finishedListeners, listener => listener());
    }

    onDownloadError(errorType, errorMessage) {
        this.isDeleted();

        this.state = downloadStates.failed;
        this.errorType = errorType;
        this.errorMessage = errorMessage;
        this.erroredTimeStamp = Date.now();

        _.forEach(this.errorListeners, listener => listener(errorType, errorMessage));
    }

    onDownloadCancelled() {
        this.isDeleted();

        _.forEach(this.cancelledListeners, listener => listener());

        this.destructor();
    }

    initialized() {
        this.isDeleted();

        return this.state === downloadStates.initialized;
    }

    started() {
        this.isDeleted();

        return this.state === downloadStates.started;
    }

    downloading() {
        this.isDeleted();

        return this.state === downloadStates.downloading;
    }

    downloaded() {
        this.isDeleted();

        return this.state === downloadStates.downloaded;
    }

    cancelled() {
        this.isDeleted();

        return this.state === downloadStates.cancelled;
    }

    paused() {
        this.isDeleted();

        return this.state === downloadStates.paused;
    }

    failed() {
        this.isDeleted();

        return this.state === downloadStates.failed;
    }
}