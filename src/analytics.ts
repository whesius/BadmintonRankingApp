const GA_MEASUREMENT_ID = 'G-T7VJCEE0F3'; // Replace with your actual GA4 Measurement ID

export function trackPageView(tabId: string, tabLabel: string): void {
  if (typeof gtag !== 'function' || !import.meta.env.PROD) return;

  gtag('event', 'page_view', {
    page_title: tabLabel,
    page_location: `${window.location.origin}${window.location.pathname}#${tabId}`,
    page_path: `/#${tabId}`,
  });
}

export function identifyUser(playerName: string): void {
  if (typeof gtag !== 'function' || !import.meta.env.PROD) return;

  gtag('config', GA_MEASUREMENT_ID, { user_id: playerName });
}
