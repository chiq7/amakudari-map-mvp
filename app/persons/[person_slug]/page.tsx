
// app/persons/[person_slug]/page.tsx

import Link from 'next/link';

// This function generates the static pages for each person at build time
export async function generateStaticParams() {
    const fs = require('fs');
    const path = require('path');
    const persons = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/persons.json'), 'utf8'));
    return persons.map((person: any) => ({
        person_slug: person.person_slug,
    }));
}

async function getPerson(slug: string) {
    const fs = require('fs');
    const path = require('path');
    const persons = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/persons.json'), 'utf8'));
    return persons.find((p: any) => p.person_slug === slug);
}

export async function generateMetadata({ params }: { params: { person_slug: string } }) {
    const person = await getPerson(params.person_slug);
    return { title: `${person?.氏名}の公表再就職情報` };
}


export default async function PersonPage({ params }: { params: { person_slug: string } }) {
    const person = await getPerson(params.person_slug);

    if (!person) {
        return <div>Person not found.</div>;
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">{person.氏名}の公表再就職情報</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard label="離職時年齢" value={person.離職時年齢} />
                <InfoCard label="離職時官職" value={person.離職時官職} />
                <InfoCard label="離職日" value={person.離職日} />
                <InfoCard label="再就職日" value={person.再就職日} />
                <InfoCard label="待機日数" value={person.wait_days !== null ? `${person.wait_days} 日` : '計算不可'} />
                <InfoCard label="再就職先名称" value={<Link href={`/organizations/${person.organization_slug}`} className="text-blue-400 hover:underline">{person.再就職先名称}</Link>} />
                <InfoCard label="再就職先業務内容" value={person.再就職先業務内容} />
                <InfoCard label="再就職先地位" value={person.再就職先地位} />
            </div>

            <div className="mt-6 text-xs text-gray-500">
                <p><b>出典:</b> {person.元ファイル名} ({person.ソース区分})</p>
                <p className="mt-2"><b>注意:</b> 本ページは公表資料に基づく再就職情報を整理したものです。同姓同名の人物と混同しないよう、離職時官職・再就職先・日付をあわせて表示しています。</p>
            </div>
        </div>
    );
}

const InfoCard = ({ label, value }: { label: string, value: any }) => (
    <div className="bg-gray-700 p-4 rounded">
        <h3 className="text-sm font-semibold text-gray-400">{label}</h3>
        <p className="text-lg">{value}</p>
    </div>
);
