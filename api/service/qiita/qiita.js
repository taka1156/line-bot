const axios = require('axios');

async function getQiitaArticle(tag) {
  // qiita 認証(1000req/1h以上リクエストしたい)
  const HEADERS = {
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.QIITA_TOKEN}`,
  };

  // API URL
  const QIITA_API = `https://qiita.com/api/v2/tags/${tag}/items`;

  // パラメータ
  const PARAMS = {
    'page': 1,
    'per_page': 100,
  };

  const data = await axios
    .get(QIITA_API, { headers: HEADERS, params: PARAMS })
    .then((res) => {
      return res.data == null ? null : res.data;
    })
    .catch((e) => console.error(e));

  if (data == null) {
    // 返せるデータがない
    return null;
  } else {
    // 返せるデータがない
    if (data.length === 0 || data.message === 'Not found') {
      return null;
    } else {
      return formatArticle(data);
    }
  }
}

// ソートして記事をタイトルとLGTM数、リンクのみにする
function formatArticle(articles) {
  // ソート
  articles = articles.sort((a, b) => {
    return b.likes_count - a.likes_count;
  });

  // 上位五件のみを通知
  articles = articles.slice(0, 5);

  // 整形
  articles = articles.map((article) => {
    const FOMART_TIME = new Date(article.updated_at).toLocaleDateString();
    const FORMAT_ARTICLES = {
      title: article.title,
      updatedAt: FOMART_TIME,
      userImg: article.user.profile_image_url,
      likesCount: article.likes_count,
      url: article.url,
    };
    return FORMAT_ARTICLES;
  });

  return articles;
}

module.exports = { getQiitaArticle };
