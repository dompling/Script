/*

Author: 2Ya
Github: https://github.com/domping
Version: v1.1.0

===================
特别说明：
1.获取多个京东cookie文件，不和野比大佬的文件冲突。暂不支持野比大佬脚本签到。
2.若是要使用京东多合一签到，请使用修改版地址：https://raw.githubusercontent.com/dompling/Script/master/jd/JD_extra_sign.js
===================
===================
使用方式：复制 https://home.m.jd.com/myJd/newhome.action 到浏览器打开 ，在个人中心自动获取 cookie，
若弹出成功则正常使用。否则继续再此页面继续刷新一下试试
===================

===================
[MITM]
hostname = me-api.jd.com

【Surge脚本配置】:
===================
[Script]
获取京东Cookie = type=http-request,pattern=^https:\/\/me-api\.jd\.com\/user_new\/info\/GetJDUserInfoUnion,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/dompling/Script/master/jd/JD_extra_cookie.js,script-update-interval=0

===================
【Loon脚本配置】:
===================
[Script]
http-request ^https:\/\/me-api\.jd\.com\/user_new\/info\/GetJDUserInfoUnion tag=获取京东Cookie, script-path=https://raw.githubusercontent.com/dompling/Script/master/jd/JD_extra_cookie.js

===================
【 QX  脚本配置 】 :
===================

[rewrite_local]
^https:\/\/me-api\.jd\.com\/user_new\/info\/GetJDUserInfoUnion  url script-request-header https://raw.githubusercontent.com/dompling/Script/master/jd/JD_extra_cookie.js

 */
const APIKey = 'CookiesJD'
const $ = new API('ql', false)
const CacheKey = `#${APIKey}`

const jdHelp = JSON.parse($.read('#jd_ck_remark') || '{}')
let remark = []
try {
  remark = JSON.parse(jdHelp.remark || '[]')
} catch (e) {
  console.log(e)
}

function getUsername(ck) {
  if (!ck) return ''
  return decodeURIComponent(ck.match(/pin=(.+?);/)[1])
}

async function getScriptUrl() {
  const response = await $.http.get({
    url: 'https://raw.githubusercontent.com/dompling/Script/master/jd/ql_api.js',
  })
  return response.body
}

const mute = '#cks_get_mute'
$.mute = $.read(mute)
;(async () => {
  const ql_script = (await getScriptUrl()) || ''
  eval(ql_script)

  if ($.ql) {
    $.ql.asyncCookie = async (cookieValue, name = 'JD_WSCK') => {
      try {
        await $.ql.login()
        console.log(`青龙${name}登陆同步`)
        let qlCk = await $.ql.select(name)
        if (!qlCk.data) return
        qlCk = qlCk.data
        const DecodeName = getUsername(cookieValue)
        const current = qlCk.find(
          (item) => getUsername(item.value) === DecodeName
        )
        if (current && current.value === cookieValue) {
          console.log('该账号无需更新')
          return
        }

        let remarks = ''
        remarks = remark.find((item) => item.username === DecodeName)
        if (remarks) {
          remarks =
            name === 'JD_WSCK'
              ? remarks.nickname
              : `${remarks.nickname}&${remarks.remark}&${remarks.qywxUserId}`
        }
        let response
        if (current) {
          current.value = cookieValue
          response = await $.ql.edit({
            name,
            remarks: current.remarks || remarks,
            value: cookieValue,
            id: current.id,
          })
          if (response.data.status === 1) {
            response = await $.ql.enabled([current.id])
          }
        } else {
          response = await $.ql.add([
            { name: name, value: cookieValue, remarks: remarks },
          ])
        }
        console.log(JSON.stringify(response))
        if ($.mute === 'true' && response.code === 200) {
          return console.log(
            '用户名: ' + DecodeName + `同步${name}更新青龙成功🎉`
          )
        } else if (response.code === 200) {
          $.notify('用户名: ' + DecodeName, '', `同步${name}更新青龙成功🎉`)
        } else {
          console.log('青龙同步失败')
        }
      } catch (e) {
        console.log(e)
      }
    }
  }
  if ($request) await GetCookie()
})()
  .catch((e) => {
    console.log(e)
  })
  .finally(() => {
    $.done()
  })

