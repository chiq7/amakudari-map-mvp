
// app/organizations/[organization_slug]/page.tsx

import Link from 'next/link';
import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/ui';

export async function generateStaticParams() {
    const fs = require('fs');
    const path = require('path');
    const orgs = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/organizations.json'), 'utf8'));
    return orgs.map((org: any) => ({
        organization_slug: org.organization_slug,
    }));
}

async function getOrganization(slug: string) {
    const fs = require('fs');
    const path = require('path');
    const orgs = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/organizations.json'), 'utf8'));
    return orgs.find((o: any) => o.organization_slug === slug);
}

export async function generateMetadata({ params }: { params: { organization_slug: string } }) {
    const org = await getOrganization(params.organization_slug);
    if (!org) return {} satisfies Metadata;
    const title = `${org.再就職先名称}の関連情報`;
    const description = `${org.再就職先名称}について、公表資料に基づく再就職者数、待機日数、主な役職・業務内容を整理しています。`;
    return {
        title,
        description,
        alternates: { canonical: `/organizations/${params.organization_slug}` },
        openGraph: { title, description, url: `/organizations/${params.organization_slug}`, images: ['/ogp.png'] },
        twitter: { title, description, images: ['/ogp.png'] },
    } satisfies Metadata;
}

export default async function OrganizationPage({ params }: { params: { organization_slug: string } }) {
    const org = await getOrganization(params.organization_slug);

    if (!org) {
        return <div>Organization not found.</div>;
    }

    return (
        <div>
            <Breadcrumb items={[
                { label: 'TOP', href: '/' },
                { label: '組織一覧', href: '/organizations' },
                { label: org.再就職先名称 },
            ]} />
            <h1 className="text-4xl font-bold mb-2">{org.再就職先名称}</h1>
            <p className="text-gray-400">公表資料に基づく官民人材移動の関連情報</p>

            <div className="my-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <StatCard label="受け入れ人数" value={org.受け入れ人数} />
                <StatCard label="平均待機日数" value={org.平均待機日数 ? `${Math.round(org.平均待機日数)}日` : 'N/A'} />
                <StatCard label="退職翌日再就職" value={`${org.退職翌日再就職件数}件`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4">再就職者一覧</h2>
                    <ul className="space-y-4">
                        {org.再就職者一覧.map((p: any) => (
                            <li key={p.person_slug} className="bg-gray-700 p-3 rounded">
                                <Link href={`/persons/${p.person_slug}`} className="font-bold text-blue-400 hover:underline">{p.氏名}</Link>
                                <p className="text-sm text-gray-400">元: {p.離職時官職}</p>
                                <p className="text-sm text-gray-300">現: {p.再就職先地位}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4">主な傾向</h2>
                    <h3 className="font-bold mt-4 mb-2">主な再就職先地位 (TOP5)</h3>
                    <ul className="list-disc list-inside">
                        {Object.entries(org.主な再就職先地位TOP5).map(([pos, count]) => <li key={pos}>{pos}: {count as number}件</li>)}
                    </ul>
                     <h3 className="font-bold mt-4 mb-2">主な再就職先業務内容 (TOP5)</h3>
                    <ul className="list-disc list-inside">
                        {Object.entries(org.主な再就職先業務内容TOP5).map(([biz, count]) => <li key={biz}>{biz}: {count as number}件</li>)}
                    </ul>
                </div>
            </div>
             <p className="mt-4 text-xs text-gray-500">※本ページは公表資料に基づき、関連する情報を機械的に整理したものです。</p>
        </div>
    );
}

const StatCard = ({ label, value }: { label: string, value: any }) => (
    <div className="bg-gray-800 p-4 rounded-lg">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
    </div>
);
