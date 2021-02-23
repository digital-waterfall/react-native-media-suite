package za.co.digitalwaterfall.reactnativemediasuite.mediadownloader.downloader;

import android.content.Context;
import android.net.Uri;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import android.util.Log;

import static com.google.android.exoplayer2.util.Assertions.checkNotNull;

import com.google.android.exoplayer2.DefaultRenderersFactory;
import com.google.android.exoplayer2.MediaItem;
import com.google.android.exoplayer2.offline.*;
import com.google.android.exoplayer2.trackselection.MappingTrackSelector;
import com.google.android.exoplayer2.upstream.HttpDataSource;
import com.google.android.exoplayer2.util.Util;
import java.io.IOException;
import java.util.HashMap;
import java.util.concurrent.CopyOnWriteArraySet;

public class DownloadTracker {

    public interface Listener {
        void onDownloadsChanged();
    }

    private static final String TAG = "DownloadTracker";

    private final Context context;
    private final HttpDataSource.Factory httpDataSourceFactory;
    private final CopyOnWriteArraySet<Listener> listeners;
    private final HashMap<String, Download> downloads;
    private final DownloadIndex downloadIndex;
    @Nullable private StartDownloadHelper startDownloadHelper;

    public DownloadTracker(Context context, HttpDataSource.Factory httpDataSourceFactory, DownloadManager downloadManager) {
        this.context = context;
        this.httpDataSourceFactory = httpDataSourceFactory;
        listeners = new CopyOnWriteArraySet<>();
        downloads = new HashMap<>();
        downloadIndex = downloadManager.getDownloadIndex();
        downloadManager.addListener(new DownloadManagerListener());
        loadDownloads();
    }

    public void addListener(Listener listener) {
        checkNotNull(listener);
        listeners.add(listener);
    }

    public void removeListener(Listener listener) {
        listeners.remove(listener);
    }

    public boolean isDownloaded(String downloadId) {
        @Nullable Download download = downloads.get(downloadId);
        return download != null && download.state != Download.STATE_FAILED;
    }

    public String getDownloadID(String uri) {
        return "";
    }

    public Download getDownload(String downloadId) {
        try {
            return downloadIndex.getDownload(downloadId);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    private DownloadHelper getDownloadHelper(Uri uri) {
        return DownloadHelper.forMediaItem(context, MediaItem.fromUri(uri), new DefaultRenderersFactory(context), httpDataSourceFactory);
    }

    @Nullable
    public DownloadRequest getDownloadRequest(String downloadId, Uri uri) {
        @Nullable Download download = downloads.get(uri);
        return download != null && download.state != Download.STATE_FAILED ? download.request : null;
    }

    public void toggleDownload(String downloadId, Uri uri) {
        @Nullable Download download = downloads.get(uri);
        if(download != null && download.state != Download.STATE_FAILED){

        } else {
            if(startDownloadHelper != null) {
                startDownloadHelper.release();
            }
            DownloadHelper downloadHelper = getDownloadHelper(uri);
            startDownloadHelper = new StartDownloadHelper( downloadHelper, downloadId);
        }
    }

    public void pauseDownload(String downloadId) {
        DownloadService.sendSetStopReason(context, NativeDownloadService.class, downloadId, Download.STATE_STOPPED, false);
    }

    public void resumeDownload(String downloadId) {
        DownloadService.sendSetStopReason(context, NativeDownloadService.class, downloadId, Download.STOP_REASON_NONE,/* foreground= */ false);
    }

    public void deleteDownload(String downloadId) {
        DownloadService.sendRemoveDownload(context, NativeDownloadService.class, downloadId, false);
    }

    private void startServiceWithRequest(DownloadRequest request) {
        DownloadService.sendAddDownload(context, NativeDownloadService.class, request, false);
    }

    private void loadDownloads() {
        try (DownloadCursor loadedDownloads = downloadIndex.getDownloads()) {
            while (loadedDownloads.moveToNext()) {
                Download download = loadedDownloads.getDownload();
                downloads.put(download.request.id, download);
            }
        } catch (IOException e) {
            Log.w(TAG, "Failed to query downloads", e);
        }
    }

    private class DownloadManagerListener implements DownloadManager.Listener {

        @Override
        public void onDownloadChanged(
                @NonNull DownloadManager downloadManager,
                @NonNull Download download,
                @Nullable Exception finalException) {
            downloads.put(download.request.id, download);
            for (Listener listener : listeners) {
                listener.onDownloadsChanged();
            }
        }

        @Override
        public void onDownloadRemoved(
                @NonNull DownloadManager downloadManager, @NonNull Download download) {
            downloads.remove(download.request.id);
            for (Listener listener : listeners) {
                listener.onDownloadsChanged();
            }
        }
    }


    private final class StartDownloadHelper implements DownloadHelper.Callback {

        private final DownloadHelper downloadHelper;
        private final String contentId;



        public StartDownloadHelper(DownloadHelper downloadHelper,String contentId) {
            this.downloadHelper = downloadHelper;
            this.contentId = contentId;
            downloadHelper.prepare(this);
        }

        public void release() {
            downloadHelper.release();
        }


        @Override
        public void onPrepared(DownloadHelper helper) {
            if (helper.getPeriodCount() == 0){
                startDownload();
                release();
                return;
            }
        }


        private void startDownload() {
            startDownload(buildDownloadRequest());
        }

        private void startDownload(DownloadRequest downloadRequest) {
            DownloadService.sendAddDownload(context, NativeDownloadService.class, downloadRequest, /* foreground= */ false);
        }

        private DownloadRequest buildDownloadRequest() {
            return downloadHelper.getDownloadRequest(contentId, null);
        }

        @Override
        public void onPrepareError(DownloadHelper helper, IOException e) {
        }
    }
}