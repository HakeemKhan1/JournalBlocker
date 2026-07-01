import Foundation
import React
import FamilyControls
import ManagedSettings
import SwiftUI
import os.log
import DeviceActivity
@available(iOS 16.0, *)
extension DeviceActivityName {
  // Pre-Fajr reset (5 minutes before Fajr - new day starts)
  static let preFajrReset = Self("prefajr.reset")
  
  // Prayer windows
  static let prayerFajr = Self("prayer.fajr")
  static let prayerDhuhr = Self("prayer.dhuhr")
  static let prayerAsr = Self("prayer.asr")
  static let prayerMaghrib = Self("prayer.maghrib")
  static let prayerIsha = Self("prayer.isha")

  static var prayerWindows: [DeviceActivityName] {
    [.prayerFajr, .prayerDhuhr, .prayerAsr, .prayerMaghrib, .prayerIsha]
  }
  
  // All monitored activities (including pre-Fajr reset)
  static var allMonitoredActivities: [DeviceActivityName] {
    [.preFajrReset] + prayerWindows
  }
}

@objc(LockedIslamBridge)
class LockedIslamBridge: NSObject, RCTBridgeModule {
  static func moduleName() -> String! { return "LockedIslamBridge" }
  static func requiresMainQueueSetup() -> Bool { true }

  private let appGroupId = "group.com.lockedislam.shared"
  private static let logger = Logger(subsystem: "com.anonymous.lockedislam", category: "ScreenTime")
  private static let store = ManagedSettingsStore() // single store instance
  
  // Storage monitoring constants
  private static let STORAGE_WARNING_THRESHOLD: Int64 = 800_000  // 800KB - warn when approaching 1MB
  private static let STORAGE_CRITICAL_THRESHOLD: Int64 = 950_000 // 950KB - critical level

