import Foundation
import AVFoundation

@objc(MediaDownloader)
class MediaDownloader: RCTEventEmitter {
    
    static let sharedDownloader = MediaDownloader()
    private var didRestorePersistenceManager = false
    fileprivate var downloadSession: AVAssetDownloadURLSession!
    fileprivate var activeDownloadsMap = [String: AVAssetDownloadTask]()
    fileprivate var restoredDownloadsIdsArray = [String]()
    
    override func supportedEvents() -> [String]! {
        return ["onDownloadFinished", "onDownloadProgress", "onDownloadStarted", "onDownloadError", "onDownloadCancelled"]
    }
    
    @objc func restoreMediaDownloader(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard !didRestorePersistenceManager else { resolve(nil); return }
        
        didRestorePersistenceManager = true
        self.prepareDownloader()
        
        if (downloadSession != nil) {
            downloadSession.getAllTasks { tasksArray in
                for task in tasksArray {
                    guard let downloadTask = task as? AVAssetDownloadTask, let downloadID = task.taskDescription else { break }
                    
                    print("Restored task: " + task.description + ". State: " + String(task.state.rawValue))
                    
                    self.activeDownloadsMap[downloadID] = downloadTask
                    self.restoredDownloadsIdsArray.append(downloadID)
                }
                resolve(nil)
                return
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
    
    @objc func downloadStream(_ url: String, downloadID: String, title: String, assetArtworkURL: String, retry: Bool) {
        downloadStreamHelper(url: url, downloadID: downloadID, title: title, assetArtworkURL: assetArtworkURL, retry: retry)
    }
    
    @objc func downloadStreamWithBitrate(_ url: String, downloadID: String, title: String, assetArtworkURL: String, retry: Bool,  bitRate: NSNumber) {
        downloadStreamHelper(url: url, downloadID: downloadID, title: title, assetArtworkURL: assetArtworkURL, retry: retry,  bitRate: bitRate)
    }
    
    func downloadStreamHelper(url: String, downloadID: String, title: String, assetArtworkURL: String, retry: Bool, bitRate: NSNumber?=nil) {
            self.prepareDownloader()
            
            let shouldDownload: Bool
            if (retry) {
                shouldDownload = true
            } else {
                shouldDownload = !(isDownloaded(downloadID: downloadID)) && !(isDownloading(downloadID: downloadID))
            }
            
            
            if shouldDownload {
                
                let asset: AVURLAsset
                if (retry && isDownloaded(downloadID: downloadID)) {
                    let baseURL = URL(fileURLWithPath: NSHomeDirectory())
                    let assetURL = baseURL.appendingPathComponent((UserDefaults.standard.url(forKey: downloadID)?.path)!)
                    
                    asset = AVURLAsset(url: assetURL)
                } else {
                    guard let assetURL = URL(string: url) else {
                        self.sendEvent(withName: "onDownloadError", body: ["error" : "The URL cannot be null", "errorType" : "NO_URL", "downloadID" : downloadID])
                        return
                    }
                    
                    asset = AVURLAsset(url: assetURL)
                }
                
                var data: Data?=nil;
                if (assetArtworkURL != "none" && !assetArtworkURL.isEmpty) {
                    data = try? Data(contentsOf: URL(string: assetArtworkURL)!)
                }
                
                guard let downloadTask = createDownloadTask(asset: asset, assetTitle: title, assetArtworkData: data, downloadID: downloadID) else {
                    self.sendEvent(withName: "onDownloadError", body: ["error" : "Failed to create download task.", "errorType" : "DOWNLOAD_TASK_ERROR", "downloadID" : downloadID])
                    return
                }
                
                downloadTask.taskDescription = downloadID
                downloadTask.resume()
                self.activeDownloadsMap[downloadID] = downloadTask
            } else {
                self.sendEvent(withName: "onDownloadError", body: ["error" : "The asset is already downloaded", "errorType" : "ALREADY_DOWNLOADED", "downloadID" : downloadID])
                return
            }
    }
    
    func createDownloadTask(asset URLAsset: AVURLAsset,
                            assetTitle title: String,
                            assetArtworkData artworkData: Data?,
                            downloadID: String,
                            bitRate: NSNumber?=nil) -> AVAssetDownloadTask? {
        if #available(iOS 10.0, *) {
            if let unwrappedBitRate = bitRate {
                return downloadSession.makeAssetDownloadTask(asset: URLAsset,
                                                                     assetTitle: title,
                                                                     assetArtworkData: artworkData,
                                                                     options: [AVAssetDownloadTaskMinimumRequiredMediaBitrateKey: unwrappedBitRate])
            } else {
                return downloadSession.makeAssetDownloadTask(asset: URLAsset,
                                                                     assetTitle: title,
                                                                     assetArtworkData: artworkData)
            }
        } else {
            self.sendEvent(withName: "onDownloadError", body:["error" : "Download not supported for iOS versions prior to iOS 10", "errorType" : "NOT_SUPPORTED", "downloadID" : downloadID])
            return nil
        }
    }
    
    @objc func isDownloaded(_ downloadID: String, isDownloadedCallback: RCTResponseSenderBlock) {
        isDownloadedCallback([NSNull(), isDownloaded(downloadID: downloadID)])
    }
    
    func isDownloaded(downloadID: String) -> Bool {
        if UserDefaults.standard.object(forKey: downloadID) != nil {
            let baseURL = URL(fileURLWithPath: NSHomeDirectory())
            let assetURL = baseURL.appendingPathComponent((UserDefaults.standard.url(forKey: downloadID)?.path)!)
            if FileManager.default.fileExists(atPath: assetURL.path) {
                return true
            }
            UserDefaults.standard.removeObject(forKey: downloadID)
            return false
        }
        return false
    }
    
    func isDownloading(downloadID: String) -> Bool {
        return self.activeDownloadsMap.keys.contains(downloadID)
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
                let assetURL = baseURL.appendingPathComponent((UserDefaults.standard.url(forKey: downloadID)?.path)!)
                try FileManager.default.removeItem(atPath: assetURL.path)
                
                userDefaults.removeObject(forKey: downloadID)
                return
            } catch {
                self.sendEvent(withName: "onDownloadError", body: ["error" : "An error occured deleting the file: \(error)", "errorType" : "DELETE_FAILED", "downloadID" : downloadID])
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
        self.activeDownloadsMap[downloadID]?.cancel()
        
        let restoredDownloadsIdIndex = self.restoredDownloadsIdsArray.firstIndex(of: downloadID)
        if restoredDownloadsIdIndex != nil {
            self.restoredDownloadsIdsArray.remove(at: restoredDownloadsIdIndex!)
        }
        
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
        self.activeDownloadsMap[downloadID]?.suspend()
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
        self.activeDownloadsMap[downloadID]?.resume()
        print("(\(downloadID)) resumed")
    }
    
    @objc func setMaxSimultaneousDownloads(_ maxSimultaneousDownloads: NSInteger) {
        downloadSession.delegateQueue.maxConcurrentOperationCount = maxSimultaneousDownloads;
    }
    
    @objc func checkIfStillDownloaded(_ downloadIDs: NSArray, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        let isDownloadedDownloadIDs: NSMutableArray = []
        for downloadID in (downloadIDs as NSArray as! [String]) {
            if isDownloaded(downloadID: downloadID) || isDownloading(downloadID: downloadID){
                isDownloadedDownloadIDs.add(downloadID)
            }
        }
        resolve(isDownloadedDownloadIDs)
    }
    
}

extension MediaDownloader: AVAssetDownloadDelegate {
    
    func urlSession(_ session: URLSession,
                    task: URLSessionTask,
                    didCompleteWithError error: Error?) {
        
        self.activeDownloadsMap.removeValue(forKey: task.taskDescription!)
        
        if let error = error as NSError? {
            switch (error.domain, error.code) {
            case (NSURLErrorDomain, NSURLErrorCancelled):
                if self.restoredDownloadsIdsArray.contains(task.taskDescription ?? "") {
                    self.sendEvent(withName: "onDownloadError", body:["downloadID" : task.taskDescription, "error" : "Download was unexpectedly cancelled.", "errorType" : "UNEXPECTEDLY_CANCELLED"])
                    print("An unexpected error occured \(error.domain)")
                    
                    let restoredDownloadsIdIndex = self.restoredDownloadsIdsArray.firstIndex(of: task.taskDescription!)
                    if restoredDownloadsIdIndex != nil {
                        self.restoredDownloadsIdsArray.remove(at: restoredDownloadsIdIndex!)
                    }
                    return
                }
                
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
        } else {
            
            let baseURL = URL(fileURLWithPath: NSHomeDirectory())
            let assetURL = baseURL.appendingPathComponent((UserDefaults.standard.url(forKey: task.taskDescription!)?.path)!)
            let estimatedSize: UInt64
            
            do {
                estimatedSize = try FileManager.default.allocatedSizeOfDirectory(atUrl: assetURL.absoluteURL)
            } catch {
                estimatedSize = 0
            }
            
            self.sendEvent(withName: "onDownloadFinished", body:["downloadID" : task.taskDescription!, "downloadLocation" : assetURL.relativeString, "size": estimatedSize])
            NSLog("Asset downloaded")
        }
        
    }
    
    func urlSession(_ session: URLSession,
                    assetDownloadTask: AVAssetDownloadTask,
                    didFinishDownloadingTo location: URL) {
        if UserDefaults.standard.object(forKey: assetDownloadTask.taskDescription!) == nil {
            UserDefaults.standard.set(location.relativePath, forKey: assetDownloadTask.taskDescription!)
        }
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
