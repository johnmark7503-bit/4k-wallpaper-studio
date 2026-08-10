"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type AnalyticsInstance = import("firebase/analytics").Analytics;
type EventParams = Record<string, string | number | boolean>;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD9RTv7gAfEa21uq7S4HAzmnbybo1XWTE4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "k-wallpaper-studio-f44ce.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "k-wallpaper-studio-f44ce",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "k-wallpaper-studio-f44ce.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1051083254721",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1051083254721:web:42215c7aa6107c24075d40",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-L857KJXJ3D",
};

let analyticsPromise: Promise<AnalyticsInstance | null> | null = null;

function getFirebaseAnalytics() {
  if (analyticsPromise) return analyticsPromise;
  analyticsPromise = (async () => {
    if (typeof window === "undefined") return null;
    const [{ getApp, getApps, initializeApp }, { getAnalytics, isSupported }] = await Promise.all([
      import("firebase/app"),
      import("firebase/analytics"),
    ]);
    if (!await isSupported()) return null;
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    return getAnalytics(app);
  })().catch(() => null);
  return analyticsPromise;
}

export function trackFirebaseEvent(eventName: string, params?: EventParams) {
  void getFirebaseAnalytics().then(async (analytics) => {
    if (!analytics) return;
    const { logEvent } = await import("firebase/analytics");
    logEvent(analytics, eventName, params);
  });
}

export function FirebaseAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    void getFirebaseAnalytics();
  }, []);

  useEffect(() => {
    trackFirebaseEvent("page_view", {
      page_path: pathname,
      page_title: document.title,
    });
  }, [pathname]);

  useEffect(() => {
    const startedAt = performance.now();
    const onVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;
      trackFirebaseEvent("engagement_time", {
        page_path: window.location.pathname,
        engagement_time_msec: Math.round(performance.now() - startedAt),
      });
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("a,button") : null;
      if (!target) return;
      const link = target instanceof HTMLAnchorElement ? target : null;
      if (link?.download || link?.href.includes("/api/wallpaper-download")) {
        trackFirebaseEvent("file_download", { file_extension: "webp", link_url: link.href });
      } else if (link && link.origin !== window.location.origin) {
        trackFirebaseEvent("outbound_click", { link_domain: link.hostname });
      }
    };

    const onSubmit = (event: SubmitEvent) => {
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      if (!form || !form.action.includes("/search")) return;
      const query = String(new FormData(form).get("q") || "").trim();
      trackFirebaseEvent("search", { search_term_length: query.length });
    };

    const observers: PerformanceObserver[] = [];
    const observeMetric = (type: string, eventName: string) => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const entry = entries.at(-1);
          if (entry) trackFirebaseEvent(eventName, { value: Math.round(entry.duration || entry.startTime) });
        });
        observer.observe({ type, buffered: true });
        observers.push(observer);
      } catch {
        // Older browsers can safely skip unsupported performance metrics.
      }
    };
    observeMetric("largest-contentful-paint", "web_vital_lcp");
    observeMetric("first-input", "web_vital_fid");

    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (navigation) {
      trackFirebaseEvent("page_speed", {
        dom_content_loaded_ms: Math.round(navigation.domContentLoadedEventEnd),
        load_time_ms: Math.round(navigation.loadEventEnd || navigation.duration),
      });
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("click", onClick, { passive: true });
    document.addEventListener("submit", onSubmit);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit);
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);
  return null;
}
