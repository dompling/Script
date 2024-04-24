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
  $.restore = Object.values($.read("backup_black_apps") || {})
    .filter((item) => !!item)
    .join(",")
    .split(",");
} catch (error) {
  $.restore = [];
}

$.getval = (t) => {
  if ($.env.isQX) {
    return $prefs.valueForKey(t);
  } else {
    return $persistentStore.read(t);
  }
};

$.getdata = (t) => {
  function lodash_get(t, s, e) {
    const i = s.replace(/\[(\d+)\]/g, ".$1").split(".");
    let r = t;
    for (const t of i) if (((r = Object(r)[t]), void 0 === r)) return e;
    return r;
  }

  let s = $.getval(t);
  if (/^@/.test(t)) {
    const [, e, i] = /^@(.*?)\.(.*?)$/.exec(t),
      r = e ? $.getval(e) : "";
    if (r)
      try {
        const t = JSON.parse(r);
        s = t ? lodash_get(t, i, "") : s;
      } catch (t) {
        s = "";
      }
  }
  return s;
};

// 存储`用户偏好`
$.KEY_usercfgs = "#chavy_boxjs_userCfgs";
// 存储`应用会话`
$.KEY_sessions = "#chavy_boxjs_sessions";
// 存储`应用订阅缓存`
$.KEY_app_subCaches = "#chavy_boxjs_app_subCaches";
// 存储`备份索引`
$.KEY_backups = "#chavy_boxjs_backups";
// 存储`当前会话` (配合切换会话, 记录当前切换到哪个会话)
$.KEY_cursessions = "#chavy_boxjs_cur_sessions";

$.token = $.read("token");
$.username = $.read("username");
$.dataSplit = Number($.read("split") | "1") | 1;
$.cacheKey = "BoxJS-Data";
$.desc = "BoxJS-Data Backup";
$.msg = "";

$.http = new HTTP({
  baseURL: `https://api.github.com`,
  accept: `application/vnd.github+json`,
  headers: {
    Authorization: `token ${$.token}`,
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36",
  },
});

const cacheArr = {
  usercfgs: "用户偏好",
  sessions: "应用会话",
  curSessions: "当前会话",
  globalbaks: "备份索引",
  appSubCaches: "应用订阅缓存",
};

$.backupType =
  $.read("backup_type") || [...Object.keys(cacheArr), "datas"].join(",");

$.backupType = $.backupType.split(",");

(async () => {
  if (!$.token || !$.username) throw "请去 boxjs 完善信息";

  const backup = getBoxJSData();
  const gistList = await getGist();

  if (!gistList) throw new Error("请检查 Gist 账号配置");
  if (gistList.message)
    throw new Error(
      `Gist 列表请求失败:${gistList.message}\n请检查 Gist 账号配置`
    );

  const commonParams = { description: $.desc, public: false };
  const all_params = { ...commonParams };
  const files = {};
  for (const cacheArrKey in cacheArr) {
    if ($.backupType.indexOf(cacheArrKey) === -1) continue;

    const label = cacheArr[cacheArrKey];
    const saveKey = `${cacheArrKey}.json`;
    $.msg += `${label}：${saveKey}\n`;
    files[saveKey] = { content: JSON.stringify(backup[cacheArrKey]) };
  }

  const isBackUp = gistList.find((item) => item.description === $.desc);

  all_params.files = files;

  const response = await backGist(all_params, isBackUp);

  const dataKeys = Object.keys(backup["datas"]);
  const dataItemNum = Math.ceil(dataKeys.length / $.dataSplit);
  const datas = chunk(dataKeys, dataItemNum);

  if ($.backupType.indexOf(`datas`) > -1) {
    const dataFiles = {
      files: {},
    };
    for (let index = 0; index < datas.length; index++) {
      const element = datas[index];
      const saveKey = `datas${index || ""}.json`;
      const saveValue = {};
      element.forEach((key) => {
        saveValue[key] = backup["datas"][key];
      });

      dataFiles.files[saveKey] = { content: JSON.stringify(saveValue) };
    }
    const result = await backGist(dataFiles, response);
    $.msg += `用户数据：datas 备份${
      result.message ? "失败" + `(${result.message})` : "成功"
    }\n`;
  }

  if (response.message) {
    $.error(`结果：gist 备份失败（${JSON.stringify(response)}❌`);
    throw `结果：gist 备份失败（${JSON.stringify(response)}）❌ \n`;
  } else {
    const commits = await getGistCommit(response.id);

    const checkboxs = {};
    commits.forEach((item) => {
      const label = convertTimeToHumanReadable(item.committed_at);
      if (!checkboxs[label]) checkboxs[label] = { key: item.version, label };
    });

    $.write(Object.values(checkboxs), "revision_options");
    $.msg += `历史 Commit 缓存成功\n`;
    $.msg += `结果：gist（${$.desc}） 备份成功 ✅\n`;
    $.info($.msg);
  }
})()
  .then(() => {
    $.notify("gist 备份", "", `${$.username}：\n${$.msg}`);
  })
  .catch((e) => {
    $.error(e);
    $.notify("gist 备份", "", `❌${e.message || e}`);
  })
  .finally(() => {
    $.done();
  });

