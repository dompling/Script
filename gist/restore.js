/*

Author: 2Ya
Github: https://www.github.com/dompling
===========================
gist 恢复备份：请先去 boxjs 设置完善 gist 信息，
token 获取方式 :
      头像菜单->
      Settings ->
      Developer settings ->
      Personal access tokens ->
      Generate new token ->
      在里面找到 gist 勾选提交
===========================


[task]

# 备份
0 10 * * * https://raw.githubusercontent.com/dompling/Script/master/gist/backup.js
# 恢复
5 10 * * * https://raw.githubusercontent.com/dompling/Script/master/gist/restore.js

 */

const $ = new API("gist");
try {
  $.backup_black_apps = Object.values($.read("backup_black_apps") || {})
    .join(",")
    .split(",")
    .filter((item) => !!item);

  $.backup_white_apps = Object.values($.read("backup_white_apps") || {})
    .join(",")
    .split(",")
    .filter((item) => !!item);
} catch (error) {
  $.backup_black_apps = [];
  $.backup_white_apps = [];
}

$.appSubCaches = JSON.parse($.read("#chavy_boxjs_app_subCaches") || "{}");

$.apps = [];
$.black_restore = [];
$.white_restore = [];
Object.values($.appSubCaches).forEach((sub) => {
  if (!sub || !sub.apps) return;
  sub.apps.forEach((app) => {
    const key = `${app.id}`;
    if ($.backup_black_apps.indexOf(key) !== -1) {
      if (app.keys) {
        $.black_restore = [...app.keys, ...$.black_restore];
      }
      if (app.settings) {
        const ids = app.settings.map((setting) => setting.id);
        $.black_restore = [...ids, ...$.black_restore];
      }
    }
    if ($.backup_white_apps.indexOf(key) !== -1) {
      if (app.keys) {
        $.white_restore = [...app.keys, ...$.white_restore];
      }
      if (app.settings) {
        const ids = app.settings.map((setting) => setting.id);
        $.white_restore = [...ids, ...$.white_restore];
      }
    }
  });
});

// 存储`用户偏好`
$.KEY_usercfgs = "chavy_boxjs_userCfgs";
// 存储`应用会话`
$.KEY_sessions = "chavy_boxjs_sessions";
// 存储`应用订阅缓存`
$.KEY_app_subCaches = "chavy_boxjs_app_subCaches";
// 存储`备份索引`
$.KEY_backups = "chavy_boxjs_backups";
// 存储`当前会话` (配合切换会话, 记录当前切换到哪个会话)
$.KEY_cursessions = "chavy_boxjs_cur_sessions";

$.token = $.read("token");
$.username = $.read("username");
$.versionId = $.read("revision_id");

$.cacheKey = "BoxJS-Data";
$.desc = "BoxJS-Data Backup";
$.msg = "";

const cacheArr = {
  usercfgs: { label: "用户偏好", key: $.KEY_usercfgs },
  sessions: { label: "应用会话", key: $.KEY_sessions },
  curSessions: { label: "当前会话", key: $.KEY_cursessions },
  globalbaks: { label: "备份索引", key: $.KEY_backups },
  appSubCaches: { label: "应用订阅缓存", key: $.KEY_app_subCaches },
};

$.backupType =
  $.read("backup_type") || [...Object.keys(cacheArr), "datas"].join(",");

$.backupType = $.backupType.split(",");

