import Foundation
import AVFoundation

@objc(MediaDownloader)
class MediaDownloader: RCTEventEmitter {
    
    static let sharedDownloader = MediaDownloader()
    private var didRestorePersistenceManager = false
    fileprivate var downloadSession: AVAssetDownloadURLSession!
    fileprivate var activeDownloadsMap = [String: AVAssetDownloadTask]()
    
    override func supportedEvents() -> [String]! {
        return ["onDownloadFinished", "onDownloadProgress", "onDownloadStarted", "onDownloadError", "onDownloadCancelled"]
    }
    
    @objc func restoreMediaDownloader() {
        guard !didRestorePersistenceManager else { return }
        
        didRestorePersistenceManager = true
        
        if (downloadSession != nil) {
            downloadSession.getAllTasks { tasksArray in
                for task in tasksArray {
                    guard let downloadTask = task as? AVAssetDownloadTask, let assetID = task.taskDescription else { break }
                    self.activeDownloadsMap[assetID] = downloadTask
                }
            }
        }
    }
    
    func prepareDownloader() {
        if (downloadSession == nil) {
            let backgroundConfiguration = URLSessionConfiguration.background(withIdentifier: "react-native-media-suite-downloader")
            downloadSession = AVAssetDownloadURLSession(configuration: backgroundConfiguration,
                                                        assetDownloadDelegate: self,
                                                        delegateQueue: OperationQueue.main)
        }
    }
    
    @objc func downloadStream(_ url: String, downloadID: String, title: String, assetArtworkURL: String) {
        downloadStreamHelper(url: url, downloadID: downloadID, title: title, assetArtworkURL: assetArtworkURL)
    }
    
    @objc func downloadStreamWithBitrate(_ url: String, downloadID: String, title: String, assetArtworkURL: String, bitRate: NSNumber) {
        downloadStreamHelper(url: url, downloadID: downloadID, title: title, assetArtworkURL: assetArtworkURL, bitRate: bitRate)
    }
    
    func downloadStreamHelper(url: String, downloadID: String, title: String, assetArtworkURL: String, bitRate: NSNumber?=nil) {
        if #available(iOS 10.0, *) {
        
            self.prepareDownloader()
    
            if !(isDownloaded(downloadID: downloadID)) && !(isDownloading(downloadID: downloadID)) {
            
                let asset = AVURLAsset(url: URL(string:url)!)
            
                var data: Data?=nil;
                if (assetArtworkURL != "none") {
                    let url = URL(string: assetArtworkURL)
                    data = try? Data(contentsOf: url!)
                }
                
                let downloadTask: AVAssetDownloadTask?
                if let unwrappedBitRate = bitRate {
                        downloadTask = downloadSession.makeAssetDownloadTask(asset: asset,
                                                                             assetTitle: title as String,
                                                                             assetArtworkData: data,
                                                                             options: [AVAssetDownloadTaskMinimumRequiredMediaBitrateKey: unwrappedBitRate])
                        
                } else {
                    downloadTask = downloadSession.makeAssetDownloadTask(asset: asset,
                                                                             assetTitle: title as String,
                                                                             assetArtworkData: data)
                }
                
                downloadTask?.taskDescription = downloadID
                downloadTask?.resume()
                activeDownloadsMap[downloadID] = downloadTask
            } else {
                self.sendEvent(withName: "onDownloadError", body: ["error" : "The asset is already downloaded", "errorType" : "ALREADY_DOWNLOADED", "downloadID" : downloadID])
                return
            }
        } else {
            self.sendEvent(withName: "onDownloadError", body:["error" : "Download not supported for iOS versions prior to iOS 10", "errorType" : "NOT_SUPPORTED", "downloadID" : downloadID])
            return
        }
    }
    
    @objc func isDownloaded(_ downloadID: String, isDownloadedCallback: RCTResponseSenderBlock) {
        isDownloadedCallback([NSNull(), isDownloaded(downloadID: downloadID)])
    }
    
    func isDownloaded(downloadID: String) -> Bool {
        if UserDefaults.standard.object(forKey: downloadID) != nil {
            let baseURL = URL(fileURLWithPath: NSHomeDirectory())
            let assetURL = baseURL.appendingPathComponent((UserDefaults.standard.url(forKey: downloadID)?.relativeString)!)
            if FileManager.default.fileExists(atPath: assetURL.path) {
                return true
            }
            UserDefaults.standard.removeObject(forKey: downloadID)
            return false
        }
        return false
    }
    
    func isDownloading(downloadID: String) -> Bool {
        return activeDownloadsMap.keys.contains(downloadID)
    }
    
    @objc func deleteDownloadedStream(_ downloadID: String) {
        let userDefaults = UserDefaults.standard
        
        if isDownloading(downloadID: downloadID) {
            self.cancelDownload(downloadID)
            return
        }
        
        if isDownloaded(downloadID: downloadID) {
            do {
                let baseURL = URL(fileURLWithPath: NSHomeDirectory())
                let assetURL = baseURL.appendingPathComponent((UserDefaults.standard.url(forKey: downloadID)?.relativeString)!)
                try FileManager.default.removeItem(atPath: assetURL.path)
                
                userDefaults.removeObject(forKey: downloadID)
                return
            } catch {
                self.sendEvent(withName: "onDownloadError", body: ["error" : "An error occured deleting the file: \(error)", "errorType" : "DELETE", "downloadID" : downloadID])
                return
            }
        }
        self.sendEvent(withName: "onDownloadError", body: ["error" : "Download not found.", "errorType" : "NOT_FOUND", "downloadID" : downloadID])
    }
    
    @objc func cancelDownload(_ downloadID: String) {
        if (!isDownloading(downloadID: downloadID)) {
            if (isDownloaded(downloadID: downloadID)) {
                self.sendEvent(withName: "onDownloadError", body: ["error" : "Finished download cannot be canceled.", "errorType" : "CANCEL_FAILED", "downloadID" : downloadID])
                return
            }
            self.sendEvent(withName: "onDownloadError", body: ["error" : "Download not found.", "errorType" : "NOT_FOUND", "downloadID" : downloadID])
            return
        }
        activeDownloadsMap[downloadID]?.cancel()
        print("(\(downloadID)) cancelled")
    }
    
    @objc func pauseDownload(_ downloadID: String) {
        if (!isDownloading(downloadID: downloadID)) {
            self.sendEvent(withName: "onDownloadError", body: ["error" : "Download not found.", "errorType" : "NOT_FOUND", "downloadID" : downloadID])
            return
        }
        if (isDownloaded(downloadID: downloadID)) {
            self.sendEvent(withName: "onDownloadError", body: ["error" : "Finished download cannot be paused.", "errorType" : "PAUSE_FAILED", "downloadID" : downloadID])
            return
        }
        activeDownloadsMap[downloadID]?.suspend()
        print("(\(downloadID)) paused")
    }
    
    @objc func resumeDownload(_ downloadID: String) {
        if (!isDownloading(downloadID: downloadID)) {
            self.sendEvent(withName: "onDownloadError", body: ["error" : "Download not found.", "errorType" : "NOT_FOUND", "downloadID" : downloadID])
            return
        }
        if (isDownloaded(downloadID: downloadID)) {
            self.sendEvent(withName: "onDownloadError", body: ["error" : "Finished download cannot be resumed.", "errorType" : "RESUME_FAILED", "downloadID" : downloadID])
            return
        }
        activeDownloadsMap[downloadID]?.resume()
        print("(\(downloadID)) resumed")
    }
    
    @objc func setMaxSimultaneousDownloads(_ maxSimultaneousDownloads: NSInteger) {
        downloadSession.delegateQueue.maxConcurrentOperationCount = maxSimultaneousDownloads;
    }
    
}