function getCache() {
  return JSON.parse($.read(CacheKey) || '[]')
}

function updateJDHelp(username) {
  if (remark.length) {
    const newRemark = remark.map((item) => {
      if (item.username === username) {
        return { ...item, status: '正常' }
      }
      return item
    })
    jdHelp.remark = JSON.stringify(newRemark, null, `\t`)
    $.write(JSON.stringify(jdHelp), '#jd_ck_remark')
  }
}

async function GetCookie() {
  const CV = `${$request.headers['Cookie'] || $request.headers['cookie']};`

  if (
    ($request.url.indexOf('GetJDUserInfoUnion') > -1 &&
      $request.url.indexOf('isLogin') === -1) ||
    $request.url.indexOf('openUpgrade') > -1
  ) {
    if (CV.match(/(pt_key=.+?pt_pin=|pt_pin=.+?pt_key=)/)) {
      const CookieValue = CV.match(/pt_key=.+?;/) + CV.match(/pt_pin=.+?;/)
      if (CookieValue.indexOf('fake_') > -1) return console.log('异常账号')
      const DecodeName = getUsername(CookieValue)
      let updateIndex = null,
        CookieName,
        tipPrefix

      const CookiesData = getCache()
      const updateCookiesData = [...CookiesData]

      CookiesData.forEach((item, index) => {
        if (getUsername(item.cookie) === DecodeName) updateIndex = index
      })
      if ($.ql) await $.ql.asyncCookie(CookieValue, 'JD_COOKIE')
      if (updateIndex !== null) {
        // const response = await TotalBean(updateCookiesData[updateIndex].cookie)
        // if (response && response.retcode === '0')
        //   return console.log('cookie 未过期，无需更新')
        updateCookiesData[updateIndex].cookie = CookieValue
        CookieName = '【账号' + (updateIndex + 1) + '】'
        tipPrefix = '更新京东'
      } else {
        updateCookiesData.push({
          userName: DecodeName,
          cookie: CookieValue,
        })
        CookieName = '【账号' + updateCookiesData.length + '】'
        tipPrefix = '首次写入京东'
      }
      const cacheValue = JSON.stringify(updateCookiesData, null, `\t`)
      $.write(cacheValue, CacheKey)
      updateJDHelp(DecodeName)

      if ($.mute === 'true') {
        return console.log(
          '用户名: ' + DecodeName + tipPrefix + CookieName + 'Cookie成功 🎉'
        )
      }
      $.notify(
        '用户名: ' + DecodeName,
        '',
        tipPrefix + CookieName + 'Cookie成功 🎉',
        { 'update-pasteboard': CookieValue }
      )
    } else {
      console.log('ck 写入失败，未找到相关 ck')
    }
  } else if ($request.headers && $request.url.indexOf('getSessionLog') > -1) {
    if (CV.match(/wskey=.+?;/) && CV.match(/pin=.+?;/)) {
      const code = CV.match(/wskey=.+?;/)[0] + `pt_${CV.match(/pin=.+?;/)[0]}`
      const wskey = CV.match(/wskey=.+?;/)[0]
      const username = getUsername(code)
      const CookiesData = getCache()
      let updateIndex = false
      console.log(`用户名：${username}`)
      console.log(`同步 wskey: ${code}`)
      CookiesData.forEach((item, index) => {
        if (item.userName === username) {
          updateIndex = index
        }
      })
      if ($.ql) await $.ql.asyncCookie(code)
      let text
      if (updateIndex === false) {
        CookiesData.push({
          userName: username,
          wskey: wskey,
        })
        text = `新增`
      } else {
        CookiesData[updateIndex].wskey = wskey
        text = `修改`
      }
      $.write(JSON.stringify(CookiesData, null, `\t`), CacheKey)
      if ($.mute === 'true') {
        return console.log('用户名: ' + username + `${text}wskey成功 🎉`)
      }
      return $.notify('用户名: ' + username, '', `${text}wskey成功 🎉`, {
        'update-pasteboard': code,
      })
    }
  } else {
    console.log('未匹配到相关信息，退出抓包')
  }
}

