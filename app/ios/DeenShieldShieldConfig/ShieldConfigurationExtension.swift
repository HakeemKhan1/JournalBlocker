//
//  ShieldConfigurationExtension.swift
//  DeenShieldShieldConfig
//
//  Journal Blocker — the custom block screen shown over shielded apps.
//  Copy is phase-aware: it reads `lockPhase` from the App Group shared state
//  and speaks to either the mandatory morning gate or a voluntary lock-in.
//  (See BLOCKING-PRD.md §5.)
//

import ManagedSettings
import ManagedSettingsUI
import UIKit
import os.log

@available(iOSApplicationExtension 16.0, *)
class ShieldConfigurationExtension: ShieldConfigurationDataSource {

    private let appGroupId = "group.com.lockedislam.shared"
    private static let logger = Logger(
        subsystem: "com.anonymous.lockedislam.DeenShieldShieldConfig",
        category: "ShieldConfig"
    )

    // MARK: - Design Tokens

    /// Deep indigo — matches the app's dark canvas.
    private let bgTint = UIColor(red: 10/255, green: 9/255, blue: 19/255, alpha: 1.0)
    /// Peach accent (the "orb" gradient midpoint) for the primary action.
    private let accent = UIColor(red: 245/255, green: 169/255, blue: 127/255, alpha: 1.0)
    private let onAccent = UIColor(red: 26/255, green: 18/255, blue: 20/255, alpha: 1.0)
    private let textPrimary = UIColor.white
    private let textSecondary = UIColor(white: 1.0, alpha: 0.7)

    // MARK: - Shared state

    private func sharedState() -> [String: Any] {
        let defaults = UserDefaults(suiteName: appGroupId)
        return defaults?.dictionary(forKey: "sharedState") as? [String: Any] ?? [:]
    }

    private func currentPhase() -> String {
        (sharedState()["lockPhase"] as? String) ?? "morningGate"
    }

    /// Best-effort "Xh Ym left" string for a lock-in session.
    private func lockInRemaining() -> String? {
        guard let iso = sharedState()["lockInUntil"] as? String else { return nil }
        let fmt = ISO8601DateFormatter()
        guard let end = fmt.date(from: iso) else { return nil }
        let secs = Int(end.timeIntervalSinceNow)
        guard secs > 0 else { return nil }
        let hours = secs / 3600
        let mins = (secs % 3600) / 60
        if hours > 0 { return "\(hours)h \(mins)m left" }
        return "\(mins)m left"
    }

    // MARK: - ShieldConfigurationDataSource

    override func configuration(shielding application: Application) -> ShieldConfiguration {
        return buildShieldConfiguration()
    }

    override func configuration(shielding application: Application,
                                in category: ActivityCategory) -> ShieldConfiguration {
        return buildShieldConfiguration()
    }

    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        return buildShieldConfiguration()
    }

    override func configuration(shielding webDomain: WebDomain,
                                in category: ActivityCategory) -> ShieldConfiguration {
        return buildShieldConfiguration()
    }

    // MARK: - Build Configuration

    private func buildShieldConfiguration() -> ShieldConfiguration {
        let phase = currentPhase()

        let title: String
        let subtitle: String
        let primary: String
        let secondary: String?

        if phase == "lockIn" {
            title = "You're locked in."
            subtitle = lockInRemaining() ?? "Focused session in progress."
            primary = "Back to work"
            secondary = "End early"
        } else {
            // morningGate (default)
            title = "Start your day."
            subtitle = "One quick journal opens your apps."
            primary = "Journal"
            secondary = nil
        }

        Self.logger.info("Building shield config for phase: \(phase)")

        return ShieldConfiguration(
            backgroundBlurStyle: .systemMaterialDark,
            backgroundColor: bgTint,
            icon: nil,
            title: ShieldConfiguration.Label(text: title, color: textPrimary),
            subtitle: ShieldConfiguration.Label(text: subtitle, color: textSecondary),
            primaryButtonLabel: ShieldConfiguration.Label(text: primary, color: onAccent),
            primaryButtonBackgroundColor: accent,
            secondaryButtonLabel: secondary.map {
                ShieldConfiguration.Label(text: $0, color: textSecondary)
            }
        )
    }
}
