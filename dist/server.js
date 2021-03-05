/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../api/index.ts":
/*!***********************!*\
  !*** ../api/index.ts ***!
  \***********************/
/***/ (function(module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const app = express_1.default();
const index_1 = __webpack_require__(/*! ./routes/v1/index */ "../api/routes/v1/index.ts");
app.use('/api/v1/', index_1.router);
// 応答するport
const PORT = process.env.PORT || 3000;
process.env.NOW_REGION ? (module.exports = app) : app.listen(PORT);
console.log(`Server running at ${PORT}`);
console.log(`ctrl + click :http://localhost:${PORT}/api/v1/`);


/***/ }),

/***/ "../api/routes/v1/index.ts":
/*!*********************************!*\
  !*** ../api/routes/v1/index.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.router = void 0;
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const bot_sdk_1 = __webpack_require__(/*! @line/bot-sdk */ "@line/bot-sdk");
const express_async_handler_1 = __importDefault(__webpack_require__(/*! express-async-handler */ "express-async-handler")); // expressでもasync使いたい
const linebot_1 = __webpack_require__(/*! ~/service/bot/linebot */ "../api/service/bot/linebot.ts");
__webpack_require__(/*! dotenv */ "dotenv").config();
const router = express_1.default.Router();
exports.router = router;
// トークン
const CLIENT_CONF = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};
const MIDDLE_CONF = {
    channelSecret: process.env.CHANNEL_SECRET,
};
const client = new bot_sdk_1.Client(CLIENT_CONF);
const Bot = new linebot_1.LineBot(client);
// 簡易的なサーバーの生死確認
router.get('/', (_, res) => {
    res.send('<h1>server is running</h1>');
});
// qiita記事の取得だけテスト
router.get('/qiita/:dummyTag', express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { dummyTag } = req.params;
    const TEST_QIITA_MESSAGE = yield Bot.replyQiitaArticleTest(dummyTag);
    res.json(TEST_QIITA_MESSAGE);
})));
router.get('/parrot/:dummyName/:dummyText', (req, res) => {
    const { dummyName, dummyText } = req.params;
    const TEST_PARROT_MESSAGE = Bot.replyParrotTest(dummyName, dummyText);
    res.json(TEST_PARROT_MESSAGE);
});
/**
 *ここから下は、LINEbot用の処理
 */
// lineからのメッセージ受け取り
router.post('/webhook', bot_sdk_1.middleware(MIDDLE_CONF), (req, res) => {
    Promise.all(req.body.events.map(handleEvent)).then((result) => res.json(result));
});
function handleEvent(event) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Bot.handleEvent(event);
    });
}


/***/ }),

/***/ "../api/service/bot/linebot.ts":
/*!*************************************!*\
  !*** ../api/service/bot/linebot.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LineBot = void 0;
const line_1 = __webpack_require__(/*! ../line/line */ "../api/service/line/line.ts");
const qiita_1 = __webpack_require__(/*! ../qiita/qiita */ "../api/service/qiita/qiita.ts");
class LineBot {
    constructor(client) {
        this.client = null;
        // メッセージ判定
        this.handleEvent = (event) => __awaiter(this, void 0, void 0, function* () {
            if (event.type !== 'message' || event.message.type !== 'text') {
                // メッセージでなければ無視
                return Promise.resolve(null);
            }
            // 上でテキストでない時を、弾いてるので、`TextEventMessage`の固定要素を持つMessageEventだとみなす。
            const TextEvent = event;
            if (/.{2,}の記事を(探して|拾って)/.test(TextEvent.message.text)) {
                // Qiitaで記事を取得
                const TEXT = event.message.text;
                const INDEX = TEXT.indexOf('の');
                const TAG = TEXT.substring(0, INDEX);
                yield this.replyQiitaArticle(TAG, event);
            }
            else {
                // おうむ返し
                yield this.replyParrot(TextEvent);
            }
        });
        // おうむ返し
        this.replyParrot = (event) => __awaiter(this, void 0, void 0, function* () {
            // 発言者の名前を取得
            const { displayName } = yield this.client.getProfile(event.source.userId);
            // Lineに適したメッセージオブジェクトに整形
            const PARROT_MESSAGE = line_1.replyParrot(displayName, event.message.text);
            // 返答
            return this.client.replyMessage(event.replyToken, PARROT_MESSAGE);
        });
        // 記事データ返却
        this.replyQiitaArticle = (tag, event) => __awaiter(this, void 0, void 0, function* () {
            // Tagが取れたか確認
            const TAG_MESSAGE = line_1.replyTag(tag);
            yield this.client.replyMessage(event.replyToken, TAG_MESSAGE);
            // 記事データ取得
            const QIITA_ARTICLES = yield qiita_1.getQiitaArticle(tag);
            // Carouselメッセージに整形
            const CAROUSEL_MESSAGE = line_1.replyQiitaMessage(tag, QIITA_ARTICLES);
            // 返答
            return this.client.pushMessage(event.source.userId, CAROUSEL_MESSAGE);
        });
        // おうむ返しテスト
        this.replyParrotTest = (dummyName, dummyText) => {
            // Lineに適したメッセージオブジェクトに整形
            const PARROT_MESSAGE = line_1.replyParrot(dummyName, dummyText);
            // 返答
            return { message: PARROT_MESSAGE };
        };
        // Qiita記事取得テスト
        this.replyQiitaArticleTest = (dummyTag) => __awaiter(this, void 0, void 0, function* () {
            // Tagが取れたか確認
            const TAG_MESSAGE = line_1.replyTag(dummyTag);
            // 記事データ取得
            const QIITA_ARTICLES = yield qiita_1.getQiitaArticle(dummyTag);
            // Carouselメッセージに整形
            const CAROUSEL_MESSAGE = line_1.replyQiitaMessage(dummyTag, QIITA_ARTICLES);
            // ローカルでデータチェック
            return { tag: TAG_MESSAGE, message: CAROUSEL_MESSAGE };
        });
        this.client = client;
    }
}
exports.LineBot = LineBot;


