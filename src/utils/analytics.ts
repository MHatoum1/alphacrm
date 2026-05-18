// src/utils/analytics.ts
export function trackMeta(event: string, params?: Record<string, any>) {
  const w = window as any;
  if (!w.fbq) return;
  w.fbq('track', event, params);
}

export function trackGtag(event: string, params?: Record<string, any>) {
  const w = window as any;
  if (!w.gtag) return;
  w.gtag('event', event, params);
}

export function trackTwitter(event: string, params?: Record<string, any>) {
  const w = window as any;
  if (!w.twq) return;
  // Twitter supports custom signals; if you have a specific one, call it here.
  w.twq('track', event, params);
}

export function trackTikTok(event: string, params?: Record<string, any>) {
  const w = window as any;
  if (!w.ttq) return;
  w.ttq.track(event, params);
}
