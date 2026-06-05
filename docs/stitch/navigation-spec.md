# 天下りマップ 導線仕様

## 基本方針

MVPでは、まだ専用ページが存在しないタグ・省庁・地域・法人種別・話題ページは、法人検索ページのクエリパラメータ付きURLで代替する。

将来的には、アクセスが多い切り口から専用ページ化する。

将来URL例：

* `/tags/[slug]`
* `/ministries/[slug]`
* `/regions/[slug]`
* `/types/[slug]`
* `/industries/[slug]`
* `/topics/[slug]`
* `/rankings/[slug]`

## 共通Header

* ロゴ「天下りマップ」 → `/`
* 話題から探す → `/corporations`

  * MVPでは法人検索ページのタグ/切り口エリアへ誘導
  * 将来は `/topics` または `/tags` 系に分離
* ランキング → `/rankings`
* 法人検索 → `/corporations`
* データ方針 → `/data-policy`
* ヘッダー検索ボックス → `/corporations?keyword={入力値}`

## Footer

* 天下りマップ → `/`
* 免責事項 → `/data-policy#disclaimer`
* プライバシーポリシー → 将来 `/privacy`

  * MVPで未実装ならリンク非活性または `#`
* データ方針 → `/data-policy`
* お問い合わせ → 将来 `/contact`

  * MVPで未実装ならリンク非活性または `#`

## TOPページ `/`

### ヒーロー検索

* メイン検索ボックス → `/corporations?keyword={入力値}`

### ヒーローボタン

* 法人を検索 → `/corporations`
* ランキング → `/rankings`
* データ方針 → `/data-policy`

### 主要統計カード

カード全体クリック可能にする場合：

* 公表再就職情報 → `/corporations`
* 受け入れ法人 → `/corporations`
* 退職翌日再就職 → `/corporations?nextDay=true`
* 30日以内再就職 → `/corporations?within30Days=true`

### 人気の切り口から探す

* 退職翌日再就職 → `/corporations?nextDay=true`
* 30日以内再就職 → `/corporations?within30Days=true`
* 国土交通省 → `/corporations?ministry=国土交通省`
* 経済産業省 → `/corporations?ministry=経済産業省`
* 厚生労働省 → `/corporations?ministry=厚生労働省`
* IT・通信 → `/corporations?industry=IT・通信`
* 建設・不動産 → `/corporations?industry=建設・不動産`
* 医療・福祉 → `/corporations?industry=医療・福祉`
* 独立行政法人 → `/corporations?type=独立行政法人`
* 公益財団法人 → `/corporations?type=公益財団法人`
* 株式会社 → `/corporations?type=株式会社`
* ライドシェア → `/corporations?topic=ライドシェア`
* 再エネ → `/corporations?topic=再エネ`
* 防衛 → `/corporations?topic=防衛`
* 東京都 → `/corporations?region=東京都`
* 大阪府 → `/corporations?region=大阪府`
* 関東地方 → `/corporations?region=関東地方`

### 注目の公表情報

* 各法人カード → `/corporations/[slug]`
* 詳細を見る → `/corporations/[slug]`
* すべて見る → `/corporations`

### ランキングから探す

* ランキング一覧へ → `/rankings`
* 各法人名 → `/corporations/[slug]`
* もっと見る → `/rankings`

  * 将来は `/rankings/[slug]`

### 法人名から探す

* すべての法人を見る → `/corporations`
* 各法人名 → `/corporations/[slug]`

### 集計データから探す

* すべての集計を見る → `/rankings`
* 省庁別集計の各省庁 → `/corporations?ministry={省庁名}`
* 業務内容別集計の各業務 → `/corporations?industry={業務名}`

### データの見方について

* データ方針を見る → `/data-policy`

## ランキングページ `/rankings`

### 検索・フィルター

* 省庁フィルター → URLクエリ `?ministry={省庁名}`
* 法人種別フィルター → URLクエリ `?type={法人種別}`
* 地域フィルター → URLクエリ `?region={地域}`
* キーワード検索 → URLクエリ `?keyword={入力値}`

### ランキングカード / 一覧

* 各法人名 → `/corporations/[slug]`
* 各行クリック → `/corporations/[slug]`
* もっと見る → MVPでは `/rankings`

  * 将来は `/rankings/[rankingType]`

### 関連する切り口

* 省庁別 → `/corporations?ministry={省庁名}`
* 地域別 → `/corporations?region={地域}`
* 法人種別 → `/corporations?type={法人種別}`
* 話題別 → `/corporations?topic={話題}`

## 法人検索 / 法人一覧ページ `/corporations`

### 検索フォーム

* キーワード検索 → `/corporations?keyword={入力値}`
* 省庁フィルター → `/corporations?ministry={省庁名}`
* 法人種別フィルター → `/corporations?type={法人種別}`
* 地域フィルター → `/corporations?region={地域}`
* 退職翌日再就職あり → `/corporations?nextDay=true`
* 30日以内再就職あり → `/corporations?within30Days=true`

