type ServerPort = string | number;

// 記事関連
type QiitaArticle = {
  title: string;
  updated_at: string;
  likes_count: number;
  url: string;
  user: {
    profile_image_url: string;
  };
};

type FormatedArticle = {
  title: string;
  updatedAt: string;
  userImg: string;
  likesCount: number;
  url: string;
};
