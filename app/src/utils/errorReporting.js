const SENTRY_DSN = 'https://446604fc47f0ce9ee7ff19e0ce2d9467@o4510486334013440.ingest.us.sentry.io/4510486335651840';

// Auto-detect Sentry installation
let Sentry = null;
try {
  Sentry = require('@sentry/react-native');
} catch (e) {
  // Sentry not installed - that's fine, we'll use no-op functions
}

const isSentryEnabled = () => !__DEV__ && Sentry && SENTRY_DSN;

export function initErrorReporting() {
  if (isSentryEnabled()) {
    Sentry.init({
      dsn: SENTRY_DSN,
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 60000, // 1 minute (reduced from 30s to prevent quota exhaustion)
      tracesSampleRate: 0.05, // 5% sampling (reduced from 20% for production efficiency)
      maxBreadcrumbs: 50, // Limit breadcrumbs to prevent memory bloat
      beforeSend(event) {
        // Strip PII to comply with privacy requirements
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },
    });
  }
}

export function captureException(error, context = {}) {
  if (__DEV__) {
    console.error('Error captured:', error, context);
    return;
  }
  
  if (isSentryEnabled()) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  }
}

export function setUserContext(userId, email) {
  if (isSentryEnabled()) {
    Sentry.setUser({ id: userId, email });
  }
}

export function addBreadcrumb(message, category = 'app', level = 'info') {
  if (isSentryEnabled()) {
    Sentry.addBreadcrumb({ message, category, level });
  }
}

