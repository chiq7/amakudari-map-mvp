(() => {
  const fs = require("node:fs");
  const path = require("node:path");

  const newsPath = path.join(process.cwd(), "data", "news", "articles.json");
  const articles = JSON.parse(fs.readFileSync(newsPath, "utf8"));
  const errors = [];
  const slugs = new Set();
  const isString = (value) => typeof value === "string" && value.trim().length > 0;
  const isDate = (value) => isString(value) && !Number.isNaN(new Date(value).getTime());

  if (!Array.isArray(articles) || articles.length === 0) {
    errors.push("data/news/articles.json must contain at least one article.");
  }

  for (const [index, article] of articles.entries()) {
    const prefix = `articles[${index}]`;
    for (const field of ["slug", "kind", "title", "description", "lead"]) {
      if (!isString(article[field])) errors.push(`${prefix}.${field} is required.`);
    }
    if (!/^[a-z0-9-]+$/.test(article.slug ?? "")) {
      errors.push(`${prefix}.slug must use lowercase letters, numbers, and hyphens.`);
    }
    if (slugs.has(article.slug)) errors.push(`${prefix}.slug is duplicated: ${article.slug}`);
    slugs.add(article.slug);
    for (const field of ["datePublished", "dateModified"]) {
      if (!isDate(article[field])) errors.push(`${prefix}.${field} must be a valid date.`);
    }
    if (!Array.isArray(article.verifiedFacts) || article.verifiedFacts.length < 2) {
      errors.push(`${prefix}.verifiedFacts must contain at least two items.`);
    }
    for (const [factIndex, fact] of (article.verifiedFacts ?? []).entries()) {
      if (!isString(fact.title) || !isString(fact.body)) {
        errors.push(`${prefix}.verifiedFacts[${factIndex}] requires title and body.`);
      }
    }
    if (!Array.isArray(article.readingGuide) || article.readingGuide.length < 2) {
      errors.push(`${prefix}.readingGuide must contain at least two items.`);
    }
    for (const [guideIndex, guide] of (article.readingGuide ?? []).entries()) {
      if (!isString(guide.title) || !isString(guide.body)) {
        errors.push(`${prefix}.readingGuide[${guideIndex}] requires title and body.`);
      }
    }
    if (!Array.isArray(article.timeline) || article.timeline.length === 0) {
      errors.push(`${prefix}.timeline must contain at least one item.`);
    }
    for (const [timelineIndex, item] of (article.timeline ?? []).entries()) {
      if (!isDate(item.date) || !isString(item.label) || !isString(item.body)) {
        errors.push(`${prefix}.timeline[${timelineIndex}] requires date, label, and body.`);
      }
    }
    if (!Array.isArray(article.sources) || article.sources.length === 0) {
      errors.push(`${prefix}.sources must contain at least one source.`);
    }
    for (const [sourceIndex, source] of (article.sources ?? []).entries()) {
      if (!["一次資料", "補足資料"].includes(source.kind)) {
        errors.push(`${prefix}.sources[${sourceIndex}].kind must be 一次資料 or 補足資料.`);
      }
      for (const field of ["title", "publisher", "url", "checkedAt"]) {
        if (!isString(source[field])) errors.push(`${prefix}.sources[${sourceIndex}].${field} is required.`);
      }
      if (!/^https:\/\//.test(source.url ?? "")) {
        errors.push(`${prefix}.sources[${sourceIndex}].url must be an HTTPS URL.`);
      }
      if (!isDate(source.checkedAt)) errors.push(`${prefix}.sources[${sourceIndex}].checkedAt must be a valid date.`);
    }
    if (!Array.isArray(article.relatedLinks) || article.relatedLinks.length < 2) {
      errors.push(`${prefix}.relatedLinks must contain at least two internal links.`);
    }
    for (const [linkIndex, link] of (article.relatedLinks ?? []).entries()) {
      if (!isString(link.label) || !isString(link.href) || !link.href.startsWith("/")) {
        errors.push(`${prefix}.relatedLinks[${linkIndex}] requires label and an internal href.`);
      }
    }
    if (!Array.isArray(article.faq) || article.faq.length === 0) {
      errors.push(`${prefix}.faq must contain at least one item.`);
    }
    for (const [faqIndex, item] of (article.faq ?? []).entries()) {
      if (!isString(item.question) || !isString(item.answer)) {
        errors.push(`${prefix}.faq[${faqIndex}] requires question and answer.`);
      }
    }
  }

  if (errors.length > 0) {
    console.error("News content validation failed:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }

  console.log(`News content validation passed (${articles.length} article${articles.length === 1 ? "" : "s"}).`);
})();
