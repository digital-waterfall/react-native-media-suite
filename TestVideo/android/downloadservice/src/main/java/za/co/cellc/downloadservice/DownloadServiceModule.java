package za.co.cellc.downloadservice;

import android.net.Uri;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
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
import com.google.android.exoplayer2.upstream.cache.CacheSpan;
import com.google.android.exoplayer2.upstream.cache.ContentMetadata;
import com.google.android.exoplayer2.upstream.cache.NoOpCacheEvictor;
import com.google.android.exoplayer2.upstream.cache.SimpleCache;
import com.google.android.exoplayer2.util.Util;

import java.io.File;
import java.util.List;
import java.util.NavigableSet;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;

import za.co.cellc.downloadservice.downloader.DownloadTracker;

public class DownloadServiceModule extends ReactContextBaseJavaModule {

    protected String userAgent;

    private File downloadDirectory;
    private Cache downloadCache;
    private DownloadManager downloadManager;
    private DownloadTracker downloadTracker;
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
    ReactApplicationContext ctx = null;

    public DownloadServiceModule(ReactApplicationContext reactContext) {
        super(reactContext);
        ctx = reactContext;
        userAgent = Util.getUserAgent(reactContext, "MediaDownloader");
        downloadManager = getDownloadManager();
    }


    public DownloadManager getDownloadManager() {
        initDownloadManager();
        return downloadManager;
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
    public void downloadStream(String videoUri, String downloadId){
        Uri movieUri = Uri.parse(videoUri);
        //downloadTracker.toggleDownload(downloadId, movieUri, ".mpd" );
        DownloadAction downloadAction = downloadTracker.getDownloadAction(downloadId, movieUri, ".mpd");
        downloadManager.handleAction(downloadAction);
        downloadManager.startDownloads();

        new Timer().scheduleAtFixedRate(new TimerTask(){
            @Override
            public void run(){
                DownloadManager.TaskState[] taskStates = downloadManager.getAllTaskStates();
                if(taskStates.length > 0) {
                    DownloadManager.TaskState taskState = taskStates[0];
                    WritableMap params = Arguments.createMap();
                    params.putDouble("percentComplete", taskState.downloadPercentage);
                    ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDownloadProgress", params);
                }
            }
        },0,1000);
    }

    @ReactMethod
    public void getProgress(String videoUri, Callback callback){
        //Uri movieUri = Uri.parse(videoUri);
        //Boolean isDownloaded = downloadTracker.isDownloaded(movieUri);
        DownloadManager.TaskState[] taskStates = downloadManager.getAllTaskStates();
        if(taskStates.length > 0) {
            DownloadManager.TaskState taskState = taskStates[0];
            callback.invoke(taskState.downloadPercentage);
        }
    }

    @ReactMethod
    public void getCachedStreamFile(String videoUri, Callback callback){
        Uri movieUri = Uri.parse(videoUri);
        List<String> offlineStreamKeys = downloadTracker.getOfflineStreamKeys(movieUri);
        Set<String> keys = downloadCache.getKeys();
        NavigableSet<CacheSpan> cachedSpans = downloadCache.getCachedSpans(videoUri);

        callback.invoke(cachedSpans.first().file.getAbsolutePath());
    }

    @Override
    public String getName(){
        return "MediaDownloader";
    }
}