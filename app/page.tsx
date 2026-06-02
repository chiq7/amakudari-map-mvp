
import Link from 'next/link';

// NOTE: This is a simplified data loader for a static build.
async function getData() {
    const fs = require('fs');
    const path = require('path');
    const persons = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/persons.json'), 'utf8'));
    const organizations = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/organizations.json'), 'utf8'));
    const rankings = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/rankings.json'), 'utf8'));
    
    // --- Data for Page ---
    // Correctly structured topics
    const topics = [
        { slug: 'ride-share', title: 'ライドシェア', tag: '国土交通省', description: 'タクシー業界団体や関連企業への再就職状況と、規制緩和を巡る議論の相関。' },
        { slug: 'pachinko', title: 'パチンко規制', tag: '警察庁', description: '遊技機メーカー・業界団体への警察OBの再就職と、規制基準の変遷。' },
        { slug: 'renewable-energy', title: '再エネ補助金', tag: '経済産業省', description: '再生可能エネルギー関連企業・財団への人材移動と補助金交付実績。' },
        { slug: 'medical-fees', title: '医療報酬改定', tag: '厚生労働省', description: '大手製薬会社や医療法人への再就職データと、薬価・診療報酬改定の動向。' },
        { slug: 'nuclear-power', title: '原発再稼働', tag: '経産省・環境省', description: '電力会社や関連プラント企業への再就職状況データベース。' },
    ];

    // Correctly structured featured items
    const featured = [
        { title: '文部科学省OBの学校法人への一斉再就職（2023年度）', description: '公表資料から確認される、複数名の退職者による特定法人群への移動動向。'},
        { title: '金融庁から暗号資産取引業者への人材移動', description: '新規規制分野における、専門知識を持つ元官僚の業界団体・関連企業への再就職状況。' },
        { title: '国土交通省関連公益法人への役員就任状況', description: '道路・港湾関連の財団法人における、元幹部職員の理事就任に関する公表データ。'}
    ]

    return { rankings, topics, featured };
}

export default async function Home() {
    const { rankings, topics, featured } = await getData();

    // Filter out numeric-only keys and non-organizational names from rankings
    const excludedRankingKeys = ['自営', '自営業', '税理士', '弁護士', '公証人', '教授', '顧問', '参与'];
    const validRankingEntries = Object.entries(rankings.受け入れ法人ランキング)
        .filter(([name, count]) => !/^\d+$/.test(name) && !excludedRankingKeys.includes(name));

    return (
        <div className="flex flex-col gap-12">
            {/* Hero & Stats Section */}
            <section className="flex flex-col gap-3 items-center text-center pt-6 pb-4">
                <h1 className="text-3xl md:text-5xl font-bold text-primary">天下りマップ</h1>
                <p className="text-md text-on-surface-variant mb-4">公表資料から見る、官民人材移動データベース</p>
                <form action="/search" method="GET" className="w-full max-w-2xl relative mb-4">
                    <input className="w-full bg-white border border-gray-300 rounded-lg py-3 pl-5 pr-4 text-md text-on-surface focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm placeholder:text-gray-400" placeholder="法人名・氏名・官職で検索" type="text" name="q"/>
                </form>
                <div className="grid grid-cols-3 gap-4 w-full max-w-3xl">
                    <StatCard label="公表再就職情報" value={1733} />
                    <StatCard label="受け入れ法人" value={860} />
                    <StatCard label="退職翌日再就職" value={84} />
                </div>
            </section>

            {/* 3 Column Main Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TopicsColumn topics={topics} />
                <RankingsColumn rankingData={validRankingEntries} />
                <FeaturedInfoColumn featured={featured} />
            </div>
            
            {/* Japan Map Section */}
            <section>
                <h2 className="text-xl font-bold text-primary border-b-2 border-gray-200 pb-2 mb-4">地域から探す</h2>
                <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 shadow-sm">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        地域別の公表再就職情報を確認できます。数字は、各地域に所在地がある法人への再就職情報件数です。
                    </p>
                    <form action="/search" method="GET" className="mt-4">
                        <input
                            className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm placeholder:text-gray-400"
                            placeholder="都道府県名・市区町村名で検索"
                            type="text"
                            name="q"
                        />
                    </form>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {['東京都', '大阪府', '神奈川県', '愛知県', '福岡県', '北海道'].map((area) => (
                            <Link
                                key={area}
                                href={`/search?q=${encodeURIComponent(area)}`}
                                className="rounded-full border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
                            >
                                {area}
                            </Link>
                        ))}
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            ['北海道・東北', 118],
                            ['関東', 426],
                            ['中部', 173],
                            ['近畿', 214],
                            ['中国・四国', 96],
                            ['九州・沖縄', 142],
                        ].map(([area, count]) => (
                            <Link
                                key={area}
                                href={`/search?q=${encodeURIComponent(area as string)}`}
                                className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-3 text-sm hover:border-blue-500 transition-colors"
                            >
                                <span className="font-semibold text-gray-800">{area}</span>
                                <span className="font-mono text-gray-600">{count}件</span>
                            </Link>
                        ))}
                    </div>
                    <p className="mt-3 text-xs text-gray-500">地域別データは順次追加予定です。</p>
                </div>
            </section>

            {/* Aggregations Section */}
            <section>
                 <h2 className="text-xl font-bold text-primary border-b-2 border-gray-200 pb-2 mb-4">集計データ</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <AggregationCard title="省庁別集計" data={{ "国土交通省": 124, "経済産業省": 98, "厚生労働省": 85, "財務省": 72, "警察庁": 45, "農林水産省": 38 }} />
                    <AggregationCard title="業務内容別集計" data={{ "IT・通信": 156, "建設・不動産": 142, "医療・福祉": 118, "金融・保険": 94, "製造": 82, "運輸・物流": 64 }} />
                </div>
            </section>
        </div>
    );
}