function getGist() {
  return $.http
    .get({ url: `/users/${$.username}/gists` })
    .then((response) => JSON.parse(response.body));
}

function getGistCommit(gist_id) {
  return $.http
    .get({ url: `/gists/${gist_id}/commits?per_page=100` })
    .then((response) => JSON.parse(response.body));
}

Date.prototype.Format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds(), //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return fmt;
};

function convertTimeToHumanReadable(dateTime) {
  return new Date(dateTime).Format("yyyy-MM-dd hh:mm");
}

function chunk(arr, num) {
  let data = [[]];
  let number = 0;
  arr.forEach((item, index) => {
    if (index > 0 && index % num == 0) {
      number++;
      data.push([]);
    }
    data[number].push(item);
  });
  return data;
}

function backGist(params, backup) {
  const method = backup ? "patch" : "post";

  return $.http[method]({
    url: `/gists${backup ? "/" + backup.id : ""}`,
    body: JSON.stringify(method === "patch" ? { files: params.files } : params),
  }).then((response) => JSON.parse(response.body));
}

function getUserCfgs() {
  const defcfgs = {
    favapps: [],
    appsubs: [],
    viewkeys: [],
    isPinedSearchBar: true,
    httpapi: "examplekey@127.0.0.1:6166",
    http_backend: "",
  };
  return Object.assign(defcfgs, JSON.parse($.read($.KEY_usercfgs || "{}")));
}

