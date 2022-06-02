/*
青龙 docker 每日自动同步 boxjs cookie
40 * * * https://raw.githubusercontent.com/dompling/Script/master/jd/ql_cookie_sync.js
 */

const $ = new API('ql', true);

const title = '🐉 通知提示';

const jd_cookies = JSON.parse($.read('#CookiesJD') || '[]');

let remark = {};
try {
  const _remark = JSON.parse(
    JSON.parse($.read('#jd_ck_remark') || '{}').remark || '[]',
  );

  _remark.forEach((item) => {
    remark[item.username] = item;
  });
} catch (e) {
  console.log(e);
}

function getUsername(ck) {
  if (!ck) return '';
  return decodeURIComponent(ck.match(/pin=(.+?);/)[1]);
}

async function getScriptUrl() {
  const response = await $.http.get({
    url: 'https://raw.githubusercontent.com/dompling/Script/master/jd/ql_api.js',
  });
  return response.body;
}

(async () => {
  const ql_script = (await getScriptUrl()) || '';
  eval(ql_script);
  await $.ql.login();

  const cookiesRes = await $.ql.select();
  const ids = cookiesRes.data.map((item) => item.id);
  await $.ql.delete(ids);
  const wskeyRes = await $.ql.select('JD_WSCK');
  await $.ql.delete(wskeyRes.data.map((item) => item.id));
  $.log('清空 cookie 和 wskey');

  const addData = [];
  const wsCookie = [];
  for (const jd_cookie of jd_cookies) {
    const username = getUsername(jd_cookie.cookie);
    let remarks = '';
    if (remark[username]) {
      remarks = remark[username].nickname;

      remarks += `&${remark[username].remark}`;
      if (remark[username].qywxUserId)
        remarks += `&${remark[username].qywxUserId}`;
    } else {
      remarks = username;
    }
    addData.push({ name: 'JD_COOKIE', value: jd_cookie.cookie, remarks });
    if (jd_cookie.wskey) {
      wsCookie.push({
        name: 'JD_WSCK',
        remarks: remarks.split('&')[0],
        value: `${jd_cookie.wskey}pt_pin=${encodeURI(username)};`,
      });
    }
  }
  if (addData.length) await $.ql.add(addData);
  if (wsCookie.length) await $.ql.add(wsCookie);

  const _cookiesRes = await $.ql.select();
  const _ids = [];
  for (let index = 0; index < _cookiesRes.data.length; index++) {
    const item = _cookiesRes.data[index];
    const response = await TotalBean(item.value);
    if (response.retcode !== '0') _ids.push(item);
  }

  if (_ids.length > 0) {
    const ids = _ids.map((item) => item.id);
    console.log(
      `过期账号：${_ids
        .map((item) => item.remarks || getUsername(item.value))
        .join(`\n`)}`,
    );
    await $.ql.disabled(ids);
  }

  const cookieText = jd_cookies.map((item) => item.userName).join(`\n`);
  if ($.read('mute') !== 'true') {
    return $.notify(title, '', `已同步账号： ${cookieText}`);
  }
})()
  .catch((e) => {
    $.log(JSON.stringify(e));
  })
  .finally(() => {
    $.done();
  });

async function TotalBean(Cookie) {
  const opt = {
    url: 'https://me-api.jd.com/user_new/info/GetJDUserInfoUnion?sceneval=2&sceneval=2&g_login_type=1&g_ty=ls',
    headers: {
      cookie: Cookie,
      Referer: 'https://home.m.jd.com/',
    },
  };
  return $.http.get(opt).then((response) => {
    try {
      return JSON.parse(response.body);
    } catch (e) {
      return {};
    }
  });
}

function getURL(api, key = 'api') {
  return `${baseURL}/${key}/${api}`;
}

function login() {
  const opt = {
    headers,
    url: getURL('login'),
    body: JSON.stringify(account),
  };
  return $.http.post(opt).then((response) => JSON.parse(response.body));
}

function getCookies(searchValue = 'JD_COOKIE') {
  const opt = { url: getURL(urlStr) + `?searchValue=${searchValue}`, headers };
  return $.http.get(opt).then((response) => JSON.parse(response.body));
}

function addCookies(cookies) {
  const opt = { url: getURL(urlStr), headers, body: JSON.stringify(cookies) };
  return $.http.post(opt).then((response) => JSON.parse(response.body));
}

function delCookie(ids) {
  const opt = { url: getURL(urlStr), headers, body: JSON.stringify(ids) };
  return $.http.delete(opt).then((response) => JSON.parse(response.body));
}

function disabled(ids) {
  const opt = {
    url: getURL(`${urlStr}/disable`),
    headers,
    body: JSON.stringify(ids),
  };
  return $.http.put(opt).then((response) => JSON.parse(response.body));
}

function ENV() {
  const isQX = typeof $task !== 'undefined';
  const isLoon = typeof $loon !== 'undefined';
  const isSurge = typeof $httpClient !== 'undefined' && !isLoon;
  const isJSBox = typeof require == 'function' && typeof $jsbox != 'undefined';
  const isNode = typeof require == 'function' && !isJSBox;
  const isRequest = typeof $request !== 'undefined';
  const isScriptable = typeof importModule !== 'undefined';
  return { isQX, isLoon, isSurge, isNode, isJSBox, isRequest, isScriptable };
}

function HTTP(defaultOptions = { baseURL: '' }) {
  const { isQX, isLoon, isSurge, isScriptable, isNode } = ENV();
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'];
  const URL_REGEX =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

  function send(method, options) {
    options = typeof options === 'string' ? { url: options } : options;
    const baseURL = defaultOptions.baseURL;
    if (baseURL && !URL_REGEX.test(options.url || '')) {
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

    // persistance

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
            { flag: 'wx' },
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
            { flag: 'wx' },
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
      const data = JSON.stringify(this.cache);
      if (isQX) $prefs.setValueForKey(data, this.name);
      if (isLoon || isSurge) $persistentStore.write(data, this.name);
      if (isNode) {
        this.node.fs.writeFileSync(
          `${this.name}.json`,
          data,
          { flag: 'w' },
          (err) => console.log(err),
        );
        this.node.fs.writeFileSync(
          'root.json',
          JSON.stringify(this.root),
          { flag: 'w' },
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
        if (JSON.stringify(opts) == '{}') {
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
      if (this.debug) console.log(msg);
    }

    info(msg) {
      console.log(msg);
    }

    error(msg) {
      console.log('ERROR: ' + msg);
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
  })(name, debug);
}