async function TotalBean(Cookie) {
  const opt = {
    url: 'https://me-api.jd.com/user_new/info/GetJDUserInfoUnion?sceneval=2&sceneval=2&g_login_type=1&g_ty=ls&isLogin=1',
    headers: {
      cookie: Cookie,
      Referer: 'https://home.m.jd.com/',
    },
  }
  return $.http.get(opt).then((response) => {
    try {
      return JSON.parse(response.body)
    } catch (e) {
      return false
    }
  })
}

function ENV() {
  const isQX = typeof $task !== 'undefined'
  const isLoon = typeof $loon !== 'undefined'
  const isSurge = typeof $httpClient !== 'undefined' && !isLoon
  const isJSBox = typeof require == 'function' && typeof $jsbox != 'undefined'
  const isNode = typeof require == 'function' && !isJSBox
  const isRequest = typeof $request !== 'undefined'
  const isScriptable = typeof importModule !== 'undefined'
  return { isQX, isLoon, isSurge, isNode, isJSBox, isRequest, isScriptable }
}

function HTTP(defaultOptions = { baseURL: '' }) {
  const { isQX, isLoon, isSurge, isScriptable, isNode } = ENV()
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH']
  const URL_REGEX =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

  function send(method, options) {
    options = typeof options === 'string' ? { url: options } : options
    const baseURL = defaultOptions.baseURL
    if (baseURL && !URL_REGEX.test(options.url || '')) {
      options.url = baseURL ? baseURL + options.url : options.url
    }
    options = { ...defaultOptions, ...options }
    const timeout = options.timeout
    const events = {
      ...{
        onRequest: () => {},
        onResponse: (resp) => resp,
        onTimeout: () => {},
      },
      ...options.events,
    }

    events.onRequest(method, options)

    let worker
    if (isQX) {
      worker = $task.fetch({ method, ...options })
    } else if (isLoon || isSurge || isNode) {
      worker = new Promise((resolve, reject) => {
        const request = isNode ? require('request') : $httpClient
        request[method.toLowerCase()](options, (err, response, body) => {
          if (err) reject(err)
          else
            resolve({
              statusCode: response.status || response.statusCode,
              headers: response.headers,
              body,
            })
        })
      })
    } else if (isScriptable) {
      const request = new Request(options.url)
      request.method = method
      request.headers = options.headers
      request.body = options.body
      worker = new Promise((resolve, reject) => {
        request
          .loadString()
          .then((body) => {
            resolve({
              statusCode: request.response.statusCode,
              headers: request.response.headers,
              body,
            })
          })
          .catch((err) => reject(err))
      })
    }

    let timeoutid
    const timer = timeout
      ? new Promise((_, reject) => {
          timeoutid = setTimeout(() => {
            events.onTimeout()
            return reject(
              `${method} URL: ${options.url} exceeds the timeout ${timeout} ms`
            )
          }, timeout)
        })
      : null

    return (
      timer
        ? Promise.race([timer, worker]).then((res) => {
            clearTimeout(timeoutid)
            return res
          })
        : worker
    ).then((resp) => events.onResponse(resp))
  }

  const http = {}
  methods.forEach(
    (method) =>
      (http[method.toLowerCase()] = (options) => send(method, options))
  )
  return http
}