$.http = new HTTP({
  baseURL: `https://api.github.com`,
  headers: {
    Authorization: `token ${$.token}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
  },
});

$.setval = (val, key) => {
  if ($.env.isQX) {
    return $prefs.setValueForKey(val, key);
  } else {
    return $persistentStore.write(val, key);
  }
};

$.getval = (t) => {
  if ($.env.isQX) {
    return $prefs.valueForKey(t);
  } else {
    return $persistentStore.read(t);
  }
};

$.setdata = (val, key) => {
  function lodash_set(obj, path, value) {
    if (Object(obj) !== obj) return obj;
    if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];
    path
      .slice(0, -1)
      .reduce(
        (a, c, i) =>
          Object(a[c]) === a[c]
            ? a[c]
            : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {}),
        obj
      )[path[path.length - 1]] = value;
    return obj;
  }

  let issuc = false;
  if (/^@/.test(key)) {
    const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key);
    const objdat = $.getval(objkey);
    const objval = objkey ? (objdat === "null" ? null : objdat || "{}") : "{}";
    try {
      const objedval = JSON.parse(objval);
      lodash_set(objedval, paths, val);
      issuc = $.setval(JSON.stringify(objedval), objkey);
    } catch (e) {
      const objedval = {};
      lodash_set(objedval, paths, val);
      issuc = $.setval(JSON.stringify(objedval), objkey);
    }
  } else {
    issuc = $.setval(val, key);
  }
  return issuc;
};

(async () => {
  if (!$.token || !$.username) throw "请去 boxjs 完善信息";
  const gistList = await getGist();
  if (!gistList) throw "请检查 Gist 账号配置";
  if (gistList.message)
    throw `Gist 列表请求失败:${gistList.message}\n请检查 Gist 账号配置`;

  let boxjsdata = gistList.find((item) => item.description === $.desc);
  if (!boxjsdata) throw "未找到 Gist 备份信息，请先备份";

  if ($.versionId) {
    boxjsdata = await getGistRevision(boxjsdata.id, $.versionId);
  }

  if ($.backupType.indexOf(`datas`) !== -1) {
    let datasIndex = 0;
    Object.keys(boxjsdata.files).forEach((key) => {
      if (key.indexOf("datas") !== -1) {
        datasIndex += 1;
        $.backupType.push(key.replace(".json", ""));
        cacheArr[key.replace(".json", "")] = {
          label: `用户数据第${datasIndex}段`,
        };
      }
    });
  }

  for (const cacheArrKey in cacheArr) {
    if ($.backupType.indexOf(cacheArrKey) === -1) continue;

    const item = cacheArr[cacheArrKey];
    const saveKey = `${cacheArrKey}.json`;
    const fileUri = boxjsdata.files[saveKey].raw_url;
    const content = await getBackGist(fileUri);
    if (content) {
      try {
        $.info(fileUri);
        if (!item.key) {
          Object.keys(content || {}).forEach((key) => {
            const val = content[key];
            if ($.white_restore.length) {
              if ($.white_restore.indexOf(key) > -1) {
                $.setdata(val, key);
                $.info(`${key}:白名单恢复`);
              }
              return;
            }
            if ($.black_restore.indexOf(key) === -1) {
              $.setdata(val, key);
            } else {
              $.info(`${key}:黑名单跳过恢复`);
            }
          });
        } else {
          $.setdata(JSON.stringify(content), item.key);
        }
        $.msg += `${item.label}：备份恢复成功 \n`;
        $.info(`${item.label}：备份恢复成功`);
      } catch (e) {
        $.msg += `${item.label}：备份数据异常 \n`;
      }
    } else {
      $.msg += `${item.label}：未找到备份，请先备份 \n`;
      $.info(`${item.label}：未找到备份，请先备份`);
    }
  }
})()
  .then(() => {
    $.write("", "revision_id");
    if ($.versionId) {
      $.notify("gist 历史备份恢复", $.versionId, `${$.username}：\n${$.msg}`);
    } else {
      $.notify("gist 备份恢复", "", `${$.username}：\n${$.msg}`);
    }
  })
  .catch((e) => {
    $.error(e);
    if ($.versionId) {
      $.notify("gist 历史备份恢复", $.versionId, `❌${e.message || e}`);
    } else {
      $.notify("gist 备份恢复", "", `❌${e.message || e}`);
    }
  })
  .finally(() => {
    $.done();
  });

function getGist() {
  return $.http
    .get({ url: `/users/${$.username}/gists` })
    .then((response) => JSON.parse(response.body));
}

function getBackGist(url) {
  return $.http.get({ url }).then((response) => JSON.parse(response.body));
}

function getGistRevision(gist_id, revision_id) {
  return $.http
    .get({ url: `/gists/${gist_id}/${revision_id}` })
    .then((response) => JSON.parse(response.body));
}

/* prettier-ignore */
function ENV(){const isJSBox=typeof require=="function"&&typeof $jsbox!="undefined";return{isQX:typeof $task!=="undefined",isLoon:typeof $loon!=="undefined",isSurge:typeof $httpClient!=="undefined"&&typeof $utils!=="undefined",isBrowser:typeof document!=="undefined",isNode:typeof require=="function"&&!isJSBox,isJSBox,isRequest:typeof $request!=="undefined",isScriptable:typeof importModule!=="undefined",isShadowrocket:"undefined"!==typeof $rocket,isStash:"undefined"!==typeof $environment&&$environment["stash-version"]}}
/* prettier-ignore */
function HTTP(defaultOptions={baseURL:""}){const{isQX,isLoon,isSurge,isScriptable,isNode,isBrowser,isShadowrocket,isStash,}=ENV();const methods=["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"];const URL_REGEX=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;function send(method,options){options=typeof options==="string"?{url:options}:options;const baseURL=defaultOptions.baseURL;if(baseURL&&!URL_REGEX.test(options.url||"")){options.url=baseURL?baseURL+options.url:options.url}if(options.body&&options.headers&&!options.headers["Content-Type"]){options.headers["Content-Type"]="application/x-www-form-urlencoded"}options={...defaultOptions,...options};const timeout=options.timeout;const events={...{onRequest:()=>{},onResponse:(resp)=>resp,onTimeout:()=>{},},...options.events,};events.onRequest(method,options);let worker;if(isQX){worker=$task.fetch({method,...options})}else if(isLoon||isSurge||isNode||isShadowrocket||isStash){worker=new Promise((resolve,reject)=>{const request=isNode?require("request"):$httpClient;request[method.toLowerCase()](options,(err,response,body)=>{if(err)reject(err);else resolve({statusCode:response.status||response.statusCode,headers:response.headers,body,})})})}else if(isScriptable){const request=new Request(options.url);request.method=method;request.headers=options.headers;request.body=options.body;worker=new Promise((resolve,reject)=>{request.loadString().then((body)=>{resolve({statusCode:request.response.statusCode,headers:request.response.headers,body,})}).catch((err)=>reject(err))})}else if(isBrowser){worker=new Promise((resolve,reject)=>{fetch(options.url,{method,headers:options.headers,body:options.body,}).then((response)=>response.json()).then((response)=>resolve({statusCode:response.status,headers:response.headers,body:response.data,})).catch(reject)})}let timeoutid;const timer=timeout?new Promise((_,reject)=>{timeoutid=setTimeout(()=>{events.onTimeout();return reject(`${method}URL:${options.url}exceeds the timeout ${timeout}ms`)},timeout)}):null;return(timer?Promise.race([timer,worker]).then((res)=>{clearTimeout(timeoutid);return res}):worker).then((resp)=>events.onResponse(resp))}const http={};methods.forEach((method)=>(http[method.toLowerCase()]=(options)=>send(method,options)));return http}
/* prettier-ignore */
function API(name="untitled",debug=false){const{isQX,isLoon,isSurge,isScriptable,isNode,isShadowrocket,isStash,}=ENV();return new(class{constructor(name,debug){this.name=name;this.debug=debug;this.http=HTTP();this.env=ENV();this.node=(()=>{if(isNode){const fs=require("fs");return{fs}}else{return null}})();this.initCache();const delay=(t,v)=>new Promise(function(resolve){setTimeout(resolve.bind(null,v),t)});Promise.prototype.delay=function(t){return this.then(function(v){return delay(t,v)})}}initCache(){if(isQX)this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}");if(isLoon||isSurge||isStash||isShadowrocket)this.cache=JSON.parse($persistentStore.read(this.name)||"{}");if(isNode){let fpath="root.json";if(!this.node.fs.existsSync(fpath)){this.node.fs.writeFileSync(fpath,JSON.stringify({}),{flag:"wx"},(err)=>console.log(err))}this.root={};fpath=`${this.name}.json`;if(!this.node.fs.existsSync(fpath)){this.node.fs.writeFileSync(fpath,JSON.stringify({}),{flag:"wx"},(err)=>console.log(err));this.cache={}}else{this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`))}}}persistCache(){const data=JSON.stringify(this.cache,null,2);if(isQX)$prefs.setValueForKey(data,this.name);if(isLoon||isSurge||isStash||isShadowrocket)$persistentStore.write(data,this.name);if(isNode){this.node.fs.writeFileSync(`${this.name}.json`,data,{flag:"w"},(err)=>console.log(err));this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},(err)=>console.log(err))}}write(data,key){this.log(`SET ${key}`);if(key.indexOf("#")!==-1){key=key.substr(1);if(isLoon||isSurge||isStash||isShadowrocket){return $persistentStore.write(data,key)}if(isQX){return $prefs.setValueForKey(data,key)}if(isNode){this.root[key]=data}}else{this.cache[key]=data}this.persistCache()}read(key){this.log(`READ ${key}`);if(key.indexOf("#")!==-1){key=key.substr(1);if(isLoon||isSurge||isStash||isShadowrocket){return $persistentStore.read(key)}if(isQX){return $prefs.valueForKey(key)}if(isNode){return this.root[key]}}else{return this.cache[key]}}delete(key){this.log(`DELETE ${key}`);if(key.indexOf("#")!==-1){key=key.substr(1);if(isLoon||isSurge||isStash||isShadowrocket){return $persistentStore.write(null,key)}if(isQX){return $prefs.removeValueForKey(key)}if(isNode){delete this.root[key]}}else{delete this.cache[key]}this.persistCache()}notify(title,subtitle="",content="",options={}){const openURL=options["open-url"];const mediaURL=options["media-url"];if(isQX)$notify(title,subtitle,content,options);if(isSurge){$notification.post(title,subtitle,content+`${mediaURL?"\n多媒体:"+mediaURL:""}`,{url:openURL})}if(isLoon||isStash||isShadowrocket){let opts={};if(openURL)opts["openUrl"]=openURL;if(mediaURL)opts["mediaUrl"]=mediaURL;if(JSON.stringify(opts)==="{}"){$notification.post(title,subtitle,content)}else{$notification.post(title,subtitle,content,opts)}}if(isNode||isScriptable){const content_=content+(openURL?`\n点击跳转:${openURL}`:"")+(mediaURL?`\n多媒体:${mediaURL}`:"");if(isJSBox){const push=require("push");push.schedule({title:title,body:(subtitle?subtitle+"\n":"")+content_,})}else{console.log(`${title}\n${subtitle}\n${content_}\n\n`)}}}log(msg){if(this.debug)console.log(`[${this.name}]LOG:${this.stringify(msg)}`)}info(msg){console.log(`[${this.name}]INFO:${this.stringify(msg)}`)}error(msg){console.log(`[${this.name}]ERROR:${this.stringify(msg)}`)}wait(millisec){return new Promise((resolve)=>setTimeout(resolve,millisec))}done(value={}){if(isQX||isLoon||isSurge||isStash||isShadowrocket){$done(value)}else if(isNode&&!isJSBox){if(typeof $context!=="undefined"){$context.headers=value.headers;$context.statusCode=value.statusCode;$context.body=value.body}}}stringify(obj_or_str){if(typeof obj_or_str==="string"||obj_or_str instanceof String)return obj_or_str;else try{return JSON.stringify(obj_or_str,null,2)}catch(err){return"[object Object]"}}})(name,debug)}
