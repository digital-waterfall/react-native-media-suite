package za.co.digitalwaterfall.reactnativemediasuite.mediadownloader.downloader;

import android.app.Notification;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.google.android.exoplayer2.offline.Download;
import com.google.android.exoplayer2.offline.DownloadManager;
import com.google.android.exoplayer2.offline.DownloadService;
import com.google.android.exoplayer2.scheduler.PlatformScheduler;
import com.google.android.exoplayer2.ui.DownloadNotificationHelper;
import com.google.android.exoplayer2.util.NotificationUtil;
import com.google.android.exoplayer2.util.Util;

import za.co.digitalwaterfall.reactnativemediasuite.R;

import java.util.List;

import static za.co.digitalwaterfall.reactnativemediasuite.mediadownloader.downloader.DownloadUtil.DOWNLOAD_NOTIFICATION_CHANNEL_ID;

/** A service for downloading media. */
public class NativeDownloadService extends DownloadService {

    private static final int FOREGROUND_NOTIFICATION_ID = 1;
    private static final int JOB_ID = 1;

    public NativeDownloadService() {
        super(FOREGROUND_NOTIFICATION_ID, DEFAULT_FOREGROUND_NOTIFICATION_UPDATE_INTERVAL, DOWNLOAD_NOTIFICATION_CHANNEL_ID, R.string.exo_download_notification_channel_name, 0);
    }

    @Override
    @NonNull
    protected DownloadManager getDownloadManager() {
        DownloadManager downloadManager = DownloadUtil.getDownloadManager(/* context= */ this);
        DownloadNotificationHelper downloadNotificationHelper =
                DownloadUtil.getDownloadNotificationHelper(/* context= */ this);
        downloadManager.addListener(
                new TerminalStateNotificationHelper(
                        this, downloadNotificationHelper, FOREGROUND_NOTIFICATION_ID + 1));
        return downloadManager;
    }

    @Override
    protected PlatformScheduler getScheduler() {
        return Util.SDK_INT >= 21 ? new PlatformScheduler(this, JOB_ID) : null;
    }

    @Override
    @NonNull
    protected Notification getForegroundNotification(@NonNull List<Download> downloads) {
        return DownloadUtil.getDownloadNotificationHelper(/* context= */ this)
                .buildProgressNotification(
                        /* context= */ this,
                        R.drawable.exo_controls_play,
                        /* contentIntent= */ null,
                        /* message= */ null,
                        downloads);
    }



    private static final class TerminalStateNotificationHelper implements DownloadManager.Listener {

        private final Context context;
        private final DownloadNotificationHelper notificationHelper;

        private int nextNotificationId;

        public TerminalStateNotificationHelper(
                Context context, DownloadNotificationHelper notificationHelper, int firstNotificationId) {
            this.context = context.getApplicationContext();
            this.notificationHelper = notificationHelper;
            nextNotificationId = firstNotificationId;
        }

        @Override
        public void onDownloadChanged(
                DownloadManager downloadManager, Download download, @Nullable Exception finalException) {
            Notification notification;
            if (download.state == Download.STATE_COMPLETED) {
                notification =
                        notificationHelper.buildDownloadCompletedNotification(
                                context,
                                R.drawable.exo_controls_play,
                                /* contentIntent= */ null,
                                Util.fromUtf8Bytes(download.request.data));
            } else if (download.state == Download.STATE_FAILED) {
                notification =
                        notificationHelper.buildDownloadFailedNotification(
                                context,
                                R.drawable.exo_controls_play,
                                /* contentIntent= */ null,
                                Util.fromUtf8Bytes(download.request.data));
            } else {
                return;
            }
            NotificationUtil.setNotification(context, nextNotificationId++, notification);
        }
    }
}