function API(name = 'untitled', debug = false) {
  const { isQX, isLoon, isSurge, isNode, isJSBox, isScriptable } = ENV()
  return new (class {
    constructor(name, debug) {
      this.name = name
      this.debug = debug

      this.http = HTTP()
      this.env = ENV()

      this.node = (() => {
        if (isNode) {
          const fs = require('fs')

          return {
            fs,
          }
        } else {
          return null
        }
      })()
      this.initCache()

      const delay = (t, v) =>
        new Promise(function (resolve) {
          setTimeout(resolve.bind(null, v), t)
        })

      Promise.prototype.delay = function (t) {
        return this.then(function (v) {
          return delay(t, v)
        })
      }
    }

    // persistance

    // initialize cache
    initCache() {
      if (isQX) this.cache = JSON.parse($prefs.valueForKey(this.name) || '{}')
      if (isLoon || isSurge)
        this.cache = JSON.parse($persistentStore.read(this.name) || '{}')

      if (isNode) {
        // create a json for root cache
        let fpath = 'root.json'
        if (!this.node.fs.existsSync(fpath)) {
          this.node.fs.writeFileSync(
            fpath,
            JSON.stringify({}),
            { flag: 'wx' },
            (err) => console.log(err)
          )
        }
        this.root = {}

        // create a json file with the given name if not exists
        fpath = `${this.name}.json`
        if (!this.node.fs.existsSync(fpath)) {
          this.node.fs.writeFileSync(
            fpath,
            JSON.stringify({}),
            { flag: 'wx' },
            (err) => console.log(err)
          )
          this.cache = {}
        } else {
          this.cache = JSON.parse(
            this.node.fs.readFileSync(`${this.name}.json`)
          )
        }
      }
    }

    // store cache
    persistCache() {
      const data = JSON.stringify(this.cache)
      if (isQX) $prefs.setValueForKey(data, this.name)
      if (isLoon || isSurge) $persistentStore.write(data, this.name)
      if (isNode) {
        this.node.fs.writeFileSync(
          `${this.name}.json`,
          data,
          { flag: 'w' },
          (err) => console.log(err)
        )
        this.node.fs.writeFileSync(
          'root.json',
          JSON.stringify(this.root),
          { flag: 'w' },
          (err) => console.log(err)
        )
      }
    }

    write(data, key) {
      this.log(`SET ${key}`)
      if (key.indexOf('#') !== -1) {
        key = key.substr(1)
        if (isSurge || isLoon) {
          return $persistentStore.write(data, key)
        }
        if (isQX) {
          return $prefs.setValueForKey(data, key)
        }
        if (isNode) {
          this.root[key] = data
        }
      } else {
        this.cache[key] = data
      }
      this.persistCache()
    }

    read(key) {
      this.log(`READ ${key}`)
      if (key.indexOf('#') !== -1) {
        key = key.substr(1)
        if (isSurge || isLoon) {
          return $persistentStore.read(key)
        }
        if (isQX) {
          return $prefs.valueForKey(key)
        }
        if (isNode) {
          return this.root[key]
        }
      } else {
        return this.cache[key]
      }
    }

    delete(key) {
      this.log(`DELETE ${key}`)
      if (key.indexOf('#') !== -1) {
        key = key.substr(1)
        if (isSurge || isLoon) {
          return $persistentStore.write(null, key)
        }
        if (isQX) {
          return $prefs.removeValueForKey(key)
        }
        if (isNode) {
          delete this.root[key]
        }
      } else {
        delete this.cache[key]
      }
      this.persistCache()
    }

    // notification
    notify(title, subtitle = '', content = '', options = {}) {
      const openURL = options['open-url']
      const mediaURL = options['media-url']

      if (isQX) $notify(title, subtitle, content, options)
      if (isSurge) {
        $notification.post(
          title,
          subtitle,
          content + `${mediaURL ? '\n多媒体:' + mediaURL : ''}`,
          {
            url: openURL,
          }
        )
      }
      if (isLoon) {
        let opts = {}
        if (openURL) opts['openUrl'] = openURL
        if (mediaURL) opts['mediaUrl'] = mediaURL
        if (JSON.stringify(opts) == '{}') {
          $notification.post(title, subtitle, content)
        } else {
          $notification.post(title, subtitle, content, opts)
        }
      }
      if (isNode || isScriptable) {
        const content_ =
          content +
          (openURL ? `\n点击跳转: ${openURL}` : '') +
          (mediaURL ? `\n多媒体: ${mediaURL}` : '')
        if (isJSBox) {
          const push = require('push')
          push.schedule({
            title: title,
            body: (subtitle ? subtitle + '\n' : '') + content_,
          })
        } else {
          console.log(`${title}\n${subtitle}\n${content_}\n\n`)
        }
      }
    }

    // other helper functions
    log(msg) {
      if (this.debug) console.log(msg)
    }

    info(msg) {
      console.log(msg)
    }

    error(msg) {
      console.log('ERROR: ' + msg)
    }

    wait(millisec) {
      return new Promise((resolve) => setTimeout(resolve, millisec))
    }

    done(value = {}) {
      if (isQX || isLoon || isSurge) {
        $done(value)
      } else if (isNode && !isJSBox) {
        if (typeof $context !== 'undefined') {
          $context.headers = value.headers
          $context.statusCode = value.statusCode
          $context.body = value.body
        }
      }
    }
  })(name, debug)
}
