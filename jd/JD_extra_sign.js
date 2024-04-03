/*
Author: 2Ya
Description: 本脚本使用的野比大佬的多合一签到 原脚本地址：https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js
Github: https://github.com/domping
===================
【task】
===================
1 0 * * * https://raw.githubusercontent.com/dompling/Script/master/jd/JD_extra_sign.js

[获取 ck]
使用方式：复制 https://home.m.jd.com/myJd/newhome.action 到浏览器打开 ，在个人中心自动获取 cookie，
若弹出成功则正常使用。否则继续再此页面继续刷新一下试试
===================
[MITM]
hostname = wq.jd.com

【Surge脚本配置】:
===================
[Script]
获取京东Cookie = type=http-request,pattern=^https:\/\/wq\.jd\.com\/user_new\/info\/GetJDUserInfoUnion,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/dompling/Script/master/jd/JD_extra_cookie.js,script-update-interval=0

===================
【Loon脚本配置】:
===================
[Script]
http-request https:\/\/wq\.jd\.com\/user_new\/info\/GetJDUserInfoUnion tag=获取京东Cookie, script-path=https://raw.githubusercontent.com/dompling/Script/master/jd/JD_extra_cookie.js

===================
【 QX  脚本配置 】 :
===================

[rewrite_local]
https:\/\/wq\.jd\.com\/user_new\/info\/GetJDUserInfoUnion  url script-request-header https://raw.githubusercontent.com/dompling/Script/master/jd/JD_extra_cookie.js

 */
const scriptURL =
  'https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js';
const APIKey = 'CookiesJD';
const CookieJD = '#CookieJD';
const CookieJD2 = '#CookieJD2';
let boxjs = 'boxjs.net';
const $ = new API(APIKey, true);
const CacheKey = `#${APIKey}`;
let cookies = [];
let cookie1 = $.read(CookieJD) || '';
let cookie2 = $.read(CookieJD2) || '';
let script = '',
  script_text = '';
try {
  cookies = getCache();
  boxjs = $.read('#BoxJSDomain') || boxjs;
  const ck1Name = getUsername(cookie1);
  const ck2Name = getUsername(cookie2);
  if (ck1Name) {
    const push1 = cookies.find((item) => {
      const u = getUsername(item.cookie);
      return u === ck1Name;
    });
    if (!push1) {
      cookies.push({
        userName: ck1Name,
        cookie: push1,
      });
    }
  }
  if (ck2Name) {
    const push2 = cookies.find((item) => {
      const u = getUsername(item.cookie);
      return u === ck2Name;
    });
    if (!push2) {
      cookies.push({
        userName: ck2Name,
        cookie: push2,
      });
    }
  }
} catch (e) {
  $.log(e);
}

(async () => {
  const saveCookies = [];
  const len = cookies.length;
  const n = 2; //假设每行显示4个
  const lineNum = len % n === 0 ? len / n : Math.floor(len / n + 1);
  for (let i = 0; i < lineNum; i++) {
    saveCookies.push(cookies.slice(i * n, i * n + n));
  }
  script = (await getScriptUrl(scriptURL)) || '';
  for (let index = 0; index < saveCookies.length; index++) {
    const item = saveCookies[index];
    $.write(item[0].cookie, CookieJD);
    $.log(`京东账号：${item[0].userName}`);
    if (item.length > 1) {
      $.write(item[1].cookie, CookieJD2);
      $.log(`京东账号：${item[1].userName}`);
    }
    const cached_logs = [];
    await new Promise((rslve) => {
      script_text = script
        .replace(/\$done/g, 'rslve')
        .replace(/\$\.done/g, 'rslve');
      $.log('执行多合一签到');
      try {
        eval(script_text);
      } catch (e) {
        cached_logs.push(e);
        rslve(e);
      }
    });
    $.log(cached_logs);
  }
})()
  .catch((e) => {
    $.log(JSON.stringify(e));
  })
  .finally(() => {
    $.write(cookie1, CookieJD);
    $.write(cookie2, CookieJD2);
    $.done();
  });

