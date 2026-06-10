# Corporation enrichment workflow

This workflow enriches draft or production corporations with public corporate
number information and optional gBizINFO details.

## Environment

`GBIZINFO_API_TOKEN` is optional. Without it, the workflow can still use the
National Tax Agency corporate-number search and existing local gBizINFO data.
Never commit the token or `.env.local`.

## Daily workflow

1. Import up to 30 draft records.

```powershell
npm.cmd run import:excel -- --file "data/pool/raw/source.xlsx" --limit 30
```

2. Preview corporation enrichment.

```powershell
npm.cmd run enrich:corporations -- --file "data/draft/example.json" --dry-run --limit 30
```

3. Write a separate enriched draft.

```powershell
npm.cmd run enrich:corporations -- --file "data/draft/example.json" --apply --limit 30
```

The default output is `example.enriched.json`. The original draft is not
modified. Ambiguous and unmatched names are written to
`data/draft/review-needed-corporation-enrichment-YYYYMMDD.json`.

4. Review every review-needed candidate and the source URL. Set
`approved: true` only after checking the original publication and corporation
identity.

5. Preview and apply promotion.

```powershell
npm.cmd run promote:draft -- --file "data/draft/example.enriched.json" --dry-run --limit 10
npm.cmd run promote:draft -- --file "data/draft/example.enriched.json" --apply --limit 10
```

6. Verify before committing.

```powershell
npm.cmd run validate:data
npm.cmd run generate:content
npx.cmd tsc --noEmit
npm.cmd run build
```

## Production enrichment

Preview at most 30 production corporations missing a corporate number or
gBizINFO data:

```powershell
npm.cmd run enrich:corporations -- --production --dry-run --limit 30
```

Apply creates
`data/archive/YYYYMMDD_HHmmss_before_enrich_corporations/` containing
`corporations.json`, `sources.json`, and `meta.json` before writing.

## Matching policy

Automatic enrichment requires exactly one candidate with either:

- an exact normalized corporation name; or
- a normalized name match after removing an equivalent legal form.

Multiple candidates, legal-form differences, missing addresses, low-confidence
matches, and unavailable searches are never applied automatically.
