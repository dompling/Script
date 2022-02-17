/**
 图标
# 获取方式: 进入待出行列表查看

[task_local]
30 * * * https://raw.githubusercontent.com/dompling/Script/master/ZXTrains/ZXTrains.js

(1). Quantumult X
[MITM]
hostname=m.ctrip.com
[rewrite_local]

^https:\/\/m.ctrip.com\/restapi\/soa2\/17644\/json\/getWaitTravelOrders* url script-respones-body https://raw.githubusercontent.com/dompling/Script/master/ZXTrians/update.trians.js

(2). Loon
[MITM]
hostname=m.ctrip.com
[Script]
http-response ^https:\/\/m.ctrip.com\/restapi\/soa2\/17644\/json\/getWaitTravelOrders* script-path=https://raw.githubusercontent.com/dompling/Script/master/ZXTrians/update.trians.js, require-body=true

(3). Surge
[MITM]
hostname=m.ctrip.com
[Script]
type=http-response, pattern=^https:\/\/m.ctrip.com\/restapi\/soa2\/17644\/json\/getWaitTravelOrders*, script-path=https://raw.githubusercontent.com/dompling/Script/master/ZXTrians/update.trians.js, require-body=true

 */

$ = new API("ZXTrains", true);

const title = "🚆智行火车";

function dateToUnixTimestamp(str) {
  const dates = new Date(str.replace(/-/g, "/"));
  return parseInt(dates.getTime());
}

(async () => {
  const response = $.read("travels");
  response.forEach((item) => {
    message(item.orders[0]);
  });
})()
  .catch((e) => {
    console.log(e);
  })
  .finally(() => {
    $.done({});
  });

function timeAgo(o) {
  var n = new Date().getTime();
  var f = n - o;
  var bs = f >= 0 ? "前" : "后"; //判断时间点是在当前时间的 之前 还是 之后
  f = Math.abs(f);
  if (f < 6e4) {
    return "刚刚";
  } //小于60秒,刚刚
  if (f < 36e5) {
    return parseInt(f / 6e4) + "分钟" + bs;
  } //小于1小时,按分钟
  if (f < 864e5) {
    return parseInt(f / 36e5) + "小时" + bs;
  } //小于1天按小时
  if (f < 2592e6) {
    return parseInt(f / 864e5) + "天" + bs;
  } //小于1个月(30天),按天数
  if (f < 31536e6) {
    return parseInt(f / 2592e6) + "个月" + bs;
  } //小于1年(365天),按月数
  return parseInt(f / 31536e6) + "年" + bs; //大于365天,按年算
}

function message(d) {
  let { trainFlights, timeDesc } = d;
  const data = trainFlights[0];
  const passengerInfos = data.passengerInfos[0];
  const fromDate = dateToUnixTimestamp(data.fromTime);
  const toDate = dateToUnixTimestamp(data.toTime);
  const nowDate = parseInt(new Date().getTime());
  if (fromDate - nowDate < 1000 * 60 * 60 * 24 && nowDate < toDate) {
    if (nowDate > fromDate && nowDate < toDate) {
      timeDesc = "列车运行中";
    } else {
      timeDesc = `距离发车还有${timeAgo(fromDate)}`;
    }
    $.notify(
      title,
      `⏰${timeDesc}`,
      `
    ⚙类型：${data.title}
    ⛩票口：${data.checkInDesc || "到站自信查询"}
    🛎提醒: ${data.tripName}
    ⏰开始：${data.fromTime}
    ⏰结束：${data.toTime}
    🏷地点：${data.fromStation} - ${data.toStation}
    💰价格：${data.price}
    💺座位：${passengerInfos.seatCategory} ${passengerInfos.carriageNo} ${
        passengerInfos.seatNo
      } 
    `
    );
  }

  if (fromDate - nowDate > 1000 * 60 * 60 * 24)
    console.log(`${data.title} 未到提醒时间`);
  if (nowDate > toDate) console.log(`${data.title} 当前车次已经   `);
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
