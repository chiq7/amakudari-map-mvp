
// app/rankings/page.tsx

async function getRankings() {
    const fs = require('fs');
    const path = require('path');
    const rankings = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/rankings.json'), 'utf8'));
    return rankings;
}

export default async function RankingsPage() {
    const rankings = await getRankings();
    
const rankingSections = [
        { title: "受け入れ法人ランキング", data: rankings.受け入れ法人ランキング },
        { title: "退職翌日再就職ランキング", data: rankings.退職翌日再就職ランキング },
        { title: "平均待機日数が短い法人ランキング", data: rankings.平均待機日数が短い法人ランキング, unit: '日' },
        { title: "法律事務所ランキング", data: rankings.法律事務所ランキング },
        { title: "監査法人コンサルランキング", data: rankings.監査法人コンサルランキング },
        { title: "大学研究機関ランキング", data: rankings.大学研究機関ランキング },
    ];

    return (
        <div>
            <h1 className="text-4xl font-bold mb-6">ランキング</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rankingSections.map(section => (
                    <RankingCard key={section.title} title={section.title} data={section.data} unit={section.unit} />
                ))}
            </div>
        </div>
    );
}

const RankingCard = ({ title, data, unit = '件' }: { title: string, data: { [key: string]: number } | undefined, unit?: string }) => (
    <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <ol className="list-decimal list-inside space-y-2">
            {Object.entries(data || {}).slice(0, 10).map(([name, count]) => (
                <li key={name} className="truncate">
                    <span className="font-semibold">{Math.round(count as number)} {unit}</span> - {name}
                </li>
            ))}
        </ol>
    </div>
);
