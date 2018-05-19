#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(MediaDownloader, NSObject)

RCT_EXTERN_METHOD(setupAssetDownload:(NSString *)url)

@end
