# Daily draft promotion

Use this workflow to add 10 to 30 reviewed records from a published Excel
source. Production data must only be updated from records whose source can be
verified.

## 1. Import a draft

```powershell
npm.cmd run import:excel -- --file "data/pool/raw/source.xlsx" --limit 30 --source-id "source-id" --source-url "https://example.go.jp/source.xlsx"
```

The importer creates draft records with `approved: false`. It does not update
production.

## 2. Review the draft

Before approval, enrich corporation information and review ambiguous names:

```powershell
npm.cmd run enrich:corporations -- --file "data/draft/example.json" --dry-run --limit 30
npm.cmd run enrich:corporations -- --file "data/draft/example.json" --apply --limit 30
```

Use the generated `.enriched.json` file for the remaining steps. See
`docs/corporation-enrichment.md` for matching and review-needed rules.

Check the source URL, person, former ministry and title, corporation, dates,
and inferred values. Set `approved: true` only for records confirmed against
the published source.

## 3. Preview the promotion

```powershell
npm.cmd run promote:draft -- --file "data/draft/example.enriched.json" --dry-run --limit 10
```

Dry-run is the default. Without `--apply`, production files and archives are
not written. The command reports skipped, duplicate, pending, and selected
counts. `--limit` defaults to 10 and accepts integers from 1 to 30.

## 4. Apply reviewed records

```powershell
npm.cmd run promote:draft -- --file "data/draft/example.enriched.json" --apply --limit 10
```

Before writing, the command validates a complete production candidate and
creates `data/archive/YYYYMMDD_HHmmss_before_promote/`. If validation or
generation fails while writing the standard production directory, production
is restored from that archive.

## 5. Verify before committing

```powershell
npm.cmd run validate:data
npm.cmd run generate:content
npx.cmd tsc --noEmit
npm.cmd run build
```

Do not commit or push if any verification command fails.