複数条件がある場合はクエリを結合する。

例：

`/corporations?ministry=国土交通省&type=一般財団法人&nextDay=true`

### サマリーカード

* 受け入れ法人 → `/corporations`
* 公表再就職者数 → `/corporations`
* 退職翌日再就職あり → `/corporations?nextDay=true`
* 30日以内再就職あり → `/corporations?within30Days=true`

### 法人一覧テーブル

* 法人名 → `/corporations/[slug]`
* 詳細を見る → `/corporations/[slug]`
* 行クリック可能にする場合 → `/corporations/[slug]`

### 関連する切り口から探す

* 退職翌日・短期再就職から探す → `/corporations?nextDay=true`
* 30日以内再就職から探す → `/corporations?within30Days=true`
* 出身省庁のつながりから探す → `/corporations?ministry={省庁名}`
* 法人の種類から探す → `/corporations?type={法人種別}`
* ランキングから探す → `/rankings`
* 地域から探す → `/corporations?region={地域}`
* データ方針を見る → `/data-policy`

## 法人詳細ページ `/corporations/[slug]`

### パンくず

* TOP → `/`
* 法人検索 → `/corporations`
* 現在の法人名 → リンクなし

### タグ

* 省庁タグ → `/corporations?ministry={省庁名}`
* 法人種別タグ → `/corporations?type={法人種別}`
* 地域タグ → `/corporations?region={地域}`
* 話題タグ → `/corporations?topic={話題}`

### 公表再就職者一覧テーブル

* 氏名 → `/persons/[slug]`
* 出典 → 外部URL

  * `target="_blank"`
  * `rel="noopener noreferrer"`

### 関連情報

* 関連トピック → `/corporations?topic={話題}`
* 元省庁の内訳 → `/corporations?ministry={省庁名}`
* データ方針について → `/data-policy`
* 外部出典・オリジナル資料 → 外部URL

## 個人詳細ページ `/persons/[slug]`

### パンくず

* TOP → `/`
* 法人検索 → `/corporations`
* 法人詳細 → `/corporations/[slug]`
* 現在の人物名 → リンクなし

### サマリーカード

原則、カード自体はリンクにしない。

ただし再就職先カードだけリンク化する場合：

* 再就職先 → `/corporations/[slug]`

### タグ

* 元省庁タグ → `/corporations?ministry={省庁名}`
* 法人種別タグ → `/corporations?type={法人種別}`
* 地域タグ → `/corporations?region={地域}`
* 役職タグ → `/corporations?position={役職名}`
* 再就職情報タグ → `/corporations?tag=再就職情報`

個人詳細ページでは「天下り」タグは使わない。

### 出典・公表資料

* 出典リンク → 外部URL

  * `target="_blank"`
  * `rel="noopener noreferrer"`

### 関連リンク

* 法人情報を詳しく見る → `/corporations/[slug]`
* 国土交通省の再就職統計を見る → MVPでは `/corporations?ministry=国土交通省`

  * 将来は `/ministries/mlit`
* 退職翌日再就職ランキングを見る → `/rankings`

  * 将来は `/rankings/next-day`
* 類似の再就職事例を見る → `/corporations?ministry={省庁名}&waitDays=0`
* データ方針について → `/data-policy`

## データ方針ページ `/data-policy`

### パンくず

* トップ → `/`
* データ方針 → リンクなし

### ページ内アンカー

可能であれば以下のidを付ける。

* データソース → `#sources`
* 表示項目と抽出ルール → `#fields`
* 待機期間の算出について → `#waiting-period`
* タグ付け・ランキング・集計 → `#ranking-policy`
* 免責事項・法的判断について → `#disclaimer`
* 掲載内容の修正・お問い合わせ → `#contact`

### 下部導線

* 法人検索へ → `/corporations`
* ランキングを見る → `/rankings`
* TOPへ戻る → `/`

### お問い合わせ

MVPで問い合わせページを実装しない場合：

* お問い合わせする → `#contact` または一旦非活性

将来的には：

* お問い合わせする → `/contact`

## 未実装ページの扱い

MVP時点で以下は未実装でもよい。

* `/privacy`
* `/contact`
* `/tags/[slug]`
* `/ministries/[slug]`
* `/regions/[slug]`
* `/types/[slug]`
* `/industries/[slug]`
* `/topics/[slug]`
* `/rankings/[slug]`

未実装ページへのリンクは、MVPでは法人検索のクエリURLで代替する。
どうしてもリンク先がない場合は、非活性表示または `#` にするが、最終実装チェックで `href="#"` が大量に残らないようにする。

## 実装後チェック

* Headerリンクが正しいか
* Footerリンクが正しいか
* 検索フォームがクエリ付きで遷移するか
* タグクリックがクエリ付き法人検索へ遷移するか
* 法人名クリックが法人詳細へ遷移するか
* 氏名クリックが個人詳細へ遷移するか
* 出典リンクが外部リンクとして開くか
* 未実装ページへのリンクが不自然に残っていないか
