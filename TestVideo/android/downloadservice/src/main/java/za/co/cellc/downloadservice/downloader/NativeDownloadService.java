package za.co.cellc.downloadservice.downloader;

import android.app.Notification;

import com.google.android.exoplayer2.offline.DownloadManager;
import com.google.android.exoplayer2.offline.DownloadManager.TaskState;
import com.google.android.exoplayer2.offline.DownloadService;
import com.google.android.exoplayer2.scheduler.PlatformScheduler;
import com.google.android.exoplayer2.ui.DownloadNotificationUtil;
import com.google.android.exoplayer2.util.NotificationUtil;
import com.google.android.exoplayer2.util.Util;

public class NativeDownloadService extends DownloadService {

    private static final String CHANNEL_ID = "download_channel";
    private static final int JOB_ID = 1;
    private static final int FOREGROUND_NOTIFICATION_ID = 1;

    public NativeDownloadService() {
        super(
                FOREGROUND_NOTIFICATION_ID,
                DEFAULT_FOREGROUND_NOTIFICATION_UPDATE_INTERVAL,
                CHANNEL_ID,
                R.string.exo_download_notification_channel_name);
    }

    @Override
    protected DownloadManager getDownloadManager() {
        return ((BlackDownloadApplication) getApplication()).getDownloadManager();
    }

    @Override
    protected PlatformScheduler getScheduler() {
        return Util.SDK_INT >= 21 ? new PlatformScheduler(this, JOB_ID) : null;
    }

    @Override
    protected Notification getForegroundNotification(TaskState[] taskStates) {
        return DownloadNotificationUtil.buildProgressNotification(
                /* context= */ this,
                R.drawable.exo_controls_play,
                CHANNEL_ID,
                /* contentIntent= */ null,
                /* message= */ null,
                taskStates);
    }

//    @Override
//    protected void onTaskStateChanged(TaskState taskState) {
//        if (taskState.action.isRemoveAction) {
//            return;
//        }
//        Notification notification = null;
//        if (taskState.state == TaskState.STATE_COMPLETED) {
//            notification =
//                    DownloadNotificationUtil.buildDownloadCompletedNotification(
//                            /* context= */ this,
//                            R.drawable.exo_controls_play,
//                            CHANNEL_ID,
//                            /* contentIntent= */ null,
//                            Util.fromUtf8Bytes(taskState.action.data));
//        } else if (taskState.state == TaskState.STATE_FAILED) {
//            notification =
//                    DownloadNotificationUtil.buildDownloadFailedNotification(
//                            /* context= */ this,
//                            R.drawable.exo_controls_play,
//                            CHANNEL_ID,
//                            /* contentIntent= */ null,
//                            Util.fromUtf8Bytes(taskState.action.data));
//        }
//        int notificationId = FOREGROUND_NOTIFICATION_ID + 1 + taskState.taskId;
//        NotificationUtil.setNotification(this, notificationId, notification);
//    }
}