function getSystemApps() {
  // prettier-ignore
  const sysapps = [
    {
      id: 'BoxSetting',
      name: '偏好设置',
      descs: ['可手动执行一些抹掉数据的脚本', '可设置明暗两种主题下的主色调', '可设置壁纸清单'],
      keys: [
        '@chavy_boxjs_userCfgs.httpapi',
        '@chavy_boxjs_userCfgs.bgimg',
        '@chavy_boxjs_userCfgs.http_backend',
        '@chavy_boxjs_userCfgs.color_dark_primary',
        '@chavy_boxjs_userCfgs.color_light_primary',
      ],
      settings: [
        {
          id: '@chavy_boxjs_userCfgs.httpapis',
          name: 'HTTP-API (Surge)',
          val: '',
          type: 'textarea',
          placeholder: ',examplekey@127.0.0.1:6166',
          autoGrow: true,
          rows: 2,
          persistentHint: true,
          desc: '示例: ,examplekey@127.0.0.1:6166! 注意: 以逗号开头, 逗号分隔多个地址, 可加回车',
        },
        {
          id: '@chavy_boxjs_userCfgs.httpapi_timeout',
          name: 'HTTP-API Timeout (Surge)',
          val: 20,
          type: 'number',
          persistentHint: true,
          desc: '如果脚本作者指定了超时时间, 会优先使用脚本指定的超时时间.',
        },
        {
          id: '@chavy_boxjs_userCfgs.http_backend',
          name: 'HTTP Backend (Quantumult X)',
          val: '',
          type: 'text',
          placeholder: 'http://127.0.0.1:9999',
          persistentHint: true,
          desc: '示例: http://127.0.0.1:9999 ! 注意: 必须是以 http 开头的完整路径, 不能是 / 结尾',
        },
        {
          id: '@chavy_boxjs_userCfgs.bgimgs',
          name: '背景图片清单',
          val: '无,\n跟随系统,跟随系统\nlight,http://api.btstu.cn/sjbz/zsy.php\ndark,https://uploadbeta.com/api/pictures/random\n妹子,http://api.btstu.cn/sjbz/zsy.php',
          type: 'textarea',
          placeholder: '无,{回车} 跟随系统,跟随系统{回车} light,图片地址{回车} dark,图片地址{回车} 妹子,图片地址',
          persistentHint: true,
          autoGrow: true,
          rows: 2,
          desc: '逗号分隔名字和链接, 回车分隔多个地址',
        },
        {
          id: '@chavy_boxjs_userCfgs.bgimg',
          name: '背景图片',
          val: '',
          type: 'text',
          placeholder: 'http://api.btstu.cn/sjbz/zsy.php',
          persistentHint: true,
          desc: '输入背景图标的在线链接',
        },
        {
          id: '@chavy_boxjs_userCfgs.changeBgImgEnterDefault',
          name: '手势进入壁纸模式默认背景图片',
          val: '',
          type: 'text',
          placeholder: '填写上面背景图片清单的值',
          persistentHint: true,
          desc: '',
        },
        {
          id: '@chavy_boxjs_userCfgs.changeBgImgOutDefault',
          name: '手势退出壁纸模式默认背景图片',
          val: '',
          type: 'text',
          placeholder: '填写上面背景图片清单的值',
          persistentHint: true,
          desc: '',
        },
        {
          id: '@chavy_boxjs_userCfgs.color_light_primary',
          name: '明亮色调',
          canvas: true,
          val: '#F7BB0E',
          type: 'colorpicker',
          desc: '',
        },
        {
          id: '@chavy_boxjs_userCfgs.color_dark_primary',
          name: '暗黑色调',
          canvas: true,
          val: '#2196F3',
          type: 'colorpicker',
          desc: '',
        },
      ],
      scripts: [
        {
          name: '抹掉：所有缓存',
          script: 'https://raw.githubusercontent.com/chavyleung/scripts/master/box/scripts/boxjs.revert.caches.js',
        },
        {
          name: '抹掉：收藏应用',
          script: 'https://raw.githubusercontent.com/chavyleung/scripts/master/box/scripts/boxjs.revert.usercfgs.favapps.js',
        },
        {
          name: '抹掉：用户偏好',
          script: 'https://raw.githubusercontent.com/chavyleung/scripts/master/box/scripts/boxjs.revert.usercfgs.js',
        },
        {
          name: '抹掉：所有会话',
          script: 'https://raw.githubusercontent.com/chavyleung/scripts/master/box/scripts/boxjs.revert.usercfgs.sessions.js',
        },
        {
          name: '抹掉：所有备份',
          script: 'https://raw.githubusercontent.com/chavyleung/scripts/master/box/scripts/boxjs.revert.baks.js',
        },
        {
          name: '抹掉：BoxJs (注意备份)',
          script: 'https://raw.githubusercontent.com/chavyleung/scripts/master/box/scripts/boxjs.revert.boxjs.js',
        },
      ],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/blob/master/box/switcher/box.switcher.js',
      icons: [
        'https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSetting.mini.png',
        'https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSetting.png',
      ],
    },
    {
      id: 'BoxSwitcher',
      name: '会话切换',
      desc: '打开静默运行后, 切换会话将不再发出系统通知 \n注: 不影响日志记录',
      keys: [],
      settings: [
        {
          id: 'CFG_BoxSwitcher_isSilent',
          name: '静默运行',
          val: false,
          type: 'boolean',
          desc: '切换会话时不发出系统通知!',
        },
      ],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/blob/master/box/switcher/box.switcher.js',
      icons: [
        'https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSwitcher.mini.png',
        'https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSwitcher.png',
      ],
      script: 'https://raw.githubusercontent.com/chavyleung/scripts/master/box/switcher/box.switcher.js',
    },
  ];
  return sysapps;
}

function getAppDatas(app) {
  const datas = {};
  const nulls = [null, undefined, "null", "undefined"];
  if (app.keys && Array.isArray(app.keys)) {
    app.keys.forEach((key) => {
      const val = $.getdata(key);
      datas[key] = nulls.includes(val) ? null : val;
    });
  }
  if (app.settings && Array.isArray(app.settings)) {
    app.settings.forEach((setting) => {
      const key = setting.id;
      const val = $.getdata(key);
      datas[key] = nulls.includes(val) ? null : val;
    });
  }
  return datas;
}

