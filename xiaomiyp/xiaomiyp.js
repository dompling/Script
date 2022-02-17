/**
 图标 https://raw.githubusercontent.com/Orz-3/task/master/xiaomiyp.png
# 获取方式:进入签到页面获取，APP :个人中心->右上角签到

[task_local]
1 0 * * * https://raw.githubusercontent.com/dompling/Script/master/xiaomiyp/xiaomiyp.js

(1). Quantumult X
[MITM]
hostname=m.xiaomiyoupin.com
[rewrite_local]
^https:\/\/m\.xiaomiyoupin\.com\/api\/auth\/login\/isloggedin url script-request-header https://raw.githubusercontent.com/dompling/Script/master/xiaomiyp/xiaomiyp.cookie.js

(2). Loon
[MITM]
hostname=m.xiaomiyoupin.com
[Script]
http-request ^https:\/\/m\.xiaomiyoupin\.com\/api\/auth\/login\/isloggedin script-path=https://raw.githubusercontent.com/dompling/Script/master/xiaomiyp/xiaomiyp.cookie.js, require-body=false

(3). Surge
[MITM]
hostname=m.xiaomiyoupin.com
[Script]
type=http-request, pattern=^https:\/\/m\.xiaomiyoupin\.com\/api\/auth\/login\/isloggedin, script-path=https://raw.githubusercontent.com/dompling/Script/master/xiaomiyp/xiaomiyp.cookie.js, require-body=false

 */

const $ = new API("xiaomiyp", true);
const cookie = $.read("cookie"); // 登陆 Cookie
const baseUrl = "https://m.xiaomiyoupin.com/";

const headers = {
  Cookie: cookie,
  "Content-Type": `application/x-www-form-urlencoded`,
  Referer: `https://m.xiaomiyoupin.com/score?spmref=YouPinM.$Myassets$.score.0.2835114337289`,
};

const title = "🍚小米有品";
!(async () => {
  if (!cookie) throw new Error("请获取设备信息和Cookie");
  const isLogin = await login();
  if (isLogin.data !== 200) throw new Error("登陆失效，请重新登陆");
  const signRes = await sign();
  if (signRes.message !== "ok") throw new Error("获取基础信息出错签到失败");

  let msg, count, point;
  point = signRes.result.request.data.balance;
  signRes.result.request.data.msg === "already done"
    ? (msg = "已签到")
    : (msg = "签到成功");
  const verifyObj = await verifySign();
  if (verifyObj.message !== "ok") throw new Error("获取基础信息出错签到失败");
  let desc =
    (verifyObj.result.signList[0] || {}).descr ||
    "1天1积分，2天2积分，……，5天及以后5积分";
  count = verifyObj.result.score.data.balance;
  if (count > 5) {
    const lottery = await getLottery();
    $.log(lottery);
  }

  $.notify(
    title,
    "",
    `🕘签到：${msg} (+${point}) 积分：${count} \n📒描述：${desc}`
  );
  $.done();
})()
  .catch((e) => {
    console.log(e);
    $.notify(title, "签到失败内容失败", "❎原因：" + e.message || e);
  })
  .finally(() => {
    $.done({});
  });

function login() {
  const params = {
    url: `${baseUrl}api/auth/login/isloggedin`,
    headers: headers,
  };
  return $.http.get(params).then(({ body }) => {
    return JSON.parse(body);
  });
}

function verifySign() {
  const body = {
    score: { model: "Score", action: "getScore" },
    signList: {
      model: "Score",
      action: "getScoreUserDoneTask",
      parameters: { tid: "1", pageSize: 10, pageIndex: 1 },
    },
    consumeList: {
      model: "Score",
      action: "getScoreTask",
      parameters: { pageSize: 10, pageIndex: 1, type: "1" },
    },
    taskList: {
      model: "Score",
      action: "getScoreTask",
      parameters: { pageSize: 10, pageIndex: 1, type: "0" },
    },
    doingList: {
      model: "Score",
      action: "getScoreUserTask",
      parameters: { pageSize: 10, pageIndex: 1, type: 0 },
    },
    signInScore: { model: "Score", action: "getSignInScore" },
  };
  return sign(body);
}

