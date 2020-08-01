const line = require('../line/line.js');
const qiita = require('../qiita/qiita.js');

class LineBot {
  constructor(client) {
    this.client = client;
  }

  // メッセージ判定
  async handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
      // メッセージでなければ無視
      return Promise.resolve(null);
    }
    if (/.{2,}の記事を(探して|拾って)/.test(event.message.text)) {
      // Qiitaで記事を取得
      const TEXT = event.message.text;
      const INDEX = TEXT.indexOf('の');
      const TAG = TEXT.substring(0, INDEX);
      await this.replayQiitaArticle(TAG, event);
    } else {
      // おうむ返し
      await this.replayParrot(event);
    }
  }

  // おうむ返し
  async replayParrot(event) {
    // 発言者の名前を取得
    const { displayName } = await this.client.getProfile(event.source.userId);
    // Lineに適したメッセージオブジェクトに整形
    const PARROT_MESSAGE = line.replyParrot(displayName, event.message.text);
    // 返答
    return this.client.replyMessage(event.replyToken, PARROT_MESSAGE);
  }

  // 記事データ返却
  async replayQiitaArticle(tag, event) {
    // Tagが取れたか確認
    const TAG_MESSAGE = line.replyTag(tag);
    await this.client.replyMessage(event.replyToken, TAG_MESSAGE);
    // 記事データ取得
    const QIITA_ARTICLES = await qiita.getQiitaArticle(tag);
    // Carouselメッセージに整形
    const CAROUSEL_MESSAGE = line.replyQiitaMessage(tag, QIITA_ARTICLES);
    // 返答
    return this.client.pushMessage(event.source.userId, CAROUSEL_MESSAGE);
  }
  
  // おうむ返しテスト
  replayParrotTest(dummyName, dummyText) {
    // Lineに適したメッセージオブジェクトに整形
    const PARROT_MESSAGE = line.replyParrot(dummyName, dummyText);
    // 返答
    return { message: PARROT_MESSAGE };
  }

  // Qiita記事取得テスト
  async replayQiitaArticleTest(dummyTag) {
    // Tagが取れたか確認
    const TAG_MESSAGE = line.replyTag(dummyTag);
    // 記事データ取得
    const QIITA_ARTICLES = await qiita.getQiitaArticle(dummyTag);
    // Carouselメッセージに整形
    const CAROUSEL_MESSAGE = line.replyQiitaMessage(dummyTag, QIITA_ARTICLES);
    // ローカルでデータチェック
    return { tag: TAG_MESSAGE, message: CAROUSEL_MESSAGE };
  }
}

module.exports = {
  LineBot,
};
