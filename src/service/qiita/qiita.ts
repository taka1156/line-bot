import axios from 'axios';

/**
 *
 * @param {String} tag Qiita記事検索に使うタグ(必須)
 * @return {Array} Qiita記事のLGTM数上位五件
 */

const getQiitaArticle = async (tag = '未設定') => {
  // qiita 認証(1000req/1h以上リクエストしたい)
  const HEADERS = {
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.QIITA_TOKEN}`,
  };

  // API URL
  const QIITA_API = `https://qiita.com/api/v2/tags/${tag}/items`;

  // パラメータ
  const PARAMS = {
    page: 1,
    per_page: 100,
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
};

/**
 *
 * @param {Array} articles 取得したQiita記事n~100件(必須)
 * @return {Array} Qiita記事のLGTM数上位五件
 */

// ソートして記事をタイトルとLGTM数、リンク、投稿したユーザーアイコンのみにする
function formatArticle(qiitaArticles: QiitaArticle[]) {
  // ソート
  qiitaArticles.sort((a, b) => {
    return b.likes_count - a.likes_count;
  });

  // 上位五件のみを通知
  qiitaArticles.slice(0, 5);

  // 整形
  const articles: FormatedArticle[] = qiitaArticles.map((article) => {
    const FOMART_TIME = formatDate(article.updated_at);

    const FORMAT_ARTICLES: FormatedArticle = {
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

function formatDate(time: string) {
  return `${new Date(time).toLocaleDateString('ja-JP')}`.replace(/-/g, '/');
}

export { getQiitaArticle };
