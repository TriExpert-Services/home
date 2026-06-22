// Thin wrapper over the self-hosted Plausible script loaded in index.html.
// Pageviews are handled in index.html; this is for custom funnel events.
// Analytics must NEVER break the app, so every call is guarded.

type EventProps = Record<string, string | number | boolean>;

type PlausibleFn = (event: string, options?: { props?: EventProps }) => void;

export function trackEvent(event: string, props?: EventProps): void {
  try {
    const plausible = (window as unknown as { plausible?: PlausibleFn }).plausible;
    if (typeof plausible === 'function') {
      plausible(event, props ? { props } : undefined);
    }
  } catch {
    /* swallow — analytics is best-effort and must not affect UX */
  }
}