function getBoxJSData() {
  const datas = {};

  const extraDatas =
    $.getdata(`${$.KEY_usercfgs.replace("#", "@")}.gist_cache_key`) || [];

  extraDatas.forEach((key) => {
    datas[key] = $.getdata(key);
  });

  const usercfgs = getUserCfgs();
  const sessions = JSON.parse($.read($.KEY_sessions) || "[]");
  const curSessions = JSON.parse($.read($.KEY_cursessions) || "{}");
  const appSubCaches = JSON.parse($.read($.KEY_app_subCaches) || "{}");
  const globalbaks = JSON.parse($.read($.KEY_backups) || "[]");
  const sysapps = getSystemApps();

  // 把 `内置应用`和`订阅应用` 里需要持久化属性放到`datas`
  sysapps.forEach((app) => {
    if ($.restore.indexOf(app.id) > -1)
      return $.info(`${app.name}: 黑名单 APP 跳过备份`);
    Object.assign(datas, getAppDatas(app));
  });

  usercfgs.appsubs.forEach((sub) => {
    const subcache = appSubCaches[sub.url];
    if (subcache && subcache.apps && Array.isArray(subcache.apps)) {
      subcache.apps.forEach((app) => {
        if ($.restore.indexOf(app.id) > -1)
          return $.info(`${app.name}: 黑名单 APP 跳过备份`);
        Object.assign(datas, getAppDatas(app));
      });
    }
  });

  return {
    datas,
    usercfgs,
    sessions,
    curSessions,
    appSubCaches,
    globalbaks,
  };
}

