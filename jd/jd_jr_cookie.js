/*
Author: 2Ya
Github: https://github.com/domping

===================
下载京东金融，进入app获取
===================

===================
[MITM]
hostname = ms.jr.jd.com

【Surge脚本配置】:
===================
[Script]
获取京东金融领豆Cookie = type=http-request,pattern=^https?:\/\/ms\.jr\.jd\.com\/gw\/generic\/uc\/newna\/m\/userstat,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/dompling/Script/master/jd/jd_jr_cookie.js,script-update-interval=0

===================
【Loon脚本配置】:
===================
[Script]
http-request ^https?:\/\/ms\.jr\.jd\.com\/gw\/generic\/uc\/newna\/m\/userstat tag=获取京东金融领豆Cookie, script-path=https://raw.githubusercontent.com/dompling/Script/master/jd/jd_jr_cookie.js

===================
【 QX  脚本配置 】 :
===================

[rewrite_local]
^https?:\/\/ms\.jr\.jd\.com\/gw\/generic\/uc\/newna\/m\/userstat  url script-request-header https://raw.githubusercontent.com/dompling/Script/master/jd/jd_jr_cookie.js

 */

const $ = new API("jd_jr", true);
const title = "金融领豆";
const cookiesKey = "cookies";
const bodyKey = "bodys";
const cookies = JSON.parse($.read(cookiesKey) || "[]");
const bodys = JSON.parse($.read(bodyKey) || "{}");
async function getCookies() {
  if ($request.headers && $request.url.indexOf("m/userstat") > -1) {
    const currentCk = $request.headers["Cookie"] || $request.headers["cookie"];
    const currentBody = $request.body;
    const saveCookie = { phoneNumber: "", username: "" };
    if (currentCk.match(/(pt_key=.+?pt_pin=|pt_pin=.+?pt_key=)/)) {
      const cookieValue =
        currentCk.match(/pt_key=.+?;/) + currentCk.match(/pt_pin=.+?;/);
      const userName = cookieValue.match(/pt_pin=(.+?);/)[1];
      bodys[userName] = currentBody;
      saveCookie.username = userName;
      if (cookies.find((item) => item.username === userName)) return;
      const pRes = await getPhoneNumber(cookieValue);
      if(pRes.resultCode===0){
         saveCookie.phoneNumber = pRes.resultData.mobile;
      }
      cookies.push(saveCookie);
      $.log(cookies);
      const cacheValue = JSON.stringify(cookies, null, "\t");
      $.write(cacheValue, cookiesKey);
      $.write(JSON.stringify(bodys), bodyKey);
      $.notify(title, "", `${userName}：获取Cookie成功 🎉`);
    }
  }
}

function getPhoneNumber(cookie) {
  const opt = {
    url: `https://ms.jr.jd.com/gw/generic/jrm/h5/m/getAlreadyBindMobile`,
    headers: {
      Cookie: cookie,
    },
   body:`{"clientType":"web","clientVersion":"0.0.0"}`
  };
  return $.http.get(opt).then((response) => JSON.parse(response.body));
}

try {
  getCookies()
    .catch((e) => {
      $.log(e);
    })
    .finally(() => $.done());
} catch (e) {
  $.log(e);
  $.done();
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
  const URL_REGEX =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

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

    return (
      timer
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