async function getScriptUrl(uri) {
  const response = await $.http.get({ url: uri });
  return response.body;
}

function getCache() {
  var cache = $.read(CacheKey) || '[]';
  return JSON.parse(cache);
}

function getUsername(ck) {
  if (!ck) return '';
  return ck.match(/pin=(.+?);/)[1];
}

/* prettier-ignore */
function ENV(){const isJSBox=typeof require=="function"&&typeof $jsbox!="undefined";return{isQX:typeof $task!=="undefined",isLoon:typeof $loon!=="undefined",isSurge:typeof $httpClient!=="undefined"&&typeof $utils!=="undefined",isBrowser:typeof document!=="undefined",isNode:typeof require=="function"&&!isJSBox,isJSBox,isRequest:typeof $request!=="undefined",isScriptable:typeof importModule!=="undefined",isShadowrocket:"undefined"!==typeof $rocket,isStash:"undefined"!==typeof $environment&&$environment["stash-version"],}}
/* prettier-ignore */
function HTTP(defaultOptions={baseURL:""}){const{isQX,isLoon,isSurge,isScriptable,isNode,isBrowser,isShadowrocket,isStash,}=ENV();const methods=["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"];const URL_REGEX=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;function send(method,options){options=typeof options==="string"?{url:options}:options;const baseURL=defaultOptions.baseURL;if(baseURL&&!URL_REGEX.test(options.url||"")){options.url=baseURL?baseURL+options.url:options.url}if(options.body&&options.headers&&!options.headers["Content-Type"]){options.headers["Content-Type"]="application/x-www-form-urlencoded"}options={...defaultOptions,...options};const timeout=options.timeout;const events={...{onRequest:()=>{},onResponse:(resp)=>resp,onTimeout:()=>{},},...options.events,};events.onRequest(method,options);let worker;if(isQX){worker=$task.fetch({method,...options})}else if(isLoon||isSurge||isNode||isShadowrocket||isStash){worker=new Promise((resolve,reject)=>{const request=isNode?require("request"):$httpClient;request[method.toLowerCase()](options,(err,response,body)=>{if(err)reject(err);else resolve({statusCode:response.status||response.statusCode,headers:response.headers,body,})})})}else if(isScriptable){const request=new Request(options.url);request.method=method;request.headers=options.headers;request.body=options.body;worker=new Promise((resolve,reject)=>{request.loadString().then((body)=>{resolve({statusCode:request.response.statusCode,headers:request.response.headers,body,})}).catch((err)=>reject(err))})}else if(isBrowser){worker=new Promise((resolve,reject)=>{fetch(options.url,{method,headers:options.headers,body:options.body,}).then((response)=>response.json()).then((response)=>resolve({statusCode:response.status,headers:response.headers,body:response.data,})).catch(reject)})}let timeoutid;const timer=timeout?new Promise((_,reject)=>{timeoutid=setTimeout(()=>{events.onTimeout();return reject(`${method}URL:${options.url}exceeds the timeout ${timeout}ms`)},timeout)}):null;return(timer?Promise.race([timer,worker]).then((res)=>{clearTimeout(timeoutid);return res}):worker).then((resp)=>events.onResponse(resp))}const http={};methods.forEach((method)=>(http[method.toLowerCase()]=(options)=>send(method,options)));return http}
/* prettier-ignore */
function API(name="untitled",debug=false){const{isQX,isLoon,isSurge,isScriptable,isNode,isShadowrocket,isStash,}=ENV();return new(class{constructor(name,debug){this.name=name;this.debug=debug;this.http=HTTP();this.env=ENV();this.node=(()=>{if(isNode){const fs=require("fs");return{fs}}else{return null}})();this.initCache();const delay=(t,v)=>new Promise(function(resolve){setTimeout(resolve.bind(null,v),t)});Promise.prototype.delay=function(t){return this.then(function(v){return delay(t,v)})}}initCache(){if(isQX)this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}");if(isLoon||isSurge)this.cache=JSON.parse($persistentStore.read(this.name)||"{}");if(isNode){let fpath="root.json";if(!this.node.fs.existsSync(fpath)){this.node.fs.writeFileSync(fpath,JSON.stringify({}),{flag:"wx"},(err)=>console.log(err))}this.root={};fpath=`${this.name}.json`;if(!this.node.fs.existsSync(fpath)){this.node.fs.writeFileSync(fpath,JSON.stringify({}),{flag:"wx"},(err)=>console.log(err));this.cache={}}else{this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`))}}}persistCache(){const data=JSON.stringify(this.cache,null,2);if(isQX)$prefs.setValueForKey(data,this.name);if(isLoon||isSurge||isStash||isShadowrocket)$persistentStore.write(data,this.name);if(isNode){this.node.fs.writeFileSync(`${this.name}.json`,data,{flag:"w"},(err)=>console.log(err));this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},(err)=>console.log(err))}}write(data,key){this.log(`SET ${key}`);if(key.indexOf("#")!==-1){key=key.substr(1);if(isLoon||isSurge||isStash||isShadowrocket){return $persistentStore.write(data,key)}if(isQX){return $prefs.setValueForKey(data,key)}if(isNode){this.root[key]=data}}else{this.cache[key]=data}this.persistCache()}read(key){this.log(`READ ${key}`);if(key.indexOf("#")!==-1){key=key.substr(1);if(isLoon||isSurge||isStash||isShadowrocket){return $persistentStore.read(key)}if(isQX){return $prefs.valueForKey(key)}if(isNode){return this.root[key]}}else{return this.cache[key]}}delete(key){this.log(`DELETE ${key}`);if(key.indexOf("#")!==-1){key=key.substr(1);if(isLoon||isSurge||isStash||isShadowrocket){return $persistentStore.write(null,key)}if(isQX){return $prefs.removeValueForKey(key)}if(isNode){delete this.root[key]}}else{delete this.cache[key]}this.persistCache()}notify(title,subtitle="",content="",options={}){const openURL=options["open-url"];const mediaURL=options["media-url"];if(isQX)$notify(title,subtitle,content,options);if(isSurge){$notification.post(title,subtitle,content+`${mediaURL?"\n多媒体:"+mediaURL:""}`,{url:openURL})}if(isLoon||isStash||isShadowrocket){let opts={};if(openURL)opts["openUrl"]=openURL;if(mediaURL)opts["mediaUrl"]=mediaURL;if(JSON.stringify(opts)==="{}"){$notification.post(title,subtitle,content)}else{$notification.post(title,subtitle,content,opts)}}if(isNode||isScriptable){const content_=content+(openURL?`\n点击跳转:${openURL}`:"")+(mediaURL?`\n多媒体:${mediaURL}`:"");if(isJSBox){const push=require("push");push.schedule({title:title,body:(subtitle?subtitle+"\n":"")+content_,})}else{console.log(`${title}\n${subtitle}\n${content_}\n\n`)}}}log(msg){if(this.debug)console.log(`[${this.name}]LOG:${this.stringify(msg)}`)}info(msg){console.log(`[${this.name}]INFO:${this.stringify(msg)}`)}error(msg){console.log(`[${this.name}]ERROR:${this.stringify(msg)}`)}wait(millisec){return new Promise((resolve)=>setTimeout(resolve,millisec))}done(value={}){if(isQX||isLoon||isSurge||isStash||isShadowrocket){$done(value)}else if(isNode&&!isJSBox){if(typeof $context!=="undefined"){$context.headers=value.headers;$context.statusCode=value.statusCode;$context.body=value.body}}}stringify(obj_or_str){if(typeof obj_or_str==="string"||obj_or_str instanceof String)return obj_or_str;else try{return JSON.stringify(obj_or_str,null,2)}catch(err){return"[object Object]"}}})(name,debug)}
