package za.co.digitalwaterfall.reactnativemediasuite.mediadownloader;

import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.exoplayer2.offline.*;

import com.google.android.exoplayer2.util.Log;
import za.co.digitalwaterfall.reactnativemediasuite.mediadownloader.downloader.DownloadTracker;
import za.co.digitalwaterfall.reactnativemediasuite.mediadownloader.downloader.DownloadUtil;
import java.util.List;
import java.util.Map;

import static za.co.digitalwaterfall.reactnativemediasuite.mediadownloader.downloader.DownloadUtil.TAG;

public class MediaDownloaderModule extends ReactContextBaseJavaModule {

    private static MediaDownloaderModule instance;
    ReactApplicationContext ctx = null;
    private DownloadTracker downloadTracker;
    private SharedPreferences sharedPref;

    public MediaDownloaderModule(ReactApplicationContext reactContext) {
        super(reactContext);
        ctx = reactContext;
        sharedPref = ctx.getSharedPreferences(TAG, Context.MODE_PRIVATE);
        downloadTracker = DownloadUtil.getDownloadTracker(reactContext);
    }

    public static MediaDownloaderModule newInstance(ReactApplicationContext reactContext){
        if(instance == null){
            instance = new MediaDownloaderModule(reactContext);
        }
        return instance;
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


//
//    public void downloadProgressUpdate(){
//        new Timer().scheduleAtFixedRate(new TimerTask(){
//            @Override
//            public void run(){
//                if (ctx.hasActiveCatalystInstance()) {
//                    List<Download> downloads = downloadManager.getCurrentDownloads();
//                    for (int i = 0; i < downloads.size(); i++) {
//                        if (downloads.get(i).state == Download.STATE_DOWNLOADING && !downloads.get(i).state != Download.STATE) {
//                            String downloadID = getDownloadID(downloads.get(i).request.uri.toString());
//                            if(downloadID != null && downloads.get(i).getPercentDownloaded() > 0) {
//                                onDownloadProgressEvent(downloadID, downloads.get(i).getPercentDownloaded());
//                            }
//                        }
//                    }
//                }
//
//            }
//        },0,1000);
//    }

//    private Download getCurrentDownload(Uri videoUri){
//        List<Download> downloads = downloadManager.getCurrentDownloads();
//        for (int i = 0; i < downloads.size(); i++) {
//            if(downloads.get(i).request.uri.equals(videoUri)){
//                return downloads.get(i);
//            }
//        }
//        return null;
//    }
//
//    public MediaSource getDownloadedMediaSource(String uri){
//        Uri videoUri = Uri.parse(uri);
//        String ext = "mpd";
//        return buildMediaSource(videoUri, ext);
//    }

//    private List<?> getOfflineStreamKeys(Uri uri) {
//        return downloadTracker.getOfflineStreamKeys(uri );
//    }


    @SuppressWarnings("unchecked")
//    private MediaSource buildMediaSource(Uri uri, @Nullable String overrideExtension) {
//        @C.ContentType int type = Util.inferContentType(uri, overrideExtension);
//        switch (type) {
//            case C.TYPE_DASH:
//                return new DashMediaSource.Factory(
//                        new DefaultDashChunkSource.Factory(buildDataSourceFactory(null)),
//                        buildDataSourceFactory(null))
//                        .setManifestParser(
//                                new FilteringManifestParser<>(
//                                        new DashManifestParser(), (List<RepresentationKey>) getOfflineStreamKeys(uri)))
//                        .createMediaSource(uri);
//            case C.TYPE_SS:
//                return new SsMediaSource.Factory(
//                        new DefaultSsChunkSource.Factory(buildDataSourceFactory(null)),
//                        buildDataSourceFactory(null))
//                        .setManifestParser(
//                                new FilteringManifestParser<>(
//                                        new SsManifestParser(), (List<StreamKey>) getOfflineStreamKeys(uri)))
//                        .createMediaSource(uri);
//            case C.TYPE_HLS:
//                return new HlsMediaSource.Factory(buildDataSourceFactory(null))
//                        .setPlaylistParser(
//                                new FilteringManifestParser<>(
//                                        new HlsPlaylistParser(), (List<RenditionKey>) getOfflineStreamKeys(uri)))
//                        .createMediaSource(uri);
//            case C.TYPE_OTHER:
//                return new ExtractorMediaSource.Factory(buildDataSourceFactory(null)).createMediaSource(uri);
//            default: {
//                throw new IllegalStateException("Unsupported type: " + type);
//            }
//        }
//    }

//    private String getDownloadID(String uri) {
//        Map<String,?> keys = sharedPref.getAll();
//        for(Map.Entry<String,?> entry : keys.entrySet()){
//            if(entry.getValue().toString().equals(uri)){
//                return entry.getKey();
//            }
//        }
//        return null;
//    }

    private String getUri(String uuid){
//        return sharedPref.getString(uuid, null);
        return "";
    }

    @ReactMethod
    public void downloadStreamWithBitRate(String videoUri, String downloadID, int bitRate){
        //TODO: Implement bitrate
        downloadStream(videoUri,downloadID);
    }

    @ReactMethod
    public void downloadStream(String uri, String downloadID){
        final Uri videoUri = Uri.parse(uri);

        Boolean isDownloaded = downloadTracker.isDownloaded(downloadID);
        if(isDownloaded){
            onDownloadErrorEvent(downloadID,"ALREADY_DOWNLOADED","The asset is already downloaded");
            onDownloadProgressEvent(downloadID, 100);
            return;
        }

        Download download = downloadTracker.getDownload(downloadID);
        if(download == null){
            downloadTracker.toggleDownload(downloadID, videoUri);
        } else if (download.state == Download.STATE_DOWNLOADING) {
            onDownloadErrorEvent(downloadID, "ALREADY_DOWNLOADED", "The asset is already downloading");
        } else {
            Log.d(TAG, "Download not started");
        }
    }

    @ReactMethod
    public void pauseDownload(final String downloadID){
        Download download = downloadTracker.getDownload(downloadID);
        if(download == null){
            onDownloadErrorEvent(downloadID,"NOT_FOUND","Download does not exist.");
            return;
        }

        if(download.state == Download.STATE_DOWNLOADING) {
            downloadTracker.pauseDownload(downloadID);
        }
    }

    @ReactMethod
    public void resumeDownload(final String downloadID){
        Download download = downloadTracker.getDownload(downloadID);
        if(download == null){
            onDownloadErrorEvent(downloadID,"NOT_FOUND","Download does not exist.");
            return;
        }

        if(download.state == Download.STATE_QUEUED){
            downloadTracker.resumeDownload(downloadID);
        }
    }

    @ReactMethod
    public void cancelDownload(final String downloadID){
        deleteDownloadedStream(downloadID);
    }

    @ReactMethod
    public void deleteDownloadedStream(final String downloadID){
        Download download = downloadTracker.getDownload(downloadID);
        if(download == null){
            onDownloadErrorEvent(downloadID,"NOT_FOUND","Download does not exist.");
            return;
        }
        downloadTracker.deleteDownload(downloadID);
        onDownloadProgressEvent(downloadID,0);
    }

    @ReactMethod
    public void checkIfStillDownloaded(ReadableArray downloadIDs, final Promise promise) {
        WritableArray isDownloadedDownloadIDs = Arguments.createArray();
        for (int i=0; i<downloadIDs.size(); i++) {
            String stringId = downloadIDs.getString(i);
            if (stringId != null) {
                if (downloadTracker.isDownloaded(stringId)) {
                    isDownloadedDownloadIDs.pushString(stringId);
                }
            }
        }
        promise.resolve(isDownloadedDownloadIDs);
    }

    @Override
    public String getName(){
        return "MediaDownloader";
    }
}
