import Foundation
import React
import SwiftUI
import FamilyControls

private let kAppGroupId = "group.com.journalblock.shared" // same as BlockingBridge

// MARK: - SwiftUI view that shows selected app icons

@available(iOS 16.0, *)
struct SelectedAppsIconsView: View {
    @State private var selection: FamilyActivitySelection?

    var body: some View {
        HStack(spacing: -6) { // Negative spacing for slight overlap (~20% of 28px icon)
            if let selection = selection, !selection.applicationTokens.isEmpty {
                let apps = Array(selection.applicationTokens)
                let totalCount = apps.count
                let displayCount = min(3, totalCount)
                let remainingCount = totalCount > 3 ? totalCount - 3 : 0
                
                // Display up to 3 icons
                ForEach(0..<displayCount, id: \.self) { index in
                    let token = apps[index]
                    Label(token)
                        .labelStyle(.iconOnly)
                        .frame(width: 28, height: 28)
                        .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
                        .zIndex(Double(displayCount - index)) // First icons on top
                }
                
                // Show "+x" as plain text if more than 3 apps
                if remainingCount > 0 {
                    Text("+\(remainingCount)")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.white)
                        .padding(.leading, 8) // Add spacing after icons
                }
            }
        }
        .onAppear(perform: loadSelection)
    }

    private func loadSelection() {
        let defaults = UserDefaults(suiteName: kAppGroupId)
        if let data = defaults?.data(forKey: "familySelection"),
           let decoded = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data) {
            selection = decoded
        } else {
            selection = nil
        }
    }
}

// MARK: - Container UIView that hosts the SwiftUI view

@available(iOS 16.0, *)
final class BlockedAppsContainerView: UIView {
    private let host: UIHostingController<SelectedAppsIconsView>

    override init(frame: CGRect) {
        host = UIHostingController(rootView: SelectedAppsIconsView())
        super.init(frame: frame)
        commonInit()
    }

    required init?(coder: NSCoder) {
        host = UIHostingController(rootView: SelectedAppsIconsView())
        super.init(coder: coder)
        commonInit()
    }

    private func commonInit() {
        backgroundColor = .clear
        host.view.backgroundColor = .clear
        addSubview(host.view)
        host.view.translatesAutoresizingMaskIntoConstraints = false

        NSLayoutConstraint.activate([
            host.view.topAnchor.constraint(equalTo: topAnchor),
            host.view.bottomAnchor.constraint(equalTo: bottomAnchor),
            host.view.leadingAnchor.constraint(equalTo: leadingAnchor),
            host.view.trailingAnchor.constraint(equalTo: trailingAnchor),
        ])
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        host.view.frame = bounds
    }
}

// MARK: - React Native view manager

@objc(BlockedAppsViewManager)
class BlockedAppsViewManager: RCTViewManager {
    override static func moduleName() -> String! {
        // RN will drop the "Manager" suffix, exposing this as "BlockedAppsView"
        return "BlockedAppsViewManager"
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func view() -> UIView! {
        if #available(iOS 16.0, *) {
            return BlockedAppsContainerView()
        } else {
            // Older iOS versions just render an empty view
            let v = UIView()
            v.backgroundColor = .clear
            return v
        }
    }
}