function sign(body = { request: { model: "Score", action: "signIn" } }) {
  const params = {
    url: `${baseUrl}app/shopv3/pipe`,
    headers: headers,
    body: encodeURI(`data=${JSON.stringify(body)}`),
  };
  return $.http.post(params).then(({ body }) => {
    const response = JSON.parse(body);
    return response;
  });
}

// 抽奖
function getLottery() {
  return sign({ request: { model: "Score", action: "luckyLottery" } });
}
function ENV() {
  const isQX = typeof $task !== "undefined";
  const isLoon = typeof $loon !== "undefined";
  const isSurge = typeof $httpClient !== "undefined" && !isLoon;
  const isJSBox = typeof require == "function" && typeof $jsbox != "undefined";
  const isNode = typeof require == "function" && !isJSBox;
  const isRequest = typeof $request !== "undefined";
  const isScriptable = typeof importModule !== "undefined";
  return { isQX, isLoon, isSurge, isNode, isJSBox, isRequest, isScriptable };
}

function HTTP(baseURL, defaultOptions = {}) {
  const { isQX, isLoon, isSurge, isScriptable, isNode } = ENV();
  const methods = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"];

  function send(method, options) {
    options = typeof options === "string" ? { url: options } : options;
    options.url = baseURL ? baseURL + options.url : options.url;
    options = { ...defaultOptions, ...options };
    const timeout = options.timeout;
    const events = {
      ...{
        onRequest: () => {},
        onResponse: (resp) => resp,
        onTimeout: () => {},
      },
      ...options.events,
    };

    events.onRequest(method, options);

    let worker;
    if (isQX) {
      worker = $task.fetch({ method, ...options });
    } else if (isLoon || isSurge || isNode) {
      worker = new Promise((resolve, reject) => {
        const request = isNode ? require("request") : $httpClient;
        request[method.toLowerCase()](options, (err, response, body) => {
          if (err) reject(err);
          else
            resolve({
              statusCode: response.status || response.statusCode,
              headers: response.headers,
              body,
            });
        });
      });
    } else if (isScriptable) {
      const request = new Request(options.url);
      request.method = method;
      request.headers = options.headers;
      request.body = options.body;
      worker = new Promise((resolve, reject) => {
        request
          .loadString()
          .then((body) => {
            resolve({
              statusCode: request.response.statusCode,
              headers: request.response.headers,
              body,
            });
          })
          .catch((err) => reject(err));
      });
    }

    let timeoutid;
    const timer = timeout
      ? new Promise((_, reject) => {
          timeoutid = setTimeout(() => {
            events.onTimeout();
            return reject(
              `${method} URL: ${options.url} exceeds the timeout ${timeout} ms`
            );
          }, timeout);
        })
      : null;

    return (timer
      ? Promise.race([timer, worker]).then((res) => {
          clearTimeout(timeoutid);
          return res;
        })
      : worker
    ).then((resp) => events.onResponse(resp));
  }

  const http = {};
  methods.forEach(
    (method) =>
      (http[method.toLowerCase()] = (options) => send(method, options))
  );
  return http;
}

