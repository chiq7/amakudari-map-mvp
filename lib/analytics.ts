export type AnalyticsValue = string | number | boolean | null | undefined;
export type AnalyticsParams = Record<string, AnalyticsValue>;

type AnalyticsWindow = Window & {
  dataLayer?: Array<Record<string, AnalyticsValue>>;
};

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const analyticsWindow = window as AnalyticsWindow;
  if (!Array.isArray(analyticsWindow.dataLayer)) {
    return;
  }

  const safeParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  );

  analyticsWindow.dataLayer.push({
    event: eventName,
    ...safeParams,
  });
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
  if (pathname === "/data-policy") return "data_policy";
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
