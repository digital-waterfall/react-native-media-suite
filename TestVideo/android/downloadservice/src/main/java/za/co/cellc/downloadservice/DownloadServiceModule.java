package za.co.cellc.downloadservice;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class DownloadServiceModule extends ReactContextBaseJavaModule {
    @Override
    public String getName(){
        return "DownloadService";
    }

    public DownloadServiceModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }


}