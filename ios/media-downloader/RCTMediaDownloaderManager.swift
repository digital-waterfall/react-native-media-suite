import Foundation
import AVFoundation

@objc(MediaDownloader)
class MediaDownloader: RCTEventEmitter {
    
    static let sharedDownloader = MediaDownloader()
    private var didRestorePersistenceManager = false
    fileprivate var downloadSession: AVAssetDownloadURLSession!
    fileprivate var activeDownloadsMap = [String: AVAssetDownloadTask]()
    
    override func supportedEvents() -> [String]! {
        return ["onDownloadFinished", "onDownloadProgress", "onDownloadStarted", "onDownloadError"]
    }
    
    @objc
    func restoreMediaDownloader() {
        guard !didRestorePersistenceManager else { return }
        
        didRestorePersistenceManager = true
        
        downloadSession.getAllTasks { tasksArray in
            for task in tasksArray {
                guard let downloadTask = task as? AVAssetDownloadTask, let assetID = task.taskDescription else { break }
                self.activeDownloadsMap[assetID] = downloadTask
            }
        }
    }
    
    func prepareDownloader() {
        if (downloadSession == nil) {
            let backgroundConfiguration = URLSessionConfiguration.background(withIdentifier: "react-native-media-kit-downloader")
            downloadSession = AVAssetDownloadURLSession(configuration: backgroundConfiguration,
                                                        assetDownloadDelegate: self,
                                                        delegateQueue: OperationQueue.main)
        }
    }
    
    @objc func downloadStream(_ url: String, downloadID: String) {
        downloadStreamHelper(url: url, downloadID: downloadID)
    }

    @objc func downloadStreamWithBitrate(_ url: String, downloadID: String, bitRate: NSNumber) {
        downloadStreamHelper(url: url, downloadID: downloadID, bitRate: bitRate)
    }
    
    func downloadStreamHelper(url: String, downloadID: String, bitRate: NSNumber?=nil) {
        
        self.prepareDownloader()
        
        if !(isDownloaded(url: url)) && !(isDownloading(downloadID: downloadID)) {
        
            let asset = AVURLAsset(url: URL(string:url)!)
            
            if #available(iOS 10.0, *) {
                
                let downloadTask: AVAssetDownloadTask?
                if let unwrappedBitRate = bitRate {
                    downloadTask = downloadSession.makeAssetDownloadTask(asset: asset,
                                                                         assetTitle: downloadID as String,
                                                                          assetArtworkData: nil,
                                                                          options: [AVAssetDownloadTaskMinimumRequiredMediaBitrateKey: unwrappedBitRate])
                
                } else {
                    downloadTask = downloadSession.makeAssetDownloadTask(asset: asset,
                                                                         assetTitle: downloadID as String,
                                                                         assetArtworkData: nil)
                }
                
                downloadTask?.taskDescription = downloadID as String
                downloadTask?.resume()
                activeDownloadsMap[downloadID] = downloadTask
                NSLog("Download started for asset from: %s", url)
                
            } else {
                self.sendEvent(withName: "onDownloadError", body:["error" : "Download not supported for iOS versions prior to iOS 10"])
                return
            }
        } else {
            self.sendEvent(withName: "onDownloadError", body: ["error" : "The asset is already downloaded"])
            return
        }
    }
    
    @objc(isDownloaded:callback:)
    func isDownloaded(url: NSString, callback isDownloadedCallback: RCTResponseSenderBlock) {
        isDownloadedCallback([NSNull(), isDownloaded(url: url as String)])
    }
    
    func isDownloaded(url: String) -> Bool {
        if UserDefaults.standard.object(forKey: url) != nil {
            let baseURL = URL(fileURLWithPath: NSHomeDirectory())
            let assetURL = baseURL.appendingPathComponent((UserDefaults.standard.url(forKey: url)?.relativeString)!)
            if FileManager.default.fileExists(atPath: assetURL.path) {
                return true
            }
            UserDefaults.standard.removeObject(forKey: url)
            return false
        }
        return false
    }
    
    func isDownloading(downloadID: String) -> Bool {
        print(activeDownloadsMap.keys.contains(downloadID))
        return activeDownloadsMap.keys.contains(downloadID)
    }
    
    @objc func deleteDownloadedStream(_ url: String) {
        let userDefaults = UserDefaults.standard
        
        if isDownloaded(url: url as String) {
            do {
                let baseURL = URL(fileURLWithPath: NSHomeDirectory())
                let assetURL = baseURL.appendingPathComponent((UserDefaults.standard.url(forKey: url)?.relativeString)!)
                try FileManager.default.removeItem(atPath: assetURL.path)
                
                userDefaults.removeObject(forKey: url as String)
            } catch {
                self.sendEvent(withName: "onDownloadError", body: ["error" : "An error occured deleting the file: \(error)"])
            }
        }
    }
    
    @objc(cancelDownload:)
    func cancelDownload(downloadID: NSString) {
         activeDownloadsMap[downloadID as String]?.cancel()
    }
    
}

extension MediaDownloader: AVAssetDownloadDelegate {
    
    func urlSession(_ session: URLSession,
                    task: URLSessionTask,
                    didCompleteWithError error: Error?) {
        
        if let error = error as NSError? {
            switch (error.domain, error.code) {
            case (NSURLErrorDomain, NSURLErrorCancelled):
                NSLog("Canceled")
            case (NSURLErrorDomain, NSURLErrorUnknown):
                self.sendEvent(withName: "onDownloadError", body:["error" : "Downloading HLS streams is not supported in the simulator."])
                print("Downloading HLS streams is not supported in the simulator.")
                
            default:
                self.sendEvent(withName: "onDownloadError", body:["error" : "An unexpected error occured \(error.domain)"])
                print("An unexpected error occured \(error.domain)")
            }
        }
        
    }
    
    func urlSession(_ session: URLSession,
                    assetDownloadTask: AVAssetDownloadTask,
                    didFinishDownloadingTo location: URL) {
        
        activeDownloadsMap.removeValue(forKey: assetDownloadTask.taskDescription!)
        NSLog(location.relativeString)
        UserDefaults.standard.set(location.relativePath, forKey: assetDownloadTask.urlAsset.url.absoluteString)
        
        self.sendEvent(withName: "onDownloadFinished", body:["downloadID" : assetDownloadTask.taskDescription, "dwonloadLocation" : location.relativeString])
        NSLog("Asset download")
        
    }
    
    func urlSession(_ session: URLSession, assetDownloadTask: AVAssetDownloadTask, didLoad timeRange: CMTimeRange, totalTimeRangesLoaded loadedTimeRanges: [NSValue], timeRangeExpectedToLoad: CMTimeRange) {
        var percentComplete = 0.0
        
        for value in loadedTimeRanges {
            let loadedTimeRange = value.timeRangeValue
            percentComplete += loadedTimeRange.duration.seconds / timeRangeExpectedToLoad.duration.seconds
        }
        
        percentComplete *= 100
        
        self.sendEvent(withName: "onDownloadProgress", body:["downloadID" : assetDownloadTask.taskDescription!, "percentComplete" : percentComplete])
        NSLog("Download progress for asset download at: %f%", percentComplete)
    }
    
    func urlSession(_ session: URLSession,
                    assetDownloadTask: AVAssetDownloadTask,
                    didResolve resolvedMediaSelection: AVMediaSelection) {
        
        NSLog("Download started")
        self.sendEvent(withName: "onDownloadStarted", body:["downloadID" : assetDownloadTask.taskDescription!])
    }
    
}
