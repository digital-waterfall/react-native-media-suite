export const downloadStates = Object.freeze({
    initialized: 'INITIALIZED',
    started: 'STARTED',
    downloading: 'DOWNLOADING',
    downloaded: 'DOWNLOADED',
    cancelled: 'CANCELLED',
    paused: 'PAUSED',
    failed: 'FAILED'
});

export default class Download {
    constructor(downloadID, remoteURL, state, bitRate, nativeDownloader) {
        this.downloadID = downloadID;
        this.remoteURL = remoteURL;
        this.state = state;
        this.bitRate = bitRate || 0;

        this.nativeDownloader = nativeDownloader;

        this.start = this.start.bind(this);
        this.initialized = this.initialized.bind(this);
        this.started = this.started.bind(this);
        this.downloading = this.downloading.bind(this);
        this.downloaded = this.downloaded.bind(this);
        this.cancelled = this.cancelled.bind(this);
        this.paused = this.paused.bind(this);
        this.failed = this.failed.bind(this);
    }

    start() {
        if (this.bitRate) {
            this.nativeDownloader.downloadStreamWithBitRate(this.remoteURL, this.downloadID, this.bitRate)
        } else {
            this.nativeDownloader.downloadStream(this.remoteURL, this.downloadID);
        }
    }

    delete() {
        this.nativeDownloader.deleteDownloadedStream(this.downloadID);
        updateManager();
    }

    initialized() {
        return this.state === downloadStates.initialized;
    }

    started() {
        return this.state === downloadStates.started;
    }

    downloading() {
        return this.state === downloadStates.downloading;
    }

    downloaded() {
        return this.state === downloadStates.downloaded;
    }

    cancelled() {
        return this.state === downloadStates.cancelled;
    }

    paused() {
        return this.state === downloadStates.paused;
    }

    failed() {
        return this.state === downloadStates.failed;
    }
}