// --- Components ---
const StatCard = ({ label, value }: { label: string, value: number }) => (
    <div className={`bg-white border rounded-lg p-3 flex flex-col items-center justify-center gap-1 shadow-sm border-gray-200 hover:border-gray-400 transition-colors`}>
        <div className={`text-2xl font-bold text-primary`}>{value.toLocaleString()}</div>
        <div className="text-xs font-semibold text-gray-500">{label}</div>
    </div>
);

const TopicsColumn = ({ topics }: { topics: any[] }) => (
    <section className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-bold text-primary border-b-2 border-blue-500 pb-2 mb-3">話題から探す</h2>
        <div className="flex flex-col gap-3">
            {topics.map(topic => (
                <Link key={topic.slug} href={`/topics/${topic.slug}`} className="group bg-gray-50 border border-gray-200 rounded p-3 hover:border-blue-500 transition-colors block">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold text-sm text-primary group-hover:text-blue-600">{topic.title}</h3>
                        <span className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px] font-semibold text-gray-600 whitespace-nowrap">{topic.tag}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{topic.description}</p>
                </Link>
            ))}
        </div>
    </section>
);

const RankingsColumn = ({ rankingData }: { rankingData: [string, any][] }) => (
    <section className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-bold text-primary border-b-2 border-green-500 pb-2 mb-3">受け入れ法人ランキング</h2>
        <ul className="flex flex-col">
            {rankingData.slice(0, 7).map(([name, count], index) => (
                 <li key={name} className="flex items-center justify-between py-2.5 border-b border-gray-200 text-sm">
                    <div className="flex items-center gap-3">
                        <span className={`font-bold w-4 text-center ${index < 3 ? 'text-blue-600' : 'text-gray-500'}`}>{index + 1}</span>
                        <span className="font-semibold text-gray-800 truncate pr-2">{name}</span>
                    </div>
                    <span className="text-gray-500 whitespace-nowrap">{count as number}名</span>
                </li>
            ))}
        </ul>
        <Link href="/rankings" className="text-sm text-blue-600 self-end mt-2 block text-right">もっと見る &rarr;</Link>
    </section>
);

const FeaturedInfoColumn = ({ featured }: { featured: any[] }) => (
    <section className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-bold text-primary border-b-2 border-purple-500 pb-2 mb-3">注目の公表情報</h2>
        <ul className="flex flex-col gap-3">
            {featured.map(item => (
                <li key={item.title} className="bg-gray-50 border border-gray-200 rounded p-3">
                    <div className="text-sm font-semibold text-gray-800">{item.title}</div>
                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                </li>
            ))}
        </ul>
    </section>
);

const AggregationCard = ({ title, data }: { title: string, data: { [key: string]: number } }) => (
    <section>
        <h3 className="text-md font-bold text-primary pb-2 border-b border-gray-200">{title}</h3>
        <div className="grid grid-cols-2 gap-3 mt-2">
            {Object.entries(data).map(([name, count]) => (
                <div key={name} className="bg-gray-50 border border-gray-200 rounded p-2 flex items-center justify-between text-sm">
                    <span className="font-semibold">{name}</span>
                    <span className="font-mono text-gray-600">{count}</span>
                </div>
            ))}
        </div>
    </section>
);