/* prettier-ignore */
function ENV(){const isJSBox=typeof require=="function"&&typeof $jsbox!="undefined";return{isQX:typeof $task!=="undefined",isLoon:typeof $loon!=="undefined",isSurge:typeof $httpClient!=="undefined"&&typeof $utils!=="undefined",isBrowser:typeof document!=="undefined",isNode:typeof require=="function"&&!isJSBox,isJSBox,isRequest:typeof $request!=="undefined",isScriptable:typeof importModule!=="undefined",isShadowrocket:"undefined"!==typeof $rocket,isStash:"undefined"!==typeof $environment&&$environment["stash-version"],}}
/* prettier-ignore */
function HTTP(defaultOptions={baseURL:""}){const{isQX,isLoon,isSurge,isScriptable,isNode,isBrowser,isShadowrocket,isStash,}=ENV();const methods=["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"];const URL_REGEX=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;function send(method,options){options=typeof options==="string"?{url:options}:options;const baseURL=defaultOptions.baseURL;if(baseURL&&!URL_REGEX.test(options.url||"")){options.url=baseURL?baseURL+options.url:options.url}if(options.body&&options.headers&&!options.headers["Content-Type"]){options.headers["Content-Type"]="application/x-www-form-urlencoded"}options={...defaultOptions,...options};const timeout=options.timeout;const events={...{onRequest:()=>{},onResponse:(resp)=>resp,onTimeout:()=>{},},...options.events,};events.onRequest(method,options);let worker;if(isQX){worker=$task.fetch({method,...options})}else if(isLoon||isSurge||isNode||isShadowrocket||isStash){worker=new Promise((resolve,reject)=>{const request=isNode?require("request"):$httpClient;request[method.toLowerCase()](options,(err,response,body)=>{if(err)reject(err);else resolve({statusCode:response.status||response.statusCode,headers:response.headers,body,})})})}else if(isScriptable){const request=new Request(options.url);request.method=method;request.headers=options.headers;request.body=options.body;worker=new Promise((resolve,reject)=>{request.loadString().then((body)=>{resolve({statusCode:request.response.statusCode,headers:request.response.headers,body,})}).catch((err)=>reject(err))})}else if(isBrowser){worker=new Promise((resolve,reject)=>{fetch(options.url,{method,headers:options.headers,body:options.body,}).then((response)=>response.json()).then((response)=>resolve({statusCode:response.status,headers:response.headers,body:response.data,})).catch(reject)})}let timeoutid;const timer=timeout?new Promise((_,reject)=>{timeoutid=setTimeout(()=>{events.onTimeout();return reject(`${method}URL:${options.url}exceeds the timeout ${timeout}ms`)},timeout)}):null;return(timer?Promise.race([timer,worker]).then((res)=>{clearTimeout(timeoutid);return res}):worker).then((resp)=>events.onResponse(resp))}const http={};methods.forEach((method)=>(http[method.toLowerCase()]=(options)=>send(method,options)));return http}
/* prettier-ignore */
function API(name="untitled",debug=false){const{isQX,isLoon,isSurge,isScriptable,isNode,isShadowrocket,isStash,}=ENV();return new(class{constructor(name,debug){this.name=name;this.debug=debug;this.http=HTTP();this.env=ENV();this.node=(()=>{if(isNode){const fs=require("fs");return{fs}}else{return null}})();this.initCache();const delay=(t,v)=>new Promise(function(resolve){setTimeout(resolve.bind(null,v),t)});Promise.prototype.delay=function(t){return this.then(function(v){return delay(t,v)})}}initCache(){if(isQX)this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}");if(isLoon||isSurge)this.cache=JSON.parse($persistentStore.read(this.name)||"{}");if(isNode){let fpath="root.json";if(!this.node.fs.existsSync(fpath)){this.node.fs.writeFileSync(fpath,JSON.stringify({}),{flag:"wx"},(err)=>console.log(err))}this.root={};fpath=`${this.name}.json`;if(!this.node.fs.existsSync(fpath)){this.node.fs.writeFileSync(fpath,JSON.stringify({}),{flag:"wx"},(err)=>console.log(err));this.cache={}}else{this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`))}}}persistCache(){const data=JSON.stringify(this.cache,null,2);if(isQX)$prefs.setValueForKey(data,this.name);if(isLoon||isSurge||isStash||isShadowrocket)$persistentStore.write(data,this.name);if(isNode){this.node.fs.writeFileSync(`${this.name}.json`,data,{flag:"w"},(err)=>console.log(err));this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},(err)=>console.log(err))}}write(data,key){this.log(`SET ${key}`);if(key.indexOf("#")!==-1){key=key.substr(1);if(isLoon||isSurge||isStash||isShadowrocket){return $persistentStore.write(data,key)}if(isQX){return $prefs.setValueForKey(data,key)}if(isNode){this.root[key]=data}}else{this.cache[key]=data}this.persistCache()}read(key){this.log(`READ ${key}`);if(key.indexOf("#")!==-1){key=key.substr(1);if(isLoon||isSurge||isStash||isShadowrocket){return $persistentStore.read(key)}if(isQX){return $prefs.valueForKey(key)}if(isNode){return this.root[key]}}else{return this.cache[key]}}delete(key){this.log(`DELETE ${key}`);if(key.indexOf("#")!==-1){key=key.substr(1);if(isLoon||isSurge||isStash||isShadowrocket){return $persistentStore.write(null,key)}if(isQX){return $prefs.removeValueForKey(key)}if(isNode){delete this.root[key]}}else{delete this.cache[key]}this.persistCache()}notify(title,subtitle="",content="",options={}){const openURL=options["open-url"];const mediaURL=options["media-url"];if(isQX)$notify(title,subtitle,content,options);if(isSurge){$notification.post(title,subtitle,content+`${mediaURL?"\n多媒体:"+mediaURL:""}`,{url:openURL})}if(isLoon||isStash||isShadowrocket){let opts={};if(openURL)opts["openUrl"]=openURL;if(mediaURL)opts["mediaUrl"]=mediaURL;if(JSON.stringify(opts)==="{}"){$notification.post(title,subtitle,content)}else{$notification.post(title,subtitle,content,opts)}}if(isNode||isScriptable){const content_=content+(openURL?`\n点击跳转:${openURL}`:"")+(mediaURL?`\n多媒体:${mediaURL}`:"");if(isJSBox){const push=require("push");push.schedule({title:title,body:(subtitle?subtitle+"\n":"")+content_,})}else{console.log(`${title}\n${subtitle}\n${content_}\n\n`)}}}log(msg){if(this.debug)console.log(`[${this.name}]LOG:${this.stringify(msg)}`)}info(msg){console.log(`[${this.name}]INFO:${this.stringify(msg)}`)}error(msg){console.log(`[${this.name}]ERROR:${this.stringify(msg)}`)}wait(millisec){return new Promise((resolve)=>setTimeout(resolve,millisec))}done(value={}){if(isQX||isLoon||isSurge||isStash||isShadowrocket){$done(value)}else if(isNode&&!isJSBox){if(typeof $context!=="undefined"){$context.headers=value.headers;$context.statusCode=value.statusCode;$context.body=value.body}}}stringify(obj_or_str){if(typeof obj_or_str==="string"||obj_or_str instanceof String)return obj_or_str;else try{return JSON.stringify(obj_or_str,null,2)}catch(err){return"[object Object]"}}})(name,debug)}
