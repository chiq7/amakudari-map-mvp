import Link from 'next/link';

const regions = [
    { id: 'hokkaido-tohoku', slug: 'hokkaido-tohoku', name: '北海道・東北', count: 118 },
    { id: 'kanto', slug: 'kanto', name: '関東', count: 426 },
    { id: 'chubu', slug: 'chubu', name: '中部', count: 173 },
    { id: 'kinki', slug: 'kinki', name: '近畿', count: 214 },
    { id: 'chugoku-shikoku', slug: 'chugoku-shikoku', name: '中国・四国', count: 96 },
    { id: 'kyushu-okinawa', slug: 'kyushu-okinawa', name: '九州・沖縄', count: 142 },
];

export default function JapanRegionMap() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {regions.map((region) => (
                <Link
                    key={region.id}
                    href={`/regions/${region.slug}`}
                    className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-3 text-sm hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                    <span className="font-semibold text-gray-800">{region.name}</span>
                    <span className="font-mono text-gray-600">{region.count}件</span>
                </Link>
            ))}
        </div>
    );
}
