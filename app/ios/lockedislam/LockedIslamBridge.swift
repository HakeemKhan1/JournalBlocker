import Foundation
import React
import FamilyControls
import ManagedSettings
import SwiftUI
import os.log
import DeviceActivity

@available(iOS 16.0, *)
extension DeviceActivityName {
  // Journal Blocker morning-gate model (see BLOCKING-PRD.md §3).
  static let dayReset = Self("day.reset")
  static let lockInSession = Self("lockin.session")
  static let breakEnd = Self("break.end")

  static var allMonitoredActivities: [DeviceActivityName] {
    [.dayReset, .lockInSession, .breakEnd]
  }
}

@objc(LockedIslamBridge)
class LockedIslamBridge: NSObject, RCTBridgeModule {
  static func moduleName() -> String! { return "LockedIslamBridge" }
  static func requiresMainQueueSetup() -> Bool { true }

  private let appGroupId = "group.com.journalblock.shared"
  private static let logger = Logger(subsystem: "com.journalblock.app", category: "ScreenTime")
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
          resolve(["count": 0])
          return
        }

        let host = UIHostingController(rootView: PickerSheet(initialSelection: existingSelection) { selection in
          // Persist selection into App Group
          if let data = try? JSONEncoder().encode(selection) {
            defaults?.set(data, forKey: "familySelection")
          }
          let count = selection.applicationTokens.count
          // Mirror count into sharedState for JS consumers and detect active locks
          var shared = defaults?.dictionary(forKey: "sharedState") ?? [:]
          shared["selectedAppsCount"] = count
          defaults?.set(shared, forKey: "sharedState")

          let lockActive = (shared["lockActive"] as? Bool) ?? false
          if lockActive {
            DispatchQueue.main.async {
              _ = Self.reconfigureShields(with: selection)
            }
          }

          resolve(["count": count])
        })
        host.modalPresentationStyle = .formSheet
        root.present(host, animated: true)
      }
    } else {
      resolve(["count": 0])
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
    // Merge into existing sharedState so background-written keys (e.g. from the
    // monitor extension) aren't clobbered by a partial JS payload.
    var merged = defaults?.dictionary(forKey: "sharedState") ?? [:]
    for (key, value) in payload {
      guard let strKey = key as? String else { continue }
      if value is NSNull {
        merged.removeValue(forKey: strKey)
      } else {
        merged[strKey] = value
      }
    }
    defaults?.set(merged, forKey: "sharedState")
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

    let apps: [[String: Any]] = selection.applications.compactMap { app in
      guard let name = app.localizedDisplayName else { return nil }
      return [
        "localizedName": name,
        "bundleIdentifier": app.bundleIdentifier ?? ""
      ]
    }

    resolve(apps)
  }

  // MARK: - Journal scheduling (morning gate + lock-in)

  /// Schedule the daily morning-gate re-engagement at `hour:minute`.
  /// The monitor extension's `day.reset` handler re-applies shields and resets
  /// `journaledToday` when this window starts.
  @objc(scheduleDayReset:minute:resolver:rejecter:)
  func scheduleDayReset(_ hour: NSNumber,
                        minute: NSNumber,
                        resolver resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard #available(iOS 16.0, *) else { resolve(false); return }

    let center = DeviceActivityCenter()
    center.stopMonitoring([.dayReset])

    var start = DateComponents()
    start.hour = hour.intValue
    start.minute = minute.intValue
    start.second = 0

    var end = DateComponents()
    // 1-minute window is enough to fire intervalDidStart.
    let endMinuteTotal = hour.intValue * 60 + minute.intValue + 1
    end.hour = (endMinuteTotal / 60) % 24
    end.minute = endMinuteTotal % 60
    end.second = 0

    let schedule = DeviceActivitySchedule(intervalStart: start,
                                          intervalEnd: end,
                                          repeats: true,
                                          warningTime: nil)
    do {
      try center.startMonitoring(.dayReset, during: schedule)
      resolve(true)
    } catch {
      reject("SCHEDULE_ERROR", "Failed to schedule day reset: \(error.localizedDescription)", error)
    }
  }

  /// Begin a user-initiated lock-in for `durationSeconds`. Applies shields
  /// immediately and schedules a one-shot window whose end unlocks (subject to
  /// the gate) via the monitor extension. Returns the ISO end time.
  @objc(startLockIn:resolver:rejecter:)
  func startLockIn(_ durationSeconds: NSNumber,
                   resolver resolve: @escaping RCTPromiseResolveBlock,
                   rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard #available(iOS 16.0, *) else { resolve(NSNull()); return }

    let now = Date()
    let end = now.addingTimeInterval(durationSeconds.doubleValue)
    let center = DeviceActivityCenter()
    center.stopMonitoring([.lockInSession])

    let cal = Calendar.current
    var startC = cal.dateComponents([.hour, .minute], from: now)
    startC.second = 0
    var endC = cal.dateComponents([.hour, .minute], from: end)
    endC.second = 0

    // Apply shields right away so the lock is instant, regardless of scheduling.
    DispatchQueue.main.async {
      let defaults = UserDefaults(suiteName: self.appGroupId)
      if let data = defaults?.data(forKey: "familySelection"),
         let sel = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data) {
        _ = Self.reconfigureShields(with: sel)
      }
    }

    let schedule = DeviceActivitySchedule(intervalStart: startC,
                                          intervalEnd: endC,
                                          repeats: false,
                                          warningTime: nil)
    let iso = ISO8601DateFormatter().string(from: end)
    do {
      try center.startMonitoring(.lockInSession, during: schedule)
    } catch {
      // Even if background scheduling fails, shields are already applied.
      Self.logger.error("startLockIn scheduling failed: \(error.localizedDescription)")
    }
    resolve(["lockInUntil": iso])
  }

  /// End a lock-in session early. Stops the background window; the caller is
  /// responsible for deciding whether to clear shields (gate may still hold).
  @objc(endLockIn:rejecter:)
  func endLockIn(_ resolve: @escaping RCTPromiseResolveBlock,
                 rejecter reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.0, *) {
      DeviceActivityCenter().stopMonitoring([.lockInSession])
    }
    resolve(NSNull())
  }

  /// Take a break inside a lock-in: clear shields now, re-lock after
  /// `durationSeconds` via the `break.end` window.
  @objc(startBreak:resolver:rejecter:)
  func startBreak(_ durationSeconds: NSNumber,
                  resolver resolve: @escaping RCTPromiseResolveBlock,
                  rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard #available(iOS 16.0, *) else { resolve(NSNull()); return }

    Self.store.clearAllSettings()

    let breakEndDate = Date().addingTimeInterval(durationSeconds.doubleValue)
    let cal = Calendar.current
    var startC = cal.dateComponents([.hour, .minute], from: breakEndDate)
    startC.second = 0
    let endMinuteTotal = (startC.hour ?? 0) * 60 + (startC.minute ?? 0) + 1
    var endC = DateComponents()
    endC.hour = (endMinuteTotal / 60) % 24
    endC.minute = endMinuteTotal % 60
    endC.second = 0

    let center = DeviceActivityCenter()
    center.stopMonitoring([.breakEnd])
    let schedule = DeviceActivitySchedule(intervalStart: startC,
                                          intervalEnd: endC,
                                          repeats: false,
                                          warningTime: nil)
    let iso = ISO8601DateFormatter().string(from: breakEndDate)
    do {
      try center.startMonitoring(.breakEnd, during: schedule)
    } catch {
      Self.logger.error("startBreak scheduling failed: \(error.localizedDescription)")
    }
    resolve(["breakEndsAt": iso])
  }

  /// Tear down all journal schedules (used when disabling blocking entirely).
  @objc(stopAllSchedules:rejecter:)
  func stopAllSchedules(_ resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.0, *) {
      DeviceActivityCenter().stopMonitoring(DeviceActivityName.allMonitoredActivities)
    }
    resolve(NSNull())
  }

  // MARK: - Storage Monitoring

  @objc(getStorageInfo:rejecter:)
  func getStorageInfo(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
    let defaults = UserDefaults(suiteName: appGroupId)
    var totalSize: Int64 = 0
    var breakdown: [String: Int] = [:]

    if let dict = defaults?.dictionaryRepresentation() {
      for (key, value) in dict {
        if let data = try? NSKeyedArchiver.archivedData(withRootObject: value, requiringSecureCoding: false) {
          let size = data.count
          totalSize += Int64(size)
          breakdown[key] = size
        }
      }
    }

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
      Self.logger.info("Shields applied — DeenShieldShieldConfig extension provides custom UI")
    }

    return applied
  }
}
