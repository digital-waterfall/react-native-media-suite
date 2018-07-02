package za.co.digitalwaterfall.reactnativemediasuite.mediadownloader;

import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.exoplayer2.C;
import com.google.android.exoplayer2.offline.DownloadAction;
import com.google.android.exoplayer2.offline.DownloadManager;
import com.google.android.exoplayer2.offline.DownloaderConstructorHelper;
import com.google.android.exoplayer2.offline.FilteringManifestParser;
import com.google.android.exoplayer2.offline.ProgressiveDownloadAction;
import com.google.android.exoplayer2.source.ExtractorMediaSource;
import com.google.android.exoplayer2.source.MediaSource;
import com.google.android.exoplayer2.source.dash.DashMediaSource;
import com.google.android.exoplayer2.source.dash.DefaultDashChunkSource;
import com.google.android.exoplayer2.source.dash.manifest.DashManifestParser;
import com.google.android.exoplayer2.source.dash.manifest.RepresentationKey;
import com.google.android.exoplayer2.source.dash.offline.DashDownloadAction;
import com.google.android.exoplayer2.source.hls.HlsMediaSource;
import com.google.android.exoplayer2.source.hls.offline.HlsDownloadAction;
import com.google.android.exoplayer2.source.hls.playlist.HlsPlaylistParser;
import com.google.android.exoplayer2.source.hls.playlist.RenditionKey;
import com.google.android.exoplayer2.source.smoothstreaming.DefaultSsChunkSource;
import com.google.android.exoplayer2.source.smoothstreaming.SsMediaSource;
import com.google.android.exoplayer2.source.smoothstreaming.manifest.SsManifestParser;
import com.google.android.exoplayer2.source.smoothstreaming.manifest.StreamKey;
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
import java.util.List;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

