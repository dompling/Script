/*
小米运动修改微信支付宝运动步数
APP Store下载小米运动APP
登入小米运动(登录方式必须是手机号码+密码(没有就用手机号码注册),下面的第三方账号(小米账号,Apple,微信)授权登录不行)
登录成功后在 我的->第三方接入->绑定支付宝,微信
小米运动只要不退出登录，就会自动获取新的token,即永久有效

 */

const $ = new API('xmSports');
$.cacheKey = 'loginCode';
$.token = $.read($.cacheKey) || [];
$.notify = $.env.isNode
  ? (title, sub, content) => {
      require('./sendNotify').sendNotify(title, `${sub}\n${content}`);
    }
  : $.notify;
if ($.env.isNode && !$.token.length) {
  if (process.env.XM_SPORTS_TOKEN) {
    $.token = process.env.XM_SPORTS_TOKEN.split('&');
  }
}

$.message = '';
(async () => {
  try {
    if ($request.url.indexOf('ctype') === -1) return getToken();
  } catch (error) {}

  if (!$.token.length) {
    return ($.message = '请获取正确的登陆信息');
  }
  const tokenInfo = {};

  for (let index = 0; index < $.token.length; index++) {
    $.body = $.token[index];
    const response = await login();

    if (response.result === 'ok') {
      const token_info = response.token_info;
      tokenInfo[token_info.user_id] = {};
      tokenInfo[token_info.user_id].email = response.thirdparty_info.email;
      tokenInfo[token_info.user_id].login_token = token_info.login_token;
      tokenInfo[token_info.user_id].code = $.body;
      console.log(tokenInfo);
    } else {
      $.message = `${$.body} 登陆签名过期，请重新获取\n`;
      console.log('登陆签名过期，请重新获取');
    }
  }
  const loginCode = Object.keys(tokenInfo).map((key) => tokenInfo[key].code);
  const phone = Object.keys(tokenInfo).map((key) => tokenInfo[key].email);
  $.write(tokenInfo, 'token');
  $.write(loginCode, $.cacheKey);
  $.message += `切换账号\n${phone.join(`\n`)}`;
})()
  .catch((e) => {
    console.log(e);
  })
  .finally(() => {
    if ($.message) $.notify('小米运动', '', $.message);
    $.done({});
  });

async function getToken() {
  if ($request.body) {
    const bodys = $request.body.split('&');
    bodys.forEach((item) => {
      const [key, value] = item.split('=');
      if (key === 'code') $.body = value;
    });
    if ($.body) {
      $.token.push($.body);
      $.write($.token, $.cacheKey);
      $.message = `获取 TOKEN 成功\nPs:新增成功之后运行本脚本，进入登录的接口全部失效，可以重新登陆其他账号`;
    }
  }
  return $.message;
}

async function login() {
  const options = {
    url: `https://account-cn2.huami.com/v2/client/login?ctype=1`,
    body: `allow_registration=false&app_name=com.xiaomi.hm.health&app_version=5.3.0&code=${$.body}&country_code=CN&device_id=00407572-6305-4A1A-BC05-92E57892EE72&device_id_type=uuid&device_model=phone&dn=api-user.huami.com%2Capi-mifit.huami.com%2Capp-analytics.huami.com%2Caccount.huami.com%2Capi-watch.huami.com%2Cauth.huami.com&grant_type=access_token&lang=zh_CN&os_version=1.5.0&source=com.xiaomi.hm.health&third_name=huami_phone`,
    headers: {
      appplatform: `ios_phone`,
      country: `CN`,
      'Content-Type': `application/x-www-form-urlencoded`,
      'User-Agent': `MiFit/5.3.0 (iPhone; iOS 14.7; Scale/2.00)`,
      cv: `5.3.0`,
      Host: `account-cn2.huami.com`,
      lang: `zh_CN`,
    },
  };
  return $.http.post(options).then((response) => JSON.parse(response.body));
}

function ENV() {
  const isQX = typeof $task !== 'undefined';
  const isLoon = typeof $loon !== 'undefined';
  const isSurge = typeof $httpClient !== 'undefined' && !isLoon;
  const isJSBox = typeof require == 'function' && typeof $jsbox != 'undefined';
  const isNode = typeof require == 'function' && !isJSBox;
  const isRequest = typeof $request !== 'undefined';
  const isScriptable = typeof importModule !== 'undefined';
  return {
    isQX,
    isLoon,
    isSurge,
    isNode,
    isJSBox,
    isRequest,
    isScriptable,
  };
}

