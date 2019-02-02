#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(MediaDownloader, NSObject)

RCT_EXTERN_METHOD(restoreMediaDownloader:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(downloadStream:(NSString *)url downloadID:(NSString *)downloadID title:(NSString *)title assetArtworkURL:(NSString *)assetArtworkURL retry:(BOOL *)retry)
RCT_EXTERN_METHOD(downloadStreamWithBitRate:(NSString *)url downloadID:(NSString *)downloadID title:(NSString *)title assetArtworkURL:(NSString *)assetArtworkURL retry:(BOOL *)retry bitRate:(nonnull NSNumber *)bitRate)
RCT_EXTERN_METHOD(isDownloaded:(NSString *)downloadID callback:(RCTResponseSenderBlock *)isDownloadedCallback)
RCT_EXTERN_METHOD(deleteDownloadedStream:(NSString *)downloadID)
RCT_EXTERN_METHOD(pauseDownload:(NSString *)downloadID)
RCT_EXTERN_METHOD(resumeDownload:(NSString *)downloadID)
RCT_EXTERN_METHOD(cancelDownload:(NSString *)downloadID)
RCT_EXTERN_METHOD(setMaxSimultaneousDownloads:(nonnull NSInteger *)maxSimultaneousDownloads)
RCT_EXTERN_METHOD(checkIfStillDownloaded:(nonnull NSArray *)downloadIDs resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

@end
