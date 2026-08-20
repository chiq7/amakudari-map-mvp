export type AnalyticsValue = string | number | boolean | null | undefined;
export type AnalyticsParams = Record<string, AnalyticsValue>;

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (command: "event", eventName: string, params: AnalyticsParams) => void;
};

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const analyticsWindow = window as AnalyticsWindow;
  const safeParams = Object.fromEntries(
    Object.entries({
      page_location: window.location.href,
      page_path: `${window.location.pathname}${window.location.search}`,
      ...params,
    }).filter(([, value]) => value !== undefined),
  );

  // GoogleAnalytics sets `gtag` after the base tag has loaded. Calling it is
  // important: pushing a plain array into dataLayer does not invoke gtag's
  // argument handling, so GA4 never receives the custom event.
  if (typeof analyticsWindow.gtag === "function") {
    analyticsWindow.gtag("event", eventName, safeParams);
    return;
  }

  // Preserve events made during the short period before the GA script loads.
  // The official gtag queue expects an Arguments-like value.
  const dataLayer = analyticsWindow.dataLayer ?? (analyticsWindow.dataLayer = []);
  function queueGtagEvent(...queuedArgs: unknown[]) {
    void queuedArgs;
    dataLayer.push(arguments);
  }
  queueGtagEvent("event", eventName, safeParams);
}

/**
 * Page-open events must not run before GA4's base configuration. If a custom
 * event becomes the first event in a session, GA4 can report an empty landing
 * page. Click events still use trackEvent directly so a fast navigation does
 * not discard them.
 */
export function trackPageEventWhenReady(
  eventName: string,
  params: AnalyticsParams = {},
) {
  if (typeof window === "undefined") return () => undefined;

  let cancelled = false;
  let attempts = 0;
  let timer: number | undefined;

  const send = () => {
    if (cancelled) return;

    const analyticsWindow = window as AnalyticsWindow;
    if (typeof analyticsWindow.gtag === "function") {
      trackEvent(eventName, params);
      return;
    }

    attempts += 1;
    if (attempts < 20) timer = window.setTimeout(send, 250);
  };

  send();

  return () => {
    cancelled = true;
    if (timer !== undefined) window.clearTimeout(timer);
  };
}

export function getPageType(pathname: string) {
  if (pathname === "/") return "home";
  if (pathname === "/rankings") return "rankings";
  if (pathname === "/corporations") return "corporations_index";
  if (/^\/corporations\/[^/]+$/.test(pathname)) return "corporation_detail";
  if (pathname === "/persons") return "persons_index";
  if (/^\/persons\/[^/]+$/.test(pathname)) return "person_detail";
  if (pathname === "/organizations") return "organizations_index";
  if (/^\/organizations\/[^/]+$/.test(pathname)) return "organization_detail";
  if (pathname === "/topics") return "topics_index";
  if (/^\/topics\/[^/]+$/.test(pathname)) return "topic_detail";
  if (pathname === "/news") return "news_index";
  if (/^\/news\/[^/]+$/.test(pathname)) return "news_article";
  if (pathname === "/data-policy") return "data_policy";
  if (pathname === "/retirement-estimator") return "retirement_estimator";
  if (pathname === "/search") return "search";
  if (pathname === "/about") return "about";
  return "other";
}

export function getLinkType(pathname: string) {
  const pageType = getPageType(pathname);
  if (pageType.endsWith("_detail")) return "detail";
  if (pageType.endsWith("_index")) return "index";
  return pageType;
}