/***/ }),

/***/ "../api/service/line/line.ts":
/*!***********************************!*\
  !*** ../api/service/line/line.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.replyQiitaMessage = exports.replyTag = exports.replyParrot = void 0;
const generateMessage_1 = __webpack_require__(/*! ./tools/generateMessage */ "../api/service/line/tools/generateMessage.ts");
/**
 * @param {String} name Lineのメッセージを送り主(必須)
 * @param {String} text 送ったテキスト(必須)
 * @return {Object} おうむ返しのテキスト
 */
// おうむ返し
const replyParrot = (name = '未設定', text = '未設定') => {
    return {
        type: 'text',
        text: `${name}さん\n「${text}」と言いましたね`,
    };
};
exports.replyParrot = replyParrot;
/**
 * @param {String} tag Lineのメッセージから取り出したタグ(必須)
 * @return {Object} タグを入れた固定メッセージを返す
 */
// 取得したタグを返す
const replyTag = (tag = '未設定') => {
    return {
        type: 'text',
        text: `${tag}で記事を探しています。\n少し待ってて下さい。`,
    };
};
exports.replyTag = replyTag;
// qiita記事の返却
const replyQiitaMessage = (tag = '未設定', articles) => {
    if (articles === null) {
        // 返せるデータがない
        return {
            type: 'text',
            text: `${tag}の記事は見つかりません。\n(短縮してないワードで指定してみて下さい)。\n(vue => vue.jsなど)`,
        };
    }
    else {
        // bubbleメッセージの配列を結合し、carouselメッセージとして返却
        return {
            type: 'flex',
            altText: `${tag}タグの記事上位五件`,
            contents: {
                type: 'carousel',
                contents: generateMessage_1.bubblesMessage(articles),
            },
        };
    }
};
exports.replyQiitaMessage = replyQiitaMessage;


/***/ }),

/***/ "../api/service/line/tools/generateMessage.ts":
/*!****************************************************!*\
  !*** ../api/service/line/tools/generateMessage.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.bubblesMessage = void 0;
/**
 *
 * @param {Array} articles Qiita記事のLGTM数上位五件の配列が入る(必須)
 * @return {Array} bubbleメッセージの配列を生成
 * [bubbleメッセージ](https://developers.line.biz/ja/docs/messaging-api/flex-message-elements/#bubble)
 */
const bubblesMessage = (articles) => {
    // 記事データをbubbleメッセージ形式に変換
    return articles.map((article) => formatBubblesMessage(article));
};
exports.bubblesMessage = bubblesMessage;
// bubbleメッセージのオブジェクトに整形
const formatBubblesMessage = ({ title, updatedAt, userImg, likesCount, url, }) => {
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


/***/ }),

/***/ "../api/service/qiita/qiita.ts":
/*!*************************************!*\
  !*** ../api/service/qiita/qiita.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getQiitaArticle = void 0;
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "axios"));
/**
 *
 * @param {String} tag Qiita記事検索に使うタグ(必須)
 * @return {Array} Qiita記事のLGTM数上位五件
 */
const getQiitaArticle = (tag = '未設定') => __awaiter(void 0, void 0, void 0, function* () {
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
    const data = yield axios_1.default
        .get(QIITA_API, { headers: HEADERS, params: PARAMS })
        .then((res) => {
        return res.data == null ? null : res.data;
    })
        .catch((e) => console.error(e));
    if (data == null) {
        // 返せるデータがない
        return null;
    }
    else {
        // 返せるデータがない
        if (data.length === 0 || data.message === 'Not found') {
            return null;
        }
        else {
            return formatArticle(data);
        }
    }
});
exports.getQiitaArticle = getQiitaArticle;
/**
 *
 * @param {Array} articles 取得したQiita記事n~100件(必須)
 * @return {Array} Qiita記事のLGTM数上位五件
 */
