import Foundation

@objc(MediaDownloader)
class MediaDownloader: NSObject {
    
    @objc(test:)
    func test(name: String) -> Void {
        NSLog(name)
    }
    
//    func setupAssetDownload() {
//        // Create new background session configuration.
//        configuration = URLSessionConfiguration.background(withIdentifier: downloadIdentifier)
//
//        // Create a new AVAssetDownloadURLSession with background configuration, delegate, and queue
//        downloadSession = AVAssetDownloadURLSession(configuration: configuration,
//                                                    assetDownloadDelegate: self,
//                                                    delegateQueue: OperationQueue.main)
//    }
    
}