function HTTP(
  defaultOptions = {
    baseURL: '',
  },
) {
  const { isQX, isLoon, isSurge, isScriptable, isNode } = ENV();
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'];
  const URL_REGEX =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

  function send(method, options) {
    options =
      typeof options === 'string'
        ? {
            url: options,
          }
        : options;
    const baseURL = defaultOptions.baseURL;
    if (baseURL && !URL_REGEX.test(options.url || '')) {
      options.url = baseURL ? baseURL + options.url : options.url;
    }
    if (options.body && options.headers && !options.headers['Content-Type']) {
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    options = {
      ...defaultOptions,
      ...options,
    };
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
      worker = $task.fetch({
        method,
        ...options,
      });
    } else if (isLoon || isSurge || isNode) {
      worker = new Promise((resolve, reject) => {
        const request = isNode ? require('request') : $httpClient;
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
              `${method} URL: ${options.url} exceeds the timeout ${timeout} ms`,
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
      (http[method.toLowerCase()] = (options) => send(method, options)),
  );
  return http;
}

function API(name = 'untitled', debug = false) {
  const { isQX, isLoon, isSurge, isNode, isJSBox, isScriptable } = ENV();
  return new (class {
    constructor(name, debug) {
      this.name = name;
      this.debug = debug;

      this.http = HTTP();
      this.env = ENV();

      this.node = (() => {
        if (isNode) {
          const fs = require('fs');

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

    // persistence
    // initialize cache
    initCache() {
      if (isQX) this.cache = JSON.parse($prefs.valueForKey(this.name) || '{}');
      if (isLoon || isSurge)
        this.cache = JSON.parse($persistentStore.read(this.name) || '{}');

      if (isNode) {
        // create a json for root cache
        let fpath = 'root.json';
        if (!this.node.fs.existsSync(fpath)) {
          this.node.fs.writeFileSync(
            fpath,
            JSON.stringify({}),
            {
              flag: 'wx',
            },
            (err) => console.log(err),
          );
        }
        this.root = {};

        // create a json file with the given name if not exists
        fpath = `${this.name}.json`;
        if (!this.node.fs.existsSync(fpath)) {
          this.node.fs.writeFileSync(
            fpath,
            JSON.stringify({}),
            {
              flag: 'wx',
            },
            (err) => console.log(err),
          );
          this.cache = {};
        } else {
          this.cache = JSON.parse(
            this.node.fs.readFileSync(`${this.name}.json`),
          );
        }
      }
    }

    // store cache
    persistCache() {
      const data = JSON.stringify(this.cache, null, 2);
      if (isQX) $prefs.setValueForKey(data, this.name);
      if (isLoon || isSurge) $persistentStore.write(data, this.name);
      if (isNode) {
        this.node.fs.writeFileSync(
          `${this.name}.json`,
          data,
          {
            flag: 'w',
          },
          (err) => console.log(err),
        );
        this.node.fs.writeFileSync(
          'root.json',
          JSON.stringify(this.root, null, 2),
          {
            flag: 'w',
          },
          (err) => console.log(err),
        );
      }
    }

    write(data, key) {
      this.log(`SET ${key}`);
      if (key.indexOf('#') !== -1) {
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
      if (key.indexOf('#') !== -1) {
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
      if (key.indexOf('#') !== -1) {
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
    notify(title, subtitle = '', content = '', options = {}) {
      const openURL = options['open-url'];
      const mediaURL = options['media-url'];

      if (isQX) $notify(title, subtitle, content, options);
      if (isSurge) {
        $notification.post(
          title,
          subtitle,
          content + `${mediaURL ? '\n多媒体:' + mediaURL : ''}`,
          {
            url: openURL,
          },
        );
      }
      if (isLoon) {
        let opts = {};
        if (openURL) opts['openUrl'] = openURL;
        if (mediaURL) opts['mediaUrl'] = mediaURL;
        if (JSON.stringify(opts) === '{}') {
          $notification.post(title, subtitle, content);
        } else {
          $notification.post(title, subtitle, content, opts);
        }
      }
      if (isNode || isScriptable) {
        const content_ =
          content +
          (openURL ? `\n点击跳转: ${openURL}` : '') +
          (mediaURL ? `\n多媒体: ${mediaURL}` : '');
        if (isJSBox) {
          const push = require('push');
          push.schedule({
            title: title,
            body: (subtitle ? subtitle + '\n' : '') + content_,
          });
        } else {
          console.log(`${title}\n${subtitle}\n${content_}\n\n`);
        }
      }
    }

    // other helper functions
    log(msg) {
      if (this.debug) console.log(`[${this.name}] LOG: ${this.stringify(msg)}`);
    }

    info(msg) {
      console.log(`[${this.name}] INFO: ${this.stringify(msg)}`);
    }

    error(msg) {
      console.log(`[${this.name}] ERROR: ${this.stringify(msg)}`);
    }

    wait(millisec) {
      return new Promise((resolve) => setTimeout(resolve, millisec));
    }

    done(value = {}) {
      if (isQX || isLoon || isSurge) {
        $done(value);
      } else if (isNode && !isJSBox) {
        if (typeof $context !== 'undefined') {
          $context.headers = value.headers;
          $context.statusCode = value.statusCode;
          $context.body = value.body;
        }
      }
    }

    stringify(obj_or_str) {
      if (typeof obj_or_str === 'string' || obj_or_str instanceof String)
        return obj_or_str;
      else
        try {
          return JSON.stringify(obj_or_str, null, 2);
        } catch (err) {
          return '[object Object]';
        }
    }
  })(name, debug);
}