function API(name = "untitled", debug = false) {
  const { isQX, isLoon, isSurge, isNode, isJSBox, isScriptable } = ENV();
  return new (class {
    constructor(name, debug) {
      this.name = name;
      this.debug = debug;

      this.http = HTTP();
      this.env = ENV();

      this.node = (() => {
        if (isNode) {
          const fs = require("fs");

          return {
            fs,
          };
        } else {
          return null;
        }
      })();
      this.initCache();

      const delay = (t, v) =>
        new Promise(function (resolve) {
          setTimeout(resolve.bind(null, v), t);
        });

      Promise.prototype.delay = function (t) {
        return this.then(function (v) {
          return delay(t, v);
        });
      };
    }
    // persistance

    // initialize cache
    initCache() {
      if (isQX) this.cache = JSON.parse($prefs.valueForKey(this.name) || "{}");
      if (isLoon || isSurge)
        this.cache = JSON.parse($persistentStore.read(this.name) || "{}");

      if (isNode) {
        // create a json for root cache
        let fpath = "root.json";
        if (!this.node.fs.existsSync(fpath)) {
          this.node.fs.writeFileSync(
            fpath,
            JSON.stringify({}),
            { flag: "wx" },
            (err) => console.log(err)
          );
        }
        this.root = {};

        // create a json file with the given name if not exists
        fpath = `${this.name}.json`;
        if (!this.node.fs.existsSync(fpath)) {
          this.node.fs.writeFileSync(
            fpath,
            JSON.stringify({}),
            { flag: "wx" },
            (err) => console.log(err)
          );
          this.cache = {};
        } else {
          this.cache = JSON.parse(
            this.node.fs.readFileSync(`${this.name}.json`)
          );
        }
      }
    }

    // store cache
    persistCache() {
      const data = JSON.stringify(this.cache);
      if (isQX) $prefs.setValueForKey(data, this.name);
      if (isLoon || isSurge) $persistentStore.write(data, this.name);
      if (isNode) {
        this.node.fs.writeFileSync(
          `${this.name}.json`,
          data,
          { flag: "w" },
          (err) => console.log(err)
        );
        this.node.fs.writeFileSync(
          "root.json",
          JSON.stringify(this.root),
          { flag: "w" },
          (err) => console.log(err)
        );
      }
    }

    write(data, key) {
      this.log(`SET ${key}`);
      if (key.indexOf("#") !== -1) {
        key = key.substr(1);
        if (isSurge || isLoon) {
          $persistentStore.write(data, key);
        }
        if (isQX) {
          $prefs.setValueForKey(data, key);
        }
        if (isNode) {
          this.root[key] = data;
        }
      } else {
        this.cache[key] = data;
      }
      this.persistCache();
    }

    read(key) {
      this.log(`READ ${key}`);
      if (key.indexOf("#") !== -1) {
        key = key.substr(1);
        if (isSurge || isLoon) {
          return $persistentStore.read(key);
        }
        if (isQX) {
          return $prefs.valueForKey(key);
        }
        if (isNode) {
          return this.root[key];
        }
      } else {
        return this.cache[key];
      }
    }

    delete(key) {
      this.log(`DELETE ${key}`);
      if (key.indexOf("#") !== -1) {
        key = key.substr(1);
        if (isSurge || isLoon) {
          $persistentStore.write(null, key);
        }
        if (isQX) {
          $prefs.removeValueForKey(key);
        }
        if (isNode) {
          delete this.root[key];
        }
      } else {
        delete this.cache[key];
      }
      this.persistCache();
    }

    // notification
    notify(title, subtitle = "", content = "", options = {}) {
      const openURL = options["open-url"];
      const mediaURL = options["media-url"];

      if (isQX) $notify(title, subtitle, content, options);
      if (isSurge) {
        $notification.post(
          title,
          subtitle,
          content + `${mediaURL ? "\n多媒体:" + mediaURL : ""}`,
          {
            url: openURL,
          }
        );
      }
      if (isLoon) {
        let opts = {};
        if (openURL) opts["openUrl"] = openURL;
        if (mediaURL) opts["mediaUrl"] = mediaURL;
        if (JSON.stringify(opts) == "{}") {
          $notification.post(title, subtitle, content);
        } else {
          $notification.post(title, subtitle, content, opts);
        }
      }
      if (isNode || isScriptable) {
        const content_ =
          content +
          (openURL ? `\n点击跳转: ${openURL}` : "") +
          (mediaURL ? `\n多媒体: ${mediaURL}` : "");
        if (isJSBox) {
          const push = require("push");
          push.schedule({
            title: title,
            body: (subtitle ? subtitle + "\n" : "") + content_,
          });
        } else {
          console.log(`${title}\n${subtitle}\n${content_}\n\n`);
        }
      }
    }

    // other helper functions
    log(msg) {
      if (this.debug) console.log(msg);
    }

    info(msg) {
      console.log(msg);
    }

    error(msg) {
      console.log("ERROR: " + msg);
    }

    wait(millisec) {
      return new Promise((resolve) => setTimeout(resolve, millisec));
    }

    done(value = {}) {
      if (isQX || isLoon || isSurge) {
        $done(value);
      } else if (isNode && !isJSBox) {
        if (typeof $context !== "undefined") {
          $context.headers = value.headers;
          $context.statusCode = value.statusCode;
          $context.body = value.body;
        }
      }
    }
  })(name, debug);
}
