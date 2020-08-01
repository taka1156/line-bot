// おうむ返し
function replyParrot({ name, text }) {
  return {
    type: 'text',
    text: `${name}さん\n「${text}」と言いましたね。`,
  };
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
    
    // 記事データをFlexメッセージ形式に変換
    const FLEX_MESSAGE = articles.map((article) => {
      return formatFlexMessage(article);
    });

    // 通常のメッセージと結合
    return {
      type: 'flex',
      altText: `${tag}タグの記事上位五件`,
      contents: {
        type: 'carousel',
        contents: FLEX_MESSAGE,
      },
    };
  }
}

// FlexMessageのオブジェクトに整形
function formatFlexMessage({ title, updatedAt, userImg, likesCount, url }) {
  return {
    type: 'bubble',
    header: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: 'Qiita',
          color: '#ffffff',
          size: 'xl',
          weight: 'bold',
        },
      ],
    },
    hero: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: `${updatedAt}`,
          size: 'lg',
        },
      ],
      paddingStart: '20px',
    },
    body: {
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'image',
          url: `${userImg}`,
          aspectMode: 'cover',
          align: 'start',
          size: 'lg',
          flex: 2,
        },
        {
          type: 'text',
          text: `${title}`,
          wrap: true,
          size: 'md',
          maxLines: 100,
          align: 'start',
          gravity: 'center',
          flex: 6,
          margin: 'md',
        },
      ],
      flex: 12,
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: `GOOD(LGTM):${likesCount}`,
          align: 'end',
          size: 'lg',
        },
      ],
    },
    action: {
      type: 'uri',
      label: 'action',
      uri: `${url}`,
    },
    styles: {
      header: {
        backgroundColor: '#55C500',
        separator: true,
        separatorColor: '#696969',
      },
      body: {
        separator: true,
      },
      footer: {
        separator: true,
      },
    },
  };
}

module.exports = {
  replyParrot,
  replyQiitaMessage,
};
