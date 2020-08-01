const { flexMessage } = require('./tools/generateMessage.js');

// おうむ返し
function replyParrot({ name, text }) {
  return { type: 'text', text: `${name}さん\n「${text}」と言いましたね。` };
}

// qiita記事の返却
function replyQiitaMessage(tag, articles) {
  if (tag == null) {
    console.error('tagが設定されてません。');
  }

  if (articles === null) {
    // 返せるデータがない
    return {
      type: 'text',
      text: `${tag}の記事は見つかりません。\n(短縮してないワードで指定してみて下さい)。\n(vue => vue.jsなど)`,
    };
  } else {
    // 通常のメッセージと結合
    return {
      type: 'flex',
      altText: `${tag}タグの記事上位五件`,
      contents: {
        type: 'carousel',
        contents: flexMessage(articles),
      },
    };
  }
}

module.exports = {
  replyParrot,
  replyQiitaMessage,
};
