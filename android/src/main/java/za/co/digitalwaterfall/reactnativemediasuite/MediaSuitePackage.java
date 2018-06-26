package za.co.digitalwaterfall.reactnativemediasuite;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import za.co.digitalwaterfall.reactnativemediasuite.mediadownloader.MediaDownloaderModule;
import za.co.digitalwaterfall.reactnativemediasuite.mediaplayer.ReactMediaPlayerViewManager;
//import ReactMediaPlayerViewManager;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class MediaSuitePackage implements ReactPackage {

  @Override
  public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
    List<NativeModule> modules = new ArrayList<>();

    modules.add(new MediaDownloaderModule(reactContext));

    return modules;
  }

  public List<Class<? extends JavaScriptModule>> createJSModules() {
    return Collections.emptyList();
  }

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
    return Arrays.<ViewManager>asList(new ReactMediaPlayerViewManager(reactContext));
  }
}
