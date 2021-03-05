import { FlexBubble } from '@line/bot-sdk';
/**
 *
 * @param {Array} articles Qiita記事のLGTM数上位五件の配列が入る(必須)
 * @return {Array} bubbleメッセージの配列を生成
 * [bubbleメッセージ](https://developers.line.biz/ja/docs/messaging-api/flex-message-elements/#bubble)
 */

const bubblesMessage = (articles: FormatedArticle[]): FlexBubble[] => {
  // 記事データをbubbleメッセージ形式に変換
  return articles.map((article: FormatedArticle) => formatBubblesMessage(article));
};

// bubbleメッセージのオブジェクトに整形
const formatBubblesMessage = ({
  title,
  updatedAt,
  userImg,
  likesCount,
  url,
}: FormatedArticle): FlexBubble => {
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
};

export {
  bubblesMessage,
};
