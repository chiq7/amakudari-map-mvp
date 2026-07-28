# Google と Bing へのサイト登録

このリポジトリには、検索エンジンがクロールするための `robots.txt` と `sitemap.xml`、canonical、OGP、構造化データを含めています。公開後に以下を実施してください。

## 1. 本番公開を確認する

デプロイ後、次の URL がすべて `200` で開けることを確認します。

- `https://amakudari.jp/`
- `https://amakudari.jp/robots.txt`
- `https://amakudari.jp/sitemap.xml`
- `https://amakudari.jp/ogp.png`

## 2. Google Search Console

1. [Google Search Console](https://search.google.com/search-console/) で `https://amakudari.jp/` を URL プレフィックス プロパティとして追加します。
2. 所有権確認で **HTML タグ** を選び、表示された `content` 値をデプロイ環境の `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` に設定します。
3. 再デプロイ後、所有権確認を完了します。
4. 「サイトマップ」で `https://amakudari.jp/sitemap.xml` を送信します。
5. URL 検査でトップページを検査し、「インデックス登録をリクエスト」を実行します。

## 3. Bing Webmaster Tools

1. [Bing Webmaster Tools](https://www.bing.com/webmasters/) に `https://amakudari.jp/` を追加します。Google Search Console の確認済みプロパティをインポートしても構いません。
2. HTML メタタグで確認する場合は、表示された `content` 値をデプロイ環境の `NEXT_PUBLIC_BING_SITE_VERIFICATION` に設定して再デプロイします。
3. `https://amakudari.jp/sitemap.xml` を送信します。

`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` と `NEXT_PUBLIC_BING_SITE_VERIFICATION` は、ビルド時にそれぞれ `google-site-verification` と `msvalidate.01` のメタタグとして出力されます。値はリポジトリにコミットしません。

## 補足

サイトマップ送信や URL 検査はクロール・インデックス登録を保証するものではありません。登録状況は Google Search Console と Bing Webmaster Tools で確認してください。
