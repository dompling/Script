/**
生日倒计时 v0.1 alpha
@author: DUMPLING YaYa

图标：
🔘彩色版本: https://raw.githubusercontent.com/Orz-3/task/master/birthday.png
🔘透明版本: https://raw.githubusercontent.com/Orz-3/mini/master/birthday.png
配置：
[loon]
cron "10 0 0 * * *" script-path=https://raw.githubusercontent.com/dompling/Script/master/birthdayCountDown/index.js
[quanx]
10 0 0 * * * https://raw.githubusercontent.com/dompling/Script/master/birthdayCountDown/index.js
*/

const $ = API("birthday", true);

const title = "🐣破壳日🐣";

$.config = {
  username: "", // 姓名
  birthday: "", // 生日日期
  physiologicalDefault: "", // 最近一次来周期时间
  physiologicalCycle: "", // 下一次周期
  nongli: true, // 农历生日
  eday: "",
  loveWords: true,
  isLeapMonth: false, //如果是农历闰月第四个参数赋值true即可
};

const readKey = [
  "mediaImg",
  "username",
  "time",
  "pDefault",
  "eday",
  "pCycle",
  "nongli",
  "loveWords",
];

const defaultKey = [
  "mediaImg",
  "username",
  "birthday",
  "physiologicalDefault",
  "eday",
  "physiologicalCycle",
  "nongli",
  "loveWords",
];

defaultKey.forEach((key, index) => {
  if ($.read(readKey[index])) $.config[key] = $.read(readKey[index]);
});
$.log($.config);
(async () => {
  const calendarRes = await getCalendarJs();
  $.calendar = evil(calendarRes);
  if (!$.config.username || !$.calendar.verifyTime($.config.birthday))
    throw "姓名或者出生日格式不正确";
  if ($.config.loveWords === "true" || $.config.loveWords === true)
    $.oneSay = await getEveryDaySay();

  getBirthday();
  getEdayNumber();
  getPhysiologicalDay();

  let content = `
  [🐣${$.config.username}🐣]：${$.oneSay || ""}

  📆农历：${$.lunar}

  📆日历：${$.solar}

  🐽属相：${$.animal}

  🌠星座：${$.astro}

  🎂下个：${$.birthday}（${$.nextDay}天）

  `;
  if ($.pDay) {
    content += `🆘生理：${$.pDay[0]} 天  📆：${$.pDay[1]}`;
  }

  if ($.eDay) {
    content += `
    
  💏相识：${$.eDay} 天  📆：${$.config.eday}`;
  }
  $.log(content);
  $.notify(`@${$.config.username}`, "嘿，在干嘛呀？", content, {
    "media-url": $.config.mediaImg,
  });
})()
  .catch((e) => {
    $.notify(title, "❌" + e);
  })
  .finally(() => {
    $.done({});
  });

function evil(str) {
  return new Function("return " + str)()();
}

function getEdayNumber() {
  if ($.calendar.verifyTime($.config.eday)) {
    const initDay = $.config.eday.split("-");
    const obj = {
      cYear: parseInt(initDay[0]),
      cMonth: parseInt(initDay[1]),
      cDay: parseInt(initDay[2]),
    };
    $.eDay = Math.abs($.calendar.daysBetween(obj));
  }
}

function getPhysiologicalDay() {
  let physiologicalDay;
  if (
    $.calendar.verifyTime($.config.physiologicalDefault) &&
    $.config.physiologicalCycle
  ) {
    physiologicalDay = getPhysiological(
      $.config.physiologicalDefault,
      $.config.physiologicalCycle
    );
  }
  $.pDay = physiologicalDay;
}

function getBirthday() {
  const [y, m, d] = $.config.birthday.split("-");
  const type =
    $.config.nongli === "false" || $.config.nongli === false ? false : true;
  const year = parseInt(y),
    month = parseInt(m),
    day = parseInt(d);
  const birth = $.calendar.birthday(year, month, day, type);
  $.birthday = `${birth[0]}-${birth[1]}-${birth[2]}`;
  $.nextDay = birth[3];
  let first;
  if (type) {
    first = $.calendar.lunar2solar(year, month, day, $.config.isLeapMonth);
  } else {
    first = $.calendar.solar2lunar(year, month, day);
  }
  $.lunar = `${first.lYear}-${first.lMonth}-${first.lDay} (${first.IMonthCn}${first.IDayCn})`;
  $.solar = `${first.cYear}-${first.cMonth}-${first.cDay}`;
  $.animal = first.Animal + $.calendar.getAnimalZodiacToEmoji(first.Animal);
  $.astro = first.astro + $.calendar.getAnimalZodiacToEmoji(first.astro);
}

async function getEveryDaySay() {
  return $.http
    .get("https://api.uomg.com/api/rand.qinghua?format=json")
    .then((response) => {
      const { body } = response;
      const { code, content } = JSON.parse(body);
      if (code !== 1) {
        throw new Error(body);
      }
      console.log(content);
      return content;
    });
}

async function getCalendarJs() {
  const response = await $.http.get({
    url: "https://gitee.com/domp/jnc_lunch/raw/master/public/calendar.js",
  });
  return response.body;
}

function getPhysiological(d, r, i = 0) {
  var lastPDefault = $.read("lastPDefault_" + i);
  if (lastPDefault !== d) {
    $.write(d, "physiologicalDefault_" + i);
  }
  if (!lastPDefault) {
    $.write(d, "lastPDefault_" + i);
  }
  var i_day = $.read("physiologicalDefault_" + i),
    _default = d,
    range = r;

  if ($.calendar.verifyTime(i_day)) {
    _default = i_day;
  } else {
    $.write(_default, "physiologicalDefault_" + i);
  }
  var initDay = _default.split("-");
  var _physiological = {
    cYear: parseInt(initDay[0]),
    cMonth: parseInt(initDay[1]),
    cDay: parseInt(initDay[2]),
  };
  var _pdays = $.calendar.daysBetween(_physiological);
  var nextPday = _default;
  if (_pdays <= 0) {
    var nexMont = new Date(
      parseInt(initDay[0]),
      parseInt(initDay[1]) - 1,
      parseInt(initDay[2]) + parseInt(range)
    );
    var nextYear = nexMont.getFullYear();
    var nextMonth = nexMont.getMonth() + 1;
    var nextDay = nexMont.getDate();
    nextPday = `${nextYear}-${nextMonth}-${nextDay}`;

    _physiological = {
      cYear: nextYear,
      cMonth: nextMonth,
      cDay: nextDay,
    };

    _pdays = $.calendar.daysBetween(_physiological);
    $.write(nextPday, "physiologicalDefault_" + i);
  }
  return [_pdays, nextPday];
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
