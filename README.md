# yt

YouTube関連のツール集です。

## 公開URL

- **メイン**: <https://hamuzon.github.io/yt/>
- **Cloudflare (埋め込みプレビュー対応)**: <https://youtube-link.hamusata.f5.si/>
- **サムネイル取得**: <https://hamuzon.github.io/yt/thumbnail/>
- **テキスト抽出**: <https://hamuzon.github.io/yt/text/>

## 共有リンクの埋め込みプレビュー

`/go/?v=動画ID` のリンクは、Cloudflare Worker がクローラー（Discord / X / Slack など）に
`og:video` 付きの HTML を返すため、YouTube プレーヤーとして埋め込み表示されます。

GitHub Pages は静的ホスティングのため、`https://hamuzon.github.io/yt/go/?v=...` では
動画ごとの OGP を生成できません。埋め込みプレビューが必要な場合は Cloudflare 版の URL を共有してください。
