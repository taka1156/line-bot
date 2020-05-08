const express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');
const asyncHandler = require('express-async-handler'); // expressでもasync使いたい
const { format } = require('fecha'); // 日付のフォーマット
const { makeMessage } = require('./flexMessage.js');
require('dotenv').config();

// トークン
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// qiita 認証(1000req/1h以上リクエストしたい)
const headers = {
  Accept: 'application/json',
  Authorization: `Bearer ${process.env.QIITA_TOKEN}`,
};

const app = express();
const client = new line.Client(config);

// 簡易的なサーバーの生死確認
app.get('/', (req, res) => {
  res.send('<h1>server is running</h1>');
});

// qiita記事の取得だけテスト
app.get('/api/:tag', asyncHandler(async (req, res) => {
    const TAG = req.params.tag;
    const QIITA_API = `https://qiita.com/api/v2/tags/${TAG}/items?page=1&per_page=100`;
    let result;

    // 記事取得
    await axios
      .get(QIITA_API, { headers: headers, data: {} })
      .then((response) => {
        const { data } = response;
        // 見つかった
        if (data != null) {
          if (data.length !== 0 || data.message !== 'Not found') {
            result = {
              type: 'flex',
              altText: `${TAG}タグの記事上位五件`,
              contents: {
                type: 'carousel',
                contents: formatArticle(data),
              },
            };

            // フレックスメッセージが空
            result = result.contents.contents.length === 0 ? null : result;
          }
        }
      })
      .catch((e) => {
        console.log(e);
      });

    // 見つからない
    if (result == null || result.length === 0) {
      result = {
        type: 'text',
        text:
          '見つかりません。\n(短縮してないワードで指定してみて下さい)。\n(vue => vue.jsなど)',
      };
    }

    res.json(result);
  })
);

/**
 *ここから下は、LINEbot用の処理
 */

// lineからのメッセージ受け取り
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // メッセージでなければ無視
    return Promise.resolve(null);
  }

  if (/.{2,}の記事を(探して|拾って)/gi.test(event.message.text)) {
    // Qiita記事の取得
    const TEXT = event.message.text;
    const INDEX = TEXT.indexOf('の');
    const TAG = TEXT.substring(0, INDEX);

    // Tagが取れたか確認
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: `${TAG}で記事を探しています。\n少し待ってて下さい。`,
    });

    const QIITA_API = `https://qiita.com/api/v2/tags/${TAG}/items?page=1&per_page=100`;
    // 初期値に見つからない時のメッセージを代入
    let result;
    // 記事取得
    await axios
      .get(QIITA_API, { headers: headers, data: {} })
      .then((response) => {
        const { data } = response;
        // 見つかった
        if (data != null) {
          if (data.length !== 0 || data.message !== 'Not found') {
            result = {
              type: 'flex',
              altText: `${TAG}タグの記事上位五件`,
              contents: {
                type: 'carousel',
                contents: formatArticle(data),
              },
            };

            // フレックスメッセージが空
            result = result.contents.contents.length === 0 ? null : result;
          }
        }
      })
      .catch((e) => {
        console.log(e);
      });

    // 見つからない
    if (result == null || result.length === 0) {
      result = {
        type: 'text',
        text:
          '見つかりません。\n(短縮してないワードで指定してみて下さい)。\n(vue => vue.jsなど)',
      };
    }

    // 結果を返す
    return client.pushMessage(event.source.userId, result);
  } else {
    // おうむ返し
    const PROFILE = await client.getProfile(event.source.userId);

    const echo = {
      type: 'text',
      text: `${PROFILE.displayName}さん\n「${event.message.text}」と言いましたね。`,
    };

    return client.replyMessage(event.replyToken, echo);
  }
}

// 応答するport
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

// ソートして記事をタイトルとLGTM数、リンクのみにして、FlexMessageのオブジェクトに整形
function formatArticle(articles) {
  // ソート
  articles = articles.sort((a, b) => {
    return b.likes_count - a.likes_count;
  });

  // 上位五件のみを通知
  articles = articles.slice(0, 5);

  // 整形
  articles = articles.map((article) => {
    const FOMART_TIME = format(new Date(article.updated_at), 'YYYY/MM/DD');
    const articlesInfo = {
      title: article.title,
      updatedAt: FOMART_TIME,
      userImg: article.user.profile_image_url,
      likesCount: article.likes_count,
      url: article.url,
    };
    return makeMessage(articlesInfo);
  });

  return articles;
}