import za.co.digitalwaterfall.reactnativemediasuite.mediadownloader.downloader.DownloadTracker;

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
    private static final String TAG = "DownloaderModule";

    protected String userAgent;

    private File downloadDirectory;
    private Cache downloadCache;
    private DownloadManager downloadManager;
    private DownloadTracker downloadTracker;
    private SharedPreferences sharedPref;
    private static MediaDownloaderModule instance;

    ReactApplicationContext ctx = null;

    public MediaDownloaderModule(ReactApplicationContext reactContext) {
        super(reactContext);
        ctx = reactContext;
        sharedPref = ctx.getSharedPreferences(TAG, Context.MODE_PRIVATE);
        userAgent = Util.getUserAgent(reactContext, "MediaDownloader");
        downloadManager = getDownloadManager();
    }

    public static MediaDownloaderModule newInstance(ReactApplicationContext reactContext){
        if(instance == null){
            instance = new MediaDownloaderModule(reactContext);
        }
        return instance;
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

    private void mapDownloadID(String uuid, String videoUri){
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString(uuid,videoUri);
        editor.commit();
    }

    private void removeDownloadID(String uuid){
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.remove(uuid);
        editor.commit();
    }

    private String getUri(String uuid){
        return sharedPref.getString(uuid, null);
    }

    private String getDownloadID(String uri) {
        Map<String,?> keys = sharedPref.getAll();
        for(Map.Entry<String,?> entry : keys.entrySet()){
            if(entry.getValue().toString().equals(uri)){
                return entry.getKey();
            }
        }
        return null;
    }

    private void onDownloadProgressEvent(String downloadID, float progress){
        WritableMap params = Arguments.createMap();
        params.putString("downloadID", downloadID);
        params.putDouble("percentComplete", progress);
        ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDownloadProgress", params);
    }

    private void onDownloadFinishedEvent(String downloadID, long downloadedBytes){
        WritableMap params = Arguments.createMap();
        params.putString("downloadID", downloadID);
        params.putDouble("size", downloadedBytes);
        //TODO: Add local path of downloaded file
        params.putString("downloadLocation", "N/A");
        ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDownloadFinished", params);
    }

    private void onDownloadCancelledEvent(String downloadID){
        WritableMap params = Arguments.createMap();
        params.putString("downloadID", downloadID);
        ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDownloadCancelled", params);
    }

    private void onDownloadStartedEvent(String downloadID){
        WritableMap params = Arguments.createMap();
        params.putString("downloadID", downloadID);
        ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDownloadStarted", params);
    }

    private void onDownloadErrorEvent(String downloadID, String errorType, String error){
        WritableMap params = Arguments.createMap();
        params.putString("error", error);
        params.putString("errorType", errorType);
        params.putString("downloadID", downloadID);
        ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDownloadError", params);
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
            downloadManager.addListener(new DownloadManager.Listener() {
                @Override
                public void onInitialized(DownloadManager downloadManager) {

                }

                @Override
                public void onTaskStateChanged(DownloadManager downloadManager, DownloadManager.TaskState taskState) {
                    Log.d(TAG, taskState.toString());
                    String downloadID = getDownloadID(taskState.action.uri.toString());
                    if (ctx.hasActiveCatalystInstance()) {
                        if (taskState.state == DownloadManager.TaskState.STATE_COMPLETED) {
                            if(taskState.downloadPercentage == 100) {
                                if(downloadID != null){
                                    onDownloadProgressEvent(downloadID, 100);
                                    onDownloadFinishedEvent(downloadID, taskState.downloadedBytes);
                                    String extension = taskState.action.uri.toString().substring(taskState.action.uri.toString().lastIndexOf("."));
                                    downloadTracker.addDownloadTracking(downloadID, taskState.action.uri,  extension);
                                }
                            }
                        } else if (taskState.state == DownloadManager.TaskState.STATE_STARTED) {
                            if(!taskState.action.isRemoveAction && taskState.downloadPercentage == -1) {
                                if(downloadID != null) {
                                    onDownloadStartedEvent(downloadID);
                                }
                            } else {
                                Log.d(TAG, "Started remove action");
                            }
                        } else if (taskState.state == DownloadManager.TaskState.STATE_CANCELED){
                            if(downloadID != null) {
                                onDownloadCancelledEvent(downloadID);
                                removeDownloadID(downloadID);
                            }
                        } else {
                            Log.d(TAG, "Unused state change");
                        }
                    }
                }

                @Override
                public void onIdle(DownloadManager downloadManager) {

                }
            });
            downloadTracker.addListener(new DownloadTracker.Listener() {
                @Override
                public void onDownloadsChanged() {
                    Log.d(TAG,"onDownloadsChanged");
                }

            });
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
                        if (taskStates[i].state == DownloadManager.TaskState.STATE_STARTED && !taskStates[i].action.isRemoveAction) {
                            String downloadID = getDownloadID(taskStates[i].action.uri.toString());
                            if(downloadID != null && taskStates[i].downloadPercentage > 0) {
                                onDownloadProgressEvent(downloadID, taskStates[i].downloadPercentage);
                            }
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

    private DownloadManager.TaskState getActiveTaskState(Uri videoUri){
        DownloadManager.TaskState[] taskStates = downloadManager.getAllTaskStates();
        for (int i = 0; i < taskStates.length; i++) {
            if(taskStates[i].action.uri.equals(videoUri)){
                return taskStates[i];
            }
        }
        return null;
    }

    public MediaSource getDownloadedMediaSource(String uri){
        Uri videoUri = Uri.parse(uri);
        String ext = "mpd";
        return buildMediaSource(videoUri, ext);
    }

    private List<?> getOfflineStreamKeys(Uri uri) {
        return downloadTracker.getOfflineStreamKeys(uri );
    }


    @SuppressWarnings("unchecked")
    private MediaSource buildMediaSource(Uri uri, @Nullable String overrideExtension) {
        @C.ContentType int type = Util.inferContentType(uri, overrideExtension);
        switch (type) {
            case C.TYPE_DASH:
                return new DashMediaSource.Factory(
                        new DefaultDashChunkSource.Factory(buildDataSourceFactory(null)),
                        buildDataSourceFactory(null))
                        .setManifestParser(
                                new FilteringManifestParser<>(
                                        new DashManifestParser(), (List<RepresentationKey>) getOfflineStreamKeys(uri)))
                        .createMediaSource(uri);
            case C.TYPE_SS:
                return new SsMediaSource.Factory(
                        new DefaultSsChunkSource.Factory(buildDataSourceFactory(null)),
                        buildDataSourceFactory(null))
                        .setManifestParser(
                                new FilteringManifestParser<>(
                                        new SsManifestParser(), (List<StreamKey>) getOfflineStreamKeys(uri)))
                        .createMediaSource(uri);
            case C.TYPE_HLS:
                return new HlsMediaSource.Factory(buildDataSourceFactory(null))
                        .setPlaylistParser(
                                new FilteringManifestParser<>(
                                        new HlsPlaylistParser(), (List<RenditionKey>) getOfflineStreamKeys(uri)))
                        .createMediaSource(uri);
            case C.TYPE_OTHER:
                return new ExtractorMediaSource.Factory(buildDataSourceFactory(null)).createMediaSource(uri);
            default: {
                throw new IllegalStateException("Unsupported type: " + type);
            }
        }
    }

    @ReactMethod
    public void downloadStreamWithBitRate(String videoUri, String downloadID, int bitRate){
        //TODO: Implement bitrate
        downloadStream(videoUri,downloadID);
    }

    @ReactMethod
    public void downloadStream(String uri, String downloadID){
        final Uri videoUri = Uri.parse(uri);

        if(getDownloadID(uri) != null && downloadID != getDownloadID(uri)){
            onDownloadErrorEvent(downloadID,"DUPLICATE_DOWNLOAD","Duplicate asset for the uri found.");
            return;
        }

        Boolean isDownloaded = downloadTracker.isDownloaded(videoUri);

        if(isDownloaded){
            onDownloadErrorEvent(downloadID,"ALREADY_DOWNLOADED","The asset is already downloaded");
            onDownloadProgressEvent(downloadID, 100);
            return;
        }

        DownloadManager.TaskState activeTaskState = getActiveTaskState(videoUri);
        if(activeTaskState == null){
            DownloadAction downloadAction = downloadTracker.getDownloadAction(downloadID, videoUri, uri.substring(uri.lastIndexOf(".")));
            mapDownloadID(downloadID, uri);
            downloadManager.handleAction(downloadAction);
            downloadManager.startDownloads();
        } else if (activeTaskState.state == DownloadManager.TaskState.STATE_STARTED) {
            onDownloadErrorEvent(downloadID, "DOWNLOAD_IN_PROGRESS", "The asset download is in progress");
        }
    }

    @ReactMethod
    public void pauseDownload(final String downloadID){
        String uri = getUri(downloadID);
        Uri videoUri = Uri.parse(uri);
        DownloadManager.TaskState activeTaskState = getActiveTaskState(videoUri);
        if(activeTaskState != null && activeTaskState.state == DownloadManager.TaskState.STATE_STARTED) {
            //TODO: Develop pause functionality per video, currently all downloads will be paused
            downloadManager.stopDownloads();
        }
    }

    @ReactMethod
    public void resumeDownload(final String downloadID){
        String uri = getUri(downloadID);
        Uri videoUri = Uri.parse(uri);
        DownloadManager.TaskState activeTaskState = getActiveTaskState(videoUri);
        if(activeTaskState != null && activeTaskState.state == DownloadManager.TaskState.STATE_QUEUED){
            //TODO: Develop start functionality per video, currently all downloads will be started
            downloadManager.startDownloads();
        }
    }

    @ReactMethod
    public void cancelDownload(final String downloadID){
        deleteDownloadedStream(downloadID);
    }

    @ReactMethod
    public void deleteDownloadedStream(final String downloadID){
        String uri = getUri(downloadID);
        Uri videoUri = Uri.parse(uri);
        String extension = uri.substring(uri.lastIndexOf("."));
        DownloadAction removeDownloadAction = downloadTracker.getRemoveDownloadAction(downloadID, videoUri, extension);
        downloadManager.handleAction(removeDownloadAction);
        downloadTracker.removeDownloadTracking(downloadID, videoUri, extension);
        onDownloadProgressEvent(downloadID,0);
    }

    @Override
    public String getName(){
        return "MediaDownloader";
    }
}
