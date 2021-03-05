import express from 'express';
import  { Client,middleware, WebhookEvent, ClientConfig, MiddlewareConfig } from '@line/bot-sdk';
import  asyncHandler from 'express-async-handler'; // expressでもasync使いたい
import { LineBot } from '~/service/bot/linebot';
require('dotenv').config();

const router = express.Router();

// トークン
const CLIENT_CONF: ClientConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
}
const MIDDLE_CONF: MiddlewareConfig = {
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new Client(CLIENT_CONF);
const Bot = new LineBot(client);

// 簡易的なサーバーの生死確認
router.get('/', (_, res: express.Response) => {
  res.send('<h1>TS server is running</h1>');
});

// qiita記事の取得だけテスト
router.get('/qiita/:dummyTag', asyncHandler(async (req: express.Request, res: express.Response) => {
    const { dummyTag } = req.params;
    const TEST_QIITA_MESSAGE = await Bot.replyQiitaArticleTest(dummyTag);
    res.json(TEST_QIITA_MESSAGE);
  })
);

router.get('/parrot/:dummyName/:dummyText', (req: express.Request, res: express.Response) => {
  const { dummyName, dummyText } = req.params;
  const TEST_PARROT_MESSAGE = Bot.replyParrotTest(dummyName, dummyText);
  res.json(TEST_PARROT_MESSAGE);
})

/**
 *ここから下は、LINEbot用の処理
 */

// lineからのメッセージ受け取り
router.post('/webhook', middleware(MIDDLE_CONF), (req: express.Request, res: express.Response) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

async function handleEvent(event: WebhookEvent) {
  await Bot.handleEvent(event);
}

export { router };
