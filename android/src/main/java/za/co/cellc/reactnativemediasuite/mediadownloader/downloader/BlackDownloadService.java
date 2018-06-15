package za.co.cellc.reactnativemediasuite.mediadownloader.downloader;

import android.app.Notification;

import com.facebook.react.bridge.ReactApplicationContext;
import com.google.android.exoplayer2.offline.DownloadManager;
import com.google.android.exoplayer2.offline.DownloadService;
import com.google.android.exoplayer2.scheduler.PlatformScheduler;
import com.google.android.exoplayer2.ui.DownloadNotificationUtil;
import com.google.android.exoplayer2.util.NotificationUtil;
import com.google.android.exoplayer2.util.Util;

import za.co.cellc.reactnativemediasuite.R;

/** A service for downloading media. */
public class BlackDownloadService extends DownloadService {

    private static final String CHANNEL_ID = "download_channel";
    private static final int JOB_ID = 1;
    private static final int FOREGROUND_NOTIFICATION_ID = 1;
    DownloadManager downloadManager;

    public BlackDownloadService(DownloadManager manager) {
        super(
                FOREGROUND_NOTIFICATION_ID,
                DEFAULT_FOREGROUND_NOTIFICATION_UPDATE_INTERVAL,
                CHANNEL_ID,
                R.string.exo_download_notification_channel_name);
        downloadManager = manager;
    }

    @Override
    protected DownloadManager getDownloadManager() {
        return downloadManager;
    }

    @Override
    protected PlatformScheduler getScheduler() {
        return Util.SDK_INT >= 21 ? new PlatformScheduler(this, JOB_ID) : null;
    }

    @Override
    protected Notification getForegroundNotification(DownloadManager.TaskState[] taskStates) {
        return DownloadNotificationUtil.buildProgressNotification(
                /* context= */ this,
                R.drawable.exo_controls_play,
                CHANNEL_ID,
                /* contentIntent= */ null,
                /* message= */ null,
                taskStates);
    }

    @Override
    protected void onTaskStateChanged(DownloadManager.TaskState taskState) {
        if (taskState.action.isRemoveAction) {
            return;
        }
        Notification notification = null;
        if (taskState.state == DownloadManager.TaskState.STATE_COMPLETED) {
            notification =
                    DownloadNotificationUtil.buildDownloadCompletedNotification(
                            /* context= */ this,
                            R.drawable.exo_controls_play,
                            CHANNEL_ID,
                            /* contentIntent= */ null,
                            Util.fromUtf8Bytes(taskState.action.data));
        } else if (taskState.state == DownloadManager.TaskState.STATE_FAILED) {
            notification =
                    DownloadNotificationUtil.buildDownloadFailedNotification(
                            /* context= */ this,
                            R.drawable.exo_controls_play,
                            CHANNEL_ID,
                            /* contentIntent= */ null,
                            Util.fromUtf8Bytes(taskState.action.data));
        }
        int notificationId = FOREGROUND_NOTIFICATION_ID + 1 + taskState.taskId;
        NotificationUtil.setNotification(this, notificationId, notification);
    }
}
