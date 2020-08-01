const express = require('express');
const line = require('@line/bot-sdk');
const router = express.Router();
const asyncHandler = require('express-async-handler'); // expressでもasync使いたい
const { LineBot } = require('../../service/bot/linebot.js');
require('dotenv').config();

// トークン
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);
const Bot = new LineBot(client);

// 簡易的なサーバーの生死確認
router.get('/', (req, res) => {
  res.send('<h1>server is running</h1>');
});

// qiita記事の取得だけテスト
router.get('/qiita/:tag', asyncHandler(async (req, res) => {
    const TAG = req.params.tag;
    const MESSAGE = await Bot.replayArticleTest(TAG);
    res.json(MESSAGE);
  })
);

/**
 *ここから下は、LINEbot用の処理
 */

// lineからのメッセージ受け取り
router.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

async function handleEvent(event) {
  await Bot.handleEvent(event);
}

module.exports = router;
