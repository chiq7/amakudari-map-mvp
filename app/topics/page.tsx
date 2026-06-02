
// app/topics/page.tsx
import Link from 'next/link';

async function getTopics() {
    const fs = require('fs');
    const path = require('path');
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/topics.json'), 'utf8'));
}

export default async function TopicsPage() {
    const topics = await getTopics();
    return (
        <div>
            <h1 className="text-4xl font-bold mb-6">話題から探す</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.map((topic: any) => (
                    <Link key={topic.topic_slug} href={`/topics/${topic.topic_slug}`} className="block bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition">
                        <h2 className="text-xl font-bold">{topic.title}</h2>
                    </Link>
                ))}
            </div>
        </div>
    );
}
