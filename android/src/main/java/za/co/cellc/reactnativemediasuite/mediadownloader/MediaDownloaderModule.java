package za.co.cellc.reactnativemediasuite.mediadownloader;

import android.net.Uri;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.exoplayer2.offline.DownloadAction;
import com.google.android.exoplayer2.offline.DownloadManager;
import com.google.android.exoplayer2.offline.DownloaderConstructorHelper;
import com.google.android.exoplayer2.offline.ProgressiveDownloadAction;
import com.google.android.exoplayer2.source.dash.offline.DashDownloadAction;
import com.google.android.exoplayer2.source.hls.offline.HlsDownloadAction;
import com.google.android.exoplayer2.source.smoothstreaming.offline.SsDownloadAction;
import com.google.android.exoplayer2.upstream.DataSource;
import com.google.android.exoplayer2.upstream.DefaultDataSourceFactory;
import com.google.android.exoplayer2.upstream.DefaultHttpDataSourceFactory;
import com.google.android.exoplayer2.upstream.FileDataSourceFactory;
import com.google.android.exoplayer2.upstream.HttpDataSource;
import com.google.android.exoplayer2.upstream.TransferListener;
import com.google.android.exoplayer2.upstream.cache.Cache;
import com.google.android.exoplayer2.upstream.cache.CacheDataSource;
import com.google.android.exoplayer2.upstream.cache.CacheDataSourceFactory;
import com.google.android.exoplayer2.upstream.cache.NoOpCacheEvictor;
import com.google.android.exoplayer2.upstream.cache.SimpleCache;
import com.google.android.exoplayer2.util.Util;

import java.io.File;
import java.util.Timer;
import java.util.TimerTask;

import za.co.cellc.reactnativemediasuite.mediadownloader.downloader.DownloadTracker;

public class MediaDownloaderModule extends ReactContextBaseJavaModule {

    private static final String DOWNLOAD_ACTION_FILE = "actions";
    private static final String DOWNLOAD_TRACKER_ACTION_FILE = "tracked_actions";
    private static final String DOWNLOAD_CONTENT_DIRECTORY = "downloads";
    private static final int MAX_SIMULTANEOUS_DOWNLOADS = 2;
    private static final DownloadAction.Deserializer[] DOWNLOAD_DESERIALIZERS =
            new DownloadAction.Deserializer[] {
                    DashDownloadAction.DESERIALIZER,
                    HlsDownloadAction.DESERIALIZER,
                    SsDownloadAction.DESERIALIZER,
                    ProgressiveDownloadAction.DESERIALIZER
            };

    protected String userAgent;

    private File downloadDirectory;
    private Cache downloadCache;
    private DownloadManager downloadManager;
    private DownloadTracker downloadTracker;

    ReactApplicationContext ctx = null;

    public MediaDownloaderModule(ReactApplicationContext reactContext) {
        super(reactContext);
        ctx = reactContext;
        userAgent = Util.getUserAgent(reactContext, "MediaDownloader");
        downloadManager = getDownloadManager();
    }

    public DownloadManager getDownloadManager() {
        initDownloadManager();
        return downloadManager;
    }

    public DownloadTracker getDownloadTracker() {
        initDownloadManager();
        return downloadTracker;
    }

    private synchronized Cache getDownloadCache() {
        if (downloadCache == null) {
            File downloadContentDirectory = new File(getDownloadDirectory(), DOWNLOAD_CONTENT_DIRECTORY);
            downloadCache = new SimpleCache(downloadContentDirectory, new NoOpCacheEvictor());
        }
        return downloadCache;
    }

    private File getDownloadDirectory() {
        if (downloadDirectory == null) {
            downloadDirectory = ctx.getExternalFilesDir(null);
            if (downloadDirectory == null) {
                downloadDirectory = ctx.getFilesDir();
            }
        }
        return downloadDirectory;
    }

    private synchronized void initDownloadManager() {
        if (downloadManager == null) {
            DownloaderConstructorHelper downloaderConstructorHelper =
                    new DownloaderConstructorHelper(
                            getDownloadCache(), buildHttpDataSourceFactory(/* listener= */ null));
            downloadManager =
                    new DownloadManager(
                            downloaderConstructorHelper,
                            MAX_SIMULTANEOUS_DOWNLOADS,
                            DownloadManager.DEFAULT_MIN_RETRY_COUNT,
                            new File(getDownloadDirectory(), DOWNLOAD_ACTION_FILE),
                            DOWNLOAD_DESERIALIZERS);
            downloadTracker =
                    new DownloadTracker(
                            /* context= */ ctx,
                            buildDataSourceFactory(/* listener= */ null),
                            new File(getDownloadDirectory(), DOWNLOAD_TRACKER_ACTION_FILE),
                            DOWNLOAD_DESERIALIZERS);
            downloadManager.addListener(downloadTracker);
            downloadManager.startDownloads();
            downloadProgressUpdate();
        }

    }

