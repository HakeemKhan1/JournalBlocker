/**
 * PurchaseService.ts
 * RevenueCat wrapper for DeenShield.
 *
 * Handles:
 *  - SDK initialization
 *  - Fetching offerings (subscriptions + tips)
 *  - Executing purchases & restores
 *  - Entitlement checks for "Deen Shield Pro"
 *  - RevenueCatUI paywall & Customer Center presentation
 *
 * Products configured in RevenueCat dashboard:
 *  - Monthly subscription
 *  - Yearly subscription
 *  - Lifetime (one-time purchase)
 */

import Purchases, {
  type PurchasesOfferings,
  type PurchasesPackage,
  type CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { Platform } from 'react-native';
import { captureException } from '../utils/errorReporting';

// ─── Configuration ──────────────────────────────────────────────
const REVENUECAT_API_KEY = Platform.select({
  ios: 'test_rXFuweXIxfYgOctugKVZfZIiegN',
  android: 'goog_YOUR_REVENUECAT_ANDROID_KEY', // TODO: Add Android key when ready
}) as string;

/** Must match the entitlement identifier in the RevenueCat dashboard */
const ENTITLEMENT_ID = 'Deen Shield Pro';

// ─── State ──────────────────────────────────────────────────────
let isInitialized = false;

// ─── Initialization ─────────────────────────────────────────────

/**
 * Initialize RevenueCat SDK. Safe to call multiple times — will no-op
 * after the first successful init.
 */
export async function initializePurchases(): Promise<void> {
  if (isInitialized) return;

  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    isInitialized = true;
  } catch (error) {
    captureException(error as Error, { context: 'PurchaseService.initialize' });
    throw error;
  }
}

// ─── Entitlement Checks ─────────────────────────────────────────

/**
 * Returns true if the user currently has an active "Deen Shield Pro" entitlement.
 */
export async function checkPremiumStatus(): Promise<boolean> {
  try {
    const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
    return (
      customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined
    );
  } catch (error) {
    captureException(error as Error, { context: 'PurchaseService.checkPremiumStatus' });
    return false;
  }
}

/**
 * Convenience: get full CustomerInfo for advanced UI needs.
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    captureException(error as Error, { context: 'PurchaseService.getCustomerInfo' });
    return null;
  }
}

// ─── Offerings ──────────────────────────────────────────────────

/**
 * Fetch all available offerings from RevenueCat.
 * Returns null on error so callers can show a graceful fallback.
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    captureException(error as Error, { context: 'PurchaseService.getOfferings' });
    return null;
  }
}

// ─── Purchases ──────────────────────────────────────────────────

/**
 * Purchase a specific package (subscription or tip).
 * Returns the updated CustomerInfo on success, or null on failure/cancellation.
 */
export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<CustomerInfo | null> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (error: any) {
    // RevenueCat throws a typed error — code 1 = user cancelled
    if (error?.userCancelled) {
      // Not an error — user just tapped "Cancel"
      return null;
    }
    captureException(error as Error, {
      context: 'PurchaseService.purchasePackage',
      packageId: pkg.identifier,
    });
    throw error;
  }
}

// ─── Restore ────────────────────────────────────────────────────

/**
 * Restore previous purchases (required by Apple for App Store approval).
 * Returns true if the user now has the premium entitlement.
 */
export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo: CustomerInfo = await Purchases.restorePurchases();
    return (
      customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined
    );
  } catch (error) {
    captureException(error as Error, { context: 'PurchaseService.restorePurchases' });
    return false;
  }
}

// ─── Listener ───────────────────────────────────────────────────

/**
 * Register a listener for customer info changes (e.g. subscription renewal,
 * expiration, or cross-device sync).
 * Returns an unsubscribe function.
 */
export function onCustomerInfoUpdate(
  callback: (info: CustomerInfo) => void,
): () => void {
  const listener = Purchases.addCustomerInfoUpdateListener(callback);
  // addCustomerInfoUpdateListener returns a remove function
  return listener;
}

// ─── RevenueCatUI: Paywall ──────────────────────────────────────

/**
 * Present the RevenueCat dashboard-configured paywall modally.
 * The paywall auto-handles purchase, restore, and close.
 * Returns the paywall result (purchased, cancelled, restored, error).
 */
export async function presentPaywall(): Promise<PAYWALL_RESULT> {
  try {
    return await RevenueCatUI.presentPaywall({
      displayCloseButton: true,
    });
  } catch (error) {
    captureException(error as Error, { context: 'PurchaseService.presentPaywall' });
    return PAYWALL_RESULT.CANCELLED;
  }
}

/**
 * Present the paywall only if the user does NOT have the "Deen Shield Pro"
 * entitlement. If already entitled, resolves immediately with NOT_PRESENTED.
 */
export async function presentPaywallIfNeeded(): Promise<PAYWALL_RESULT> {
  try {
    return await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: ENTITLEMENT_ID,
      displayCloseButton: true,
    });
  } catch (error) {
    captureException(error as Error, { context: 'PurchaseService.presentPaywallIfNeeded' });
    return PAYWALL_RESULT.CANCELLED;
  }
}

// ─── RevenueCatUI: Customer Center ──────────────────────────────

/**
 * Present the RevenueCat Customer Center modally.
 * Lets users manage subscriptions, request refunds, restore purchases, etc.
 * All configured from the RevenueCat dashboard.
 */
export async function presentCustomerCenter(): Promise<void> {
  try {
    await RevenueCatUI.presentCustomerCenter();
  } catch (error) {
    captureException(error as Error, { context: 'PurchaseService.presentCustomerCenter' });
  }
}

// Re-export for convenience
export { PAYWALL_RESULT, ENTITLEMENT_ID };
