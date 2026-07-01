//
//  DeviceActivityMonitorExtension.swift
//  PrayerMonitorExtension
//
//  Created by Ali Jameel on 2025-11-01.
//

import Foundation
import DeviceActivity
import ManagedSettings
import FamilyControls
import os.log

@available(iOSApplicationExtension 16.0, *)
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

@available(iOSApplicationExtension 16.0, *)
final class DeviceActivityMonitorExtension: DeviceActivityMonitor {
    private let appGroupId = "group.com.lockedislam.shared"
    private static let store = ManagedSettingsStore()
    private static let logger = Logger(subsystem: "com.anonymous.lockedislam", category: "PrayerMonitorExtension")
    
    // Prayer order for checking completion
    private static let prayerOrder = ["fajr", "dhuhr", "asr", "maghrib", "isha"]

    // MARK: - DeviceActivityMonitor Overrides
    
    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)
        
        // Handle pre-Fajr new day reset (5 min before Fajr)
        if activity == .preFajrReset {
            performNewDayReset()
            return
        }
        
        // Handle regular prayer windows - apply shields
        guard DeviceActivityName.prayerWindows.contains(activity) else { return }
        reapplySelection(for: activity)
    }
    
    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)
        
        // Ignore pre-Fajr reset end (no action needed)
        if activity == .preFajrReset {
            return
        }
        
        // Handle prayer window end
        guard DeviceActivityName.prayerWindows.contains(activity) else { return }
        
        // Check if all required prayers are marked as prayed
        let defaults = UserDefaults(suiteName: appGroupId)
        let shared = defaults?.dictionary(forKey: "sharedState") as? [String: Any] ?? [:]
        let prayedMap = shared["prayed"] as? [String: Bool] ?? [:]
        
        // Get required prayers up to and including this one
        let currentPrayer = mapToPrayerId(activity: activity)
        let allPrayed = checkAllRequiredPrayersComplete(currentPrayer: currentPrayer, prayedMap: prayedMap)
        
        if allPrayed {
            // Clear shields - user has completed all required prayers
            Self.store.clearAllSettings()
            
            // Update shared state
            if var updatedShared = defaults?.dictionary(forKey: "sharedState") {
                updatedShared["lockActive"] = false
                defaults?.set(updatedShared, forKey: "sharedState")
            }
        }
    }

    // MARK: - New Day Reset (5 minutes before Fajr)
    
    /// Performs unconditional reset for new day:
    /// - Clears ALL shields (regardless of current state)
    /// - Resets ALL prayer checkboxes to unchecked
    /// - Deletes prayed data from storage
    private func performNewDayReset() {
        guard let defaults = UserDefaults(suiteName: appGroupId) else { return }
        
        // 1. ALWAYS clear shields (handles scenarios a and c from plan)
        Self.store.clearAllSettings()
        
        // 2. ALWAYS delete/reset prayed data from storage (handles all scenarios)
        // This clears the checkboxes when user opens the app
        var shared = defaults.dictionary(forKey: "sharedState") ?? [:]
        
        // Reset prayed map to all false
        shared["prayed"] = [
            "fajr": false,
            "dhuhr": false,
            "asr": false,
            "maghrib": false,
            "isha": false
        ]
        shared["lockActive"] = false
        shared["currentPrayer"] = NSNull()
        
        // Update day key to new day
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        shared["dayKey"] = formatter.string(from: Date())
        
        defaults.set(shared, forKey: "sharedState")
        defaults.synchronize()
    }

    // MARK: - Shield Application
    
    private func reapplySelection(for activity: DeviceActivityName) {
        guard let defaults = UserDefaults(suiteName: appGroupId) else { return }
        
        let selection: FamilyActivitySelection
        
        if let data = defaults.data(forKey: "familySelection"),
           let decoded = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data) {
            selection = decoded
        } else {
            selection = FamilyActivitySelection()
        }

        let applied = Self.reconfigureShields(with: selection)

        // Update shared state
        var shared = defaults.dictionary(forKey: "sharedState") ?? [:]
        shared["lockActive"] = applied
        if let prayerId = mapToPrayerId(activity: activity) {
            shared["currentPrayer"] = prayerId
        }
        defaults.set(shared, forKey: "sharedState")
        defaults.synchronize()
    }

    private static func reconfigureShields(with selection: FamilyActivitySelection) -> Bool {
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

        return applied
    }

    // MARK: - Helper Functions
    
    private func mapToPrayerId(activity: DeviceActivityName) -> String? {
        switch activity {
        case .prayerFajr: return "fajr"
        case .prayerDhuhr: return "dhuhr"
        case .prayerAsr: return "asr"
        case .prayerMaghrib: return "maghrib"
        case .prayerIsha: return "isha"
        default: return nil
        }
    }
    
    /// Check if all prayers up to and including the current prayer have been prayed
    private func checkAllRequiredPrayersComplete(currentPrayer: String?, prayedMap: [String: Bool]) -> Bool {
        guard let current = currentPrayer,
              let currentIndex = Self.prayerOrder.firstIndex(of: current) else {
            return false
        }
        
        // Check all prayers up to and including current are prayed
        for i in 0...currentIndex {
            let prayer = Self.prayerOrder[i]
            if prayedMap[prayer] != true {
                return false
            }
        }
        
        return true
    }
}
