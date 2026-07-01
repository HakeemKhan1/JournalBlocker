//
//  ShieldConfigurationExtension.swift
//  DeenShieldShieldConfig
//
//  Premium "Opal-style" shield UI for blocked apps.
//  Reads current prayer name from App Group shared state and
//  displays an Apple-clean custom block screen.
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

    // MARK: - Design Tokens (HIG-compliant)

    /// Deep Emerald — primary dark background tint
    private let emeraldBg = UIColor(red: 15/255, green: 36/255, blue: 21/255, alpha: 1.0)
    /// Vibrant Mint — accent for interactive elements
    private let mint = UIColor(red: 47/255, green: 160/255, blue: 94/255, alpha: 1.0)
    /// Warm Gold — secondary accent
    private let gold = UIColor(red: 212/255, green: 175/255, blue: 55/255, alpha: 1.0)
    /// Soft white for body text
    private let textPrimary = UIColor.white
    /// Muted white for subtitles
    private let textSecondary = UIColor(white: 1.0, alpha: 0.7)

    // MARK: - Current Prayer Name

    /// Reads the current prayer from the App Group shared state.
    /// Falls back to "Prayer" if unavailable.
    private func currentPrayerName() -> String {
        let defaults = UserDefaults(suiteName: appGroupId)
        let shared = defaults?.dictionary(forKey: "sharedState") as? [String: Any]
        
        guard let prayerId = shared?["currentPrayer"] as? String else {
            return "Prayer"
        }

        // Capitalize first letter: "fajr" -> "Fajr"
        let labels: [String: String] = [
            "fajr": "Fajr",
            "dhuhr": "Dhuhr",
            "asr": "Asr",
            "maghrib": "Maghrib",
            "isha": "Isha"
        ]
        return labels[prayerId] ?? prayerId.capitalized
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

    /// Constructs the premium shield UI.
    ///
    /// Layout follows Apple HIG:
    ///  - System-provided blur background (dark material)
    ///  - Clear, legible title and subtitle
    ///  - Primary action button styled with mint accent
    ///  - Secondary dismiss option
    ///
    private func buildShieldConfiguration() -> ShieldConfiguration {
        let prayer = currentPrayerName()

        Self.logger.info("Building shield config for prayer: \(prayer)")

        return ShieldConfiguration(
            // Background: dark material blur (system-provided)
            backgroundBlurStyle: .systemMaterialDark,

            // Tint: subtle emerald overlay on the blur
            backgroundColor: emeraldBg,

            // Icon: nil — let the system show the app's own icon (HIG best practice)
            icon: nil,

            // Title
            title: ShieldConfiguration.Label(
                text: "Focus for \(prayer)",
                color: textPrimary
            ),

            // Subtitle
            subtitle: ShieldConfiguration.Label(
                text: "Discipline is an act of worship.",
                color: textSecondary
            ),

            // Primary button — deep-links back to the app
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "I am done praying",
                color: .white
            ),
            primaryButtonBackgroundColor: mint,

            // Secondary button — gentle dismiss
            secondaryButtonLabel: ShieldConfiguration.Label(
                text: "Not yet",
                color: textSecondary
            )
        )
    }
}
