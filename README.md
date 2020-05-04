# LINE BOT

## 機能
- おうむ返し
- `/.{2,}の記事を(探して|拾って)/gi`にマッチする場合、指定のタグでQiita APIに記事を取得する。

## 使っているもの
- express
- @line/bot-sdk
- now

## scipts
- `yarn dev (now dev)`
- `yarn dev:deploy (now)`
- `yarn prod:deploy (now --prod)`

※ now --prodは、実行時のurlを固定したデプロイ

## トークンを登録
- `now secret add {トークン名} {トークン}`
- `now secret remove {トークン名}`
- `now secret list`