extension AVURLAsset {
    var fileSize: Int? {
        let keys: Set<URLResourceKey> = [.totalFileSizeKey, .fileSizeKey]
        let resourceValues = try? url.resourceValues(forKeys: keys)
        
        return resourceValues?.fileSize ?? resourceValues?.totalFileSize
    }
}

extension MediaDownloader: AVAssetDownloadDelegate {
    
    func urlSession(_ session: URLSession,
                    task: URLSessionTask,
                    didCompleteWithError error: Error?) {
        
        activeDownloadsMap.removeValue(forKey: task.taskDescription!)
        
        if let error = error as NSError? {
            switch (error.domain, error.code) {
            case (NSURLErrorDomain, NSURLErrorCancelled):
                deleteDownloadedStream(task.taskDescription!)
                print("Deleting downloaded files.")
                self.sendEvent(withName: "onDownloadCancelled", body: ["downloadID" : task.taskDescription])
                
            case (NSURLErrorDomain, NSURLErrorUnknown):
                self.sendEvent(withName: "onDownloadError", body:["downloadID" : task.taskDescription, "error" : "Downloading HLS streams is not supported in the simulator.", "errorType" : "SIMULATOR_NOT_SUPPORTED"])
                print("Downloading HLS streams is not supported in the simulator.")
                
            default:
                self.sendEvent(withName: "onDownloadError", body:["downloadID" : task.taskDescription, "error" : "An unexpected error occured \(error.domain)", "errorType" : "UNKNOWN"])
                print("An unexpected error occured \(error.domain)")
            }
        }
        
    }
    
    func urlSession(_ session: URLSession,
                    assetDownloadTask: AVAssetDownloadTask,
                    didFinishDownloadingTo location: URL) {
        
        activeDownloadsMap.removeValue(forKey: assetDownloadTask.taskDescription!)
        
        UserDefaults.standard.set(location.relativePath, forKey: assetDownloadTask.taskDescription!)
        
        let estimatedSize: UInt64
        do {
            estimatedSize = try FileManager.default.allocatedSizeOfDirectory(atUrl: location.absoluteURL)
        } catch {
            estimatedSize = 0
        }
        
        self.sendEvent(withName: "onDownloadFinished", body:["downloadID" : assetDownloadTask.taskDescription!, "downloadLocation" : location.relativeString, "size": estimatedSize])
        NSLog("Asset downloaded")
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
