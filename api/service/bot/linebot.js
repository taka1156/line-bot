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
    if (/.{2,}の記事を(探して|拾って)/gi.test(event.message.text)) {
      // Qiitaで記事を取得
      const TEXT = event.message.text;
      const INDEX = TEXT.indexOf('の');
      const TAG = TEXT.substring(0, INDEX);
      await this.replayArticle(TAG, event);
    } else {
      // おうむ返し
      await this.replayParrot(event);
    }
  }

  // おうむ返し
  async replayParrot(event) {
    // 発言者の名前を取得
    const { displayName } = await this.client.getProfile(event.source.userId);
    // おうむ返しに使うオブジェクト
    const PARROT = {
      name: displayName,
      text: event.message.text,
    };
    // Lineに適したメッセージオブジェクトに整形
    const PARROT_MESSAGE = line.replyParrot(PARROT);
    // 返答
    return this.client.replyMessage(event.replyToken, PARROT_MESSAGE);
  }

  // 記事データ返却
  async replayArticle(tag, event) {
    // Tagが取れたか確認
    await this.client.replyMessage(event.replyToken, {
      type: 'text',
      text: `${tag}で記事を探しています。\n少し待ってて下さい。`,
    });
    // 記事データ取得
    const ARTICLES = await qiita.getQiitaArticle(tag);
    // Lineに適したメッセージオブジェクトに整形
    const MESSAGE = line.replyQiitaMessage(tag, ARTICLES);
    // 返答
    return this.client.pushMessage(event.source.userId, MESSAGE);
  }

  async replayArticleTest(tag) {
    // 記事データ取得
    const ARTICLES = await qiita.getQiitaArticle(tag);
    // Lineに適したメッセージオブジェクトに整形
    const MESSAGE = line.replyQiitaMessage(tag, ARTICLES);
    // ローカルでデータチェック
    return MESSAGE;
  }
}

module.exports = {
  LineBot,
};