    /** Returns a {@link HttpDataSource.Factory}. */
    public HttpDataSource.Factory buildHttpDataSourceFactory(
            TransferListener<? super DataSource> listener) {
        return new DefaultHttpDataSourceFactory(userAgent, listener);
    }

    /** Returns a {@link DataSource.Factory}. */
    public DataSource.Factory buildDataSourceFactory(TransferListener<? super DataSource> listener) {
        DefaultDataSourceFactory upstreamFactory =
                new DefaultDataSourceFactory(ctx, listener, buildHttpDataSourceFactory(listener));
        return buildReadOnlyCacheDataSource(upstreamFactory, getDownloadCache());
    }

    public void downloadProgressUpdate(){
        new Timer().scheduleAtFixedRate(new TimerTask(){
            @Override
            public void run(){
                if (ctx.hasActiveCatalystInstance()) {
                    DownloadManager.TaskState[] taskStates = downloadManager.getAllTaskStates();
                    for (int i = 0; i < taskStates.length; i++) {
                        if (taskStates[i].state == 1) {
                            WritableMap params = Arguments.createMap();
                            params.putString("downloadID", taskStates[i].action.uri.toString());
                            params.putDouble("percentComplete", taskStates[i].downloadPercentage);
                            ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDownloadProgress", params);
                        }
                    }
                }

            }
        },0,1000);
    }

    private static CacheDataSourceFactory buildReadOnlyCacheDataSource(
            DefaultDataSourceFactory upstreamFactory, Cache cache) {
        return new CacheDataSourceFactory(
                cache,
                upstreamFactory,
                new FileDataSourceFactory(),
                /* cacheWriteDataSinkFactory= */ null,
                CacheDataSource.FLAG_IGNORE_CACHE_ON_ERROR,
                /* eventListener= */ null);
    }

    @ReactMethod
    public void downloadStream(String videoUri){
        final Uri movieUri = Uri.parse(videoUri);

        Boolean isDownloaded = downloadTracker.isDownloaded(movieUri);

        if(isDownloaded){
            WritableMap params = Arguments.createMap();
            params.putString("error", "The asset is already downloaded");
            params.putString("errorType", "ALREADY_DOWNLOADED");
            params.putString("downloadID", videoUri);
            ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDownloadError", params);
            return;
        }

        DownloadManager.TaskState[] taskStates = downloadManager.getAllTaskStates();
        DownloadManager.TaskState taskState = null;
        for (int i = 0; i < taskStates.length; i++) {
            if(taskStates[i].action.uri.equals(movieUri)){
                taskState = taskStates[i];
                break;
            }
        }
        if(taskState == null){
            DownloadAction downloadAction = downloadTracker.getDownloadAction(videoUri, movieUri, ".mpd");
            int taskId = downloadManager.handleAction(downloadAction);
        } else if (taskState.state == DownloadManager.TaskState.STATE_STARTED) {
            WritableMap params = Arguments.createMap();
            params.putString("error", "The asset download is in progress");
            params.putString("errorType", "DOWNLOAD_IN_PROGRESS");
            params.putString("downloadID", videoUri);
            ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDownloadError", params);
        }
    }

    @ReactMethod
    public void pauseDownload(final String videoUri){
        Uri movieUri = Uri.parse(videoUri);
        DownloadManager.TaskState[] taskStates = downloadManager.getAllTaskStates();
        Boolean isDownloading = false;
        for (int i = 0; i < taskStates.length; i++) {
            if(taskStates[i].action.uri.equals(movieUri)){
                if(taskStates[i].state == DownloadManager.TaskState.STATE_STARTED) {
                    isDownloading = true;
                }
                break;
            }
        }
        if(isDownloading) {
            downloadManager.stopDownloads();

        }
    }

    @ReactMethod
    public void resumeDownload(final String videoUri){
        Uri movieUri = Uri.parse(videoUri);
        DownloadManager.TaskState[] taskStates = downloadManager.getAllTaskStates();
        Boolean isDownloaded = downloadTracker.isDownloaded(movieUri);
        Boolean isDownloading = false;
        for (int i = 0; i < taskStates.length; i++) {
            if(taskStates[i].action.uri.equals(movieUri)){
                if(taskStates[i].state == 1){
                    isDownloading = true;
                }
                break;
            }
        }
        if(!isDownloading && !isDownloaded) {
            downloadManager.startDownloads();
        }
    }

//    @ReactMethod
//    public void cancelDownload(final String videoUri){
//        Uri movieUri = Uri.parse(videoUri);
//        DownloadManager.TaskState[] taskStates = downloadManager.getAllTaskStates();
//        Boolean isDownloaded = downloadTracker.isDownloaded(movieUri);
//        Boolean isDownloading = false;
//        for (int i = 0; i < taskStates.length; i++) {
//            if(taskStates[i].action.uri.equals(movieUri)){
//                if(taskStates[i].state == 1){
//                    isDownloading = true;
//                }
//                break;
//            }
//        }
//        if(!isDownloaded) {
//            downloadCache.();
//        }
//    }

    @Override
    public String getName(){
        return "MediaDownloader";
    }
}