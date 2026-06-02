
// app/about/page.tsx
export default function AboutPage() {
    return (
        <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-lg">
            <h1 className="text-4xl font-bold mb-4">このサイトについて</h1>
            <div className="space-y-4 text-gray-300">
                <p>
                    本サイトは、内閣官房が公表している「国家公務員の再就職状況」の公表資料に基づき、官民の人材移動を検索・可視化することを目的に運営しています。
                </p>
                <p>
                    特定の個人・団体を批判または告発する意図はなく、あくまで公表された事実を整理し、中立的な視点からデータを提供することを目指しています。
                </p>
                <p>
                    情報の整理にあたり、当サイトは以下の表現方針を遵守します。
                </p>
                <ul className="list-disc list-inside bg-gray-700 p-4 rounded">
                    <li>ヘイトや断定的な表現は行いません。</li>
                    <li>事実・時系列・ランキングを客観的に提示します。</li>
                    <li>情報の因果関係については断定しません。</li>
                </ul>
                <p>
                    データには公表時点での情報が反映されており、現状と異なる場合があります。また、情報の集計・整理の過程で誤りが含まれる可能性もあります。お気づきの点がありましたら、将来的に設置予定のフィードバックフォームよりご連絡ください。
                </p>
                 <p>
                    今後の開発で、各データポイントの正確な出典（公表資料のURL、ページ数など）を明記していく予定です。
                </p>
            </div>
        </div>
    );
}
