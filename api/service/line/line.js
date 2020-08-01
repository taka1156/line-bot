const { carouselMessage } = require('./tools/generateMessage.js');

/**
 * @param {String} name Lineのメッセージを送り主(必須)
 * @param {String} text 送ったテキスト(必須)
 * @return {Object} おうむ返しのテキスト
 */

// おうむ返し
function replyParrot(name = '未設定', text = '未設定') {
  return {
    type: 'text',
    text: `${name}さん\n「${text}」と言いましたね`,
  };
}

/**
 * @param {String} tag Lineのメッセージから取り出したタグ(必須)
 * @return {Object} タグを入れた固定メッセージを返す
 */

// 取得したタグを返す
function replyTag(tag = '未設定') {
  return {
    type: 'text',
    text: `${tag}で記事を探しています。\n少し待ってて下さい。`,
  };
}

/**
 * @param {String} tag Qiita記事検索に使ったタグ(必須)
 * @param {Array} articles Qiita記事のLGTM数上位五件の配列が入る(null許容)
 * @return {Object} 返せるデータがない場合はTIPSのメッセージを出し、返すデータがある場合は、Carouselメッセージに整形して返す
 * [Carouselメッセージ](https://developers.line.biz/ja/docs/messaging-api/flex-message-elements/#carousel)
 */

// qiita記事の返却
function replyQiitaMessage(tag = '未設定', articles) {
  if (articles === null) {
    // 返せるデータがない
    return {
      type: 'text',
      text: `${tag}の記事は見つかりません。\n(短縮してないワードで指定してみて下さい)。\n(vue => vue.jsなど)`,
    };
  } else {
    // bubbleメッセージの配列を結合し、carouselメッセージとして返却
    return {
      type: 'flex',
      altText: `${tag}タグの記事上位五件`,
      contents: {
        type: 'carousel',
        contents: carouselMessage(articles),
      },
    };
  }
}

module.exports = {
  replyParrot,
  replyTag,
  replyQiitaMessage,
};
