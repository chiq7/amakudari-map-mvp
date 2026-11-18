import { formatDate } from "@/lib/display-text";
import Link from "next/link";
import type { Metadata } from "next";
import { canonicalUrl, pageMetadata } from "@/lib/seo";
import { getMinistryPath } from "@/lib/ministry-pages";
import { Breadcrumb, TagChip } from "@/components/ui";
import CorporationBusinessContext from "@/components/CorporationBusinessContext";
import OnizukaReemployment, { onizukaSlug } from "@/components/OnizukaReemployment";
import ShareButton from "@/components/ShareButton";
import { getCorporationEditorialContext } from "@/lib/corporation-contexts";
import { getCorporation, getPerson, persons, records, sources } from "@/lib/static-content";

export function generateStaticParams() {
  return persons.map((person) => ({ person_slug: person.slug }));
}

export async function generateMetadata(
  props: {
    params: Promise<{ person_slug: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  if (params.person_slug === onizukaSlug) {
    return pageMetadata(
      "鬼塚友章氏の再就職先｜警察庁離職後の公表記録",
      "鬼塚友章氏は2022年8月30日に警察庁長官官房付で離職。全国遊技機商業協同組合連合会や株式会社HESTA大倉など、6件の再就職先を就任日と当時の役職で一覧にしました。",
      `/persons/${onizukaSlug}`,
    );
  }
  const person = getPerson(params.person_slug);
  const title = `${person.name.replace(/\s/g, "")}氏の公表再就職記録｜${person.ministry}から${person.corporationName}へ`;
  const description = person.newPosition === "-"
    ? `${person.name}氏の離職時の官職は「${person.formerPosition}」。${formatDate(person.reemployedAt)}の公表記録にある再就職先は「${person.corporationName}」で、役職欄は「-」です。`
    : `${person.name}氏の離職時の官職は「${person.formerPosition}」。${formatDate(person.reemployedAt)}に${person.corporationName}の「${person.newPosition}」へ就任した公表記録と、元資料を確認できます。`;
  return pageMetadata(title, description, `/persons/${params.person_slug}`);
}

export default async function PersonDetailPage(props: { params: Promise<{ person_slug: string }> }) {
  const params = await props.params;
  if (params.person_slug === onizukaSlug) return <OnizukaReemployment />;
  const person = getPerson(params.person_slug);
  const recordSources = [...new Set(records.filter((record) => record.personSlug === person.slug).map((record) => record.sourceId))]
    .flatMap((id) => sources.filter((source) => source.id === id));
  const pageUrl = canonicalUrl(`/persons/${person.slug}`);
  const appointment = person.newPosition === "-" ? `再就職先は「${person.corporationName}」（役職欄は「-」）` : `再就職先は${person.corporationName}、就任時の役職は「${person.newPosition}」`;
  const sameNameProfiles = persons.filter((other) => other.slug !== person.slug && other.name === person.name);
  const personData = { "@context": "https://schema.org", "@type": "WebPage", url: pageUrl,
    mainEntity: { "@type": "Person", name: person.name, url: pageUrl, description: `${formatDate(person.reemployedAt)}の公表記録。 ${appointment}。` },
    citation: recordSources.map((source) => source.url) };
  const corporation = getCorporation(person.corporationSlug);
  const corporationContext = getCorporationEditorialContext(person.corporationSlug);
  const corporationWebsite =
    corporationContext?.business.officialWebsite || corporation.gbizInfo?.officialWebsite;
  return (
    <div className="flex flex-col gap-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personData).replace(/</g, "\\u003c") }} />
      <Breadcrumb
        items={[
          { label: "TOP", href: "/" },
          { label: "人物一覧", href: "/persons" },
          { label: person.name },
        ]}
      />

      <section>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-primary md:text-4xl">{person.name} 氏の再就職先・公表記録</h1>
            <p className="mt-2 text-base leading-7 text-on-surface-variant">
              離職時の官職は「{person.formerPosition}」。公表表に記載された{appointment}です。
            </p>
            <h2 className="mt-4 text-sm font-bold">再就職記録の根拠資料</h2>
            <div className="flex flex-wrap gap-x-4 text-sm">{recordSources.map((source) => <a key={source.id} href={source.url} data-analytics-event="source_link" data-source-type="government" className="inline-flex min-h-11 items-center font-semibold text-secondary underline">{source.publisher}の原資料：{source.title}{source.url.endsWith(".xlsx") ? "（Excel）" : ""}</a>)}</div>
            {sameNameProfiles.length ? <p className="mt-2 text-sm leading-7">同じ表記の氏名で別の官職・就職先を記載した記録もあります。同一人物かは確定していません。{sameNameProfiles.map((other) => <Link key={other.slug} href={`/persons/${other.slug}`} className="ml-2 font-semibold text-secondary underline">{other.corporationName}への記録</Link>)}</p> : null}
          </div>
          <ShareButton title={`${person.name}氏の公表再就職情報 | 天下りマップ`} />
        </div>
      </section>

      <section aria-labelledby="reemployment-flow-heading" className="border-y-4 border-primary bg-surface-container-lowest px-5 py-6 md:px-8 md:py-8">
        <p className="text-xs font-extrabold tracking-[0.12em] text-secondary">公表資料で確認できる移動</p>
        <h2 id="reemployment-flow-heading" className="mt-2 text-2xl font-extrabold text-primary md:text-3xl">
          どこから、どこへ移った？
        </h2>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <div className="mt-1 border-l-4 border-on-surface-variant bg-surface-container-low p-5 lg:mt-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="bg-on-surface-variant px-2 py-1 text-sm font-semibold text-surface">離職前</span>
              <span className="font-mono text-sm text-on-surface-variant">{formatDate(person.retiredAt)} 離職</span>
            </div>
            <p className="text-sm font-bold text-on-surface-variant">所属</p>
            <p className="mt-1 text-2xl font-extrabold text-primary">{person.ministry}</p>
            <div className="my-4 border-t border-outline-variant" />
            <p className="text-sm font-bold text-on-surface-variant">離職時の役職</p>
            <p className="mt-1 text-base font-semibold leading-7 text-primary">{person.formerPosition}</p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center bg-secondary text-lg font-bold text-on-secondary">
              <span className="lg:hidden">↓</span>
              <span className="hidden lg:inline">→</span>
            </div>
            <p className="text-sm font-extrabold text-secondary">待機 {person.waitDays}日</p>
            <p className="mt-1 text-xs text-on-surface-variant">
              {person.waitDays === 0 ? "離職日と就任日が同日" : "離職日から就任日まで"}
            </p>
          </div>

          <div className="border-l-4 border-secondary bg-secondary-fixed/30 p-5 lg:mt-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="bg-secondary px-2 py-1 text-sm font-semibold text-on-secondary">再就職後</span>
              <span className="font-mono text-sm text-on-surface-variant">{formatDate(person.reemployedAt)} 就任</span>
            </div>
            <p className="text-sm font-bold text-on-surface-variant">再就職先</p>
            <Link href={`/corporations/${person.corporationSlug}`} className="mt-1 block text-2xl font-extrabold leading-tight text-secondary hover:underline">
              {person.corporationName}
            </Link>
            <div className="my-4 border-t border-outline-variant" />
            <p className="text-sm font-bold text-on-surface-variant">再就職後の役職</p>
            <p className="mt-1 text-base font-semibold leading-7 text-primary">{person.newPosition}</p>
            {corporationWebsite ? (
              <a
                href={corporationWebsite.url}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics-event="source_link"
                data-source-type="official_website"
                data-analytics-location="person_reemployment_flow"
                className="mt-4 inline-flex min-h-11 items-center bg-primary px-4 text-sm font-extrabold text-white hover:bg-primary/90"
              >
                法人公式ページを見る ↗
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <CorporationBusinessContext
        corporation={corporation}
        connection={`${person.name}氏が${person.ministry}の「${person.formerPosition}」から、${person.newPosition}として${corporation.name}へ再就職した記録が公表されています。`}
      />

      <section>
        <h2 className="mb-2 text-sm font-bold text-on-surface-variant">関連タグ</h2>
        <div className="flex flex-wrap gap-2">
          <TagChip href={`/corporations?ministry=${encodeURIComponent(person.ministry)}`}>{person.ministry}</TagChip>
          <TagChip href={`/corporations?type=${encodeURIComponent(corporation.type)}`}>{corporation.type}</TagChip>
          {corporation.region && corporation.region !== "不明" ? (
            <TagChip href={`/corporations?region=${encodeURIComponent(corporation.region)}`}>{corporation.region}</TagChip>
          ) : null}
          {person.waitDays === 1 ? (
            <TagChip href="/corporations?flag=nextDay" active>
              退職翌日の再就職
            </TagChip>
          ) : null}
          {person.tags.filter((tag) => tag !== person.ministry && tag !== "再就職情報").slice(0, 3).map((tag) => (
            <TagChip key={tag} href={tag === "30日以内" ? "/corporations?flag=within30Days" : `/corporations?tag=${encodeURIComponent(tag)}`}>{tag === "30日以内" ? "30日以内の記録がある法人" : tag}</TagChip>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="mb-4 text-xl font-bold text-primary">関連リンク</h2>
          <div className="flex flex-col gap-3">
            <Link href={`/corporations/${person.corporationSlug}`} className="font-semibold text-secondary hover:underline">
              法人情報を詳しく見る
            </Link>
            <Link href={getMinistryPath(person.ministry)} className="font-semibold text-secondary hover:underline">
              {person.ministry}の関連記録を見る
            </Link>
            <Link href="/rankings" className="font-semibold text-secondary hover:underline">
              ランキングを見る
            </Link>
            <Link href={`/corporations?ministry=${encodeURIComponent(person.ministry)}&sort=shortestAverageWaitingDays`} className="font-semibold text-secondary hover:underline">
              類似の再就職事例を見る
            </Link>
            <Link href="/data-policy" className="font-semibold text-secondary hover:underline">
              データ方針について
            </Link>
          </div>
      </section>
    </div>
  );
}
