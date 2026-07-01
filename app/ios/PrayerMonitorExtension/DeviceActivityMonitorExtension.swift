//
//  DeviceActivityMonitorExtension.swift
//  PrayerMonitorExtension
//
//  Journal Blocker — background scheduler for the morning-gate lock model.
//  (Re-pointed from the original prayer-window engine; see BLOCKING-PRD.md §3/§5.)
//
//  Activities:
//    • day.reset       — repeats daily at dayStartTime. Re-engages the morning
//                        gate: journaledToday=false + applyShields.
//    • lockin.session  — one-shot window for a user-initiated focus session.
//    • break.end       — one-shot; re-locks after a lock-in break.
//

import Foundation
import DeviceActivity
import ManagedSettings
import FamilyControls
import UserNotifications
import os.log

@available(iOSApplicationExtension 16.0, *)
extension DeviceActivityName {
    static let dayReset = Self("day.reset")
    static let lockInSession = Self("lockin.session")
    static let breakEnd = Self("break.end")

    static var allMonitoredActivities: [DeviceActivityName] {
        [.dayReset, .lockInSession, .breakEnd]
    }
}

@available(iOSApplicationExtension 16.0, *)
final class DeviceActivityMonitorExtension: DeviceActivityMonitor {
    private let appGroupId = "group.com.journalblock.shared"
    private static let store = ManagedSettingsStore()
    private static let logger = Logger(subsystem: "com.journalblock.app", category: "JournalMonitor")

    // MARK: - DeviceActivityMonitor Overrides

    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)

        switch activity {
        case .dayReset:
            performDayReset()
        case .lockInSession:
            // Focus session begins — shields on.
            applyShieldsFromSelection(lockPhase: "lockIn", extra: ["lockInActive": true])
        case .breakEnd:
            // Break is over — re-lock (respect whichever phase should hold).
            reapplyAfterBreak()
        default:
            break
        }
    }

    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)

        switch activity {
        case .lockInSession:
            // Focus session ended. Clear the lock-in flag; only actually unlock
            // if the morning gate is already satisfied, otherwise the gate holds.
            guard let defaults = UserDefaults(suiteName: appGroupId) else { return }
            var shared = defaults.dictionary(forKey: "sharedState") ?? [:]
            shared["lockInActive"] = false
            let journaled = (shared["journaledToday"] as? Bool) ?? false
            if journaled {
                Self.store.clearAllSettings()
                shared["lockActive"] = false
                shared.removeValue(forKey: "lockPhase") // NSNull isn't plist-safe
            } else {
                // Gate still owes a journal — keep shields, revert phase to the gate.
                shared["lockPhase"] = "morningGate"
                shared["lockActive"] = true
            }
            defaults.set(shared, forKey: "sharedState")
            defaults.synchronize()
        default:
            break
        }
    }

    // MARK: - New Day Reset (fires at dayStartTime)

    /// Re-engages the morning gate for a fresh day. NOTE the inversion vs. the
    /// original prayer app: this *applies* shields (locked until journaled)
    /// rather than clearing them.
    private func performDayReset() {
        guard let defaults = UserDefaults(suiteName: appGroupId) else { return }
        var shared = defaults.dictionary(forKey: "sharedState") ?? [:]

        // A new day owes a journal again.
        shared["journaledToday"] = false
        shared["lockInActive"] = false

        // Refill break budget if lock-in breaks are configured.
        if let maxPasses = shared["maxBreakPasses"] as? Int {
            shared["breakPassesRemaining"] = maxPasses
        }

        // Stamp the new day.
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        shared["dayKey"] = formatter.string(from: Date())

        // Engage the gate.
        let applied = Self.reconfigureShields(with: loadSelection())
        shared["lockActive"] = applied
        if applied { shared["lockPhase"] = "morningGate" } else { shared.removeValue(forKey: "lockPhase") }

        defaults.set(shared, forKey: "sharedState")
        defaults.synchronize()

        if applied {
            postMorningNudge()
        }
    }

    /// Fire a local notification inviting the user to journal (requires the app
    /// to have been granted notification permission during onboarding).
    private func postMorningNudge() {
        let content = UNMutableNotificationContent()
        content.title = "Start your day"
        content.body = "Set your intentions to open your apps."
        content.sound = .default
        // Fire ~immediately (1s); the day.reset window has already started.
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: "morning.nudge", content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request, withCompletionHandler: nil)
    }

    // MARK: - Shield Application

    private func applyShieldsFromSelection(lockPhase: String, extra: [String: Any] = [:]) {
        guard let defaults = UserDefaults(suiteName: appGroupId) else { return }
        let applied = Self.reconfigureShields(with: loadSelection())

        var shared = defaults.dictionary(forKey: "sharedState") ?? [:]
        shared["lockActive"] = applied
        if applied { shared["lockPhase"] = lockPhase } else { shared.removeValue(forKey: "lockPhase") }
        for (k, v) in extra { shared[k] = v }
        defaults.set(shared, forKey: "sharedState")
        defaults.synchronize()
    }

    private func reapplyAfterBreak() {
        guard let defaults = UserDefaults(suiteName: appGroupId) else { return }
        let shared = defaults.dictionary(forKey: "sharedState") ?? [:]
        // If a lock-in is still active, resume it; otherwise fall back to the gate
        // if the day still owes a journal.
        let lockInActive = (shared["lockInActive"] as? Bool) ?? false
        let journaled = (shared["journaledToday"] as? Bool) ?? false
        if lockInActive {
            applyShieldsFromSelection(lockPhase: "lockIn")
        } else if !journaled {
            applyShieldsFromSelection(lockPhase: "morningGate")
        }
    }

    private func loadSelection() -> FamilyActivitySelection {
        let defaults = UserDefaults(suiteName: appGroupId)
        if let data = defaults?.data(forKey: "familySelection"),
           let decoded = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data) {
            return decoded
        }
        return FamilyActivitySelection()
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
}