// ソートして記事をタイトルとLGTM数、リンク、投稿したユーザーアイコンのみにする
function formatArticle(qiitaArticles) {
    // ソート
    qiitaArticles.sort((a, b) => {
        return b.likes_count - a.likes_count;
    });
    // 上位五件のみを通知
    qiitaArticles.slice(0, 5);
    // 整形
    const articles = qiitaArticles.map((article) => {
        const FOMART_TIME = formatDate(article.updated_at);
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
function formatDate(time) {
    return `${new Date(time).toLocaleDateString('ja-JP')}`.replace(/-/g, '/');
}


/***/ }),

/***/ "@line/bot-sdk":
/*!********************************!*\
  !*** external "@line/bot-sdk" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("@line/bot-sdk");;

/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/***/ ((module) => {

module.exports = require("axios");;

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("dotenv");;

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");;

/***/ }),

/***/ "express-async-handler":
/*!****************************************!*\
  !*** external "express-async-handler" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("express-async-handler");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("../api/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi4vYXBpL2luZGV4LnRzIiwid2VicGFjazovLy8uLi9hcGkvcm91dGVzL3YxL2luZGV4LnRzIiwid2VicGFjazovLy8uLi9hcGkvc2VydmljZS9ib3QvbGluZWJvdC50cyIsIndlYnBhY2s6Ly8vLi4vYXBpL3NlcnZpY2UvbGluZS9saW5lLnRzIiwid2VicGFjazovLy8uLi9hcGkvc2VydmljZS9saW5lL3Rvb2xzL2dlbmVyYXRlTWVzc2FnZS50cyIsIndlYnBhY2s6Ly8vLi4vYXBpL3NlcnZpY2UvcWlpdGEvcWlpdGEudHMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiQGxpbmUvYm90LXNka1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImF4aW9zXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZG90ZW52XCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZXhwcmVzc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImV4cHJlc3MtYXN5bmMtaGFuZGxlclwiIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlGQUE4QjtBQUM5QixNQUFNLEdBQUcsR0FBRyxpQkFBTyxFQUFFLENBQUM7QUFDdEIsMEZBQTJDO0FBRTNDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLGNBQU0sQ0FBQyxDQUFDO0FBRTVCLFdBQVc7QUFDWCxNQUFNLElBQUksR0FBZSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7QUFDbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuRSxPQUFPLENBQUMsR0FBRyxD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Q0E7VUFDQTs7OztVQ3JCQTtVQUNBO1VBQ0E7VUFDQSIsImZpbGUiOiJzZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmNvbnN0IGFwcCA9IGV4cHJlc3MoKTtcbmltcG9ydCB7IHJvdXRlciB9IGZyb20gJy4vcm91dGVzL3YxL2luZGV4JztcblxuYXBwLnVzZSgnL2FwaS92MS8nLCByb3V0ZXIpO1xuXG4vLyDlv5znrZTjgZnjgotwb3J0XG5jb25zdCBQT1JUOiBTZXJ2ZXJQb3J0ID0gcHJvY2Vzcy5lbnYuUE9SVCB8fCAzMDAwO1xucHJvY2Vzcy5lbnYuTk9XX1JFR0lPTiA/IChtb2R1bGUuZXhwb3J0cyA9IGFwcCkgOiBhcHAubGlzdGVuKFBPUlQpO1xuY29uc29sZS5sb2coYFNlcnZlciBydW5uaW5nIGF0ICR7UE9SVH1gKTtcbmNvbnNvbGUubG9nKGBjdHJsICsgY2xpY2sgOmh0dHA6Ly9sb2NhbGhvc3Q6JHtQT1JUfS9hcGkvdjEvYCk7XG4iLCJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCAgeyBDbGllbnQsbWlkZGxld2FyZSwgV2ViaG9va0V2ZW50LCBDbGllbnRDb25maWcsIE1pZGRsZXdhcmVDb25maWcgfSBmcm9tICdAbGluZS9ib3Qtc2RrJztcbmltcG9ydCAgYXN5bmNIYW5kbGVyIGZyb20gJ2V4cHJlc3MtYXN5bmMtaGFuZGxlcic7IC8vIGV4cHJlc3PjgafjgoJhc3luY+S9v+OBhOOBn+OBhFxuaW1wb3J0IHsgTGluZUJvdCB9IGZyb20gJ34vc2VydmljZS9ib3QvbGluZWJvdCc7XG5yZXF1aXJlKCdkb3RlbnYnKS5jb25maWcoKTtcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuLy8g44OI44O844Kv44OzXG5jb25zdCBDTElFTlRfQ09ORjogQ2xpZW50Q29uZmlnID0ge1xuICBjaGFubmVsQWNjZXNzVG9rZW46IHByb2Nlc3MuZW52LkNIQU5ORUxfQUNDRVNTX1RPS0VOLFxufVxuY29uc3QgTUlERExFX0NPTkY6IE1pZGRsZXdhcmVDb25maWcgPSB7XG4gIGNoYW5uZWxTZWNyZXQ6IHByb2Nlc3MuZW52LkNIQU5ORUxfU0VDUkVULFxufTtcblxuY29uc3QgY2xpZW50ID0gbmV3IENsaWVudChDTElFTlRfQ09ORik7XG5jb25zdCBCb3QgPSBuZXcgTGluZUJvdChjbGllbnQpO1xuXG4vLyDnsKHmmJPnmoTjgarjgrXjg7zjg5Djg7zjga7nlJ/mrbvnorroqo1cbnJvdXRlci5nZXQoJy8nLCAoXywgcmVzOiBleHByZXNzLlJlc3BvbnNlKSA9PiB7XG4gIHJlcy5zZW5kKCc8aDE+c2VydmVyIGlzIHJ1bm5pbmc8L2gxPicpO1xufSk7XG5cbi8vIHFpaXRh6KiY5LqL44Gu5Y+W5b6X44Gg44GR44OG44K544OIXG5yb3V0ZXIuZ2V0KCcvcWlpdGEvOmR1bW15VGFnJywgYXN5bmNIYW5kbGVyKGFzeW5jIChyZXE6IGV4cHJlc3MuUmVxdWVzdCwgcmVzOiBleHByZXNzLlJlc3BvbnNlKSA9PiB7XG4gICAgY29uc3QgeyBkdW1teVRhZyB9ID0gcmVxLnBhcmFtcztcbiAgICBjb25zdCBURVNUX1FJSVRBX01FU1NBR0UgPSBhd2FpdCBCb3QucmVwbHlRaWl0YUFydGljbGVUZXN0KGR1bW15VGFnKTtcbiAgICByZXMuanNvbihURVNUX1FJSVRBX01FU1NBR0UpO1xuICB9KVxuKTtcblxucm91dGVyLmdldCgnL3BhcnJvdC86ZHVtbXlOYW1lLzpkdW1teVRleHQnLCAocmVxOiBleHByZXNzLlJlcXVlc3QsIHJlczogZXhwcmVzcy5SZXNwb25zZSkgPT4ge1xuICBjb25zdCB7IGR1bW15TmFtZSwgZHVtbXlUZXh0IH0gPSByZXEucGFyYW1zO1xuICBjb25zdCBURVNUX1BBUlJPVF9NRVNTQUdFID0gQm90LnJlcGx5UGFycm90VGVzdChkdW1teU5hbWUsIGR1bW15VGV4dCk7XG4gIHJlcy5qc29uKFRFU1RfUEFSUk9UX01FU1NBR0UpO1xufSlcblxuLyoqXG4gKuOBk+OBk+OBi+OCieS4i+OBr+OAgUxJTkVib3TnlKjjga7lh6bnkIZcbiAqL1xuXG4vLyBsaW5l44GL44KJ44Gu44Oh44OD44K744O844K45Y+X44GR5Y+W44KKXG5yb3V0ZXIucG9zdCgnL3dlYmhvb2snLCBtaWRkbGV3YXJlKE1JRERMRV9DT05GKSwgKHJlcTogZXhwcmVzcy5SZXF1ZXN0LCByZXM6IGV4cHJlc3MuUmVzcG9uc2UpID0+IHtcbiAgUHJvbWlzZS5hbGwocmVxLmJvZHkuZXZlbnRzLm1hcChoYW5kbGVFdmVudCkpLnRoZW4oKHJlc3VsdCkgPT5cbiAgICByZXMuanNvbihyZXN1bHQpXG4gICk7XG59KTtcblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlRXZlbnQoZXZlbnQ6IFdlYmhvb2tFdmVudCkge1xuICBhd2FpdCBCb3QuaGFuZGxlRXZlbnQoZXZlbnQpO1xufVxuXG5leHBvcnQgeyByb3V0ZXIgfTtcbiIsImltcG9ydCB7XG4gIFdlYmhvb2tFdmVudCxcbiAgQ2xpZW50LFxuICBNZXNzYWdlRXZlbnQsXG4gIFRleHRFdmVudE1lc3NhZ2UsXG4gIEV2ZW50QmFzZSxcbn0gZnJvbSAnQGxpbmUvYm90LXNkayc7XG5pbXBvcnQgeyByZXBseVBhcnJvdCwgcmVwbHlUYWcsIHJlcGx5UWlpdGFNZXNzYWdlIH0gZnJvbSAnLi4vbGluZS9saW5lJztcbmltcG9ydCB7IGdldFFpaXRhQXJ0aWNsZSB9IGZyb20gJy4uL3FpaXRhL3FpaXRhJztcblxuaW50ZXJmYWNlIExpbmVCb3RJbnRlcmZhY2Uge1xuICBoYW5kbGVFdmVudDogKGV2ZW50OiBXZWJob29rRXZlbnQpID0+IFByb21pc2U8YW55Pjtcbn1cblxuLy8g44OG44Kt44K544OI5Zu65a6a44Gu5Z6LXG50eXBlIE1lc3NhZ2VUZXh0RXZlbnQgPSB7XG4gIHR5cGU6ICdtZXNzYWdlJztcbiAgbWVzc2FnZTogVGV4dEV2ZW50TWVzc2FnZTtcbn0gJiBFdmVudEJhc2UgJiB7XG4gICAgcmVwbHlUb2tlbjogc3RyaW5nO1xuICB9O1xuXG5jbGFzcyBMaW5lQm90IGltcGxlbWVudHMgTGluZUJvdEludGVyZmFjZSB7XG4gIGNsaWVudDogbnVsbCB8IENsaWVudCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoY2xpZW50OiBDbGllbnQpIHtcbiAgICB0aGlzLmNsaWVudCA9IGNsaWVudDtcbiAgfVxuXG4gIC8vIOODoeODg+OCu+ODvOOCuOWIpOWumlxuICBoYW5kbGVFdmVudCA9IGFzeW5jIChldmVudDogV2ViaG9va0V2ZW50KTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICBpZiAoZXZlbnQudHlwZSAhPT0gJ21lc3NhZ2UnIHx8IGV2ZW50Lm1lc3NhZ2UudHlwZSAhPT0gJ3RleHQnKSB7XG4gICAgICAvLyDjg6Hjg4Pjgrvjg7zjgrjjgafjgarjgZHjgozjgbDnhKHoppZcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgfVxuICAgIC8vIOS4iuOBp+ODhuOCreOCueODiOOBp+OBquOBhOaZguOCkuOAgeW8vuOBhOOBpuOCi+OBruOBp+OAgWBUZXh0RXZlbnRNZXNzYWdlYOOBruWbuuWumuimgee0oOOCkuaMgeOBpE1lc3NhZ2VFdmVudOOBoOOBqOOBv+OBquOBmeOAglxuICAgIGNvbnN0IFRleHRFdmVudCA9IGV2ZW50IGFzIE1lc3NhZ2VUZXh0RXZlbnQ7XG4gICAgaWYgKC8uezIsfeOBruiomOS6i+OCkijmjqLjgZfjgaZ85ou+44Gj44GmKS8udGVzdChUZXh0RXZlbnQubWVzc2FnZS50ZXh0KSkge1xuICAgICAgLy8gUWlpdGHjgafoqJjkuovjgpLlj5blvpdcbiAgICAgIGNvbnN0IFRFWFQgPSBldmVudC5tZXNzYWdlLnRleHQ7XG4gICAgICBjb25zdCBJTkRFWCA9IFRFWFQuaW5kZXhPZign44GuJyk7XG4gICAgICBjb25zdCBUQUcgPSBURVhULnN1YnN0cmluZygwLCBJTkRFWCk7XG4gICAgICBhd2FpdCB0aGlzLnJlcGx5UWlpdGFBcnRpY2xlKFRBRywgZXZlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyDjgYrjgYbjgoDov5TjgZdcbiAgICAgIGF3YWl0IHRoaXMucmVwbHlQYXJyb3QoVGV4dEV2ZW50KTtcbiAgICB9XG4gIH07XG5cbiAgLy8g44GK44GG44KA6L+U44GXXG4gIHJlcGx5UGFycm90ID0gYXN5bmMgKGV2ZW50OiBNZXNzYWdlVGV4dEV2ZW50KSA9PiB7XG4gICAgLy8g55m66KiA6ICF44Gu5ZCN5YmN44KS5Y+W5b6XXG4gICAgY29uc3QgeyBkaXNwbGF5TmFtZSB9ID0gYXdhaXQgdGhpcy5jbGllbnQuZ2V0UHJvZmlsZShldmVudC5zb3VyY2UudXNlcklkKTtcbiAgICAvLyBMaW5l44Gr6YGp44GX44Gf44Oh44OD44K744O844K444Kq44OW44K444Kn44Kv44OI44Gr5pW05b2iXG4gICAgY29uc3QgUEFSUk9UX01FU1NBR0UgPSByZXBseVBhcnJvdChkaXNwbGF5TmFtZSwgZXZlbnQubWVzc2FnZS50ZXh0KTtcbiAgICAvLyDov5TnrZRcbiAgICByZXR1cm4gdGhpcy5jbGllbnQucmVwbHlNZXNzYWdlKGV2ZW50LnJlcGx5VG9rZW4sIFBBUlJPVF9NRVNTQUdFKTtcbiAgfTtcblxuICAvLyDoqJjkuovjg4fjg7zjgr/ov5TljbRcbiAgcmVwbHlRaWl0YUFydGljbGUgPSBhc3luYyAodGFnOiBzdHJpbmcsIGV2ZW50OiBNZXNzYWdlRXZlbnQpID0+IHtcbiAgICAvLyBUYWfjgYzlj5bjgozjgZ/jgYvnorroqo1cbiAgICBjb25zdCBUQUdfTUVTU0FHRSA9IHJlcGx5VGFnKHRhZyk7XG4gICAgYXdhaXQgdGhpcy5jbGllbnQucmVwbHlNZXNzYWdlKGV2ZW50LnJlcGx5VG9rZW4sIFRBR19NRVNTQUdFKTtcbiAgICAvLyDoqJjkuovjg4fjg7zjgr/lj5blvpdcbiAgICBjb25zdCBRSUlUQV9BUlRJQ0xFUyA9IGF3YWl0IGdldFFpaXRhQXJ0aWNsZSh0YWcpO1xuICAgIC8vIENhcm91c2Vs44Oh44OD44K744O844K444Gr5pW05b2iXG4gICAgY29uc3QgQ0FST1VTRUxfTUVTU0FHRSA9IHJlcGx5UWlpdGFNZXNzYWdlKHRhZywgUUlJVEFfQVJUSUNMRVMpO1xuICAgIC8vIOi/lOetlFxuICAgIHJldHVybiB0aGlzLmNsaWVudC5wdXNoTWVzc2FnZShldmVudC5zb3VyY2UudXNlcklkLCBDQVJPVVNFTF9NRVNTQUdFKTtcbiAgfTtcblxuICAvLyDjgYrjgYbjgoDov5TjgZfjg4bjgrnjg4hcbiAgcmVwbHlQYXJyb3RUZXN0ID0gKGR1bW15TmFtZTogc3RyaW5nLCBkdW1teVRleHQ6IHN0cmluZykgPT4ge1xuICAgIC8vIExpbmXjgavpganjgZfjgZ/jg6Hjg4Pjgrvjg7zjgrjjgqrjg5bjgrjjgqfjgq/jg4jjgavmlbTlvaJcbiAgICBjb25zdCBQQVJST1RfTUVTU0FHRSA9IHJlcGx5UGFycm90KGR1bW15TmFtZSwgZHVtbXlUZXh0KTtcbiAgICAvLyDov5TnrZRcbiAgICByZXR1cm4geyBtZXNzYWdlOiBQQVJST1RfTUVTU0FHRSB9O1xuICB9O1xuXG4gIC8vIFFpaXRh6KiY5LqL5Y+W5b6X44OG44K544OIXG4gIHJlcGx5UWlpdGFBcnRpY2xlVGVzdCA9IGFzeW5jIChkdW1teVRhZzogc3RyaW5nKSA9PiB7XG4gICAgLy8gVGFn44GM5Y+W44KM44Gf44GL56K66KqNXG4gICAgY29uc3QgVEFHX01FU1NBR0UgPSByZXBseVRhZyhkdW1teVRhZyk7XG4gICAgLy8g6KiY5LqL44OH44O844K/5Y+W5b6XXG4gICAgY29uc3QgUUlJVEFfQVJUSUNMRVMgPSBhd2FpdCBnZXRRaWl0YUFydGljbGUoZHVtbXlUYWcpO1xuICAgIC8vIENhcm91c2Vs44Oh44OD44K744O844K444Gr5pW05b2iXG4gICAgY29uc3QgQ0FST1VTRUxfTUVTU0FHRSA9IHJlcGx5UWlpdGFNZXNzYWdlKGR1bW15VGFnLCBRSUlUQV9BUlRJQ0xFUyk7XG4gICAgLy8g44Ot44O844Kr44Or44Gn44OH44O844K/44OB44Kn44OD44KvXG4gICAgcmV0dXJuIHsgdGFnOiBUQUdfTUVTU0FHRSwgbWVzc2FnZTogQ0FST1VTRUxfTUVTU0FHRSB9O1xuICB9O1xufVxuXG5leHBvcnQgeyBMaW5lQm90IH07XG4iLCJpbXBvcnQgeyBUZXh0TWVzc2FnZSwgRmxleE1lc3NhZ2UgfSBmcm9tICdAbGluZS9ib3Qtc2RrJztcblxuaW1wb3J0IHsgYnViYmxlc01lc3NhZ2UgfSBmcm9tICcuL3Rvb2xzL2dlbmVyYXRlTWVzc2FnZSc7XG5cbi8qKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgTGluZeOBruODoeODg+OCu+ODvOOCuOOCkumAgeOCiuS4uyjlv4XpoIgpXG4gKiBAcGFyYW0ge1N0cmluZ30gdGV4dCDpgIHjgaPjgZ/jg4bjgq3jgrnjg4go5b+F6aCIKVxuICogQHJldHVybiB7T2JqZWN0fSDjgYrjgYbjgoDov5TjgZfjga7jg4bjgq3jgrnjg4hcbiAqL1xuXG4vLyDjgYrjgYbjgoDov5TjgZdcbmNvbnN0IHJlcGx5UGFycm90ID0gKG5hbWUgPSAn5pyq6Kit5a6aJywgdGV4dCA9ICfmnKroqK3lrponKTogVGV4dE1lc3NhZ2UgPT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICd0ZXh0JyxcbiAgICB0ZXh0OiBgJHtuYW1lfeOBleOCk1xcbuOAjCR7dGV4dH3jgI3jgajoqIDjgYTjgb7jgZfjgZ/jga1gLFxuICB9O1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge1N0cmluZ30gdGFnIExpbmXjga7jg6Hjg4Pjgrvjg7zjgrjjgYvjgonlj5bjgorlh7rjgZfjgZ/jgr/jgrAo5b+F6aCIKVxuICogQHJldHVybiB7T2JqZWN0fSDjgr/jgrDjgpLlhaXjgozjgZ/lm7rlrprjg6Hjg4Pjgrvjg7zjgrjjgpLov5TjgZlcbiAqL1xuXG4vLyDlj5blvpfjgZfjgZ/jgr/jgrDjgpLov5TjgZlcbmNvbnN0IHJlcGx5VGFnID0gKHRhZyA9ICfmnKroqK3lrponKTogVGV4dE1lc3NhZ2UgPT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICd0ZXh0JyxcbiAgICB0ZXh0OiBgJHt0YWd944Gn6KiY5LqL44KS5o6i44GX44Gm44GE44G+44GZ44CCXFxu5bCR44GX5b6F44Gj44Gm44Gm5LiL44GV44GE44CCYCxcbiAgfTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtTdHJpbmd9IHRhZyBRaWl0YeiomOS6i+aknOe0ouOBq+S9v+OBo+OBn+OCv+OCsCjlv4XpoIgpXG4gKiBAcGFyYW0ge0FycmF5fSBhcnRpY2xlcyBRaWl0YeiomOS6i+OBrkxHVE3mlbDkuIrkvY3kupTku7bjga7phY3liJfjgYzlhaXjgosobnVsbOioseWuuSlcbiAqIEByZXR1cm4ge09iamVjdH0g6L+U44Gb44KL44OH44O844K/44GM44Gq44GE5aC05ZCI44GvVElQU+OBruODoeODg+OCu+ODvOOCuOOCkuWHuuOBl+OAgei/lOOBmeODh+ODvOOCv+OBjOOBguOCi+WgtOWQiOOBr+OAgUNhcm91c2Vs44Oh44OD44K744O844K444Gr5pW05b2i44GX44Gm6L+U44GZXG4gKiBbQ2Fyb3VzZWzjg6Hjg4Pjgrvjg7zjgrhdKGh0dHBzOi8vZGV2ZWxvcGVycy5saW5lLmJpei9qYS9kb2NzL21lc3NhZ2luZy1hcGkvZmxleC1tZXNzYWdlLWVsZW1lbnRzLyNjYXJvdXNlbClcbiAqL1xuXG50eXBlIFFpaXRhUmVzdWx0TWVzc2FnZSA9IFRleHRNZXNzYWdlIHwgRmxleE1lc3NhZ2U7XG5cbi8vIHFpaXRh6KiY5LqL44Gu6L+U5Y20XG5jb25zdCByZXBseVFpaXRhTWVzc2FnZSA9IChcbiAgdGFnID0gJ+acquioreWumicsXG4gIGFydGljbGVzOiBGb3JtYXRlZEFydGljbGVbXVxuKTogUWlpdGFSZXN1bHRNZXNzYWdlID0+IHtcbiAgaWYgKGFydGljbGVzID09PSBudWxsKSB7XG4gICAgLy8g6L+U44Gb44KL44OH44O844K/44GM44Gq44GEXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgIHRleHQ6IGAke3RhZ33jga7oqJjkuovjga/opovjgaTjgYvjgorjgb7jgZvjgpPjgIJcXG4o55+t57iu44GX44Gm44Gq44GE44Ov44O844OJ44Gn5oyH5a6a44GX44Gm44G/44Gm5LiL44GV44GEKeOAglxcbih2dWUgPT4gdnVlLmpz44Gq44GpKWAsXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBidWJibGXjg6Hjg4Pjgrvjg7zjgrjjga7phY3liJfjgpLntZDlkIjjgZfjgIFjYXJvdXNlbOODoeODg+OCu+ODvOOCuOOBqOOBl+OBpui/lOWNtFxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnZmxleCcsXG4gICAgICBhbHRUZXh0OiBgJHt0YWd944K/44Kw44Gu6KiY5LqL5LiK5L2N5LqU5Lu2YCxcbiAgICAgIGNvbnRlbnRzOiB7XG4gICAgICAgIHR5cGU6ICdjYXJvdXNlbCcsXG4gICAgICAgIGNvbnRlbnRzOiBidWJibGVzTWVzc2FnZShhcnRpY2xlcyksXG4gICAgICB9LFxuICAgIH07XG4gIH1cbn07XG5cbmV4cG9ydCB7XG4gIHJlcGx5UGFycm90LFxuICByZXBseVRhZyxcbiAgcmVwbHlRaWl0YU1lc3NhZ2UsXG59O1xuIiwiaW1wb3J0IHsgRmxleEJ1YmJsZSB9IGZyb20gJ0BsaW5lL2JvdC1zZGsnO1xuLyoqXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJ0aWNsZXMgUWlpdGHoqJjkuovjga5MR1RN5pWw5LiK5L2N5LqU5Lu244Gu6YWN5YiX44GM5YWl44KLKOW/hemgiClcbiAqIEByZXR1cm4ge0FycmF5fSBidWJibGXjg6Hjg4Pjgrvjg7zjgrjjga7phY3liJfjgpLnlJ/miJBcbiAqIFtidWJibGXjg6Hjg4Pjgrvjg7zjgrhdKGh0dHBzOi8vZGV2ZWxvcGVycy5saW5lLmJpei9qYS9kb2NzL21lc3NhZ2luZy1hcGkvZmxleC1tZXNzYWdlLWVsZW1lbnRzLyNidWJibGUpXG4gKi9cblxuY29uc3QgYnViYmxlc01lc3NhZ2UgPSAoYXJ0aWNsZXM6IEZvcm1hdGVkQXJ0aWNsZVtdKTogRmxleEJ1YmJsZVtdID0+IHtcbiAgLy8g6KiY5LqL44OH44O844K/44KSYnViYmxl44Oh44OD44K744O844K45b2i5byP44Gr5aSJ5o+bXG4gIHJldHVybiBhcnRpY2xlcy5tYXAoKGFydGljbGU6IEZvcm1hdGVkQXJ0aWNsZSkgPT4gZm9ybWF0QnViYmxlc01lc3NhZ2UoYXJ0aWNsZSkpO1xufTtcblxuLy8gYnViYmxl44Oh44OD44K744O844K444Gu44Kq44OW44K444Kn44Kv44OI44Gr5pW05b2iXG5jb25zdCBmb3JtYXRCdWJibGVzTWVzc2FnZSA9ICh7XG4gIHRpdGxlLFxuICB1cGRhdGVkQXQsXG4gIHVzZXJJbWcsXG4gIGxpa2VzQ291bnQsXG4gIHVybCxcbn06IEZvcm1hdGVkQXJ0aWNsZSk6IEZsZXhCdWJibGUgPT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdidWJibGUnLFxuICAgIGhlYWRlcjoge1xuICAgICAgdHlwZTogJ2JveCcsXG4gICAgICBsYXlvdXQ6ICd2ZXJ0aWNhbCcsXG4gICAgICBjb250ZW50czogW1xuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgIHRleHQ6ICdRaWl0YScsXG4gICAgICAgICAgY29sb3I6ICcjZmZmZmZmJyxcbiAgICAgICAgICBzaXplOiAneGwnLFxuICAgICAgICAgIHdlaWdodDogJ2JvbGQnLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIGhlcm86IHtcbiAgICAgIHR5cGU6ICdib3gnLFxuICAgICAgbGF5b3V0OiAndmVydGljYWwnLFxuICAgICAgY29udGVudHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICB0ZXh0OiBgJHt1cGRhdGVkQXR9YCxcbiAgICAgICAgICBzaXplOiAnbGcnLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIHBhZGRpbmdTdGFydDogJzIwcHgnLFxuICAgIH0sXG4gICAgYm9keToge1xuICAgICAgdHlwZTogJ2JveCcsXG4gICAgICBsYXlvdXQ6ICdob3Jpem9udGFsJyxcbiAgICAgIGNvbnRlbnRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnaW1hZ2UnLFxuICAgICAgICAgIHVybDogYCR7dXNlckltZ31gLFxuICAgICAgICAgIGFzcGVjdE1vZGU6ICdjb3ZlcicsXG4gICAgICAgICAgYWxpZ246ICdzdGFydCcsXG4gICAgICAgICAgc2l6ZTogJ2xnJyxcbiAgICAgICAgICBmbGV4OiAyLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgIHRleHQ6IGAke3RpdGxlfWAsXG4gICAgICAgICAgd3JhcDogdHJ1ZSxcbiAgICAgICAgICBzaXplOiAnbWQnLFxuICAgICAgICAgIG1heExpbmVzOiAxMDAsXG4gICAgICAgICAgYWxpZ246ICdzdGFydCcsXG4gICAgICAgICAgZ3Jhdml0eTogJ2NlbnRlcicsXG4gICAgICAgICAgZmxleDogNixcbiAgICAgICAgICBtYXJnaW46ICdtZCcsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgZmxleDogMTIsXG4gICAgfSxcbiAgICBmb290ZXI6IHtcbiAgICAgIHR5cGU6ICdib3gnLFxuICAgICAgbGF5b3V0OiAndmVydGljYWwnLFxuICAgICAgY29udGVudHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICB0ZXh0OiBgR09PRChMR1RNKToke2xpa2VzQ291bnR9YCxcbiAgICAgICAgICBhbGlnbjogJ2VuZCcsXG4gICAgICAgICAgc2l6ZTogJ2xnJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICBhY3Rpb246IHtcbiAgICAgIHR5cGU6ICd1cmknLFxuICAgICAgbGFiZWw6ICdhY3Rpb24nLFxuICAgICAgdXJpOiBgJHt1cmx9YCxcbiAgICB9LFxuICAgIHN0eWxlczoge1xuICAgICAgaGVhZGVyOiB7XG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJyM1NUM1MDAnLFxuICAgICAgICBzZXBhcmF0b3I6IHRydWUsXG4gICAgICAgIHNlcGFyYXRvckNvbG9yOiAnIzY5Njk2OScsXG4gICAgICB9LFxuICAgICAgYm9keToge1xuICAgICAgICBzZXBhcmF0b3I6IHRydWUsXG4gICAgICB9LFxuICAgICAgZm9vdGVyOiB7XG4gICAgICAgIHNlcGFyYXRvcjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn07XG5cbmV4cG9ydCB7XG4gIGJ1YmJsZXNNZXNzYWdlLFxufTtcbiIsImltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0YWcgUWlpdGHoqJjkuovmpJzntKLjgavkvb/jgYbjgr/jgrAo5b+F6aCIKVxuICogQHJldHVybiB7QXJyYXl9IFFpaXRh6KiY5LqL44GuTEdUTeaVsOS4iuS9jeS6lOS7tlxuICovXG5cbmNvbnN0IGdldFFpaXRhQXJ0aWNsZSA9IGFzeW5jICh0YWcgPSAn5pyq6Kit5a6aJykgPT4ge1xuICAvLyBxaWl0YSDoqo3oqLwoMTAwMHJlcS8xaOS7peS4iuODquOCr+OCqOOCueODiOOBl+OBn+OBhClcbiAgY29uc3QgSEVBREVSUyA9IHtcbiAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7cHJvY2Vzcy5lbnYuUUlJVEFfVE9LRU59YCxcbiAgfTtcblxuICAvLyBBUEkgVVJMXG4gIGNvbnN0IFFJSVRBX0FQSSA9IGBodHRwczovL3FpaXRhLmNvbS9hcGkvdjIvdGFncy8ke3RhZ30vaXRlbXNgO1xuXG4gIC8vIOODkeODqeODoeODvOOCv1xuICBjb25zdCBQQVJBTVMgPSB7XG4gICAgcGFnZTogMSxcbiAgICBwZXJfcGFnZTogMTAwLFxuICB9O1xuXG4gIGNvbnN0IGRhdGEgPSBhd2FpdCBheGlvc1xuICAgIC5nZXQoUUlJVEFfQVBJLCB7IGhlYWRlcnM6IEhFQURFUlMsIHBhcmFtczogUEFSQU1TIH0pXG4gICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgcmV0dXJuIHJlcy5kYXRhID09IG51bGwgPyBudWxsIDogcmVzLmRhdGE7XG4gICAgfSlcbiAgICAuY2F0Y2goKGUpID0+IGNvbnNvbGUuZXJyb3IoZSkpO1xuXG4gIGlmIChkYXRhID09IG51bGwpIHtcbiAgICAvLyDov5TjgZvjgovjg4fjg7zjgr/jgYzjgarjgYRcbiAgICByZXR1cm4gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICAvLyDov5TjgZvjgovjg4fjg7zjgr/jgYzjgarjgYRcbiAgICBpZiAoZGF0YS5sZW5ndGggPT09IDAgfHwgZGF0YS5tZXNzYWdlID09PSAnTm90IGZvdW5kJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmb3JtYXRBcnRpY2xlKGRhdGEpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJ0aWNsZXMg5Y+W5b6X44GX44GfUWlpdGHoqJjkuotufjEwMOS7tijlv4XpoIgpXG4gKiBAcmV0dXJuIHtBcnJheX0gUWlpdGHoqJjkuovjga5MR1RN5pWw5LiK5L2N5LqU5Lu2XG4gKi9cblxuLy8g44K944O844OI44GX44Gm6KiY5LqL44KS44K/44Kk44OI44Or44GoTEdUTeaVsOOAgeODquODs+OCr+OAgeaKleeov+OBl+OBn+ODpuODvOOCtuODvOOCouOCpOOCs+ODs+OBruOBv+OBq+OBmeOCi1xuZnVuY3Rpb24gZm9ybWF0QXJ0aWNsZShxaWl0YUFydGljbGVzOiBRaWl0YUFydGljbGVbXSkge1xuICAvLyDjgr3jg7zjg4hcbiAgcWlpdGFBcnRpY2xlcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgcmV0dXJuIGIubGlrZXNfY291bnQgLSBhLmxpa2VzX2NvdW50O1xuICB9KTtcblxuICAvLyDkuIrkvY3kupTku7bjga7jgb/jgpLpgJrnn6VcbiAgcWlpdGFBcnRpY2xlcy5zbGljZSgwLCA1KTtcblxuICAvLyDmlbTlvaJcbiAgY29uc3QgYXJ0aWNsZXM6IEZvcm1hdGVkQXJ0aWNsZVtdID0gcWlpdGFBcnRpY2xlcy5tYXAoKGFydGljbGUpID0+IHtcbiAgICBjb25zdCBGT01BUlRfVElNRSA9IGZvcm1hdERhdGUoYXJ0aWNsZS51cGRhdGVkX2F0KTtcblxuICAgIGNvbnN0IEZPUk1BVF9BUlRJQ0xFUzogRm9ybWF0ZWRBcnRpY2xlID0ge1xuICAgICAgdGl0bGU6IGFydGljbGUudGl0bGUsXG4gICAgICB1cGRhdGVkQXQ6IEZPTUFSVF9USU1FLFxuICAgICAgdXNlckltZzogYXJ0aWNsZS51c2VyLnByb2ZpbGVfaW1hZ2VfdXJsLFxuICAgICAgbGlrZXNDb3VudDogYXJ0aWNsZS5saWtlc19jb3VudCxcbiAgICAgIHVybDogYXJ0aWNsZS51cmwsXG4gICAgfTtcblxuICAgIHJldHVybiBGT1JNQVRfQVJUSUNMRVM7XG4gIH0pO1xuXG4gIHJldHVybiBhcnRpY2xlcztcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF0ZSh0aW1lOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGAke25ldyBEYXRlKHRpbWUpLnRvTG9jYWxlRGF0ZVN0cmluZygnamEtSlAnKX1gLnJlcGxhY2UoLy0vZywgJy8nKTtcbn1cblxuZXhwb3J0IHsgZ2V0UWlpdGFBcnRpY2xlIH07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAbGluZS9ib3Qtc2RrXCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJheGlvc1wiKTs7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZG90ZW52XCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzXCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzLWFzeW5jLWhhbmRsZXJcIik7OyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdGlmKF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0pIHtcblx0XHRyZXR1cm4gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi4vYXBpL2luZGV4LnRzXCIpO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==