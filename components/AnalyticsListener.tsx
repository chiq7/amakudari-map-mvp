"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  getLinkType,
  getPageType,
  trackEvent,
  trackPageEventWhenReady,
} from "@/lib/analytics";

function getLocation(element: Element) {
  return (
    element.closest<HTMLElement>("[data-analytics-location]")?.dataset
      .analyticsLocation ?? "page_content"
  );
}

function getSourceType(anchor: HTMLAnchorElement) {
  if (anchor.dataset.sourceType) return anchor.dataset.sourceType;

  try {
    const hostname = new URL(anchor.href).hostname.replace(/^www\./, "");
    if (hostname.endsWith("gbiz.go.jp")) return "gbizinfo";
    if (hostname.endsWith("go.jp")) return "government";
    if (hostname.endsWith("lg.jp")) return "local_government";
    return "external_reference";
  } catch {
    return "external_reference";
  }
}

export default function AnalyticsListener() {
  const pathname = usePathname();

  useEffect(() => {
    const pageType = getPageType(pathname);
    const detailEventByPageType: Partial<Record<string, string>> = {
      person_detail: "view_person_detail",
      corporation_detail: "view_corporation_detail",
      organization_detail: "view_organization_detail",
      news_article: "view_news_article",
    };
    const detailEvent = detailEventByPageType[pageType];
    const cancelDetailEvent = detailEvent
      ? trackPageEventWhenReady(detailEvent, { page_type: pageType })
      : () => undefined;

    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;

      const location = getLocation(anchor);
      if (anchor.dataset.experimentId) {
        trackEvent("click_experiment_cta", {
          cta_name: anchor.dataset.ctaName ?? "unknown",
          location,
          experiment_id: anchor.dataset.experimentId,
        });
      }

      if (anchor.dataset.rankingType) {
        trackEvent("click_ranking_card", {
          ranking_type: anchor.dataset.rankingType,
          location,
        });
      }

      if (anchor.dataset.analyticsEvent === "source_link") {
        trackEvent("click_source_link", {
          source_type: getSourceType(anchor),
          location,
        });
      }

      if (anchor.dataset.analyticsEvent === "contact_link") {
        trackEvent("click_contact_link", { location });
      }

      const url = new URL(anchor.href, window.location.origin);
      if (url.origin !== window.location.origin) return;

      const filterKeys = [
        "ministry",
        "type",
        "region",
        "flag",
        "tag",
        "topic",
        "position",
        "waitDays",
        "sort",
        "nextDay",
      ];
      const activeFilterCount = filterKeys.filter((key) =>
        url.searchParams.has(key),
      ).length;
      if (url.pathname === "/corporations" && activeFilterCount > 0) {
        trackEvent("filter_use", {
          from_page_type: getPageType(pathname),
          filter_count: activeFilterCount,
          location,
        });
      }

      trackEvent("click_internal_link", {
        link_type: anchor.dataset.linkType ?? getLinkType(url.pathname),
        from_page_type: getPageType(pathname),
        to_page_type: getPageType(url.pathname),
        location,
      });
    }

    function handleSubmit(event: SubmitEvent) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (form.dataset.analyticsEvent !== "site_search") return;

      trackEvent("site_search", {
        page_type: getPageType(pathname),
        location: getLocation(form),
      });

      const searchInput = form.querySelector<HTMLInputElement>(
        'input[type="search"]',
      );
      const query = searchInput?.value.trim();
      if (!query) return;

      event.preventDefault();
      const destination = new URL(form.action, window.location.origin);
      destination.searchParams.set("keyword", query);
      window.location.assign(destination.href);
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);
    return () => {
      cancelDetailEvent();
      document.removeEventListener("click", handleClick);
      document.removeEventListener("submit", handleSubmit);
    };
  }, [pathname]);

  return null;
}
