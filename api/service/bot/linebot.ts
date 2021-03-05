import {
  WebhookEvent,
  Client,
  MessageEvent,
  TextEventMessage,
  EventBase,
} from '@line/bot-sdk';
import { replyParrot, replyTag, replyQiitaMessage } from '../line/line';
import { getQiitaArticle } from '../qiita/qiita';

interface LineBotInterface {
  handleEvent: (event: WebhookEvent) => Promise<any>;
}

// テキスト固定の型
type MessageTextEvent = {
  type: 'message';
  message: TextEventMessage;
} & EventBase & {
    replyToken: string;
  };

class LineBot implements LineBotInterface {
  client: null | Client = null;

  constructor(client: Client) {
    this.client = client;
  }

  // メッセージ判定
  handleEvent = async (event: WebhookEvent): Promise<any> => {
    if (event.type !== 'message' || event.message.type !== 'text') {
      // メッセージでなければ無視
      return Promise.resolve(null);
    }
    // 上でテキストでない時を、弾いてるので、`TextEventMessage`の固定要素を持つMessageEventだとみなす。
    const TextEvent = event as MessageTextEvent;
    if (/.{2,}の記事を(探して|拾って)/.test(TextEvent.message.text)) {
      // Qiitaで記事を取得
      const TEXT = event.message.text;
      const INDEX = TEXT.indexOf('の');
      const TAG = TEXT.substring(0, INDEX);
      await this.replyQiitaArticle(TAG, event);
    } else {
      // おうむ返し
      await this.replyParrot(TextEvent);
    }
  };

  // おうむ返し
  replyParrot = async (event: MessageTextEvent) => {
    // 発言者の名前を取得
    const { displayName } = await this.client.getProfile(event.source.userId);
    // Lineに適したメッセージオブジェクトに整形
    const PARROT_MESSAGE = replyParrot(displayName, event.message.text);
    // 返答
    return this.client.replyMessage(event.replyToken, PARROT_MESSAGE);
  };

  // 記事データ返却
  replyQiitaArticle = async (tag: string, event: MessageEvent) => {
    // Tagが取れたか確認
    const TAG_MESSAGE = replyTag(tag);
    await this.client.replyMessage(event.replyToken, TAG_MESSAGE);
    // 記事データ取得
    const QIITA_ARTICLES = await getQiitaArticle(tag);
    // Carouselメッセージに整形
    const CAROUSEL_MESSAGE = replyQiitaMessage(tag, QIITA_ARTICLES);
    // 返答
    return this.client.pushMessage(event.source.userId, CAROUSEL_MESSAGE);
  };

  // おうむ返しテスト
  replyParrotTest = (dummyName: string, dummyText: string) => {
    // Lineに適したメッセージオブジェクトに整形
    const PARROT_MESSAGE = replyParrot(dummyName, dummyText);
    // 返答
    return { message: PARROT_MESSAGE };
  };

  // Qiita記事取得テスト
  replyQiitaArticleTest = async (dummyTag: string) => {
    // Tagが取れたか確認
    const TAG_MESSAGE = replyTag(dummyTag);
    // 記事データ取得
    const QIITA_ARTICLES = await getQiitaArticle(dummyTag);
    // Carouselメッセージに整形
    const CAROUSEL_MESSAGE = replyQiitaMessage(dummyTag, QIITA_ARTICLES);
    // ローカルでデータチェック
    return { tag: TAG_MESSAGE, message: CAROUSEL_MESSAGE };
  };
}

export { LineBot };
