# yt

YouTube関連のツール集です。

## 公開URL

- **メイン**: [https://hamuzon.github.io/yt/](https://hamuzon.github.io/yt/)
- **サムネイル取得**: [https://hamuzon.github.io/yt/thumbnail/](https://hamuzon.github.io/yt/thumbnail/)
- **テキスト抽出**: [https://hamuzon.github.io/yt/text/](https://hamuzon.github.io/yt/text/)

## 開発

```bash
npm install
npm run dev
```

## デプロイメモ

- **GitHub Pages**: `next.config.mjs` の `output: 'export'` により `out/` を配信します。
- **Cloudflare Workers**: `wrangler.jsonc` の `main` (`worker/index.ts`) で `/go` 系リダイレクトを処理し、その他は `assets.directory` (`out/`) を配信します。
- Worker は `/go` / `/yt` に加えて、GitHub Pages 互換の `/yt/go` / `/yt/yt` 形式も同じロジックで処理します。