  @objc(authorizeScreenTime:rejecter:)
  func authorizeScreenTime(_ resolve: @escaping RCTPromiseResolveBlock,
                           rejecter reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.0, *) {
      Task { @MainActor in
        do {
          try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
          resolve(["authorized": true])
        } catch {
          resolve(["authorized": false])
        }
      }
    } else {
      resolve(["authorized": false])
    }
  }

  @objc(pickApps:rejecter:)
  func pickApps(_ resolve: @escaping RCTPromiseResolveBlock,
                rejecter reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.0, *) {
      DispatchQueue.main.async {
        let defaults = UserDefaults(suiteName: self.appGroupId)

        struct PickerSheet: View {
          @Environment(\.dismiss) private var dismiss
          @State private var selection: FamilyActivitySelection
          let onDone: (FamilyActivitySelection) -> Void
          
          init(initialSelection: FamilyActivitySelection, onDone: @escaping (FamilyActivitySelection) -> Void) {
            _selection = State(initialValue: initialSelection)
            self.onDone = onDone
          }

          var body: some View {
            NavigationView {
              FamilyActivityPicker(selection: $selection)
                .navigationTitle("Pick Apps")
                .toolbar {
                  ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                      onDone(selection)
                      dismiss()
                    }
                  }
                }
            }
          }
        }

        let existingSelection: FamilyActivitySelection
        if let data = defaults?.data(forKey: "familySelection"),
           let decoded = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data) {
          existingSelection = decoded
        } else {
          existingSelection = FamilyActivitySelection()
        }

        guard let root = UIApplication.shared.connectedScenes
            .compactMap({ ($0 as? UIWindowScene)?.keyWindow })
            .first?.rootViewController else {
          resolve(["tokens": 0])
          return
        }

        let host = UIHostingController(rootView: PickerSheet(initialSelection: existingSelection) { selection in
          // Persist selection into App Group
          if #available(iOS 16.0, *) {
            // Store the entire selection (more reliable than piecemeal types)
            if let data = try? JSONEncoder().encode(selection) {
              defaults?.set(data, forKey: "familySelection")
            }
          }
          let count = selection.applicationTokens.count
          // Mirror count into sharedState for JS consumers and detect active locks
          var shared = defaults?.dictionary(forKey: "sharedState") ?? [:]
          shared["selectedAppsCount"] = count
          defaults?.set(shared, forKey: "sharedState")

          let lockActive = (shared["lockActive"] as? Bool) ?? false
          if lockActive {
            DispatchQueue.main.async {
              if #available(iOS 16.0, *) {
                _ = Self.reconfigureShields(with: selection)
              }
            }
          }

          resolve(["count": count])
        })
        host.modalPresentationStyle = .formSheet
        root.present(host, animated: true)
      }
    } else {
      resolve(["tokens": 0])
    }
  }

  @objc(applyShields:rejecter:)
  func applyShields(_ resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.0, *) {
      DispatchQueue.main.async {
        let defaults = UserDefaults(suiteName: self.appGroupId)
        let status = AuthorizationCenter.shared.authorizationStatus
        guard status == .approved else {
          resolve(["applied": false])
          return
        }
        var applied = false
        if let data = defaults?.data(forKey: "familySelection"),
           let sel = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data) {
          applied = Self.reconfigureShields(with: sel)
        } else {
          applied = Self.reconfigureShields(with: FamilyActivitySelection())
        }
        resolve(["applied": applied])
      }
    } else {
      resolve(["applied": false])
    }
  }

  @objc(clearShields:rejecter:)
  func clearShields(_ resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.0, *) {
      let store = Self.store
      store.clearAllSettings()
    }
    resolve(NSNull())
  }

  @objc(syncSharedState:resolver:rejecter:)
  func syncSharedState(_ payload: NSDictionary,
                       resolver resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
    let defaults = UserDefaults(suiteName: appGroupId)
    // Filter out NSNull values before storing (UserDefaults only accepts property-list types)
    var filtered: [String: Any] = [:]
    for (key, value) in payload {
      if let strKey = key as? String, !(value is NSNull) {
        filtered[strKey] = value
      }
    }
    defaults?.set(filtered, forKey: "sharedState")
    resolve(NSNull())
  }

  @objc(getSharedState:rejecter:)
  func getSharedState(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
    let defaults = UserDefaults(suiteName: appGroupId)
    if let obj = defaults?.object(forKey: "sharedState") as? [String: Any] {
      resolve(obj)
    } else {
      resolve(NSNull())
    }
  }

  @objc(getSelectedAppsSummary:rejecter:)
  func getSelectedAppsSummary(_ resolve: @escaping RCTPromiseResolveBlock,
                              rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard #available(iOS 16.0, *) else {
      resolve([])
      return
    }

    let defaults = UserDefaults(suiteName: appGroupId)

    guard let data = defaults?.data(forKey: "familySelection"),
          let selection = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data) else {
      resolve([])
      return
    }

    // NOTE: Application tokens are privacy-preserving, but Apple exposes a
    // read-only Application wrapper specifically for this use case.
    let apps: [[String: Any]] = selection.applications.compactMap { app in
      guard let name = app.localizedDisplayName else { return nil }
      return [
        "localizedName": name,
        "bundleIdentifier": app.bundleIdentifier ?? ""
      ]
    }

    resolve(apps)
  }

  // Schedule DeviceActivity intervals at provided ISO start times (adhān + grace)
  // Also schedules pre-Fajr reset (5 minutes before Fajr) for new day handling
  @objc(startMonitoring:graceSecs:resolver:rejecter:)
  func startMonitoring(_ isoStarts: [String],
                      graceSecs: NSNumber,
                      resolver resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.0, *) {
      let fmt = ISO8601DateFormatter()
      let calendar = Calendar.current
      
      // Parse dates
      var parsedDates: [Date] = []
      for isoString in isoStarts {
        if let date = fmt.date(from: isoString) {
          parsedDates.append(date)
        }
      }
      parsedDates.sort()
      
      // Reject with descriptive error if ALL dates failed to parse
      guard !parsedDates.isEmpty else {
        let errorMsg = "All \(isoStarts.count) prayer times failed to parse. Expected ISO 8601 format."
        reject("PARSE_ERROR", errorMsg, nil)
        return
      }

      let center = DeviceActivityCenter()

      // Remove any existing schedules to avoid duplicates (including pre-Fajr reset)
      center.stopMonitoring(DeviceActivityName.allMonitoredActivities)

      let graceSeconds = max(min(graceSecs.intValue, 15 * 60), 30)
      var scheduledAny = false
      let pairs = zip(DeviceActivityName.prayerWindows, parsedDates)

      // Schedule each prayer window
      for (name, startDate) in pairs {
        var startComponents = calendar.dateComponents([.hour, .minute], from: startDate)
        startComponents.second = 0

        let endDate = calendar.date(byAdding: .second, value: graceSeconds, to: startDate)
          ?? startDate.addingTimeInterval(TimeInterval(graceSeconds))
        var endComponents = calendar.dateComponents([.hour, .minute], from: endDate)
        endComponents.second = 0

        let schedule = DeviceActivitySchedule(intervalStart: startComponents,
                                              intervalEnd: endComponents,
                                              repeats: true,
                                              warningTime: nil)
        do {
          try center.startMonitoring(name, during: schedule)
          scheduledAny = true
        } catch {
          // Silently continue - some schedules may fail
        }
      }
      
      // Schedule pre-Fajr reset (5 minutes before Fajr)
      // This triggers new day reset: clears shields and resets prayed checkboxes
      if let fajrDate = parsedDates.first {
        let preFajrDate = calendar.date(byAdding: .minute, value: -5, to: fajrDate) ?? fajrDate
        var preFajrStart = calendar.dateComponents([.hour, .minute], from: preFajrDate)
        preFajrStart.second = 0
        
        // End 1 minute later (just need to trigger intervalDidStart, not maintain)
        let preFajrEndDate = calendar.date(byAdding: .minute, value: 1, to: preFajrDate) ?? preFajrDate
        var preFajrEnd = calendar.dateComponents([.hour, .minute], from: preFajrEndDate)
        preFajrEnd.second = 0
        
        let preFajrSchedule = DeviceActivitySchedule(
          intervalStart: preFajrStart,
          intervalEnd: preFajrEnd,
          repeats: true,
          warningTime: nil
        )
        
        do {
          try center.startMonitoring(.preFajrReset, during: preFajrSchedule)
        } catch {
          // Silently continue
        }
      }

      resolve(scheduledAny)
    } else {
      resolve(false)
    }
  }

  // MARK: - Storage Monitoring

  @objc(getStorageInfo:rejecter:)
  func getStorageInfo(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
    let defaults = UserDefaults(suiteName: appGroupId)
    var totalSize: Int64 = 0
    var breakdown: [String: Int] = [:]
    
    // Calculate size of each key
    if let dict = defaults?.dictionaryRepresentation() {
      for (key, value) in dict {
        if let data = try? NSKeyedArchiver.archivedData(withRootObject: value, requiringSecureCoding: false) {
          let size = data.count
          totalSize += Int64(size)
          breakdown[key] = size
        }
      }
    }
    
    // Determine status
    var status = "ok"
    if totalSize >= Self.STORAGE_CRITICAL_THRESHOLD {
      status = "critical"
    } else if totalSize >= Self.STORAGE_WARNING_THRESHOLD {
      status = "warning"
    }
    
    resolve([
      "totalBytes": totalSize,
      "totalKB": Double(totalSize) / 1024.0,
      "status": status,
      "warningThresholdKB": Double(Self.STORAGE_WARNING_THRESHOLD) / 1024.0,
      "criticalThresholdKB": Double(Self.STORAGE_CRITICAL_THRESHOLD) / 1024.0,
      "breakdown": breakdown
    ])
  }
  
  @objc(clearStorageCache:rejecter:)
  func clearStorageCache(_ resolve: @escaping RCTPromiseResolveBlock,
                         rejecter reject: @escaping RCTPromiseRejectBlock) {
    let defaults = UserDefaults(suiteName: appGroupId)
    
    // Only clear non-essential data (keep familySelection and sharedState)
    let keysToKeep = ["familySelection", "sharedState"]
    
    if let allKeys = defaults?.dictionaryRepresentation().keys {
      for key in allKeys {
        if !keysToKeep.contains(key) {
          defaults?.removeObject(forKey: key)
        }
      }
    }
    
    defaults?.synchronize()
    resolve(["cleared": true])
  }

  @available(iOS 16.0, *)
  private static func reconfigureShields(with selection: FamilyActivitySelection) -> Bool {
    let store = Self.store
    var applied = false

    if selection.applicationTokens.isEmpty {
      store.shield.applications = nil
    } else {
      store.shield.applications = selection.applicationTokens
      applied = true
    }

    if selection.webDomainTokens.isEmpty {
      store.shield.webDomains = nil
    } else {
      store.shield.webDomains = selection.webDomainTokens
      applied = true
    }

    if selection.categoryTokens.isEmpty {
      store.shield.applicationCategories = nil
    } else {
      store.shield.applicationCategories = .specific(selection.categoryTokens)
      applied = true
    }

    if applied {
      Self.logger.info("Shields applied — DeenShieldShieldConfig extension will provide custom UI")
    }

    return applied
  }
}

