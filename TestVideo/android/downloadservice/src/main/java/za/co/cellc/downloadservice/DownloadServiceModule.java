package za.co.cellc.downloadservice;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class DownloadServiceModule extends ReactContextBaseJavaModule {

    public DownloadServiceModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @ReactMethod
    public void initDownloader(int input, Callback callback){

        callback.invoke(input*input);

    }

    @Override
    public String getName(){
        return "DownloadServiceModule";
    }
}