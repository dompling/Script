/*
author: 2Ya

修改自lowking
哔哩哔哩番剧监控-lowking-v1.6

hostname = *.bilibili.com

************************
Surge 4.2.0+ 脚本配置:
************************

[Script]
# > 哔哩哔哩番剧监控
获取哔哩哔哩 = type=http-request,pattern=^https:\/\/api.vc.bilibili.com\/dynamic_svr\/v1\/dynamic_svr\/dynamic_new,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/dompling/Script/master/BiliBili/bilibili.cookie.js,script-update-interval=0
哔哩哔哩番剧监控 = type=cron,cronexp="0 0 0,1 * * ?",wake-system=1,script-path=https://raw.githubusercontent.com/dompling/Script/master/BiliBiliMonitor/BiliBiliMonitor.js


************************
QuantumultX 本地脚本配置:
************************

[rewrite_local]
#哔哩哔哩番剧监控cookie
https:\/\/api.vc.bilibili.com\/dynamic_svr\/v1\/dynamic_svr\/dynamic_new  url script-request-header https://raw.githubusercontent.com/dompling/Script/master/BiliBili/bilibili.cookie.js

[task_local]
0 0 0,1 * * ? https://raw.githubusercontent.com/dompling/Script/master/BiliBiliMonitor/BiliBiliMonitor.js

************************
LOON 本地脚本配置:
************************

[Script]
http-request https:\/\/api.vc.bilibili.com\/dynamic_svr\/v1\/dynamic_svr\/dynamic_new tag=获取哔哩哔哩Cookie, script-path=https://raw.githubusercontent.com/dompling/Script/master/BiliBili/bilibili.cookie.js
cron "0 0 0,1 * * *" script-path=https://raw.githubusercontent.com/dompling/Script/master/BiliBiliMonitor/BiliBiliMonitor.js, tag=哔哩哔哩番剧监控

*/

const bilibiliCookie = new API("bilibili").read("cookie");
const cookieData = bilibiliCookie.split("; ");
const $ = new API("BiliBiliMonitor", true);
$.log(cookieData);
let vmid;
try {
  vmid = cookieData
    .find((item) => item.indexOf("DedeUserID=") > -1)
    .split("=")[1];
} catch (e) {
  $.log(e);
}
const dateTime = new Date().getTime();
const moduleName = "📹 哔哩哔哩番剧监控";
const subscriptionName = "subscriptions";

(async () => {
  if (!vmid) throw "cookie 未获取，请到（app->动态）获取";
  const subscriptionsDataTypeOne = await getSubscription({
    type: 1,
    pn: 1,
    ps: 30,
    follow_status: 0,
    vmid: vmid,
  });
  const subscriptionsDataTypeTwo = await getSubscription({
    type: 2,
    pn: 1,
    ps: 30,
    follow_status: 0,
    vmid: vmid,
  });
  let resultList = {};
  resultList = Object.assign(subscriptionsDataTypeOne, resultList);
  resultList = Object.assign(subscriptionsDataTypeTwo, resultList);
  if (Object.keys(resultList).length > 0) {
    message(resultList);
  } else {
    throw "番剧数据获取错误";
  }
})()
  .catch((e) => {
    $.notify(moduleName, `❌：${e}`);
  })
  .finally(() => {
    $.done({});
  });

function message(data) {
  const subscriptions = $.read(subscriptionName);
  if (subscriptions && Object.keys(subscriptions).length > 0) {
    try {
      //curList转成对象
      let curKeyList = [];
      for (let i in data) {
        curKeyList.push(i);
      }
      let storedKeyList = [];
      for (let i in subscriptions) {
        storedKeyList.push(i);
      }
      let result = findDifferentElements2(storedKeyList, curKeyList);
      if (!result || result.length == 0) {
        $.log("💭无番剧更新");
      } else {
        $.log(`💭番剧更新如下：`);
        for (let i in result) {
          const keys = result[i];
          const bangumi = curList[keys];
          $.notify(
            moduleName,
            `【${bangumi.title}】- ${bangumi.indexShow}`,
            "",
            {
              "media-url": bangumi.cover,
              "open-url": bangumi.url,
            }
          );
          $.log(`【${bangumi.title}】- ${bangumi.indexShow}`);
        }
      }
    } catch (e) {
      $.notify(
        moduleName,
        "已保存的追番列表数据格式错误❌，请使用BoxJs手动清空后再试：" + e
      );
    }
  } else {
    $.write(data, subscriptionName);
    $.log("追番列表：" + JSON.stringify(data));
    $.notify(moduleName, "首次运行，已保存追番列表");
  }
}

