#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(MediaDownloader, NSObject)

RCT_EXTERN_METHOD(restoreMediaDownloader)
RCT_EXTERN_METHOD(downloadStream:(NSString *)url downloadID:(NSString *)downloadID)
RCT_EXTERN_METHOD(downloadStreamWithBitRate:(NSString *)url downloadID:(NSString *)downloadID bitRate:(nonnull NSNumber *)bitRate)
RCT_EXTERN_METHOD(isDownloaded:(NSString *)withStreamUrl callback:(RCTResponseSenderBlock *)isDownloadedCallback)
RCT_EXTERN_METHOD(deleteDownloadedStream:(NSString *)url)
RCT_EXTERN_METHOD(cancelDownload:(NSString *)downloadID)

@end
