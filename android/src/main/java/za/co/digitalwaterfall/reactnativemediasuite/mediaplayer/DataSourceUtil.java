package za.co.digitalwaterfall.reactnativemediasuite.mediaplayer;

import com.facebook.react.bridge.ReactContext;
import com.google.android.exoplayer2.upstream.DataSource;
import com.google.android.exoplayer2.upstream.DefaultBandwidthMeter;
import com.google.android.exoplayer2.upstream.DefaultDataSourceFactory;
import com.google.android.exoplayer2.upstream.DefaultHttpDataSourceFactory;
import com.google.android.exoplayer2.upstream.HttpDataSource;
import com.google.android.exoplayer2.upstream.TransferListener;
import com.google.android.exoplayer2.util.Util;

public class DataSourceUtil {
    private DataSourceUtil() {
    }

    private static DataSource.Factory rawDataSourceFactory = null;
    private static DataSource.Factory defaultDataSourceFactory = null;
    private static String userAgent = null;

    public static void setUserAgent(String userAgent) {
        DataSourceUtil.userAgent = userAgent;
    }

    public static String getUserAgent(ReactContext context) {
        if (userAgent == null) {
            userAgent = Util.getUserAgent(context, "MediaPlayer");
        }
        return userAgent;
    }

    public static DataSource.Factory getRawDataSourceFactory(ReactContext context) {
        if (rawDataSourceFactory == null) {
            rawDataSourceFactory = buildRawDataSourceFactory(context);
        }
        return rawDataSourceFactory;
    }

    public static void setRawDataSourceFactory(DataSource.Factory factory) {
        DataSourceUtil.rawDataSourceFactory = factory;
    }

    public static  DataSource.Factory getDefaultDataSourceFactory(ReactContext context, DefaultBandwidthMeter bandwidthMeter) {
        if (defaultDataSourceFactory == null) {
            defaultDataSourceFactory = buildDataSourceFactory(context, bandwidthMeter);
        }
        return defaultDataSourceFactory;
    }

    public static void setDefaultDataSourceFactory(DataSource.Factory factory) {
        DataSourceUtil.defaultDataSourceFactory = factory;
    }

    private static DataSource.Factory buildRawDataSourceFactory(ReactContext context) {
        return new RawResourceDataSourceFactory(context.getApplicationContext());
    }

    private static   DataSource.Factory buildDataSourceFactory(ReactContext context, DefaultBandwidthMeter bandwidthMeter) {
        return new DefaultDataSourceFactory(context, bandwidthMeter,
                buildHttpDataSourceFactory(/* listener= */ null));
    }


    /** Returns a {@link HttpDataSource.Factory}. */
    public static HttpDataSource.Factory buildHttpDataSourceFactory(
            TransferListener<? super DataSource> listener) {
        return new DefaultHttpDataSourceFactory(userAgent, listener);
    }

}
