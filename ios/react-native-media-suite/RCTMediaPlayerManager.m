#import "RCTMediaPlayerManager.h"
#import "RCTMediaPlayerView.h"
#import "React/RCTUIManager.h"
#import "AVFoundation/AVFoundation.h"

@implementation RCTMediaPlayerManager

RCT_EXPORT_MODULE(RCTMediaPlayerView)

- (UIView *) view {
    return [[RCTMediaPlayerView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(autoplay, BOOL)
RCT_EXPORT_VIEW_PROPERTY(src, NSString*)
RCT_EXPORT_VIEW_PROPERTY(preload, NSString*)
RCT_EXPORT_VIEW_PROPERTY(loop, BOOL)
RCT_EXPORT_VIEW_PROPERTY(muted, BOOL)
RCT_EXPORT_VIEW_PROPERTY(ignoreSilentSwitch, BOOL)
RCT_EXPORT_VIEW_PROPERTY(resizeMode, NSString);


RCT_EXPORT_VIEW_PROPERTY(onPlayerPause, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPlayerPlay, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPlayerEnd, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPlayerBuffering, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPlayerBufferOk, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPlayerProgress, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPlayerBufferChange, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPlayerError, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPlayerLoad, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPlayerLoadStart, RCTBubblingEventBlock)


- (NSDictionary *)constantsToExport
{
    return @{
             @"ScaleNone": AVLayerVideoGravityResizeAspect,
             @"ScaleToFill": AVLayerVideoGravityResize,
             @"ScaleAspectFit": AVLayerVideoGravityResizeAspect,
             @"ScaleAspectFill": AVLayerVideoGravityResizeAspectFill
             };
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

RCT_EXPORT_METHOD(pause:(nonnull NSNumber *)reactTag) {
    [self executeBlock:^(RCTMediaPlayerView *view) {
        [view pause];
    } withTag:reactTag];
}


RCT_EXPORT_METHOD(stop:(nonnull NSNumber *)reactTag) {
    [self executeBlock:^(RCTMediaPlayerView *view) {
        [view stop];
    } withTag:reactTag];
}

RCT_EXPORT_METHOD(play:(nonnull NSNumber *)reactTag) {
    [self executeBlock:^(RCTMediaPlayerView *view) {
        [view play];
    } withTag:reactTag];
}

RCT_EXPORT_METHOD(seekTo:(nonnull NSNumber *)reactTag :(double)timeMs) {
    [self executeBlock:^(RCTMediaPlayerView *view) {
        [view seekTo:timeMs];
    } withTag:reactTag];
}

RCT_EXPORT_METHOD(setMaxBitRate:(nonnull NSNumber *)reactTag :(double)bitRate) {
    [self executeBlock:^(RCTMediaPlayerView *view) {
        [view setMaxBitRate:bitRate];
    } withTag:reactTag];
}


typedef void (^RCTMediaPlayerViewManagerBlock)(RCTMediaPlayerView *view);

- (void)executeBlock:(RCTMediaPlayerViewManagerBlock)block withTag:(nonnull NSNumber *)reactTag {
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMediaPlayerView *> *viewRegistry) {
        RCTMediaPlayerView *view = viewRegistry[reactTag];
        if (![view isKindOfClass:[RCTMediaPlayerView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting RCTMediaPlayerView, got: %@", view);
        } else {
            block(view);
        }
    }];
}

@end