function findDifferentElements2(array1, array2) {
  // 定义一个空数res组作为返回值的容器，基本操作次数1。
  const res = [];
  // 定义一个对象用于装数组一的元素，基本操作次数1。
  const objectA = {};
  // 使用对象的 hash table 存储元素，并且去重。基本操作次数2n。
  for (const ele of array1) {
    // 取出n个元素n次
    objectA[ele] = undefined; // 存入n个元素n次
  }
  // 定义一个对象用于装数组二的元素，基本操作次数1。
  const objectB = {};
  // 使用对象的 hash table 存储元素，并且去重。基本操作次数2n。
  for (const ele of array2) {
    // 取出n个元素n次
    objectB[ele] = undefined; // 存入n个元素n次
  }
  // 使用对象的 hash table 删除相同元素。基本操作次数4n。
  for (const key in objectA) {
    //取出n个key (n次操作)
    if (key in objectB) {
      // 基本操作1次 (外层循环n次)
      delete objectB[key]; // 基本操作1次 (外层循环n次)
      delete objectA[key]; // 基本操作1次 (外层循环n次)（总共是3n 加上n次取key的操作 一共是4n）
    }
  }
  // 将第二个对象剩下来的key push到res容器中，基本操作次数也是3n次(最糟糕的情况)。
  for (const key in objectB) {
    // 取出n个元素n次(最糟糕的情况)。
    res[res.length] = key; // 读取n次length n次，存入n个元素n次，一共2n(最糟糕的情况)。
  }
  // 返回结果，基本操作次数1。
  return res;
}

async function getSubscription(params) {
  let i = 0,
    pageSize = params.pn,
    dataSource = {};
  delete params.pn;
  do {
    let data = Object.keys(params).map((key) => {
      const value = params[key];
      return `${key}=${value}`;
    });
    data.push(`ts=${dateTime}`);
    data.push(`pn=${pageSize}`);
    data = data.join("&");
    const url = `https://api.bilibili.com/x/space/bangumi/follow/list?${data}`;
    const response = await $.http.get({
      url,
      headers: {
        cookie: bilibiliCookie,
      },
    });
    try {
      const body = JSON.parse(response.body);
      if (body.code !== 0) throw "获取番剧列表失败" + (body.message || "");
      const { list } = body.data;
      if (!list.length) return dataSource;
      for (let i in list) {
        const bangumi = list[i];
        const sessionId = bangumi["season_id"];
        const newEpId = bangumi["new_ep"].id;
        dataSource[`${sessionId}${newEpId}`] = {
          newEpId,
          sessionId,
          url: bangumi.url,
          cover: bangumi.cover,
          title: bangumi.title,
          is_finish: bangumi.is_finish,
          total_count: bangumi.total_count,
          indexShow: bangumi["new_ep"]["index_show"],
        };
      }
      pageSize++;
    } catch (e) {
      i = 1;
      $.notify(moduleName, `❌：页码（${pageSize}）—— ${e}`);
      return {};
    }
  } while (i === 0);
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

function HTTP(defaultOptions = { baseURL: "" }) {
  const { isQX, isLoon, isSurge, isScriptable, isNode } = ENV();
  const methods = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"];
  const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

  function send(method, options) {
    options = typeof options === "string" ? { url: options } : options;
    const baseURL = defaultOptions.baseURL;
    if (baseURL && !URL_REGEX.test(options.url || "")) {
      options.url = baseURL ? baseURL + options.url : options.url;
    }
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
          return $persistentStore.write(data, key);
        }
        if (isQX) {
          return $prefs.setValueForKey(data, key);
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
          return $persistentStore.write(null, key);
        }
        if (isQX) {
          return $prefs.removeValueForKey(key);
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
