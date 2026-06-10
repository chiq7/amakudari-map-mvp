
// app/topics/[topic_slug]/page.tsx

import type { Metadata } from "next";

export async function generateStaticParams() {
    const fs = require('fs');
    const path = require('path');
    const topics = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/topics.json'), 'utf8'));
    return topics.map((topic: any) => ({
        topic_slug: topic.topic_slug,
    }));
}

async function getTopic(slug: string) {
    const fs = require('fs');
    const path = require('path');
    const topics = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/topics.json'), 'utf8'));
    return topics.find((t: any) => t.topic_slug === slug);
}

export async function generateMetadata({
    params,
}: {
    params: { topic_slug: string };
}): Promise<Metadata> {
    return {
        alternates: { canonical: `/topics/${params.topic_slug}` },
    };
}

export default async function TopicDetailPage({ params }: { params: { topic_slug: string } }) {
    const topic = await getTopic(params.topic_slug);

    if (!topic) return <div>Topic not found.</div>

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">{topic.title}</h1>
            <div className="bg-gray-800 p-6 rounded-lg">
                <p className="text-gray-400">[MVP注記：このページは現在設計段階です。将来的には、このテーマに関連する可能性のある省庁、法人、個人の一覧が表示されます。]</p>
                <p className="mt-4 text-xs text-gray-500">{topic.caution_text || "このページは因果関係を示すものではありません。公表資料をもとに、関連する可能性のある省庁・法人・業界を整理するためのものです。"}</p>
            </div>
        </div>
    );
}
