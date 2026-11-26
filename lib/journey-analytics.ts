type JourneyClick = {
  pagePath: string;
  origin: string;
  location: string;
  destination: URL;
  isSourceLink: boolean;
  sourceType?: string;
};

export function getJourneyClickEvent({
  pagePath,
  origin,
  location,
  destination,
  isSourceLink,
  sourceType,
}: JourneyClick) {
  if (destination.protocol !== "https:" && destination.protocol !== "http:") return;

  if (pagePath === "/" && destination.origin === origin) {
    // 2026-11-27: 「天下りとは？」のリンク先は /about#reemployment-rules、「省庁別一覧」は /ministries
    if (location === "home_intent_definition" && destination.pathname === "/about") return "click_home_definition";
    if (location === "home_intent_lists") {
      if (destination.pathname === "/ministries") return "click_home_ministry_list";
      if (destination.pathname === "/corporations") return "click_home_company_list";
    }
    return;
  }

  if (!isSourceLink || destination.origin === origin) return;

  // Start on the existing source catalogue and corporation detail pages.
  // The shared listener must not add new events to other person pages.
  if (/^\/corporations\/[^/]+\/?$/.test(pagePath)) {
    if (sourceType === "official_website") return "click_company_official_site";
    if (sourceType === "government_primary_source") return "click_public_source_doc";
  }

  if (pagePath === "/data-policy" && location === "data_sources" && !sourceType) {
    const host = destination.hostname;
    // Count tagged public-agency resource pages, not registry lookups or homepages.
    if (
      /\.(go|lg)\.jp$/.test(host) &&
      host !== "gbiz.go.jp" && !host.endsWith(".gbiz.go.jp") &&
      host !== "houjin-bangou.nta.go.jp" && !host.endsWith(".houjin-bangou.nta.go.jp") &&
      destination.pathname !== "/"
    ) return "click_public_source_doc";
  }
}
