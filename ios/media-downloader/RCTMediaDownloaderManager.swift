import Foundation
import AVKit

@objc(MediaDownloader)
class MediaDownloader: RCTEventEmitter {
    
    var downloadSession: AVAssetDownloadURLSession?
    
    override func supportedEvents() -> [String]! {
        return ["testEvent1", "testEvent2", "testEvent3"]
    }
    
    @objc(setupAssetDownload:)
    func setupAssetDownload(url: String) {
        NSLog(url)
        // Create new background session configuration.
        let configuration = URLSessionConfiguration.background(withIdentifier: "downloadIdentifier")

        // Create a new AVAssetDownloadURLSession with background configuration, delegate, and queue
        downloadSession = AVAssetDownloadURLSession(configuration: configuration,
                                                    assetDownloadDelegate: self,
                                                    delegateQueue: OperationQueue.main)
        
        let asset = AVURLAsset(url: URL(string:url)!)
        
        // Create new AVAssetDownloadTask for the desired asset
        if #available(iOS 10.0, *) {
            let downloadTask = downloadSession?.makeAssetDownloadTask(asset: asset,
                                                                     assetTitle: "Test Asset",
                                                                     assetArtworkData: nil,
                                                                     options: nil)
            // Start task and begin download
            downloadTask?.resume()
            NSLog(downloadTask.debugDescription)
            NSLog("Started Download?")
        } else {
            return
        }
    }
    
}

extension MediaDownloader: AVAssetDownloadDelegate {
    
    func urlSession(_ session: URLSession,
                    assetDownloadTask: AVAssetDownloadTask,
                    didFinishDownloadingTo location: URL) {
        //Called when a download task has finished downloading a requested asset.
        NSLog("testEvent1")
        self.sendEvent(withName: "testEvent1", body:"Finished Downloading!")
    }
    
    func urlSession(_ session: URLSession, assetDownloadTask: AVAssetDownloadTask, didLoad timeRange: CMTimeRange, totalTimeRangesLoaded loadedTimeRanges: [NSValue], timeRangeExpectedToLoad: CMTimeRange) {
        var percentComplete = 0.0
        
        // Iterate through the loaded time ranges
        for value in loadedTimeRanges {
            // Unwrap the CMTimeRange from the NSValue
            let loadedTimeRange = value.timeRangeValue
            
            // Calculate the percentage of the total expected asset duration
            percentComplete += loadedTimeRange.duration.seconds / timeRangeExpectedToLoad.duration.seconds
        }
        percentComplete *= 100
        NSLog("testEvent2")
        self.sendEvent(withName: "testEvent2", body: "Download progress update: " + String(percentComplete))
    }
    
    func urlSession(_ session: URLSession,
                    assetDownloadTask: AVAssetDownloadTask,
                    didResolve resolvedMediaSelection: AVMediaSelection) {
        //Called when the media selection for the download is fully resolved, including any automatic selections.
        NSLog("testEvent3")
        self.sendEvent(withName: "testEvent3", body: "Media selection for the download is fully resolved, Starting Download!")
    }
    
}
