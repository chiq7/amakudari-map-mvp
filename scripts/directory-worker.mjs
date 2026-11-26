import { getDirectoryPage } from "./directory-filters.js";
import corporations from "./directory-data.js";
import legacyOrganizations from "./legacy-organizations.js";

function escape(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function pageLink(params, page, label) {
  const next = new URLSearchParams(params);
  next.set("page", String(page));
  return `<a href="/corporations?${escape(next)}#server-directory-results">${label}</a>`;
}

function resultsMarkup(result, params) {
  const { activeFilters, filteredCorporations, first, page, pageCount, visibleCorporations } = result;
  const title = activeFilters.map((filter) => filter.heading).join("・") || "すべての法人";
  const rows = visibleCorporations.map((corp) => {
    const href = "/corporations/" + encodeURIComponent(corp.slug);
    const stats = corp.count ? `${corp.personCount}人・${corp.count}件` : "再就職記録未収録";
    return `<li><a href="${href}">${escape(corp.name)}</a>（${escape(corp.type)}／${stats}）</li>`;
  }).join("");
  const previous = page > 1 ? pageLink(params, page - 1, "前の法人を見る") : "";
  const next = page < pageCount ? pageLink(params, page + 1, "次の法人を見る") : "";
  return `<section id="server-directory-results" class="rounded-xl border border-outline-variant bg-white p-5"><h2 class="text-xl font-bold">${escape(title)}</h2><p>${filteredCorporations.length}法人中 ${rows ? first + 1 : 0}〜${first + visibleCorporations.length}法人を表示</p>${rows ? `<ul class="my-4 space-y-2 text-secondary underline">${rows}</ul>` : "<p>条件に一致する法人は見つかりませんでした。</p>"}<nav aria-label="法人一覧のページ送り" class="flex gap-4 text-secondary underline">${previous}${next}</nav><a href="/corporations">条件を外して法人一覧へ</a></section>`;
}

const directoryWorker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/organizations/") && ["GET", "HEAD"].includes(request.method)) {
      const key = url.pathname.slice("/organizations/".length).replace(/\/$/, "").toLowerCase();
      if (!key) return Response.redirect(new URL("/corporations", url), 308);
      if (Object.hasOwn(legacyOrganizations, key)) {
        return Response.redirect(new URL(`/corporations/${legacyOrganizations[key]}`, url), 308);
      }
      const missing = await env.ASSETS.fetch(new Request(new URL("/_missing-legacy-organization", url), { method: request.method }));
      return new Response(missing.body, { status: 404, headers: missing.headers });
    }
    if (url.pathname !== "/corporations" || !url.search || !["GET", "HEAD"].includes(request.method)) {
      return env.ASSETS.fetch(request);
    }
    const result = getDirectoryPage(corporations, url.searchParams);
    if (!result.renderDirectory) return env.ASSETS.fetch(request);
    const baseUrl = new URL(url.pathname, url.origin);
    const baseRequest = new Request(baseUrl, request);
    baseRequest.headers.delete("If-None-Match");
    baseRequest.headers.delete("If-Modified-Since");
    const base = await env.ASSETS.fetch(baseRequest);
    if (!base.ok || !base.headers.get("Content-Type")?.includes("text/html")) return base;
    // HEAD has no body to rewrite; HTMLRewriter on it returned 500 for filtered URLs
    // (Next.js link prefetch sends HEAD). Answer with the same headers as a GET would.
    if (request.method === "HEAD") {
      const headers = new Headers(base.headers);
      headers.delete("ETag");
      headers.delete("Content-Length");
      headers.set("Cache-Control", "private, no-cache");
      return new Response(null, { status: base.status, headers });
    }
    const rewriter = new HTMLRewriter()
      .on("#server-directory", { element(el) { el.setInnerContent(resultsMarkup(result, url.searchParams), { html: true }); } })
      .on("#featured-corporations-directory", { element(el) { el.setAttribute("hidden", ""); } });
    if (result.filteredCorporations.length === 0) {
      rewriter.on("head", { element(el) { el.append('<meta name="robots" content="noindex, follow">', { html: true }); } });
    }
    const output = rewriter.transform(base);
    output.headers.delete("ETag");
    output.headers.set("Cache-Control", "private, no-cache");
    return output;
  },
};

export default directoryWorker;
