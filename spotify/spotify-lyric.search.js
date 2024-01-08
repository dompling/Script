/*

需要配置 boxjs 参数 BaiDu_APP_ID，BaiDu_SECURITY_KEY

原作者：@app2smile （https://github.com/app2smile）

Spotify非中文歌词翻译 Surge和Loon需要>=iOS15 (仓库地址: https://github.com/app2smile/rules)
采用百度翻译接口进行翻译,需要先免费申请百度翻译api的id和密钥,然后根据不同软件进行不同配置

-----------申请百度翻译(有标准版和高级版 建议申请高级版)api--------------
标准版(很可能不够用):单次最长请求1000字符,免费调用量5万字符/月,QPS=1
高级版:单次最长请求6000字符,免费调用量100万字符/月,QPS=10

    注册百度翻译个人开发者: http://api.fanyi.baidu.com/register
    注册后如果需要认证可自行选择是否实人认证(高级版需要验证)
    开通(通用翻译)API服务: https://fanyi-api.baidu.com/choose
    成功后即可看到自己的appid和密钥(不要泄露给任何人): http://api.fanyi.baidu.com/manage/developer

------------软件配置(在文本模式下,填入下方内容)--------------

1.Surge:
[MITM]
hostname = %APPEND% spclient.wg.spotify.com
[Script]
spotify歌词请求 = type=http-request,pattern=^https:\/\/spclient\.wg\.spotify\.com\/color-lyrics\/v2\/track\/,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/dompling/Script/master/spotify/spotify-lyric.request.js
spotify歌词翻译 = type=http-response,pattern=^https:\/\/spclient\.wg\.spotify\.com\/color-lyrics\/v2\/track\/,requires-body=1,binary-body-mode=1,max-size=0,script-path=https://raw.githubusercontent.com/dompling/Script/master/spotify/spotify-lyric.search.js


2.Loon:
[Mitm]
hostname =spclient.wg.spotify.com
[Script]
http-request ^https:\/\/spclient\.wg\.spotify\.com\/color-lyrics\/v2\/track\/ script-path=https://raw.githubusercontent.com/dompling/Script/master/spotify/spotify-lyric.request.js, requires-body=true timeout=10, tag=spotify歌词请求
http-response ^https:\/\/spclient\.wg\.spotify\.com\/color-lyrics\/v2\/track\/ script-path=https://raw.githubusercontent.com/dompling/Script/master/spotify/spotify-lyric.search.js, requires-body=true, binary-body-mode=true, timeout=10, tag=spotify歌词翻译

3.qx:
[mitm]
hostname = spclient.wg.spotify.com
[rewrite_local]
^https:\/\/spclient\.wg\.spotify\.com\/color-lyrics\/v2\/track\/ url script-request-body https://raw.githubusercontent.com/dompling/Script/master/spotify/spotify-lyric.request.js
^https:\/\/spclient\.wg\.spotify\.com\/color-lyrics\/v2\/track\/ url script-echo-response https://raw.githubusercontent.com/dompling/Script/master/spotify/spotify-lyric.search.js


*/

const notifyName = "spotify歌词翻译2023.06.19";
const $ = new API("Spotify");

const options = {
  appid: $.read("#BaiDu_APP_ID") || "",
  securityKey: $.read("#BaiDu_SECURITY_KEY") || "",
};

const MUSIC_TAG = {
  163: "网易云歌词",
};

$.log163 = (str) => {
  try {
    console.log(
      `(${MUSIC_TAG[163]})${
        typeof str === "object" ? JSON.stringify(str) : str
      }`
    );
  } catch (e) {}
};


if (typeof $argument !== "undefined") {
  //console.log($argument);
  try {
    const params = Object.fromEntries(
      $argument.split("&").map((item) => item.split("="))
    );
    Object.assign(options, params);
  } catch (error) {
    $.notify(notifyName, "$argument解析失败", $argument);
  }
}

// text-decoder
/* prettier-ignore */
!function(i){"use strict";function _(n,e,i){return e<=n&&n<=i}"undefined"!=typeof module&&module.exports&&!i["encoding-indexes"]&&(i["encoding-indexes"]=require("./encoding-indexes.js")["encoding-indexes"]);var l=Math.floor;function s(n){if(void 0===n)return{};if(n===Object(n))return n;throw TypeError("Could not convert argument to dictionary")}function u(n){return 0<=n&&n<=127}var a=u,b=-1;function c(n){this.tokens=[].slice.call(n),this.tokens.reverse()}c.prototype={endOfStream:function(){return!this.tokens.length},read:function(){return this.tokens.length?this.tokens.pop():b},prepend:function(n){if(Array.isArray(n))for(var e=n;e.length;)this.tokens.push(e.pop());else this.tokens.push(n)},push:function(n){if(Array.isArray(n))for(var e=n;e.length;)this.tokens.unshift(e.shift());else this.tokens.unshift(n)}};var w=-1;function m(n,e){if(n)throw TypeError("Decoder error");return e||65533}function f(n){throw TypeError("The code point "+n+" could not be encoded.")}function r(n){return n=String(n).trim().toLowerCase(),Object.prototype.hasOwnProperty.call(d,n)?d[n]:null}var t,o,n=[{encodings:[{labels:["unicode-1-1-utf-8","utf-8","utf8"],name:"UTF-8"}],heading:"The Encoding"},{encodings:[{labels:["866","cp866","csibm866","ibm866"],name:"IBM866"},{labels:["csisolatin2","iso-8859-2","iso-ir-101","iso8859-2","iso88592","iso_8859-2","iso_8859-2:1987","l2","latin2"],name:"ISO-8859-2"},{labels:["csisolatin3","iso-8859-3","iso-ir-109","iso8859-3","iso88593","iso_8859-3","iso_8859-3:1988","l3","latin3"],name:"ISO-8859-3"},{labels:["csisolatin4","iso-8859-4","iso-ir-110","iso8859-4","iso88594","iso_8859-4","iso_8859-4:1988","l4","latin4"],name:"ISO-8859-4"},{labels:["csisolatincyrillic","cyrillic","iso-8859-5","iso-ir-144","iso8859-5","iso88595","iso_8859-5","iso_8859-5:1988"],name:"ISO-8859-5"},{labels:["arabic","asmo-708","csiso88596e","csiso88596i","csisolatinarabic","ecma-114","iso-8859-6","iso-8859-6-e","iso-8859-6-i","iso-ir-127","iso8859-6","iso88596","iso_8859-6","iso_8859-6:1987"],name:"ISO-8859-6"},{labels:["csisolatingreek","ecma-118","elot_928","greek","greek8","iso-8859-7","iso-ir-126","iso8859-7","iso88597","iso_8859-7","iso_8859-7:1987","sun_eu_greek"],name:"ISO-8859-7"},{labels:["csiso88598e","csisolatinhebrew","hebrew","iso-8859-8","iso-8859-8-e","iso-ir-138","iso8859-8","iso88598","iso_8859-8","iso_8859-8:1988","visual"],name:"ISO-8859-8"},{labels:["csiso88598i","iso-8859-8-i","logical"],name:"ISO-8859-8-I"},{labels:["csisolatin6","iso-8859-10","iso-ir-157","iso8859-10","iso885910","l6","latin6"],name:"ISO-8859-10"},{labels:["iso-8859-13","iso8859-13","iso885913"],name:"ISO-8859-13"},{labels:["iso-8859-14","iso8859-14","iso885914"],name:"ISO-8859-14"},{labels:["csisolatin9","iso-8859-15","iso8859-15","iso885915","iso_8859-15","l9"],name:"ISO-8859-15"},{labels:["iso-8859-16"],name:"ISO-8859-16"},{labels:["cskoi8r","koi","koi8","koi8-r","koi8_r"],name:"KOI8-R"},{labels:["koi8-ru","koi8-u"],name:"KOI8-U"},{labels:["csmacintosh","mac","macintosh","x-mac-roman"],name:"macintosh"},{labels:["dos-874","iso-8859-11","iso8859-11","iso885911","tis-620","windows-874"],name:"windows-874"},{labels:["cp1250","windows-1250","x-cp1250"],name:"windows-1250"},{labels:["cp1251","windows-1251","x-cp1251"],name:"windows-1251"},{labels:["ansi_x3.4-1968","ascii","cp1252","cp819","csisolatin1","ibm819","iso-8859-1","iso-ir-100","iso8859-1","iso88591","iso_8859-1","iso_8859-1:1987","l1","latin1","us-ascii","windows-1252","x-cp1252"],name:"windows-1252"},{labels:["cp1253","windows-1253","x-cp1253"],name:"windows-1253"},{labels:["cp1254","csisolatin5","iso-8859-9","iso-ir-148","iso8859-9","iso88599","iso_8859-9","iso_8859-9:1989","l5","latin5","windows-1254","x-cp1254"],name:"windows-1254"},{labels:["cp1255","windows-1255","x-cp1255"],name:"windows-1255"},{labels:["cp1256","windows-1256","x-cp1256"],name:"windows-1256"},{labels:["cp1257","windows-1257","x-cp1257"],name:"windows-1257"},{labels:["cp1258","windows-1258","x-cp1258"],name:"windows-1258"},{labels:["x-mac-cyrillic","x-mac-ukrainian"],name:"x-mac-cyrillic"}],heading:"Legacy single-byte encodings"},{encodings:[{labels:["chinese","csgb2312","csiso58gb231280","gb2312","gb_2312","gb_2312-80","gbk","iso-ir-58","x-gbk"],name:"GBK"},{labels:["gb18030"],name:"gb18030"}],heading:"Legacy multi-byte Chinese (simplified) encodings"},{encodings:[{labels:["big5","big5-hkscs","cn-big5","csbig5","x-x-big5"],name:"Big5"}],heading:"Legacy multi-byte Chinese (traditional) encodings"},{encodings:[{labels:["cseucpkdfmtjapanese","euc-jp","x-euc-jp"],name:"EUC-JP"},{labels:["csiso2022jp","iso-2022-jp"],name:"ISO-2022-JP"},{labels:["csshiftjis","ms932","ms_kanji","shift-jis","shift_jis","sjis","windows-31j","x-sjis"],name:"Shift_JIS"}],heading:"Legacy multi-byte Japanese encodings"},{encodings:[{labels:["cseuckr","csksc56011987","euc-kr","iso-ir-149","korean","ks_c_5601-1987","ks_c_5601-1989","ksc5601","ksc_5601","windows-949"],name:"EUC-KR"}],heading:"Legacy multi-byte Korean encodings"},{encodings:[{labels:["csiso2022kr","hz-gb-2312","iso-2022-cn","iso-2022-cn-ext","iso-2022-kr"],name:"replacement"},{labels:["utf-16be"],name:"UTF-16BE"},{labels:["utf-16","utf-16le"],name:"UTF-16LE"},{labels:["x-user-defined"],name:"x-user-defined"}],heading:"Legacy miscellaneous encodings"}],d={},h=(n.forEach(function(n){n.encodings.forEach(function(e){e.labels.forEach(function(n){d[n]=e})})}),{}),g={};function y(n,e){return e&&e[n]||null}function p(n,e){e=e.indexOf(n);return-1===e?null:e}function v(n){if("encoding-indexes"in i)return i["encoding-indexes"][n];throw Error("Indexes missing. Did you forget to include encoding-indexes.js first?")}var x="utf-8";function O(n,e){if(!(this instanceof O))throw TypeError("Called as a function. Did you forget 'new'?");n=void 0!==n?String(n):x,e=s(e),this._encoding=null,this._decoder=null,this._ignoreBOM=!1,this._BOMseen=!1,this._error_mode="replacement",this._do_not_flush=!1;var i=r(n);if(null===i||"replacement"===i.name)throw RangeError("Unknown encoding: "+n);if(g[i.name])return(n=this)._encoding=i,Boolean(e.fatal)&&(n._error_mode="fatal"),Boolean(e.ignoreBOM)&&(n._ignoreBOM=!0),Object.defineProperty||(this.encoding=n._encoding.name.toLowerCase(),this.fatal="fatal"===n._error_mode,this.ignoreBOM=n._ignoreBOM),n;throw Error("Decoder not present. Did you forget to include encoding-indexes.js first?")}function k(n,e){if(!(this instanceof k))throw TypeError("Called as a function. Did you forget 'new'?");e=s(e),this._encoding=null,this._encoder=null,this._do_not_flush=!1,this._fatal=Boolean(e.fatal)?"fatal":"replacement";if(Boolean(e.NONSTANDARD_allowLegacyEncoding)){e=r(n=void 0!==n?String(n):x);if(null===e||"replacement"===e.name)throw RangeError("Unknown encoding: "+n);if(!h[e.name])throw Error("Encoder not present. Did you forget to include encoding-indexes.js first?");this._encoding=e}else this._encoding=r("utf-8"),void 0!==n&&"console"in i&&console.warn("TextEncoder constructor called with encoding label, which is ignored.");return Object.defineProperty||(this.encoding=this._encoding.name.toLowerCase()),this}function e(n){var r=n.fatal,t=0,o=0,s=0,l=128,a=191;this.handler=function(n,e){if(e===b&&0!==s)return s=0,m(r);if(e===b)return w;if(0===s){if(_(e,0,127))return e;if(_(e,194,223))s=1,t=31&e;else if(_(e,224,239))224===e&&(l=160),237===e&&(a=159),s=2,t=15&e;else{if(!_(e,240,244))return m(r);240===e&&(l=144),244===e&&(a=143),s=3,t=7&e}return null}var i;return _(e,l,a)?(l=128,a=191,t=t<<6|63&e,(o+=1)!==s?null:(i=t,t=s=o=0,i)):(t=s=o=0,l=128,a=191,n.prepend(e),m(r))}}function E(n){n.fatal;this.handler=function(n,e){if(e===b)return w;if(a(e))return e;_(e,128,2047)?(i=1,r=192):_(e,2048,65535)?(i=2,r=224):_(e,65536,1114111)&&(i=3,r=240);for(var i,r,t=[(e>>6*i)+r];0<i;)t.push(128|63&e>>6*(i-1)),--i;return t}}function j(i,n){var r=n.fatal;this.handler=function(n,e){return e===b?w:u(e)?e:null===(e=i[e-128])?m(r):e}}function B(r,n){n.fatal;this.handler=function(n,e){var i;return e===b?w:a(e)?e:(null===(i=p(e,r))&&f(e),i+128)}}function S(n){var o=n.fatal,s=0,l=0,a=0;this.handler=function(n,e){var i,r,t;return e===b&&0===s&&0===l&&0===a?w:(e!==b||0===s&&0===l&&0===a||(a=l=s=0,m(o)),0!==a?(i=null,_(e,48,57)&&(i=function(n){if(39419<n&&n<189e3||1237575<n)return null;if(7457===n)return 59335;for(var e=0,i=0,r=v("gb18030-ranges"),t=0;t<r.length;++t){var o=r[t];if(!(o[0]<=n))break;e=o[0],i=o[1]}return i+n-e}(10*(126*(10*(s-129)+l-48)+a-129)+e-48)),r=[l,a,e],a=l=s=0,null===i?(n.prepend(r),m(o)):i):0!==l?_(e,129,254)?(a=e,null):(n.prepend([l,e]),l=s=0,m(o)):0!==s?_(e,48,57)?(l=e,null):(r=s,s=0,(t=null)===(i=null===(t=_(e,64,126)||_(e,128,254)?190*(r-129)+(e-(e<127?64:65)):t)?null:y(t,v("gb18030")))&&u(e)&&n.prepend(e),null===i?m(o):i):u(e)?e:128===e?8364:_(e,129,254)?(s=e,null):m(o))}}function T(n,t){n.fatal;this.handler=function(n,e){var i,r;return e===b?w:a(e)?e:58853===e?f(e):t&&8364===e?128:null!==(i=p(e,v("gb18030")))?(r=i%190,[l(i/190)+129,r+(r<63?64:65)]):t?f(e):(i=function(n){if(59335===n)return 7457;for(var e=0,i=0,r=v("gb18030-ranges"),t=0;t<r.length;++t){var o=r[t];if(!(o[1]<=n))break;e=o[1],i=o[0]}return i+n-e}(e),[(r=l(i/10/126/10))+129,(e=l((i-=10*r*126*10)/10/126))+48,(r=l((i-=10*e*126)/10))+129,48+(i-10*r)])}}function I(n){var t=n.fatal,o=0;this.handler=function(n,e){if(e===b&&0!==o)return o=0,m(t);if(e===b&&0===o)return w;if(0===o)return u(e)?e:_(e,129,254)?(o=e,null):m(t);var i=o,r=null;switch(o=0,r=_(e,64,126)||_(e,161,254)?157*(i-129)+(e-(e<127?64:98)):r){case 1133:return[202,772];case 1135:return[202,780];case 1164:return[234,772];case 1166:return[234,780]}i=null===r?null:y(r,v("big5"));return null===i&&u(e)&&n.prepend(e),null===i?m(t):i}}function U(n){n.fatal;this.handler=function(n,e){var i,r;return e===b?w:a(e)?e:(i=e,r=o=o||v("big5").map(function(n,e){return e<5024?null:n}),null===(i=9552===i||9566===i||9569===i||9578===i||21313===i||21317===i?r.lastIndexOf(i):p(i,r))||(r=l(i/157)+129)<161?f(e):[r,(e=i%157)+(e<63?64:98)])}}function C(n){var t=n.fatal,o=!1,s=0;this.handler=function(n,e){var i,r;return e===b&&0!==s?(s=0,m(t)):e===b&&0===s?w:142===s&&_(e,161,223)?(s=0,65216+e):143===s&&_(e,161,254)?(o=!0,s=e,null):0!==s?(i=s,s=0,r=null,_(i,161,254)&&_(e,161,254)&&(r=y(94*(i-161)+(e-161),v(o?"jis0212":"jis0208"))),o=!1,_(e,161,254)||n.prepend(e),null===r?m(t):r):u(e)?e:142===e||143===e||_(e,161,254)?(s=e,null):m(t)}}function P(n){n.fatal;this.handler=function(n,e){var i;return e===b?w:a(e)?e:165===e?92:8254===e?126:_(e,65377,65439)?[142,e-65377+161]:null===(i=p(e=8722===e?65293:e,v("jis0208")))?f(e):[l(i/94)+161,i%94+161]}}function D(n){var t=n.fatal,o=0,s=1,l=2,a=3,u=4,c=5,f=6,d=o,h=o,g=0,p=!1;this.handler=function(n,e){switch(d){default:case o:return 27===e?(d=c,null):_(e,0,127)&&14!==e&&15!==e&&27!==e?(p=!1,e):e===b?w:(p=!1,m(t));case s:return 27===e?(d=c,null):92===e?(p=!1,165):126===e?(p=!1,8254):_(e,0,127)&&14!==e&&15!==e&&27!==e&&92!==e&&126!==e?(p=!1,e):e===b?w:(p=!1,m(t));case l:return 27===e?(d=c,null):_(e,33,95)?(p=!1,65344+e):e===b?w:(p=!1,m(t));case a:return 27===e?(d=c,null):_(e,33,126)?(p=!1,g=e,d=u,null):e===b?w:(p=!1,m(t));case u:if(27===e)d=c;else{if(_(e,33,126))return d=a,null===(i=y(94*(g-33)+e-33,v("jis0208")))?m(t):i;e===b?(d=a,n.prepend(e)):d=a}return m(t);case c:return 36===e||40===e?(g=e,d=f,null):(n.prepend(e),p=!1,d=h,m(t));case f:var i=g,r=(g=0,null);return(40===i&&66===e&&(r=o),40===i&&74===e&&(r=s),40===i&&73===e&&(r=l),null!==(r=36!==i||64!==e&&66!==e?r:a))?(d=r,r=p,p=!0,r?m(t):null):(n.prepend([i,e]),p=!1,d=h,m(t))}}}function F(n){n.fatal;var r=0,t=1,o=2,s=r;this.handler=function(n,e){if(e===b&&s!==r)return n.prepend(e),s=r,[27,40,66];if(e===b&&s===r)return w;if(!(s!==r&&s!==t||14!==e&&15!==e&&27!==e))return f(65533);if(s===r&&a(e))return e;if(s===t&&(a(e)&&92!==e&&126!==e||165==e||8254==e)){if(a(e))return e;if(165===e)return 92;if(8254===e)return 126}var i;return a(e)&&s!==r?(n.prepend(e),s=r,[27,40,66]):165!==e&&8254!==e||s===t?null===(i=p(e=8722===e?65293:e,v("jis0208")))?f(e):s!==o?(n.prepend(e),s=o,[27,36,66]):[l(i/94)+33,i%94+33]:(n.prepend(e),s=t,[27,40,74])}}function J(n){var t=n.fatal,o=0;this.handler=function(n,e){var i,r;return e===b&&0!==o?(o=0,m(t)):e===b&&0===o?w:0!==o?(r=o,i=null,o=0,(_(e,64,126)||_(e,128,252))&&(i=188*(r-(r<160?129:193))+e-(e<127?64:65)),_(i,8836,10715)?48508+i:(null===(r=null===i?null:y(i,v("jis0208")))&&u(e)&&n.prepend(e),null===r?m(t):r)):u(e)||128===e?e:_(e,161,223)?65216+e:_(e,129,159)||_(e,224,252)?(o=e,null):m(t)}}function K(n){n.fatal;this.handler=function(n,e){var i;return e===b?w:a(e)||128===e?e:165===e?92:8254===e?126:_(e,65377,65439)?e-65377+161:(i=e=8722===e?65293:e,null===(i=(t=t||v("jis0208").map(function(n,e){return _(e,8272,8835)?null:n})).indexOf(i))?f(e):[(e=l(i/188))+(e<31?129:193),(e=i%188)+(e<63?64:65)])}}function R(n){var t=n.fatal,o=0;this.handler=function(n,e){var i,r;return e===b&&0!==o?(o=0,m(t)):e===b&&0===o?w:0!==o?(r=o,o=0,r=(i=null)===(i=_(e,65,254)?190*(r-129)+(e-65):i)?null:y(i,v("euc-kr")),null===i&&u(e)&&n.prepend(e),null===r?m(t):r):u(e)?e:_(e,129,254)?(o=e,null):m(t)}}function G(n){n.fatal;this.handler=function(n,e){var i;return e===b?w:a(e)?e:null===(i=p(e,v("euc-kr")))?f(e):[l(i/190)+129,i%190+65]}}function A(n,e){var i=n>>8,n=255&n;return e?[i,n]:[n,i]}function L(r,n){var t=n.fatal,o=null,s=null;this.handler=function(n,e){var i;return e!==b||null===o&&null===s?e===b&&null===o&&null===s?w:null===o?(o=e,null):(e=r?(o<<8)+e:(e<<8)+o,(o=null)!==s?(i=s,s=null,_(e,56320,57343)?65536+1024*(i-55296)+(e-56320):(n.prepend(A(e,r)),m(t))):_(e,55296,56319)?(s=e,null):_(e,56320,57343)?m(t):e):m(t)}}function M(r,n){n.fatal;this.handler=function(n,e){var i;return e===b?w:_(e,0,65535)?A(e,r):(i=A(55296+(e-65536>>10),r),e=A(56320+(e-65536&1023),r),i.concat(e))}}function N(n){n.fatal;this.handler=function(n,e){return e===b?w:u(e)?e:63360+e-128}}function q(n){n.fatal;this.handler=function(n,e){return e===b?w:a(e)?e:_(e,63360,63487)?e-63360+128:f(e)}}Object.defineProperty&&(Object.defineProperty(O.prototype,"encoding",{get:function(){return this._encoding.name.toLowerCase()}}),Object.defineProperty(O.prototype,"fatal",{get:function(){return"fatal"===this._error_mode}}),Object.defineProperty(O.prototype,"ignoreBOM",{get:function(){return this._ignoreBOM}})),O.prototype.decode=function(n,e){n="object"==typeof n&&n instanceof ArrayBuffer?new Uint8Array(n):"object"==typeof n&&"buffer"in n&&n.buffer instanceof ArrayBuffer?new Uint8Array(n.buffer,n.byteOffset,n.byteLength):new Uint8Array(0);e=s(e),this._do_not_flush||(this._decoder=g[this._encoding.name]({fatal:"fatal"===this._error_mode}),this._BOMseen=!1),this._do_not_flush=Boolean(e.stream);for(var i,r=new c(n),t=[];;){var o=r.read();if(o===b)break;if((i=this._decoder.handler(r,o))===w)break;null!==i&&(Array.isArray(i)?t.push.apply(t,i):t.push(i))}if(!this._do_not_flush){for(;(i=this._decoder.handler(r,r.read()))!==w&&(null!==i&&(Array.isArray(i)?t.push.apply(t,i):t.push(i)),!r.endOfStream()););this._decoder=null}return function(n){e=["UTF-8","UTF-16LE","UTF-16BE"],i=this._encoding.name,-1===e.indexOf(i)||this._ignoreBOM||this._BOMseen||(0<n.length&&65279===n[0]?(this._BOMseen=!0,n.shift()):0<n.length&&(this._BOMseen=!0));for(var e,i,r=n,t="",o=0;o<r.length;++o){var s=r[o];s<=65535?t+=String.fromCharCode(s):(s-=65536,t+=String.fromCharCode(55296+(s>>10),56320+(1023&s)))}return t}.call(this,t)},Object.defineProperty&&Object.defineProperty(k.prototype,"encoding",{get:function(){return this._encoding.name.toLowerCase()}}),k.prototype.encode=function(n,e){n=void 0===n?"":String(n),e=s(e),this._do_not_flush||(this._encoder=h[this._encoding.name]({fatal:"fatal"===this._fatal})),this._do_not_flush=Boolean(e.stream);for(var i,r=new c(function(n){for(var e=String(n),i=e.length,r=0,t=[];r<i;){var o,s=e.charCodeAt(r);s<55296||57343<s?t.push(s):56320<=s&&s<=57343?t.push(65533):55296<=s&&s<=56319&&(r!==i-1&&56320<=(o=e.charCodeAt(r+1))&&o<=57343?(t.push(65536+((1023&s)<<10)+(1023&o)),r+=1):t.push(65533)),r+=1}return t}(n)),t=[];;){var o=r.read();if(o===b)break;if((i=this._encoder.handler(r,o))===w)break;Array.isArray(i)?t.push.apply(t,i):t.push(i)}if(!this._do_not_flush){for(;;){if((i=this._encoder.handler(r,r.read()))===w)break;Array.isArray(i)?t.push.apply(t,i):t.push(i)}this._encoder=null}return new Uint8Array(t)},h["UTF-8"]=function(n){return new E(n)},g["UTF-8"]=function(n){return new e(n)},"encoding-indexes"in i&&n.forEach(function(n){"Legacy single-byte encodings"===n.heading&&n.encodings.forEach(function(n){var n=n.name,e=v(n.toLowerCase());g[n]=function(n){return new j(e,n)},h[n]=function(n){return new B(e,n)}})}),g.GBK=function(n){return new S(n)},h.GBK=function(n){return new T(n,!0)},h.gb18030=function(n){return new T(n)},g.gb18030=function(n){return new S(n)},h.Big5=function(n){return new U(n)},g.Big5=function(n){return new I(n)},h["EUC-JP"]=function(n){return new P(n)},g["EUC-JP"]=function(n){return new C(n)},h["ISO-2022-JP"]=function(n){return new F(n)},g["ISO-2022-JP"]=function(n){return new D(n)},h.Shift_JIS=function(n){return new K(n)},g.Shift_JIS=function(n){return new J(n)},h["EUC-KR"]=function(n){return new G(n)},g["EUC-KR"]=function(n){return new R(n)},h["UTF-16BE"]=function(n){return new M(!0,n)},g["UTF-16BE"]=function(n){return new L(!0,n)},h["UTF-16LE"]=function(n){return new M(!1,n)},g["UTF-16LE"]=function(n){return new L(!1,n)},h["x-user-defined"]=function(n){return new q(n)},g["x-user-defined"]=function(n){return new N(n)},i.TextEncoder||(i.TextEncoder=k),i.TextDecoder||(i.TextDecoder=O),"undefined"!=typeof module&&module.exports&&(module.exports={TextEncoder:i.TextEncoder,TextDecoder:i.TextDecoder,EncodingIndexes:i["encoding-indexes"]})}(this||{});
// protobuf-ts 2.9.0
/* prettier-ignore */
(i=>{i.symbol=Symbol.for("protobuf-ts/unknown"),i.onRead=(e,r,t,a,n)=>{(s(r)?r[i.symbol]:r[i.symbol]=[]).push({no:t,wireType:a,data:n})},i.onWrite=(e,r,t)=>{for(var{no:a,wireType:n,data:s}of i.list(r))t.tag(a,n).raw(s)},i.list=(e,r)=>{return s(e)?(e=e[i.symbol],r?e.filter(e=>e.no==r):e):[]},i.last=(e,r)=>(0,i.list)(e,r).slice(-1)[0];const s=e=>e&&Array.isArray(e[i.symbol])})(UnknownFieldHandler=UnknownFieldHandler||{});var UnknownFieldHandler,WireType=(e=>(e[e.Varint=0]="Varint",e[e.Bit64=1]="Bit64",e[e.LengthDelimited=2]="LengthDelimited",e[e.StartGroup=3]="StartGroup",e[e.EndGroup=4]="EndGroup",e[e.Bit32=5]="Bit32",e))(WireType||{});const MESSAGE_TYPE=Symbol.for("protobuf-ts/message-type");function lowerCamelCase(r){let t=!1;var a=[];for(let e=0;e<r.length;e++){var n=r.charAt(e);"_"==n?t=!0:/\d/.test(n)?(a.push(n),t=!0):t?(a.push(n.toUpperCase()),t=!1):0==e?a.push(n.toLowerCase()):a.push(n)}return a.join("")}var ScalarType=(e=>(e[e.DOUBLE=1]="DOUBLE",e[e.FLOAT=2]="FLOAT",e[e.INT64=3]="INT64",e[e.UINT64=4]="UINT64",e[e.INT32=5]="INT32",e[e.FIXED64=6]="FIXED64",e[e.FIXED32=7]="FIXED32",e[e.BOOL=8]="BOOL",e[e.STRING=9]="STRING",e[e.BYTES=12]="BYTES",e[e.UINT32=13]="UINT32",e[e.SFIXED32=15]="SFIXED32",e[e.SFIXED64=16]="SFIXED64",e[e.SINT32=17]="SINT32",e[e.SINT64=18]="SINT64",e))(ScalarType||{}),LongType=(e=>(e[e.BIGINT=0]="BIGINT",e[e.STRING=1]="STRING",e[e.NUMBER=2]="NUMBER",e))(LongType||{}),RepeatType=(e=>(e[e.NO=0]="NO",e[e.PACKED=1]="PACKED",e[e.UNPACKED=2]="UNPACKED",e))(RepeatType||{});function normalizeFieldInfo(e){return e.localName=e.localName??lowerCamelCase(e.name),e.jsonName=e.jsonName??lowerCamelCase(e.name),e.repeat=e.repeat??0,e.opt=e.opt??(!e.repeat&&(!e.oneof&&"message"==e.kind)),e}function isOneofGroup(e){if("object"!=typeof e||null===e||!e.hasOwnProperty("oneofKind"))return!1;switch(typeof e.oneofKind){case"string":return void 0===e[e.oneofKind]?!1:2==Object.keys(e).length;case"undefined":return 1==Object.keys(e).length;default:return!1}}class ReflectionTypeCheck{constructor(e){this.fields=e.fields??[]}prepare(){if(!this.data){var e,r=[],t=[],a=[];for(e of this.fields)if(e.oneof)a.includes(e.oneof)||(a.push(e.oneof),r.push(e.oneof),t.push(e.oneof));else switch(t.push(e.localName),e.kind){case"scalar":case"enum":e.opt&&!e.repeat||r.push(e.localName);break;case"message":e.repeat&&r.push(e.localName);break;case"map":r.push(e.localName)}this.data={req:r,known:t,oneofs:Object.values(a)}}}is(e,a,n=!1){if(!(a<0)){if(null==e||"object"!=typeof e)return!1;this.prepare();let r=Object.keys(e),t=this.data;if(r.length<t.req.length||t.req.some(e=>!r.includes(e)))return!1;if(!n&&r.some(e=>!t.known.includes(e)))return!1;if(!(a<1)){for(const i of t.oneofs){const o=e[i];if(!isOneofGroup(o))return!1;if(void 0!==o.oneofKind){var s=this.fields.find(e=>e.localName===o.oneofKind);if(!s)return!1;if(!this.field(o[o.oneofKind],s,n,a))return!1}}for(const l of this.fields)if(void 0===l.oneof&&!this.field(e[l.localName],l,n,a))return!1}}return!0}field(e,r,t,a){var n=r.repeat;switch(r.kind){case"scalar":return void 0===e?r.opt:n?this.scalars(e,r.T,a,r.L):this.scalar(e,r.T,r.L);case"enum":return void 0===e?r.opt:n?this.scalars(e,ScalarType.INT32,a):this.scalar(e,ScalarType.INT32);case"message":return void 0===e?!0:n?this.messages(e,r.T(),t,a):this.message(e,r.T(),t,a);case"map":if("object"!=typeof e||null===e)return!1;if(a<2)return!0;if(!this.mapKeys(e,r.K,a))return!1;switch(r.V.kind){case"scalar":return this.scalars(Object.values(e),r.V.T,a,r.V.L);case"enum":return this.scalars(Object.values(e),ScalarType.INT32,a);case"message":return this.messages(Object.values(e),r.V.T(),t,a)}}return!0}message(e,r,t,a){return t?r.isAssignable(e,a):r.is(e,a)}messages(r,t,e,a){if(!Array.isArray(r))return!1;if(!(a<2))if(e){for(let e=0;e<r.length&&e<a;e++)if(!t.isAssignable(r[e],a-1))return!1}else for(let e=0;e<r.length&&e<a;e++)if(!t.is(r[e],a-1))return!1;return!0}scalar(e,r,t){var a=typeof e;switch(r){case ScalarType.UINT64:case ScalarType.FIXED64:case ScalarType.INT64:case ScalarType.SFIXED64:case ScalarType.SINT64:switch(t){case LongType.BIGINT:return"bigint"==a;case LongType.NUMBER:return"number"==a&&!isNaN(e);default:return"string"==a}case ScalarType.BOOL:return"boolean"==a;case ScalarType.STRING:return"string"==a;case ScalarType.BYTES:return e instanceof Uint8Array;case ScalarType.DOUBLE:case ScalarType.FLOAT:return"number"==a&&!isNaN(e);default:return"number"==a&&Number.isInteger(e)}}scalars(r,t,a,n){if(!Array.isArray(r))return!1;if(!(a<2)&&Array.isArray(r))for(let e=0;e<r.length&&e<a;e++)if(!this.scalar(r[e],t,n))return!1;return!0}mapKeys(e,r,t){var a=Object.keys(e);switch(r){case ScalarType.INT32:case ScalarType.FIXED32:case ScalarType.SFIXED32:case ScalarType.SINT32:case ScalarType.UINT32:return this.scalars(a.slice(0,t).map(e=>parseInt(e)),r,t);case ScalarType.BOOL:return this.scalars(a.slice(0,t).map(e=>"true"==e||"false"!=e&&e),r,t);default:return this.scalars(a,r,t,LongType.STRING)}}}function typeofJsonValue(e){var r=typeof e;if("object"==r){if(Array.isArray(e))return"array";if(null===e)return"null"}return r}function isJsonObject(e){return null!==e&&"object"==typeof e&&!Array.isArray(e)}let encTable="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(""),decTable=[];for(let e=0;e<encTable.length;e++)decTable[encTable[e].charCodeAt(0)]=e;function base64decode(r){let e=3*r.length/4,t=("="==r[r.length-2]?e-=2:"="==r[r.length-1]&&--e,new Uint8Array(e)),a=0,n=0,s,i=0;for(let e=0;e<r.length;e++){if(void 0===(s=decTable[r.charCodeAt(e)]))switch(r[e]){case"=":n=0;case"\n":case"\r":case"\t":case" ":continue;default:throw Error("invalid base64 string.")}switch(n){case 0:i=s,n=1;break;case 1:t[a++]=i<<2|(48&s)>>4,i=s,n=2;break;case 2:t[a++]=(15&i)<<4|(60&s)>>2,i=s,n=3;break;case 3:t[a++]=(3&i)<<6|s,n=0}}if(1==n)throw Error("invalid base64 string.");return t.subarray(0,a)}function base64encode(r){let t="",a=0,n,s=0;for(let e=0;e<r.length;e++)switch(n=r[e],a){case 0:t+=encTable[n>>2],s=(3&n)<<4,a=1;break;case 1:t+=encTable[s|n>>4],s=(15&n)<<2,a=2;break;case 2:t=(t+=encTable[s|n>>6])+encTable[63&n],a=0}return a&&(t=t+encTable[s]+"=",1==a&&(t+="=")),t}function varint64read(){let r=0,t=0;for(let e=0;e<28;e+=7){var a=this.buf[this.pos++];if(r|=(127&a)<<e,0==(128&a))return this.assertBounds(),[r,t]}var e=this.buf[this.pos++];if(r|=(15&e)<<28,t=(112&e)>>4,0==(128&e))return this.assertBounds(),[r,t];for(let e=3;e<=31;e+=7){var n=this.buf[this.pos++];if(t|=(127&n)<<e,0==(128&n))return this.assertBounds(),[r,t]}throw new Error("invalid varint")}function varint64write(r,t,a){for(let e=0;e<28;e+=7){var n=r>>>e,s=!(n>>>7==0&&0==t);if(a.push(255&(s?128|n:n)),!s)return}var e=r>>>28&15|(7&t)<<4,i=!(t>>3==0);if(a.push(255&(i?128|e:e)),i){for(let e=3;e<31;e+=7){var o=t>>>e,l=!(o>>>7==0);if(a.push(255&(l?128|o:o)),!l)return}a.push(t>>>31&1)}}decTable["-".charCodeAt(0)]=encTable.indexOf("+"),decTable["_".charCodeAt(0)]=encTable.indexOf("/");const TWO_PWR_32_DBL$1=4294967296;function int64fromString(t){var e="-"==t[0];e&&(t=t.slice(1));let a=0,n=0;function r(e,r){e=Number(t.slice(e,r));n*=1e6,(a=1e6*a+e)>=TWO_PWR_32_DBL$1&&(n+=a/TWO_PWR_32_DBL$1|0,a%=TWO_PWR_32_DBL$1)}return r(-24,-18),r(-18,-12),r(-12,-6),r(-6),[e,a,n]}function int64toString(e,r){if(r<=2097151)return""+(TWO_PWR_32_DBL$1*r+(e>>>0));var t=(e>>>24|r<<8)>>>0&16777215,r=r>>16&65535;let a=(16777215&e)+6777216*t+6710656*r,n=t+8147497*r,s=2*r;function i(e,r){e=e?String(e):"";return r?"0000000".slice(e.length)+e:e}return 1e7<=a&&(n+=Math.floor(a/1e7),a%=1e7),1e7<=n&&(s+=Math.floor(n/1e7),n%=1e7),i(s,0)+i(n,s)+i(a,1)}function varint32write(r,t){if(0<=r){for(;127<r;)t.push(127&r|128),r>>>=7;t.push(r)}else{for(let e=0;e<9;e++)t.push(127&r|128),r>>=7;t.push(1)}}function varint32read(){let r=this.buf[this.pos++];var e=127&r;if(0==(128&r))return this.assertBounds(),e;if(e|=(127&(r=this.buf[this.pos++]))<<7,0==(128&r))return this.assertBounds(),e;if(e|=(127&(r=this.buf[this.pos++]))<<14,0==(128&r))return this.assertBounds(),e;if(e|=(127&(r=this.buf[this.pos++]))<<21,0==(128&r))return this.assertBounds(),e;e|=(15&(r=this.buf[this.pos++]))<<28;for(let e=5;0!=(128&r)&&e<10;e++)r=this.buf[this.pos++];if(0!=(128&r))throw new Error("invalid varint");return this.assertBounds(),e>>>0}function detectBi(){var e=new DataView(new ArrayBuffer(8));return void 0!==globalThis.BigInt&&"function"==typeof e.getBigInt64&&"function"==typeof e.getBigUint64&&"function"==typeof e.setBigInt64&&"function"==typeof e.setBigUint64?{MIN:BigInt("-9223372036854775808"),MAX:BigInt("9223372036854775807"),UMIN:BigInt("0"),UMAX:BigInt("18446744073709551615"),C:BigInt,V:e}:void 0}const BI=detectBi();function assertBi(e){if(!e)throw new Error("BigInt unavailable, see https://github.com/timostamm/protobuf-ts/blob/v1.0.8/MANUAL.md#bigint-support")}const RE_DECIMAL_STR=/^-?[0-9]+$/,TWO_PWR_32_DBL=4294967296;class SharedPbLong{constructor(e,r){this.lo=0|e,this.hi=0|r}isZero(){return 0==this.lo&&0==this.hi}toNumber(){var e=this.hi*TWO_PWR_32_DBL+(this.lo>>>0);if(Number.isSafeInteger(e))return e;throw new Error("cannot convert to safe number")}}const _PbULong=class extends SharedPbLong{static from(e){if(BI)switch(typeof e){case"string":if("0"==e)return this.ZERO;if(""==e)throw new Error("string is no integer");e=BI.C(e);case"number":if(0===e)return this.ZERO;e=BI.C(e);case"bigint":if(!e)return this.ZERO;if(e<BI.UMIN)throw new Error("signed value for ulong");if(e>BI.UMAX)throw new Error("ulong too large");return BI.V.setBigUint64(0,e,!0),new _PbULong(BI.V.getInt32(0,!0),BI.V.getInt32(4,!0))}else switch(typeof e){case"string":if("0"==e)return this.ZERO;if(e=e.trim(),!RE_DECIMAL_STR.test(e))throw new Error("string is no integer");var[r,t,a]=int64fromString(e);if(r)throw new Error("signed value");return new _PbULong(t,a);case"number":if(0==e)return this.ZERO;if(!Number.isSafeInteger(e))throw new Error("number is no integer");if(e<0)throw new Error("signed value for ulong");return new _PbULong(e,e/TWO_PWR_32_DBL)}throw new Error("unknown value "+typeof e)}toString(){return BI?this.toBigInt().toString():int64toString(this.lo,this.hi)}toBigInt(){return assertBi(BI),BI.V.setInt32(0,this.lo,!0),BI.V.setInt32(4,this.hi,!0),BI.V.getBigUint64(0,!0)}};let PbULong=_PbULong;PbULong.ZERO=new _PbULong(0,0);const _PbLong=class extends SharedPbLong{static from(e){if(BI)switch(typeof e){case"string":if("0"==e)return this.ZERO;if(""==e)throw new Error("string is no integer");e=BI.C(e);case"number":if(0===e)return this.ZERO;e=BI.C(e);case"bigint":if(!e)return this.ZERO;if(e<BI.MIN)throw new Error("ulong too small");if(e>BI.MAX)throw new Error("ulong too large");return BI.V.setBigInt64(0,e,!0),new _PbLong(BI.V.getInt32(0,!0),BI.V.getInt32(4,!0))}else switch(typeof e){case"string":if("0"==e)return this.ZERO;var r,t,a;if(e=e.trim(),RE_DECIMAL_STR.test(e))return[r,a,t]=int64fromString(e),a=new _PbLong(a,t),r?a.negate():a;throw new Error("string is no integer");case"number":if(0==e)return this.ZERO;if(Number.isSafeInteger(e))return 0<e?new _PbLong(e,e/TWO_PWR_32_DBL):new _PbLong(-e,-e/TWO_PWR_32_DBL).negate();throw new Error("number is no integer")}throw new Error("unknown value "+typeof e)}isNegative(){return 0!=(2147483648&this.hi)}negate(){let e=~this.hi,r=this.lo;return r?r=1+~r:e+=1,new _PbLong(r,e)}toString(){var e;return BI?this.toBigInt().toString():this.isNegative()?"-"+int64toString((e=this.negate()).lo,e.hi):int64toString(this.lo,this.hi)}toBigInt(){return assertBi(BI),BI.V.setInt32(0,this.lo,!0),BI.V.setInt32(4,this.hi,!0),BI.V.getBigInt64(0,!0)}};let PbLong=_PbLong;function assert(e,r){if(!e)throw new Error(r)}PbLong.ZERO=new _PbLong(0,0);const FLOAT32_MAX=34028234663852886e22,FLOAT32_MIN=-34028234663852886e22,UINT32_MAX=4294967295,INT32_MAX=2147483647,INT32_MIN=-2147483648;function assertInt32(e){if("number"!=typeof e)throw new Error("invalid int 32: "+typeof e);if(!Number.isInteger(e)||e>INT32_MAX||e<INT32_MIN)throw new Error("invalid int 32: "+e)}function assertUInt32(e){if("number"!=typeof e)throw new Error("invalid uint 32: "+typeof e);if(!Number.isInteger(e)||e>UINT32_MAX||e<0)throw new Error("invalid uint 32: "+e)}function assertFloat32(e){if("number"!=typeof e)throw new Error("invalid float 32: "+typeof e);if(Number.isFinite(e)&&(e>FLOAT32_MAX||e<FLOAT32_MIN))throw new Error("invalid float 32: "+e)}function reflectionLongConvert(e,r){switch(r){case LongType.BIGINT:return e.toBigInt();case LongType.NUMBER:return e.toNumber();default:return e.toString()}}class ReflectionJsonReader{constructor(e){this.info=e}prepare(){if(void 0===this.fMap){this.fMap={};for(const e of this.info.fields??[])this.fMap[e.name]=e,this.fMap[e.jsonName]=e,this.fMap[e.localName]=e}}assert(e,r,t){if(!e){let e=typeofJsonValue(t);throw"number"!=e&&"boolean"!=e||(e=t.toString()),new Error(`Cannot parse JSON ${e}for ${this.info.typeName}#`+r)}}read(e,r,t){this.prepare();var a,n,s=[];for([a,n]of Object.entries(e)){var i=this.fMap[a];if(!i){if(t.ignoreUnknownFields)continue;throw new Error(`Found unknown field while reading ${this.info.typeName}from JSON format.JSON key:`+a)}var o=i.localName;let e;if(i.oneof){if(s.includes(i.oneof))throw new Error(`Multiple members of the oneof group"${i.oneof}"of ${this.info.typeName}are present in JSON.`);s.push(i.oneof),e=r[i.oneof]={oneofKind:o}}else e=r;if("map"==i.kind){if(null!==n){this.assert(isJsonObject(n),i.name,n);var l,c,f=e[o];for([l,c]of Object.entries(n)){this.assert(null!==c,i.name+" map value",null);let e;switch(i.V.kind){case"message":e=i.V.T().internalJsonRead(c,t);break;case"enum":if(!1===(e=this.enum(i.V.T(),c,i.name,t.ignoreUnknownFields)))continue;break;case"scalar":e=this.scalar(c,i.V.T,i.V.L,i.name)}this.assert(void 0!==e,i.name+" map value",c);let r=l;i.K==ScalarType.BOOL&&(r="true"==r||"false"!=r&&r),f[r=this.scalar(r,i.K,LongType.STRING,i.name).toString()]=e}}}else if(i.repeat){if(null!==n){this.assert(Array.isArray(n),i.name,n);var u=e[o];for(const p of n){this.assert(null!==p,i.name,null);let e;switch(i.kind){case"message":e=i.T().internalJsonRead(p,t);break;case"enum":if(!1===(e=this.enum(i.T(),p,i.name,t.ignoreUnknownFields)))continue;break;case"scalar":e=this.scalar(p,i.T,i.L,i.name)}this.assert(void 0!==e,i.name,n),u.push(e)}}}else switch(i.kind){case"message":null===n&&"google.protobuf.Value"!=i.T().typeName?this.assert(void 0===i.oneof,i.name+" (oneof member)",null):e[o]=i.T().internalJsonRead(n,t,e[o]);break;case"enum":var h=this.enum(i.T(),n,i.name,t.ignoreUnknownFields);!1!==h&&(e[o]=h);break;case"scalar":e[o]=this.scalar(n,i.T,i.L,i.name)}}}enum(r,t,a,n){if("google.protobuf.NullValue"==r[0]&&assert(null===t,`Unable to parse field ${this.info.typeName}#${a},enum ${r[0]}only accepts null.`),null===t)return 0;switch(typeof t){case"number":return assert(Number.isInteger(t),`Unable to parse field ${this.info.typeName}#${a},enum can only be integral number,got ${t}.`),t;case"string":let e=t;r[2]&&t.substring(0,r[2].length)===r[2]&&(e=t.substring(r[2].length));var s=r[1][e];return void 0===s&&n?!1:(assert("number"==typeof s,`Unable to parse field ${this.info.typeName}#${a},enum ${r[0]}has no value for"${t}".`),s)}assert(!1,`Unable to parse field ${this.info.typeName}#${a},cannot parse enum value from ${typeof t}".`)}scalar(r,t,a,e){let n;try{switch(t){case ScalarType.DOUBLE:case ScalarType.FLOAT:if(null===r)return 0;if("NaN"===r)return Number.NaN;if("Infinity"===r)return Number.POSITIVE_INFINITY;if("-Infinity"===r)return Number.NEGATIVE_INFINITY;if(""===r)n="empty string";else if("string"==typeof r&&r.trim().length!==r.length)n="extra whitespace";else if("string"==typeof r||"number"==typeof r){var s=Number(r);if(Number.isNaN(s))n="not a number";else{if(Number.isFinite(s))return t==ScalarType.FLOAT&&assertFloat32(s),s;n="too large or small"}}break;case ScalarType.INT32:case ScalarType.FIXED32:case ScalarType.SFIXED32:case ScalarType.SINT32:case ScalarType.UINT32:if(null===r)return 0;let e;if("number"==typeof r?e=r:""===r?n="empty string":"string"==typeof r&&(r.trim().length!==r.length?n="extra whitespace":e=Number(r)),void 0===e)break;return(t==ScalarType.UINT32?assertUInt32:assertInt32)(e),e;case ScalarType.INT64:case ScalarType.SFIXED64:case ScalarType.SINT64:if(null===r)return reflectionLongConvert(PbLong.ZERO,a);if("number"!=typeof r&&"string"!=typeof r)break;return reflectionLongConvert(PbLong.from(r),a);case ScalarType.FIXED64:case ScalarType.UINT64:if(null===r)return reflectionLongConvert(PbULong.ZERO,a);if("number"!=typeof r&&"string"!=typeof r)break;return reflectionLongConvert(PbULong.from(r),a);case ScalarType.BOOL:if(null===r)return!1;if("boolean"!=typeof r)break;return r;case ScalarType.STRING:if(null===r)return"";if("string"!=typeof r){n="extra whitespace";break}try{encodeURIComponent(r)}catch(e){0;break}return r;case ScalarType.BYTES:if(null===r||""===r)return new Uint8Array(0);if("string"!=typeof r)break;return base64decode(r)}}catch(e){n=e.message}this.assert(!1,e+(n?"-"+n:""),r)}}class ReflectionJsonWriter{constructor(e){this.fields=e.fields??[]}write(e,r){var t,a,n={},s=e;for(const i of this.fields)i.oneof?(t=s[i.oneof]).oneofKind===i.localName&&(a="scalar"==i.kind||"enum"==i.kind?{...r,emitDefaultValues:!0}:r,assert(void 0!==(t=this.field(i,t[i.localName],a))),n[r.useProtoFieldName?i.name:i.jsonName]=t):void 0!==(a=this.field(i,s[i.localName],r))&&(n[r.useProtoFieldName?i.name:i.jsonName]=a);return n}field(r,t,a){let e=void 0;if("map"==r.kind){assert("object"==typeof t&&null!==t);var n={};switch(r.V.kind){case"scalar":for(var[s,i]of Object.entries(t)){i=this.scalar(r.V.T,i,r.name,!1,!0);assert(void 0!==i),n[s.toString()]=i}break;case"message":var o,l,c=r.V.T();for([o,l]of Object.entries(t)){var f=this.message(c,l,r.name,a);assert(void 0!==f),n[o.toString()]=f}break;case"enum":var u,h,p=r.V.T();for([u,h]of Object.entries(t)){assert(void 0===h||"number"==typeof h);var T=this.enum(p,h,r.name,!1,!0,a.enumAsInteger);assert(void 0!==T),n[u.toString()]=T}}(a.emitDefaultValues||0<Object.keys(n).length)&&(e=n)}else if(r.repeat){assert(Array.isArray(t));var d=[];switch(r.kind){case"scalar":for(let e=0;e<t.length;e++){var y=this.scalar(r.T,t[e],r.name,r.opt,!0);assert(void 0!==y),d.push(y)}break;case"enum":var g=r.T();for(let e=0;e<t.length;e++){assert(void 0===t[e]||"number"==typeof t[e]);var b=this.enum(g,t[e],r.name,r.opt,!0,a.enumAsInteger);assert(void 0!==b),d.push(b)}break;case"message":var m=r.T();for(let e=0;e<t.length;e++){var I=this.message(m,t[e],r.name,a);assert(void 0!==I),d.push(I)}}(a.emitDefaultValues||0<d.length||a.emitDefaultValues)&&(e=d)}else switch(r.kind){case"scalar":e=this.scalar(r.T,t,r.name,r.opt,a.emitDefaultValues);break;case"enum":e=this.enum(r.T(),t,r.name,r.opt,a.emitDefaultValues,a.enumAsInteger);break;case"message":e=this.message(r.T(),t,r.name,a)}return e}enum(e,r,t,a,n,s){if("google.protobuf.NullValue"==e[0])return null;if(void 0===r)assert(a);else if(0!==r||n||a)return assert("number"==typeof r),assert(Number.isInteger(r)),s||!e[1].hasOwnProperty(r)?r:e[2]?e[2]+e[1][r]:e[1][r]}message(e,r,t,a){return void 0===r?a.emitDefaultValues?null:void 0:e.internalJsonWrite(r,a)}scalar(e,r,t,a,n){if(void 0===r)assert(a);else{var s=n||a;switch(e){case ScalarType.INT32:case ScalarType.SFIXED32:case ScalarType.SINT32:return 0===r?s?0:void 0:(assertInt32(r),r);case ScalarType.FIXED32:case ScalarType.UINT32:return 0===r?s?0:void 0:(assertUInt32(r),r);case ScalarType.FLOAT:assertFloat32(r);case ScalarType.DOUBLE:return 0===r?s?0:void 0:(assert("number"==typeof r),Number.isNaN(r)?"NaN":r===Number.POSITIVE_INFINITY?"Infinity":r===Number.NEGATIVE_INFINITY?"-Infinity":r);case ScalarType.STRING:return""===r?s?"":void 0:(assert("string"==typeof r),r);case ScalarType.BOOL:return!1===r?!s&&void 0:(assert("boolean"==typeof r),r);case ScalarType.UINT64:case ScalarType.FIXED64:assert("number"==typeof r||"string"==typeof r||"bigint"==typeof r);var i=PbULong.from(r);return i.isZero()&&!s?void 0:i.toString();case ScalarType.INT64:case ScalarType.SFIXED64:case ScalarType.SINT64:assert("number"==typeof r||"string"==typeof r||"bigint"==typeof r);i=PbLong.from(r);return i.isZero()&&!s?void 0:i.toString();case ScalarType.BYTES:return(assert(r instanceof Uint8Array),r.byteLength)?base64encode(r):s?"":void 0}}}}function reflectionScalarDefault(e,r=LongType.STRING){switch(e){case ScalarType.BOOL:return!1;case ScalarType.UINT64:case ScalarType.FIXED64:return reflectionLongConvert(PbULong.ZERO,r);case ScalarType.INT64:case ScalarType.SFIXED64:case ScalarType.SINT64:return reflectionLongConvert(PbLong.ZERO,r);case ScalarType.DOUBLE:case ScalarType.FLOAT:return 0;case ScalarType.BYTES:return new Uint8Array(0);case ScalarType.STRING:return"";default:return 0}}class ReflectionBinaryReader{constructor(e){this.info=e}prepare(){var e;this.fieldNoToField||(e=this.info.fields??[],this.fieldNoToField=new Map(e.map(e=>[e.no,e])))}read(a,n,s,e){this.prepare();for(var r=void 0===e?a.len:a.pos+e;a.pos<r;){var[t,i]=a.tag(),o=this.fieldNoToField.get(t);if(o){let e=n,r=o.repeat,t=o.localName;switch(o.oneof&&(e=e[o.oneof]).oneofKind!==t&&(e=n[o.oneof]={oneofKind:t}),o.kind){case"scalar":case"enum":var l="enum"==o.kind?ScalarType.INT32:o.T,c="scalar"==o.kind?o.L:void 0;if(r){var f=e[t];if(i==WireType.LengthDelimited&&l!=ScalarType.STRING&&l!=ScalarType.BYTES)for(var u=a.uint32()+a.pos;a.pos<u;)f.push(this.scalar(a,l,c));else f.push(this.scalar(a,l,c))}else e[t]=this.scalar(a,l,c);break;case"message":r?(h=e[t],p=o.T().internalBinaryRead(a,a.uint32(),s),h.push(p)):e[t]=o.T().internalBinaryRead(a,a.uint32(),s,e[t]);break;case"map":var[h,p]=this.mapEntry(o,a,s);e[t][h]=p}}else{var T=s.readUnknownField;if("throw"==T)throw new Error(`Unknown field ${t} (wire type ${i}) for `+this.info.typeName);var d=a.skip(i);!1!==T&&(!0===T?UnknownFieldHandler.onRead:T)(this.info.typeName,n,t,i,d)}}}mapEntry(e,r,t){var a=r.uint32(),n=r.pos+a;let s=void 0,i=void 0;for(;r.pos<n;){var[o,l]=r.tag();switch(o){case 1:s=e.K==ScalarType.BOOL?r.bool().toString():this.scalar(r,e.K,LongType.STRING);break;case 2:switch(e.V.kind){case"scalar":i=this.scalar(r,e.V.T,e.V.L);break;case"enum":i=r.int32();break;case"message":i=e.V.T().internalBinaryRead(r,r.uint32(),t)}break;default:throw new Error(`Unknown field ${o} (wire type ${l}) in map entry for ${this.info.typeName}#`+e.name)}}if(void 0===s&&(a=reflectionScalarDefault(e.K),s=e.K==ScalarType.BOOL?a.toString():a),void 0===i)switch(e.V.kind){case"scalar":i=reflectionScalarDefault(e.V.T,e.V.L);break;case"enum":i=0;break;case"message":i=e.V.T().create()}return[s,i]}scalar(e,r,t){switch(r){case ScalarType.INT32:return e.int32();case ScalarType.STRING:return e.string();case ScalarType.BOOL:return e.bool();case ScalarType.DOUBLE:return e.double();case ScalarType.FLOAT:return e.float();case ScalarType.INT64:return reflectionLongConvert(e.int64(),t);case ScalarType.UINT64:return reflectionLongConvert(e.uint64(),t);case ScalarType.FIXED64:return reflectionLongConvert(e.fixed64(),t);case ScalarType.FIXED32:return e.fixed32();case ScalarType.BYTES:return e.bytes();case ScalarType.UINT32:return e.uint32();case ScalarType.SFIXED32:return e.sfixed32();case ScalarType.SFIXED64:return reflectionLongConvert(e.sfixed64(),t);case ScalarType.SINT32:return e.sint32();case ScalarType.SINT64:return reflectionLongConvert(e.sint64(),t)}}}class ReflectionBinaryWriter{constructor(e){this.info=e}prepare(){var e;this.fields||(e=this.info.fields?this.info.fields.concat():[],this.fields=e.sort((e,r)=>e.no-r.no))}write(n,s,i){this.prepare();for(const u of this.fields){let e,r,t=u.repeat,a=u.localName;if(u.oneof){var o=n[u.oneof];if(o.oneofKind!==a)continue;e=o[a],r=!0}else e=n[a],r=!1;switch(u.kind){case"scalar":case"enum":var l="enum"==u.kind?ScalarType.INT32:u.T;if(t)if(assert(Array.isArray(e)),t==RepeatType.PACKED)this.packed(s,l,u.no,e);else for(const h of e)this.scalar(s,l,u.no,h,!0);else void 0===e?assert(u.opt):this.scalar(s,l,u.no,e,r||u.opt);break;case"message":if(t){assert(Array.isArray(e));for(const p of e)this.message(s,i,u.T(),u.no,p)}else this.message(s,i,u.T(),u.no,e);break;case"map":assert("object"==typeof e&&null!==e);for(var[c,f]of Object.entries(e))this.mapEntry(s,i,u,c,f)}}var e=i.writeUnknownFields;!1!==e&&(!0===e?UnknownFieldHandler.onWrite:e)(this.info.typeName,n,s)}mapEntry(e,r,t,a,n){e.tag(t.no,WireType.LengthDelimited),e.fork();let s=a;switch(t.K){case ScalarType.INT32:case ScalarType.FIXED32:case ScalarType.UINT32:case ScalarType.SFIXED32:case ScalarType.SINT32:s=Number.parseInt(a);break;case ScalarType.BOOL:assert("true"==a||"false"==a),s="true"==a}switch(this.scalar(e,t.K,1,s,!0),t.V.kind){case"scalar":this.scalar(e,t.V.T,2,n,!0);break;case"enum":this.scalar(e,ScalarType.INT32,2,n,!0);break;case"message":this.message(e,r,t.V.T(),2,n)}e.join()}message(e,r,t,a,n){void 0!==n&&(t.internalBinaryWrite(n,e.tag(a,WireType.LengthDelimited).fork(),r),e.join())}scalar(e,r,t,a,n){var[r,s,i]=this.scalarInfo(r,a);i&&!n||(e.tag(t,r),e[s](a))}packed(r,e,t,a){if(a.length){assert(e!==ScalarType.BYTES&&e!==ScalarType.STRING),r.tag(t,WireType.LengthDelimited),r.fork();var[,n]=this.scalarInfo(e);for(let e=0;e<a.length;e++)r[n](a[e]);r.join()}}scalarInfo(e,r){let t=WireType.Varint,a;var n=void 0===r;let s=0===r;switch(e){case ScalarType.INT32:a="int32";break;case ScalarType.STRING:s=n||!r.length,t=WireType.LengthDelimited,a="string";break;case ScalarType.BOOL:s=!1===r,a="bool";break;case ScalarType.UINT32:a="uint32";break;case ScalarType.DOUBLE:t=WireType.Bit64,a="double";break;case ScalarType.FLOAT:t=WireType.Bit32,a="float";break;case ScalarType.INT64:s=n||PbLong.from(r).isZero(),a="int64";break;case ScalarType.UINT64:s=n||PbULong.from(r).isZero(),a="uint64";break;case ScalarType.FIXED64:s=n||PbULong.from(r).isZero(),t=WireType.Bit64,a="fixed64";break;case ScalarType.BYTES:s=n||!r.byteLength,t=WireType.LengthDelimited,a="bytes";break;case ScalarType.FIXED32:t=WireType.Bit32,a="fixed32";break;case ScalarType.SFIXED32:t=WireType.Bit32,a="sfixed32";break;case ScalarType.SFIXED64:s=n||PbLong.from(r).isZero(),t=WireType.Bit64,a="sfixed64";break;case ScalarType.SINT32:a="sint32";break;case ScalarType.SINT64:s=n||PbLong.from(r).isZero(),a="sint64"}return[t,a,n||s]}}function reflectionCreate(e){var r,t={};Object.defineProperty(t,MESSAGE_TYPE,{enumerable:!1,value:e});for(r of e.fields){var a=r.localName;if(!r.opt)if(r.oneof)t[r.oneof]={oneofKind:void 0};else if(r.repeat)t[a]=[];else switch(r.kind){case"scalar":t[a]=reflectionScalarDefault(r.T,r.L);break;case"enum":t[a]=0;break;case"map":t[a]={}}}return t}function reflectionMergePartial(e,r,t){let a,n=t,s;for(var i of e.fields){var o=i.localName;if(i.oneof){var l=n[i.oneof];if(null==(null==l?void 0:l.oneofKind))continue;if(a=l[o],(s=r[i.oneof]).oneofKind=l.oneofKind,null==a){delete s[o];continue}}else if(a=n[o],s=r,null==a)continue;switch(i.repeat&&(s[o].length=a.length),i.kind){case"scalar":case"enum":if(i.repeat)for(let e=0;e<a.length;e++)s[o][e]=a[e];else s[o]=a;break;case"message":var c=i.T();if(i.repeat)for(let e=0;e<a.length;e++)s[o][e]=c.create(a[e]);else void 0===s[o]?s[o]=c.create(a):c.mergePartial(s[o],a);break;case"map":switch(i.V.kind){case"scalar":case"enum":Object.assign(s[o],a);break;case"message":var f,u=i.V.T();for(f of Object.keys(a))s[o][f]=u.create(a[f])}}}}const defaultsWrite$1={emitDefaultValues:!1,enumAsInteger:!1,useProtoFieldName:!1,prettySpaces:0},defaultsRead$1={ignoreUnknownFields:!1};function jsonReadOptions(e){return e?{...defaultsRead$1,...e}:defaultsRead$1}function jsonWriteOptions(e){return e?{...defaultsWrite$1,...e}:defaultsWrite$1}function reflectionEquals(e,r,t){if(r!==t){if(!r||!t)return!1;for(var a of e.fields){var n=a.localName,s=(a.oneof?r[a.oneof]:r)[n],i=(a.oneof?t[a.oneof]:t)[n];switch(a.kind){case"enum":case"scalar":var o="enum"==a.kind?ScalarType.INT32:a.T;if((a.repeat?repeatedPrimitiveEq:primitiveEq)(o,s,i))break;return!1;case"map":if("message"==a.V.kind?repeatedMsgEq(a.V.T(),objectValues(s),objectValues(i)):repeatedPrimitiveEq("enum"==a.V.kind?ScalarType.INT32:a.V.T,objectValues(s),objectValues(i)))break;return!1;case"message":o=a.T();if(a.repeat?repeatedMsgEq(o,s,i):o.equals(s,i))break;return!1}}}return!0}const objectValues=Object.values;function primitiveEq(e,r,t){if(r!==t){if(e!==ScalarType.BYTES)return!1;var a=r,n=t;if(a.length!==n.length)return!1;for(let e=0;e<a.length;e++)if(a[e]!=n[e])return!1}return!0}function repeatedPrimitiveEq(r,t,a){if(t.length!==a.length)return!1;for(let e=0;e<t.length;e++)if(!primitiveEq(r,t[e],a[e]))return!1;return!0}function repeatedMsgEq(r,t,a){if(t.length!==a.length)return!1;for(let e=0;e<t.length;e++)if(!r.equals(t[e],a[e]))return!1;return!0}const defaultsWrite={writeUnknownFields:!0,writerFactory:()=>new BinaryWriter};function binaryWriteOptions(e){return e?{...defaultsWrite,...e}:defaultsWrite}class BinaryWriter{constructor(e){this.stack=[],this.textEncoder=e??new TextEncoder,this.chunks=[],this.buf=[]}finish(){this.chunks.push(new Uint8Array(this.buf));let r=0;for(let e=0;e<this.chunks.length;e++)r+=this.chunks[e].length;var t=new Uint8Array(r);let a=0;for(let e=0;e<this.chunks.length;e++)t.set(this.chunks[e],a),a+=this.chunks[e].length;return this.chunks=[],t}fork(){return this.stack.push({chunks:this.chunks,buf:this.buf}),this.chunks=[],this.buf=[],this}join(){var e=this.finish(),r=this.stack.pop();if(r)return this.chunks=r.chunks,this.buf=r.buf,this.uint32(e.byteLength),this.raw(e);throw new Error("invalid state,fork stack empty")}tag(e,r){return this.uint32((e<<3|r)>>>0)}raw(e){return this.buf.length&&(this.chunks.push(new Uint8Array(this.buf)),this.buf=[]),this.chunks.push(e),this}uint32(e){for(assertUInt32(e);127<e;)this.buf.push(127&e|128),e>>>=7;return this.buf.push(e),this}int32(e){return assertInt32(e),varint32write(e,this.buf),this}bool(e){return this.buf.push(e?1:0),this}bytes(e){return this.uint32(e.byteLength),this.raw(e)}string(e){e=this.textEncoder.encode(e);return this.uint32(e.byteLength),this.raw(e)}float(e){assertFloat32(e);var r=new Uint8Array(4);return new DataView(r.buffer).setFloat32(0,e,!0),this.raw(r)}double(e){var r=new Uint8Array(8);return new DataView(r.buffer).setFloat64(0,e,!0),this.raw(r)}fixed32(e){assertUInt32(e);var r=new Uint8Array(4);return new DataView(r.buffer).setUint32(0,e,!0),this.raw(r)}sfixed32(e){assertInt32(e);var r=new Uint8Array(4);return new DataView(r.buffer).setInt32(0,e,!0),this.raw(r)}sint32(e){return assertInt32(e),varint32write(e=(e<<1^e>>31)>>>0,this.buf),this}sfixed64(e){var r=new Uint8Array(8),t=new DataView(r.buffer),e=PbLong.from(e);return t.setInt32(0,e.lo,!0),t.setInt32(4,e.hi,!0),this.raw(r)}fixed64(e){var r=new Uint8Array(8),t=new DataView(r.buffer),e=PbULong.from(e);return t.setInt32(0,e.lo,!0),t.setInt32(4,e.hi,!0),this.raw(r)}int64(e){e=PbLong.from(e);return varint64write(e.lo,e.hi,this.buf),this}sint64(e){var e=PbLong.from(e),r=e.hi>>31;return varint64write(e.lo<<1^r,(e.hi<<1|e.lo>>>31)^r,this.buf),this}uint64(e){e=PbULong.from(e);return varint64write(e.lo,e.hi,this.buf),this}}const defaultsRead={readUnknownField:!0,readerFactory:e=>new BinaryReader(e)};function binaryReadOptions(e){return e?{...defaultsRead,...e}:defaultsRead}class BinaryReader{constructor(e,r){this.varint64=varint64read,this.uint32=varint32read,this.buf=e,this.len=e.length,this.pos=0,this.view=new DataView(e.buffer,e.byteOffset,e.byteLength),this.textDecoder=r??new TextDecoder("utf-8",{fatal:!0,ignoreBOM:!0})}tag(){var e=this.uint32(),r=e>>>3,e=7&e;if(r<=0||e<0||5<e)throw new Error("illegal tag:field no"+r+"wire type"+e);return[r,e]}skip(e){var r,t=this.pos;switch(e){case WireType.Varint:for(;128&this.buf[this.pos++];);break;case WireType.Bit64:this.pos+=4;case WireType.Bit32:this.pos+=4;break;case WireType.LengthDelimited:var a=this.uint32();this.pos+=a;break;case WireType.StartGroup:for(;(r=this.tag()[1])!==WireType.EndGroup;)this.skip(r);break;default:throw new Error("cant skip wire type"+e)}return this.assertBounds(),this.buf.subarray(t,this.pos)}assertBounds(){if(this.pos>this.len)throw new RangeError("premature EOF")}int32(){return 0|this.uint32()}sint32(){var e=this.uint32();return e>>>1^-(1&e)}int64(){return new PbLong(...this.varint64())}uint64(){return new PbULong(...this.varint64())}sint64(){var[e,r]=this.varint64(),t=-(1&e),e=(e>>>1|(1&r)<<31)^t,r=r>>>1^t;return new PbLong(e,r)}bool(){var[e,r]=this.varint64();return 0!==e||0!==r}fixed32(){return this.view.getUint32((this.pos+=4)-4,!0)}sfixed32(){return this.view.getInt32((this.pos+=4)-4,!0)}fixed64(){return new PbULong(this.sfixed32(),this.sfixed32())}sfixed64(){return new PbLong(this.sfixed32(),this.sfixed32())}float(){return this.view.getFloat32((this.pos+=4)-4,!0)}double(){return this.view.getFloat64((this.pos+=8)-8,!0)}bytes(){var e=this.uint32(),r=this.pos;return this.pos+=e,this.assertBounds(),this.buf.subarray(r,r+e)}string(){return this.textDecoder.decode(this.bytes())}}class MessageType{constructor(e,r,t){this.defaultCheckDepth=16,this.typeName=e,this.fields=r.map(normalizeFieldInfo),this.options=t??{},this.refTypeCheck=new ReflectionTypeCheck(this),this.refJsonReader=new ReflectionJsonReader(this),this.refJsonWriter=new ReflectionJsonWriter(this),this.refBinReader=new ReflectionBinaryReader(this),this.refBinWriter=new ReflectionBinaryWriter(this)}create(e){var r=reflectionCreate(this);return void 0!==e&&reflectionMergePartial(this,r,e),r}clone(e){var r=this.create();return reflectionMergePartial(this,r,e),r}equals(e,r){return reflectionEquals(this,e,r)}is(e,r=this.defaultCheckDepth){return this.refTypeCheck.is(e,r,!1)}isAssignable(e,r=this.defaultCheckDepth){return this.refTypeCheck.is(e,r,!0)}mergePartial(e,r){reflectionMergePartial(this,e,r)}fromBinary(e,r){r=binaryReadOptions(r);return this.internalBinaryRead(r.readerFactory(e),e.byteLength,r)}fromJson(e,r){return this.internalJsonRead(e,jsonReadOptions(r))}fromJsonString(e,r){e=JSON.parse(e);return this.fromJson(e,r)}toJson(e,r){return this.internalJsonWrite(e,jsonWriteOptions(r))}toJsonString(e,r){e=this.toJson(e,r);return JSON.stringify(e,null,(null==r?void 0:r.prettySpaces)??0)}toBinary(e,r){r=binaryWriteOptions(r);return this.internalBinaryWrite(e,r.writerFactory(),r).finish()}internalJsonRead(e,r,t){if(null===e||"object"!=typeof e||Array.isArray(e))throw new Error(`Unable to parse message ${this.typeName}from JSON ${typeofJsonValue(e)}.`);return t=t??this.create(),this.refJsonReader.read(e,t,r),t}internalJsonWrite(e,r){return this.refJsonWriter.write(e,r)}internalBinaryWrite(e,r,t){return this.refBinWriter.write(e,r,t),r}internalBinaryRead(e,r,t,a){a=a??this.create();return this.refBinReader.read(e,a,t,r),a}}
/* prettier-ignore */

// https://github.com/emn178/js-md5 md5=i.md5=_
/* prettier-ignore */
let md5;!function(){"use strict";function t(t){if(t)d[0]=d[16]=d[1]=d[2]=d[3]=d[4]=d[5]=d[6]=d[7]=d[8]=d[9]=d[10]=d[11]=d[12]=d[13]=d[14]=d[15]=0,this.blocks=d,this.buffer8=l;else if(a){var r=new ArrayBuffer(68);this.buffer8=new Uint8Array(r),this.blocks=new Uint32Array(r)}else this.blocks=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];this.h0=this.h1=this.h2=this.h3=this.start=this.bytes=this.hBytes=0,this.finalized=this.hashed=!1,this.first=!0}var r="input is invalid type",e="object"==typeof window,i=e?window:{};i.JS_MD5_NO_WINDOW&&(e=!1);var s=!e&&"object"==typeof self,h=!i.JS_MD5_NO_NODE_JS&&"object"==typeof process&&process.versions&&process.versions.node;h?i=global:s&&(i=self);var f=!i.JS_MD5_NO_COMMON_JS&&"object"==typeof module&&module.exports,o="function"==typeof define&&define.amd,a=!i.JS_MD5_NO_ARRAY_BUFFER&&"undefined"!=typeof ArrayBuffer,n="0123456789abcdef".split(""),u=[128,32768,8388608,-2147483648],y=[0,8,16,24],c=["hex","array","digest","buffer","arrayBuffer","base64"],p="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(""),d=[],l;if(a){var A=new ArrayBuffer(68);l=new Uint8Array(A),d=new Uint32Array(A)}!i.JS_MD5_NO_NODE_JS&&Array.isArray||(Array.isArray=function(t){return"[object Array]"===Object.prototype.toString.call(t)}),!a||!i.JS_MD5_NO_ARRAY_BUFFER_IS_VIEW&&ArrayBuffer.isView||(ArrayBuffer.isView=function(t){return"object"==typeof t&&t.buffer&&t.buffer.constructor===ArrayBuffer});var b=function(r){return function(e){return new t(!0).update(e)[r]()}},v=function(){var r=b("hex");h&&(r=w(r)),r.create=function(){return new t},r.update=function(t){return r.create().update(t)};for(var e=0;e<c.length;++e){var i=c[e];r[i]=b(i)}return r},w=function(t){var e=eval("require('crypto')"),i=eval("require('buffer').Buffer"),s=function(s){if("string"==typeof s)return e.createHash("md5").update(s,"utf8").digest("hex");if(null===s||void 0===s)throw r;return s.constructor===ArrayBuffer&&(s=new Uint8Array(s)),Array.isArray(s)||ArrayBuffer.isView(s)||s.constructor===i?e.createHash("md5").update(new i(s)).digest("hex"):t(s)};return s};t.prototype.update=function(t){if(!this.finalized){var e,i=typeof t;if("string"!==i){if("object"!==i)throw r;if(null===t)throw r;if(a&&t.constructor===ArrayBuffer)t=new Uint8Array(t);else if(!(Array.isArray(t)||a&&ArrayBuffer.isView(t)))throw r;e=!0}for(var s,h,f=0,o=t.length,n=this.blocks,u=this.buffer8;f<o;){if(this.hashed&&(this.hashed=!1,n[0]=n[16],n[16]=n[1]=n[2]=n[3]=n[4]=n[5]=n[6]=n[7]=n[8]=n[9]=n[10]=n[11]=n[12]=n[13]=n[14]=n[15]=0),e)if(a)for(h=this.start;f<o&&h<64;++f)u[h++]=t[f];else for(h=this.start;f<o&&h<64;++f)n[h>>2]|=t[f]<<y[3&h++];else if(a)for(h=this.start;f<o&&h<64;++f)(s=t.charCodeAt(f))<128?u[h++]=s:s<2048?(u[h++]=192|s>>6,u[h++]=128|63&s):s<55296||s>=57344?(u[h++]=224|s>>12,u[h++]=128|s>>6&63,u[h++]=128|63&s):(s=65536+((1023&s)<<10|1023&t.charCodeAt(++f)),u[h++]=240|s>>18,u[h++]=128|s>>12&63,u[h++]=128|s>>6&63,u[h++]=128|63&s);else for(h=this.start;f<o&&h<64;++f)(s=t.charCodeAt(f))<128?n[h>>2]|=s<<y[3&h++]:s<2048?(n[h>>2]|=(192|s>>6)<<y[3&h++],n[h>>2]|=(128|63&s)<<y[3&h++]):s<55296||s>=57344?(n[h>>2]|=(224|s>>12)<<y[3&h++],n[h>>2]|=(128|s>>6&63)<<y[3&h++],n[h>>2]|=(128|63&s)<<y[3&h++]):(s=65536+((1023&s)<<10|1023&t.charCodeAt(++f)),n[h>>2]|=(240|s>>18)<<y[3&h++],n[h>>2]|=(128|s>>12&63)<<y[3&h++],n[h>>2]|=(128|s>>6&63)<<y[3&h++],n[h>>2]|=(128|63&s)<<y[3&h++]);this.lastByteIndex=h,this.bytes+=h-this.start,h>=64?(this.start=h-64,this.hash(),this.hashed=!0):this.start=h}return this.bytes>4294967295&&(this.hBytes+=this.bytes/4294967296<<0,this.bytes=this.bytes%4294967296),this}},t.prototype.finalize=function(){if(!this.finalized){this.finalized=!0;var t=this.blocks,r=this.lastByteIndex;t[r>>2]|=u[3&r],r>=56&&(this.hashed||this.hash(),t[0]=t[16],t[16]=t[1]=t[2]=t[3]=t[4]=t[5]=t[6]=t[7]=t[8]=t[9]=t[10]=t[11]=t[12]=t[13]=t[14]=t[15]=0),t[14]=this.bytes<<3,t[15]=this.hBytes<<3|this.bytes>>>29,this.hash()}},t.prototype.hash=function(){var t,r,e,i,s,h,f=this.blocks;this.first?r=((r=((t=((t=f[0]-680876937)<<7|t>>>25)-271733879<<0)^(e=((e=(-271733879^(i=((i=(-1732584194^2004318071&t)+f[1]-117830708)<<12|i>>>20)+t<<0)&(-271733879^t))+f[2]-1126478375)<<17|e>>>15)+i<<0)&(i^t))+f[3]-1316259209)<<22|r>>>10)+e<<0:(t=this.h0,r=this.h1,e=this.h2,r=((r+=((t=((t+=((i=this.h3)^r&(e^i))+f[0]-680876936)<<7|t>>>25)+r<<0)^(e=((e+=(r^(i=((i+=(e^t&(r^e))+f[1]-389564586)<<12|i>>>20)+t<<0)&(t^r))+f[2]+606105819)<<17|e>>>15)+i<<0)&(i^t))+f[3]-1044525330)<<22|r>>>10)+e<<0),r=((r+=((t=((t+=(i^r&(e^i))+f[4]-176418897)<<7|t>>>25)+r<<0)^(e=((e+=(r^(i=((i+=(e^t&(r^e))+f[5]+1200080426)<<12|i>>>20)+t<<0)&(t^r))+f[6]-1473231341)<<17|e>>>15)+i<<0)&(i^t))+f[7]-45705983)<<22|r>>>10)+e<<0,r=((r+=((t=((t+=(i^r&(e^i))+f[8]+1770035416)<<7|t>>>25)+r<<0)^(e=((e+=(r^(i=((i+=(e^t&(r^e))+f[9]-1958414417)<<12|i>>>20)+t<<0)&(t^r))+f[10]-42063)<<17|e>>>15)+i<<0)&(i^t))+f[11]-1990404162)<<22|r>>>10)+e<<0,r=((r+=((t=((t+=(i^r&(e^i))+f[12]+1804603682)<<7|t>>>25)+r<<0)^(e=((e+=(r^(i=((i+=(e^t&(r^e))+f[13]-40341101)<<12|i>>>20)+t<<0)&(t^r))+f[14]-1502002290)<<17|e>>>15)+i<<0)&(i^t))+f[15]+1236535329)<<22|r>>>10)+e<<0,r=((r+=((i=((i+=(r^e&((t=((t+=(e^i&(r^e))+f[1]-165796510)<<5|t>>>27)+r<<0)^r))+f[6]-1069501632)<<9|i>>>23)+t<<0)^t&((e=((e+=(t^r&(i^t))+f[11]+643717713)<<14|e>>>18)+i<<0)^i))+f[0]-373897302)<<20|r>>>12)+e<<0,r=((r+=((i=((i+=(r^e&((t=((t+=(e^i&(r^e))+f[5]-701558691)<<5|t>>>27)+r<<0)^r))+f[10]+38016083)<<9|i>>>23)+t<<0)^t&((e=((e+=(t^r&(i^t))+f[15]-660478335)<<14|e>>>18)+i<<0)^i))+f[4]-405537848)<<20|r>>>12)+e<<0,r=((r+=((i=((i+=(r^e&((t=((t+=(e^i&(r^e))+f[9]+568446438)<<5|t>>>27)+r<<0)^r))+f[14]-1019803690)<<9|i>>>23)+t<<0)^t&((e=((e+=(t^r&(i^t))+f[3]-187363961)<<14|e>>>18)+i<<0)^i))+f[8]+1163531501)<<20|r>>>12)+e<<0,r=((r+=((i=((i+=(r^e&((t=((t+=(e^i&(r^e))+f[13]-1444681467)<<5|t>>>27)+r<<0)^r))+f[2]-51403784)<<9|i>>>23)+t<<0)^t&((e=((e+=(t^r&(i^t))+f[7]+1735328473)<<14|e>>>18)+i<<0)^i))+f[12]-1926607734)<<20|r>>>12)+e<<0,r=((r+=((h=(i=((i+=((s=r^e)^(t=((t+=(s^i)+f[5]-378558)<<4|t>>>28)+r<<0))+f[8]-2022574463)<<11|i>>>21)+t<<0)^t)^(e=((e+=(h^r)+f[11]+1839030562)<<16|e>>>16)+i<<0))+f[14]-35309556)<<23|r>>>9)+e<<0,r=((r+=((h=(i=((i+=((s=r^e)^(t=((t+=(s^i)+f[1]-1530992060)<<4|t>>>28)+r<<0))+f[4]+1272893353)<<11|i>>>21)+t<<0)^t)^(e=((e+=(h^r)+f[7]-155497632)<<16|e>>>16)+i<<0))+f[10]-1094730640)<<23|r>>>9)+e<<0,r=((r+=((h=(i=((i+=((s=r^e)^(t=((t+=(s^i)+f[13]+681279174)<<4|t>>>28)+r<<0))+f[0]-358537222)<<11|i>>>21)+t<<0)^t)^(e=((e+=(h^r)+f[3]-722521979)<<16|e>>>16)+i<<0))+f[6]+76029189)<<23|r>>>9)+e<<0,r=((r+=((h=(i=((i+=((s=r^e)^(t=((t+=(s^i)+f[9]-640364487)<<4|t>>>28)+r<<0))+f[12]-421815835)<<11|i>>>21)+t<<0)^t)^(e=((e+=(h^r)+f[15]+530742520)<<16|e>>>16)+i<<0))+f[2]-995338651)<<23|r>>>9)+e<<0,r=((r+=((i=((i+=(r^((t=((t+=(e^(r|~i))+f[0]-198630844)<<6|t>>>26)+r<<0)|~e))+f[7]+1126891415)<<10|i>>>22)+t<<0)^((e=((e+=(t^(i|~r))+f[14]-1416354905)<<15|e>>>17)+i<<0)|~t))+f[5]-57434055)<<21|r>>>11)+e<<0,r=((r+=((i=((i+=(r^((t=((t+=(e^(r|~i))+f[12]+1700485571)<<6|t>>>26)+r<<0)|~e))+f[3]-1894986606)<<10|i>>>22)+t<<0)^((e=((e+=(t^(i|~r))+f[10]-1051523)<<15|e>>>17)+i<<0)|~t))+f[1]-2054922799)<<21|r>>>11)+e<<0,r=((r+=((i=((i+=(r^((t=((t+=(e^(r|~i))+f[8]+1873313359)<<6|t>>>26)+r<<0)|~e))+f[15]-30611744)<<10|i>>>22)+t<<0)^((e=((e+=(t^(i|~r))+f[6]-1560198380)<<15|e>>>17)+i<<0)|~t))+f[13]+1309151649)<<21|r>>>11)+e<<0,r=((r+=((i=((i+=(r^((t=((t+=(e^(r|~i))+f[4]-145523070)<<6|t>>>26)+r<<0)|~e))+f[11]-1120210379)<<10|i>>>22)+t<<0)^((e=((e+=(t^(i|~r))+f[2]+718787259)<<15|e>>>17)+i<<0)|~t))+f[9]-343485551)<<21|r>>>11)+e<<0,this.first?(this.h0=t+1732584193<<0,this.h1=r-271733879<<0,this.h2=e-1732584194<<0,this.h3=i+271733878<<0,this.first=!1):(this.h0=this.h0+t<<0,this.h1=this.h1+r<<0,this.h2=this.h2+e<<0,this.h3=this.h3+i<<0)},t.prototype.hex=function(){this.finalize();var t=this.h0,r=this.h1,e=this.h2,i=this.h3;return n[t>>4&15]+n[15&t]+n[t>>12&15]+n[t>>8&15]+n[t>>20&15]+n[t>>16&15]+n[t>>28&15]+n[t>>24&15]+n[r>>4&15]+n[15&r]+n[r>>12&15]+n[r>>8&15]+n[r>>20&15]+n[r>>16&15]+n[r>>28&15]+n[r>>24&15]+n[e>>4&15]+n[15&e]+n[e>>12&15]+n[e>>8&15]+n[e>>20&15]+n[e>>16&15]+n[e>>28&15]+n[e>>24&15]+n[i>>4&15]+n[15&i]+n[i>>12&15]+n[i>>8&15]+n[i>>20&15]+n[i>>16&15]+n[i>>28&15]+n[i>>24&15]},t.prototype.toString=t.prototype.hex,t.prototype.digest=function(){this.finalize();var t=this.h0,r=this.h1,e=this.h2,i=this.h3;return[255&t,t>>8&255,t>>16&255,t>>24&255,255&r,r>>8&255,r>>16&255,r>>24&255,255&e,e>>8&255,e>>16&255,e>>24&255,255&i,i>>8&255,i>>16&255,i>>24&255]},t.prototype.array=t.prototype.digest,t.prototype.arrayBuffer=function(){this.finalize();var t=new ArrayBuffer(16),r=new Uint32Array(t);return r[0]=this.h0,r[1]=this.h1,r[2]=this.h2,r[3]=this.h3,t},t.prototype.buffer=t.prototype.arrayBuffer,t.prototype.base64=function(){for(var t,r,e,i="",s=this.array(),h=0;h<15;)t=s[h++],r=s[h++],e=s[h++],i+=p[t>>>2]+p[63&(t<<4|r>>>4)]+p[63&(r<<2|e>>>6)]+p[63&e];return t=s[h],i+=p[t>>>2]+p[t<<4&63]+"=="};var _=v();f?module.exports=_:(md5=i.md5=_,o&&define(function(){return _}))}();

/* prettier-ignore */
function charPYStr(){return '锕皑蔼碍爱嗳嫒瑷暧霭谙铵鹌肮袄奥媪骜鳌坝罢钯摆败呗颁办绊钣帮绑镑谤剥饱宝报鲍鸨龅辈贝钡狈备惫鹎贲锛绷笔毕毙币闭荜哔滗铋筚跸边编贬变辩辫苄缏笾标骠飑飙镖镳鳔鳖别瘪濒滨宾摈傧缤槟殡膑镔髌鬓饼禀拨钵铂驳饽钹鹁补钸财参蚕残惭惨灿骖黪苍舱仓沧厕侧册测恻层诧锸侪钗搀掺蝉馋谗缠铲产阐颤冁谄谶蒇忏婵骣觇禅镡场尝长偿肠厂畅伥苌怅阊鲳钞车彻砗尘陈衬伧谌榇碜龀撑称惩诚骋枨柽铖铛痴迟驰耻齿炽饬鸱冲冲虫宠铳畴踌筹绸俦帱雠橱厨锄雏础储触处刍绌蹰传钏疮闯创怆锤缍纯鹑绰辍龊辞词赐鹚聪葱囱从丛苁骢枞凑辏蹿窜撺错锉鹾达哒鞑带贷骀绐担单郸掸胆惮诞弹殚赕瘅箪当挡党荡档谠砀裆捣岛祷导盗焘灯邓镫敌涤递缔籴诋谛绨觌镝颠点垫电巅钿癫钓调铫鲷谍叠鲽钉顶锭订铤丢铥东动栋冻岽鸫窦犊独读赌镀渎椟牍笃黩锻断缎簖兑队对怼镦吨顿钝炖趸夺堕铎鹅额讹恶饿谔垩阏轭锇锷鹗颚颛鳄诶儿尔饵贰迩铒鸸鲕发罚阀珐矾钒烦贩饭访纺钫鲂飞诽废费绯镄鲱纷坟奋愤粪偾丰枫锋风疯冯缝讽凤沣肤辐抚辅赋复负讣妇缚凫驸绂绋赙麸鲋鳆钆该钙盖赅杆赶秆赣尴擀绀冈刚钢纲岗戆镐睾诰缟锆搁鸽阁铬个纥镉颍给亘赓绠鲠龚宫巩贡钩沟苟构购够诟缑觏蛊顾诂毂钴锢鸪鹄鹘剐挂鸹掴关观馆惯贯诖掼鹳鳏广犷规归龟闺轨诡贵刽匦刿妫桧鲑鳜辊滚衮绲鲧锅国过埚呙帼椁蝈铪骇韩汉阚绗颉号灏颢阂鹤贺诃阖蛎横轰鸿红黉讧荭闳鲎壶护沪户浒鹕哗华画划话骅桦铧怀坏欢环还缓换唤痪焕涣奂缳锾鲩黄谎鳇挥辉毁贿秽会烩汇讳诲绘诙荟哕浍缋珲晖荤浑诨馄阍获货祸钬镬击机积饥迹讥鸡绩缉极辑级挤几蓟剂济计记际继纪讦诘荠叽哜骥玑觊齑矶羁虿跻霁鲚鲫夹荚颊贾钾价驾郏浃铗镓蛲歼监坚笺间艰缄茧检碱硷拣捡简俭减荐槛鉴践贱见键舰剑饯渐溅涧谏缣戋戬睑鹣笕鲣鞯将浆蒋桨奖讲酱绛缰胶浇骄娇搅铰矫侥脚饺缴绞轿较挢峤鹪鲛阶节洁结诫届疖颌鲒紧锦仅谨进晋烬尽劲荆茎卺荩馑缙赆觐鲸惊经颈静镜径痉竞净刭泾迳弪胫靓纠厩旧阄鸠鹫驹举据锯惧剧讵屦榉飓钜锔窭龃鹃绢锩镌隽觉决绝谲珏钧军骏皲开凯剀垲忾恺铠锴龛闶钪铐颗壳课骒缂轲钶锞颔垦恳龈铿抠库裤喾块侩郐哙脍宽狯髋矿旷况诓诳邝圹纩贶亏岿窥馈溃匮蒉愦聩篑阃锟鲲扩阔蛴蜡腊莱来赖崃徕涞濑赉睐铼癞籁蓝栏拦篮阑兰澜谰揽览懒缆烂滥岚榄斓镧褴琅阆锒捞劳涝唠崂铑铹痨乐鳓镭垒类泪诔缧篱狸离鲤礼丽厉励砾历沥隶俪郦坜苈莅蓠呖逦骊缡枥栎轹砺锂鹂疠粝跞雳鲡鳢俩联莲连镰怜涟帘敛脸链恋炼练蔹奁潋琏殓裢裣鲢粮凉两辆谅魉疗辽镣缭钌鹩猎临邻鳞凛赁蔺廪檩辚躏龄铃灵岭领绫棂蛏鲮馏刘浏骝绺镏鹨龙聋咙笼垄拢陇茏泷珑栊胧砻楼娄搂篓偻蒌喽嵝镂瘘耧蝼髅芦卢颅庐炉掳卤虏鲁赂禄录陆垆撸噜闾泸渌栌橹轳辂辘氇胪鸬鹭舻鲈峦挛孪滦乱脔娈栾鸾銮抡轮伦仑沦纶论囵萝罗逻锣箩骡骆络荦猡泺椤脶镙驴吕铝侣屡缕虑滤绿榈褛锊呒妈玛码蚂马骂吗唛嬷杩买麦卖迈脉劢瞒馒蛮满谩缦镘颡鳗猫锚铆贸麽没镁门闷们扪焖懑钔锰梦眯谜弥觅幂芈谧猕祢绵缅渑腼黾庙缈缪灭悯闽闵缗鸣铭谬谟蓦馍殁镆谋亩钼呐钠纳难挠脑恼闹铙讷馁内拟腻铌鲵撵辇鲶酿鸟茑袅聂啮镊镍陧蘖嗫颟蹑柠狞宁拧泞苎咛聍钮纽脓浓农侬哝驽钕诺傩疟欧鸥殴呕沤讴怄瓯盘蹒庞抛疱赔辔喷鹏纰罴铍骗谝骈飘缥频贫嫔苹凭评泼颇钋扑铺朴谱镤镨栖脐齐骑岂启气弃讫蕲骐绮桤碛颀颃鳍牵钎铅迁签谦钱钳潜浅谴堑佥荨悭骞缱椠钤枪呛墙蔷强抢嫱樯戗炝锖锵镪羟跄锹桥乔侨翘窍诮谯荞缲硗跷窃惬锲箧钦亲寝锓轻氢倾顷请庆揿鲭琼穷茕蛱巯赇虮鳅趋区躯驱龋诎岖阒觑鸲颧权劝诠绻辁铨却鹊确阕阙悫让饶扰绕荛娆桡热韧认纫饪轫荣绒嵘蝾缛铷颦软锐蚬闰润洒萨飒鳃赛伞毵糁丧骚扫缫涩啬铯穑杀刹纱铩鲨筛晒酾删闪陕赡缮讪姗骟钐鳝墒伤赏垧殇觞烧绍赊摄慑设厍滠畲绅审婶肾渗诜谂渖声绳胜师狮湿诗时蚀实识驶势适释饰视试谥埘莳弑轼贳铈鲥寿兽绶枢输书赎属术树竖数摅纾帅闩双谁税顺说硕烁铄丝饲厮驷缌锶鸶耸怂颂讼诵擞薮馊飕锼苏诉肃谡稣虽随绥岁谇孙损笋荪狲缩琐锁唢睃獭挞闼铊鳎台态钛鲐摊贪瘫滩坛谭谈叹昙钽锬顸汤烫傥饧铴镗涛绦讨韬铽腾誊锑题体屉缇鹈阗条粜龆鲦贴铁厅听烃铜统恸头钭秃图钍团抟颓蜕饨脱鸵驮驼椭箨鼍袜娲腽弯湾顽万纨绾网辋韦违围为潍维苇伟伪纬谓卫诿帏闱沩涠玮韪炜鲔温闻纹稳问阌瓮挝蜗涡窝卧莴龌呜钨乌诬无芜吴坞雾务误邬庑怃妩骛鹉鹜锡牺袭习铣戏细饩阋玺觋虾辖峡侠狭厦吓硖鲜纤贤衔闲显险现献县馅羡宪线苋莶藓岘猃娴鹇痫蚝籼跹厢镶乡详响项芗饷骧缃飨萧嚣销晓啸哓潇骁绡枭箫协挟携胁谐写泻谢亵撷绁缬锌衅兴陉荥凶汹锈绣馐鸺虚嘘须许叙绪续诩顼轩悬选癣绚谖铉镟学谑泶鳕勋询寻驯训讯逊埙浔鲟压鸦鸭哑亚讶垭娅桠氩阉烟盐严岩颜阎艳厌砚彦谚验厣赝俨兖谳恹闫酽魇餍鼹鸯杨扬疡阳痒养样炀瑶摇尧遥窑谣药轺鹞鳐爷页业叶靥谒邺晔烨医铱颐遗仪蚁艺亿忆义诣议谊译异绎诒呓峄饴怿驿缢轶贻钇镒镱瘗舣荫阴银饮隐铟瘾樱婴鹰应缨莹萤营荧蝇赢颖茔莺萦蓥撄嘤滢潆璎鹦瘿颏罂哟拥佣痈踊咏镛优忧邮铀犹诱莸铕鱿舆鱼渔娱与屿语狱誉预驭伛俣谀谕蓣嵛饫阈妪纡觎欤钰鹆鹬龉鸳渊辕园员圆缘远橼鸢鼋约跃钥粤悦阅钺郧匀陨运蕴酝晕韵郓芸恽愠纭韫殒氲杂灾载攒暂赞瓒趱錾赃脏驵凿枣责择则泽赜啧帻箦贼谮赠综缯轧铡闸栅诈斋债毡盏斩辗崭栈战绽谵张涨帐账胀赵诏钊蛰辙锗这谪辄鹧贞针侦诊镇阵浈缜桢轸赈祯鸩挣睁狰争帧症郑证诤峥钲铮筝织职执纸挚掷帜质滞骘栉栀轵轾贽鸷蛳絷踬踯觯钟终种肿众锺诌轴皱昼骤纣绉猪诸诛烛瞩嘱贮铸驻伫槠铢专砖转赚啭馔颞桩庄装妆壮状锥赘坠缀骓缒谆准着浊诼镯兹资渍谘缁辎赀眦锱龇鲻踪总纵偬邹诹驺鲰诅组镞钻缵躜鳟翱并卜沉丑淀迭斗范干皋硅柜后伙秸杰诀夸里凌么霉捻凄扦圣尸抬涂洼喂污锨咸蝎彝涌游吁御愿岳云灶扎札筑于志注凋讠谫郄勐凼坂垅垴埯埝苘荬荮莜莼菰藁揸吒吣咔咝咴噘噼嚯幞岙嵴彷徼犸狍馀馇馓馕愣憷懔丬溆滟溷漤潴澹甯纟绔绱珉枧桊桉槔橥轱轷赍肷胨飚煳煅熘愍淼砜磙眍钚钷铘铞锃锍锎锏锘锝锪锫锿镅镎镢镥镩镲稆鹋鹛鹱疬疴痖癯裥襁耢颥螨麴鲅鲆鲇鲞鲴鲺鲼鳊鳋鳘鳙鞒鞴齄';}function ftPYStr(){return '唸錒皚藹礙愛噯嬡璦曖靄諳銨鵪骯襖奧媼驁鰲壩罷鈀擺敗唄頒辦絆鈑幫綁鎊謗剝飽寶報鮑鴇齙輩貝鋇狽備憊鵯賁錛繃筆畢斃幣閉蓽嗶潷鉍篳蹕邊編貶變辯辮芐緶籩標驃颮飆鏢鑣鰾鱉別癟瀕濱賓擯儐繽檳殯臏鑌髕鬢餅稟撥缽鉑駁餑鈸鵓補鈽財參蠶殘慚慘燦驂黲蒼艙倉滄廁側冊測惻層詫鍤儕釵攙摻蟬饞讒纏鏟產闡顫囅諂讖蕆懺嬋驏覘禪鐔場嘗長償腸廠暢倀萇悵閶鯧鈔車徹硨塵陳襯傖諶櫬磣齔撐稱懲誠騁棖檉鋮鐺癡遲馳恥齒熾飭鴟沖衝蟲寵銃疇躊籌綢儔幬讎櫥廚鋤雛礎儲觸處芻絀躕傳釧瘡闖創愴錘綞純鶉綽輟齪辭詞賜鶿聰蔥囪從叢蓯驄樅湊輳躥竄攛錯銼鹺達噠韃帶貸駘紿擔單鄲撣膽憚誕彈殫賧癉簞當擋黨蕩檔讜碭襠搗島禱導盜燾燈鄧鐙敵滌遞締糴詆諦綈覿鏑顛點墊電巔鈿癲釣調銚鯛諜疊鰈釘頂錠訂鋌丟銩東動棟凍崠鶇竇犢獨讀賭鍍瀆櫝牘篤黷鍛斷緞籪兌隊對懟鐓噸頓鈍燉躉奪墮鐸鵝額訛惡餓諤堊閼軛鋨鍔鶚顎顓鱷誒兒爾餌貳邇鉺鴯鮞發罰閥琺礬釩煩販飯訪紡鈁魴飛誹廢費緋鐨鯡紛墳奮憤糞僨豐楓鋒風瘋馮縫諷鳳灃膚輻撫輔賦復負訃婦縛鳧駙紱紼賻麩鮒鰒釓該鈣蓋賅桿趕稈贛尷搟紺岡剛鋼綱崗戇鎬睪誥縞鋯擱鴿閣鉻個紇鎘潁給亙賡綆鯁龔宮鞏貢鉤溝茍構購夠詬緱覯蠱顧詁轂鈷錮鴣鵠鶻剮掛鴰摑關觀館慣貫詿摜鸛鰥廣獷規歸龜閨軌詭貴劊匭劌媯檜鮭鱖輥滾袞緄鯀鍋國過堝咼幗槨蟈鉿駭韓漢闞絎頡號灝顥閡鶴賀訶闔蠣橫轟鴻紅黌訌葒閎鱟壺護滬戶滸鶘嘩華畫劃話驊樺鏵懷壞歡環還緩換喚瘓煥渙奐繯鍰鯇黃謊鰉揮輝毀賄穢會燴匯諱誨繪詼薈噦澮繢琿暉葷渾諢餛閽獲貨禍鈥鑊擊機積饑跡譏雞績緝極輯級擠幾薊劑濟計記際繼紀訐詰薺嘰嚌驥璣覬齏磯羈蠆躋霽鱭鯽夾莢頰賈鉀價駕郟浹鋏鎵蟯殲監堅箋間艱緘繭檢堿鹼揀撿簡儉減薦檻鑒踐賤見鍵艦劍餞漸濺澗諫縑戔戩瞼鶼筧鰹韉將漿蔣槳獎講醬絳韁膠澆驕嬌攪鉸矯僥腳餃繳絞轎較撟嶠鷦鮫階節潔結誡屆癤頜鮚緊錦僅謹進晉燼盡勁荊莖巹藎饉縉贐覲鯨驚經頸靜鏡徑痙競凈剄涇逕弳脛靚糾廄舊鬮鳩鷲駒舉據鋸懼劇詎屨櫸颶鉅鋦窶齟鵑絹錈鐫雋覺決絕譎玨鈞軍駿皸開凱剴塏愾愷鎧鍇龕閌鈧銬顆殼課騍緙軻鈳錁頷墾懇齦鏗摳庫褲嚳塊儈鄶噲膾寬獪髖礦曠況誆誑鄺壙纊貺虧巋窺饋潰匱蕢憒聵簣閫錕鯤擴闊蠐蠟臘萊來賴崍徠淶瀨賚睞錸癩籟藍欄攔籃闌蘭瀾讕攬覽懶纜爛濫嵐欖斕鑭襤瑯閬鋃撈勞澇嘮嶗銠鐒癆樂鰳鐳壘類淚誄縲籬貍離鯉禮麗厲勵礫歷瀝隸儷酈壢藶蒞蘺嚦邐驪縭櫪櫟轢礪鋰鸝癘糲躒靂鱺鱧倆聯蓮連鐮憐漣簾斂臉鏈戀煉練蘞奩瀲璉殮褳襝鰱糧涼兩輛諒魎療遼鐐繚釕鷯獵臨鄰鱗凜賃藺廩檁轔躪齡鈴靈嶺領綾欞蟶鯪餾劉瀏騮綹鎦鷚龍聾嚨籠壟攏隴蘢瀧瓏櫳朧礱樓婁摟簍僂蔞嘍嶁鏤瘺耬螻髏蘆盧顱廬爐擄鹵虜魯賂祿錄陸壚擼嚕閭瀘淥櫨櫓轤輅轆氌臚鸕鷺艫鱸巒攣孿灤亂臠孌欒鸞鑾掄輪倫侖淪綸論圇蘿羅邏鑼籮騾駱絡犖玀濼欏腡鏍驢呂鋁侶屢縷慮濾綠櫚褸鋝嘸媽瑪碼螞馬罵嗎嘜嬤榪買麥賣邁脈勱瞞饅蠻滿謾縵鏝顙鰻貓錨鉚貿麼沒鎂門悶們捫燜懣鍆錳夢瞇謎彌覓冪羋謐獼禰綿緬澠靦黽廟緲繆滅憫閩閔緡鳴銘謬謨驀饃歿鏌謀畝鉬吶鈉納難撓腦惱鬧鐃訥餒內擬膩鈮鯢攆輦鯰釀鳥蔦裊聶嚙鑷鎳隉蘗囁顢躡檸獰寧擰濘苧嚀聹鈕紐膿濃農儂噥駑釹諾儺瘧歐鷗毆嘔漚謳慪甌盤蹣龐拋皰賠轡噴鵬紕羆鈹騙諞駢飄縹頻貧嬪蘋憑評潑頗釙撲鋪樸譜鏷鐠棲臍齊騎豈啟氣棄訖蘄騏綺榿磧頎頏鰭牽釬鉛遷簽謙錢鉗潛淺譴塹僉蕁慳騫繾槧鈐槍嗆墻薔強搶嬙檣戧熗錆鏘鏹羥蹌鍬橋喬僑翹竅誚譙蕎繰磽蹺竊愜鍥篋欽親寢鋟輕氫傾頃請慶撳鯖瓊窮煢蛺巰賕蟣鰍趨區軀驅齲詘嶇闃覷鴝顴權勸詮綣輇銓卻鵲確闋闕愨讓饒擾繞蕘嬈橈熱韌認紉飪軔榮絨嶸蠑縟銣顰軟銳蜆閏潤灑薩颯鰓賽傘毿糝喪騷掃繅澀嗇銫穡殺剎紗鎩鯊篩曬釃刪閃陜贍繕訕姍騸釤鱔墑傷賞坰殤觴燒紹賒攝懾設厙灄畬紳審嬸腎滲詵諗瀋聲繩勝師獅濕詩時蝕實識駛勢適釋飾視試謚塒蒔弒軾貰鈰鰣壽獸綬樞輸書贖屬術樹豎數攄紓帥閂雙誰稅順說碩爍鑠絲飼廝駟緦鍶鷥聳慫頌訟誦擻藪餿颼鎪蘇訴肅謖穌雖隨綏歲誶孫損筍蓀猻縮瑣鎖嗩脧獺撻闥鉈鰨臺態鈦鮐攤貪癱灘壇譚談嘆曇鉭錟頇湯燙儻餳鐋鏜濤絳討韜鋱騰謄銻題體屜緹鵜闐條糶齠鰷貼鐵廳聽烴銅統慟頭鈄禿圖釷團摶頹蛻飩脫鴕馱駝橢籜鼉襪媧膃彎灣頑萬紈綰網輞韋違圍為濰維葦偉偽緯謂衛諉幃闈溈潿瑋韙煒鮪溫聞紋穩問閿甕撾蝸渦窩臥萵齷嗚鎢烏誣無蕪吳塢霧務誤鄔廡憮嫵騖鵡鶩錫犧襲習銑戲細餼鬩璽覡蝦轄峽俠狹廈嚇硤鮮纖賢銜閑顯險現獻縣餡羨憲線莧薟蘚峴獫嫻鷴癇蠔秈躚廂鑲鄉詳響項薌餉驤緗饗蕭囂銷曉嘯嘵瀟驍綃梟簫協挾攜脅諧寫瀉謝褻擷紲纈鋅釁興陘滎兇洶銹繡饈鵂虛噓須許敘緒續詡頊軒懸選癬絢諼鉉鏇學謔澩鱈勛詢尋馴訓訊遜塤潯鱘壓鴉鴨啞亞訝埡婭椏氬閹煙鹽嚴巖顏閻艷厭硯彥諺驗厴贗儼兗讞懨閆釅魘饜鼴鴦楊揚瘍陽癢養樣煬瑤搖堯遙窯謠藥軺鷂鰩爺頁業葉靨謁鄴曄燁醫銥頤遺儀蟻藝億憶義詣議誼譯異繹詒囈嶧飴懌驛縊軼貽釔鎰鐿瘞艤蔭陰銀飲隱銦癮櫻嬰鷹應纓瑩螢營熒蠅贏穎塋鶯縈鎣攖嚶瀅瀠瓔鸚癭頦罌喲擁傭癰踴詠鏞優憂郵鈾猶誘蕕銪魷輿魚漁娛與嶼語獄譽預馭傴俁諛諭蕷崳飫閾嫗紆覦歟鈺鵒鷸齬鴛淵轅園員圓緣遠櫞鳶黿約躍鑰粵悅閱鉞鄖勻隕運蘊醞暈韻鄆蕓惲慍紜韞殞氳雜災載攢暫贊瓚趲鏨贓臟駔鑿棗責擇則澤賾嘖幘簀賊譖贈綜繒軋鍘閘柵詐齋債氈盞斬輾嶄棧戰綻譫張漲帳賬脹趙詔釗蟄轍鍺這謫輒鷓貞針偵診鎮陣湞縝楨軫賑禎鴆掙睜猙爭幀癥鄭證諍崢鉦錚箏織職執紙摯擲幟質滯騭櫛梔軹輊贄鷙螄縶躓躑觶鐘終種腫眾鍾謅軸皺晝驟紂縐豬諸誅燭矚囑貯鑄駐佇櫧銖專磚轉賺囀饌顳樁莊裝妝壯狀錐贅墜綴騅縋諄準著濁諑鐲茲資漬諮緇輜貲眥錙齜鯔蹤總縱傯鄒諏騶鯫詛組鏃鉆纘躦鱒翺並蔔沈醜澱叠鬥範幹臯矽櫃後夥稭傑訣誇裏淩麽黴撚淒扡聖屍擡塗窪餵汙鍁鹹蠍彜湧遊籲禦願嶽雲竈紮劄築於誌註雕訁譾郤猛氹阪壟堖垵墊檾蕒葤蓧蒓菇槁摣咤唚哢噝噅撅劈謔襆嶴脊仿僥獁麅餘餷饊饢楞怵懍爿漵灩混濫瀦淡寧糸絝緔瑉梘棬案橰櫫軲軤賫膁腖飈糊煆溜湣渺碸滾瞘鈈鉕鋣銱鋥鋶鐦鐧鍩鍀鍃錇鎄鎇鎿鐝鑥鑹鑔穭鶓鶥鸌癧屙瘂臒襇繈耮顬蟎麯鮁鮃鮎鯗鯝鯴鱝鯿鰠鰵鱅鞽韝齇';}function simplized(r){for(var t="",a=0;a<r.length;a++)-1!=ftPYStr().indexOf(r.charAt(a))?t+=charPYStr().charAt(ftPYStr().indexOf(r.charAt(a))):t+=r.charAt(a);return t}

// protobuf 解析
/* prettier-ignore */
class ColorLyricsResponse$Type extends MessageType {
  constructor() {
    super("ColorLyricsResponse", [
      { no: 1, name: "lyrics", kind: "message", T: () => LyricsResponse },
      // { no: 2, name: "colors", kind: "message", T: () => ColorsResponse },
    ]);
  }
  create(e) {
    var n = {};
    return (
      globalThis.Object.defineProperty(n, MESSAGE_TYPE, {
        enumerable: !1,
        value: this,
      }),
      void 0 !== e && reflectionMergePartial(this, n, e),
      n
    );
  }
  internalBinaryRead(e, n, r, i) {
    for (var a = null != i ? i : this.create(), t = e.pos + n; e.pos < t; ) {
      var [s, l] = e.tag();
      switch (s) {
        case 1: {
          a.lyrics = LyricsResponse.internalBinaryRead(
            e,
            e.uint32(),
            r,
            a.lyrics
          );
          break;
        }
        // case 2: {
          // a.colors = ColorsResponse.internalBinaryRead(
          //   e,
          //   e.uint32(),
          //   r,
          //   a.colors
          // );
        //   break;
        // }
        default: {
          var o = r.readUnknownField;
          if ("throw" === o)
            throw new globalThis.Error(
              `Unknown field ${s}(wire type ${l})for` + this.typeName
            );
          var d = e.skip(l);
          if (o !== false)
            (o === true ? UnknownFieldHandler.onRead : o)(
              this.typeName,
              a,
              s,
              l,
              d
            );
        }
      }
    }
    return a;
  }
  internalBinaryWrite(e, n, r) {
    e.lyrics &&
      LyricsResponse.internalBinaryWrite(
        e.lyrics,
        n.tag(1, WireType.LengthDelimited).fork(),
        r
      ).join();
      
    // e.colors &&
    //   ColorsResponse.internalBinaryWrite(
    //     e.colors,
    //     n.tag(1, WireType.LengthDelimited).fork(),
    //     r
    //   ).join();  
    
    r = r.writeUnknownFields;
    return (
      !1 !== r &&
        (1 == r ? UnknownFieldHandler.onWrite : r)(this.typeName, e, n),
      n
    );
  }
}
const ColorLyricsResponse = new ColorLyricsResponse$Type();
class LyricsResponse$Type extends MessageType {
  constructor() {
    super("LyricsResponse", [
      { no: 2, name: "lines", kind: "message", repeat: 1, T: () => LyricsLine },
      {
        no: 9,
        name: "alternatives",
        kind: "message",
        repeat: 1,
        T: () => Alternative,
      },
      { no: 10, name: "language", kind: "scalar", T: 9 },
    ]);
  }
  create(e) {
    var n = { lines: [], alternatives: [], language: "" };
    return (
      globalThis.Object.defineProperty(n, MESSAGE_TYPE, {
        enumerable: !1,
        value: this,
      }),
      void 0 !== e && reflectionMergePartial(this, n, e),
      n
    );
  }
  internalBinaryRead(e, n, r, i) {
    for (var a = null != i ? i : this.create(), t = e.pos + n; e.pos < t; ) {
      var [s, l] = e.tag();
      switch (s) {
        case 2:
          a.lines.push(LyricsLine.internalBinaryRead(e, e.uint32(), r));
          break;
        case 9:
          a.alternatives.push(Alternative.internalBinaryRead(e, e.uint32(), r));
          break;
        case 10:
          a.language = e.string();
          break;
        default:
          var o = r.readUnknownField;
          if ("throw" === o)
            throw new globalThis.Error(
              `Unknown field ${s}(wire type ${l})for` + this.typeName
            );
          var d = e.skip(l);
          !1 !== o &&
            (!0 === o ? UnknownFieldHandler.onRead : o)(
              this.typeName,
              a,
              s,
              l,
              d
            );
      }
    }
    return a;
  }
  internalBinaryWrite(n, r, i) {
    for (let e = 0; e < n.lines.length; e++)
      LyricsLine.internalBinaryWrite(
        n.lines[e],
        r.tag(2, WireType.LengthDelimited).fork(),
        i
      ).join();
    for (let e = 0; e < n.alternatives.length; e++)
      Alternative.internalBinaryWrite(
        n.alternatives[e],
        r.tag(9, WireType.LengthDelimited).fork(),
        i
      ).join();
    "" !== n.language && r.tag(10, WireType.LengthDelimited).string(n.language);
    var e = i.writeUnknownFields;
    return (
      !1 !== e &&
        (1 == e ? UnknownFieldHandler.onWrite : e)(this.typeName, n, r),
      r
    );
  }
}
const LyricsResponse = new LyricsResponse$Type();
class LyricsLine$Type extends MessageType {
  constructor() {
    super("LyricsLine", [
      { no: 1, name: "startTimeMs", kind: "scalar", T: ScalarType.INT32 },
      { no: 2, name: "words", kind: "scalar", T: 9 },
    ]);
  }
  create(e) {
    var n = { words: "", startTimeMs: 0 };
    return (
      globalThis.Object.defineProperty(n, MESSAGE_TYPE, {
        enumerable: !1,
        value: this,
      }),
      void 0 !== e && reflectionMergePartial(this, n, e),
      n
    );
  }
  internalBinaryRead(reader, length, options, target) {
    const message = target ?? this.create();
    const end = reader.pos + length;
    while (reader.pos < end) {
      const [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.startTimeMs = reader.int32();
          break;
        case 2:
          message.words = reader.string();
          break;
        default:
          const u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(
              `Unknown field ${fieldNo}(wire type ${wireType})for ${this.typeName}`
            );
          const d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(
              this.typeName,
              message,
              fieldNo,
              wireType,
              d
            );
      }
    }
    return message;
  }
  internalBinaryWrite(e, n, r) {
    "" !== e.words && n.tag(2, WireType.LengthDelimited).string(e.words);
    0 !== e.startTimeMs &&
      n.tag(1, WireType.Varint).int32(Number(e.startTimeMs));

    r = r.writeUnknownFields;
    return (
      !1 !== r &&
        (1 == r ? UnknownFieldHandler.onWrite : r)(this.typeName, e, n),
      n
    );
  }
}
const LyricsLine = new LyricsLine$Type();
class Alternative$Type extends MessageType {
  constructor() {
    super("Alternative", [
      { no: 1, name: "language", kind: "scalar", T: 9 },
      { no: 2, name: "lines", kind: "scalar", repeat: 2, T: 9 },
    ]);
  }
  create(e) {
    var n = { language: "", lines: [] };
    return (
      globalThis.Object.defineProperty(n, MESSAGE_TYPE, {
        enumerable: !1,
        value: this,
      }),
      void 0 !== e && reflectionMergePartial(this, n, e),
      n
    );
  }
  internalBinaryRead(e, n, r, i) {
    for (var a = null != i ? i : this.create(), t = e.pos + n; e.pos < t; ) {
      var [s, l] = e.tag();
      switch (s) {
        case 1:
          a.language = e.string();
          break;
        case 2:
          a.lines.push(e.string());
          break;
        default:
          var o = r.readUnknownField;
          if ("throw" === o)
            throw new globalThis.Error(
              `Unknown field ${s}(wire type ${l})for` + this.typeName
            );
          var d = e.skip(l);
          !1 !== o &&
            (!0 === o ? UnknownFieldHandler.onRead : o)(
              this.typeName,
              a,
              s,
              l,
              d
            );
      }
    }
    return a;
  }
  internalBinaryWrite(n, r, e) {
    "" !== n.language && r.tag(1, WireType.LengthDelimited).string(n.language);
    for (let e = 0; e < n.lines.length; e++)
      r.tag(2, WireType.LengthDelimited).string(n.lines[e]);
    e = e.writeUnknownFields;
    return (
      !1 !== e &&
        (1 == e ? UnknownFieldHandler.onWrite : e)(this.typeName, n, r),
      r
    );
  }
}
const Alternative = new Alternative$Type();
class Colors$Type extends MessageType {
  constructor() {
    super("Colors", [
      { no: 1, name: "background", kind: "scalar", T: ScalarType.INT32 },
      { no: 2, name: "text", kind: "scalar", T: ScalarType.INT32 },
      { no: 3, name: "highlightText", kind: "scalar", T: ScalarType.INT32 },
    ]);
  }
  create(e) {
    var n = {};
    return (
      globalThis.Object.defineProperty(n, MESSAGE_TYPE, {
        enumerable: !1,
        value: this,
      }),
      void 0 !== e && reflectionMergePartial(this, n, e),
      n
    );
  }
  internalBinaryRead(reader, length, options, target) {
    const message = target ?? this.create();
    const end = reader.pos + length;
    while (reader.pos < end) {
      const [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.background = reader.int32();
          break;
        case 2:
          message.text = reader.int32();
          break;
        case 3:
          message.highlightText = reader.int32();
          break;
        default:
          const u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(
              `Unknown field ${fieldNo}(wire type ${wireType})for ${this.typeName}`
            );
          const d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(
              this.typeName,
              message,
              fieldNo,
              wireType,
              d
            );
      }
    }
    return message;
  }
  internalBinaryWrite(e, n, r) {
    e.background && n.tag(1, WireType.Varint).int32(e.background);
    e.text && n.tag(1, WireType.text).int32(e.text);
    e.highlightText && n.tag(1, WireType.Varint).int32(e.highlightText);
    r = r.writeUnknownFields;
    return (
      !1 !== r &&
        (1 == r ? UnknownFieldHandler.onWrite : r)(this.typeName, e, n),
      n
    );
  }
}
const ColorsResponse = new Colors$Type();

const Platform = {
  IOS: {
    status: 200,
    headers: {
      "x-content-type-options": "nosniff",
      "content-type": "application/vnd.google.protobuf",
      "mc-ttl": "0",
      "strict-transport-security": "max-age=31536000",
      "mc-cache-policy": "public",
      server: "envoy",
      "Alt-Svc": 'h3=":443"; ma=2592000,h3-29=":443"; ma=2592000',
      "cache-control": "public, max-age=0",
      Via: "HTTP/2 edgeproxy, 1.1 google",
    },
  },
  MAC: {
    status: 200,
    headers: {
      "access-control-allow-credentials": "true",
      "access-control-allow-methods": "DELETE,GET,PATCH,POST,PUT,OPTIONS",
      "access-control-max-age": "0",
      via: "HTTP/2 edgeproxy, 1.1 google",
      server: "envoy",
      "access-control-allow-origin": "https://xpui.app.spotify.com",
      date: "Thu, 28 Dec 2023 08:32:54 GMT",
      "access-control-allow-headers":
        "Accept,Authorization,Origin,Content-Type,Spotify-App-Version,App-Platform,X-Spotify-Connection-Id,X-Client-Id,X-Spotify-Quicksilver-Uri,client-token,content-access-token,x-cloud-trace-context",
      "alt-svc": 'h3=":443"; ma=2592000,h3-29=":443"; ma=2592000',
      vary: "Accept-Encoding",
    },
  },
};
const isIOS = ($request.headers["app-platform"]||$request.headers["App-Platform"]) === "iOS";
$.response = isIOS ? Platform.IOS : Platform.MAC;
const baseUrl = "https://spclient.wg.spotify.com/color-lyrics/v2/track/";

(async () => {
 
  if ($request.method === "OPTIONS") {
    return $.response;
  }

  let trackId = $request.url.replace(baseUrl, "");

  if (isIOS) {
    trackId = getQueryVariable("trackId");
    $request.url = `${baseUrl}${trackId}?clientLanguage=zh`;
  } else {
    trackId = trackId.split("/")[0];
  }

  if($.env.isQX){
  $request.headers["Accept"] = "application/json";
  } else{
  $request.headers["accept"] = "application/json";}
  
  let colorLyricsResponseObj = await $.http
    .get($request)
    .then((response) => response.body);

  if (!colorLyricsResponseObj) {
    $.log163("网易云歌词搜索");
    const colors = { background: -6002616, text: -16777216, highlightText: -1 };
    colors.background = Math.round(Math.random() * 10000000) * -1;

    colorLyricsResponseObj = {
      lyrics: {
        syncType: "LINE_SYNCED",
        lines: [],
        provider: "MusixMatch",
        providerLyricsId: "7752053",
        providerDisplayName: "Musixmatch",
        syncLyricsUri: "",
        isDenseTypeface: true,
        alternatives: [],
        language: "z1",
        isRtlLanguage: false,
        fullscreenAction: "FULLSCREEN_LYRICS",
        showUpsell: false,
        capStatus: "NONE",
        impressionsRemaining: 0,
      },
      colors: colors,
      hasVocalRemoval: false,
    };

    let data = {};
    try {
      data = await searchMusic(trackId);
    } catch (error) {
      console.log(error);
      throw error;
    }

    colorLyricsResponseObj.lyrics = {
      ...colorLyricsResponseObj.lyrics,
      ...data,
    };
    if (data.lines.length == 0) {
      $.log163("未找到歌词");
      throw "未找到歌词";
    }
  } else {
    colorLyricsResponseObj = JSON.parse(colorLyricsResponseObj);
  }

  const originLanguage = colorLyricsResponseObj.lyrics.language;

  if ("z1" === originLanguage) {
    console.log("歌词为中文,无需翻译");
    return getResult(colorLyricsResponseObj);
  }


  if (!options.appid || !options.securityKey) {
    console.log(notifyName, "请按备注获取百度翻译 appid 和 securityKey");
    return getResult(colorLyricsResponseObj);
  }


  console.log(`歌词语言为:${originLanguage}`);
  const { appid, securityKey } = options;
  //console.log(`appid:${appid},securityKey:${securityKey}`);

  const query = colorLyricsResponseObj.lyrics.lines
    .map((x) => x.words)
    .filter((words) => words && words !== "♪")
    .filter((v, i, a) => a.indexOf(v) === i)
    .join("\n");

  const salt = Date.now();
  const queryObj = {
    q: query,
    from: "auto",
    to: "zh",
    appid,
    salt,
    sign: md5(appid + query + salt + securityKey),
  };
  const requestBody = Object.entries(queryObj)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");

  const response = await $.http.post({
    url: "https://fanyi-api.baidu.com/api/trans/vip/translate",
    body: requestBody,
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
  });

  if (response.statusCode !== 200) throw response;

  const baiduResult = JSON.parse(response.body);
  if (!baiduResult || baiduResult.error_code)
    throw baiduResult || { error_msg: "翻译失败" };
  console.log("翻译成功");

  // 因为采用了批量翻译,如果歌词为多种语言,只会翻译其中的一种语言
  const transArr = baiduResult.trans_result
    .filter((trans) => trans.src !== trans.dst)
    .map((trans) => [trans.src, trans.dst]);
  const transMap = new Map(transArr);
  const zhWords = colorLyricsResponseObj.lyrics.lines
    .map((line) => line.words)
    .map((word) => transMap.get(word) || word || "");

  colorLyricsResponseObj.lyrics.alternatives = [
    {
      language: "z1",
      lines: zhWords,
    },
  ];

  if ($.read("autoTrans") !== "false" || $.read("autoTrans") === false) {
    const lines = [];

    colorLyricsResponseObj.lyrics.lines.forEach((line, index) => {
      lines.push(line);
      if (zhWords[index] && zhWords[index] !== "♪")
        lines.push({ ...line, words: zhWords[index] });
    });

    colorLyricsResponseObj.lyrics.lines = lines;
  }

  return getResult(colorLyricsResponseObj);
})()
  .then(() => {
    return isIOS ? $.done($.response) : $.done({ response: $.response });
  })
  .catch((e) => {
    console.log(`脚本异常：` + JSON.stringify(e));
    $.response.body = {
      lyrics: {
        lines: [
          {
            words: JSON.stringify(e) || "未找到歌词或脚本运行异常",
            startTimeMs: `0`,
          },
        ],
      },
    };
    getResult($.response.body);
    return isIOS ? $.done($.response) : $.done({ response: $.response });
  });

  
function getResult(body) {
  if (!isIOS) {
    $.response.body = JSON.stringify(body);
    return $.response;
  }
  
  let binaryBody = ColorLyricsResponse.fromBinary($response.body, {
    readUnknownField: true,
  });
  
  binaryBody.lyrics.lines = body.lyrics.lines;
  binaryBody.lyrics.alternatives = body.lyrics.alternatives;

  let result = ColorLyricsResponse.toBinary(binaryBody);
  
  if (!$.env.isQX) {
    $.response.body = result;
    return $.response;
  }

  $.response.bodyBytes = result.buffer.slice(
    result.byteOffset,
    result.byteLength + result.byteOffset
  );
  return $.response;
}

async function searchMusic(spotifyTrackId) {
  if ($.read("music163") == "false") {
    return;
  }
  $.log163("spotifyTrackId:" + spotifyTrackId);
  const cacheKey = {
    token: "spotifyToken",
    ids: "spotifyTo163Ids",
    lyics: "spotifyTo163Lyics",
  };

  $.spotifyToken = $.read(cacheKey.token) || { time: 0 };
  $.cacheIds = $.read(cacheKey.ids) || {};
  $.lyicsIds = $.read(cacheKey.lyics) || {};

  $.options = {
    clientId: $.read("clientId") || "81bfc97830af4ddb801fdce4c939fa59",
    clientSecret: $.read("clientSecret") || "e3c09842a07e4d40ae53a95e8f482324",
  };

  let lyicsData = $.lyicsIds[spotifyTrackId];
  let trackItem = $.cacheIds[spotifyTrackId];

  if (!lyicsData || $.read("cacheLyics") === "false") {
    const currentDate = new Date().getTime();
    if (parseInt(currentDate - $.spotifyToken.time) > 3600 * 1000) {
      $.spotifyToken = await getSpotifyToken($.options);
      $.log163("spotifyToken:获取成功");
      if (!$.spotifyToken.access_token) {
        $.log163(JSON.stringify($.spotifyToken));
        return {};
      } else {
        $.spotifyToken.time = new Date().getTime();
      }
      $.write($.spotifyToken, cacheKey.token);
    }

    if (!trackItem) {
      const spotifyTrack = await getSpotifyTrack(
        spotifyTrackId,
        $.spotifyToken
      );

      if (!spotifyTrack || !spotifyTrack.name) {
        $.log163(JSON.stringify(spotifyTrack));
        return {};
      }
      $.log163("spotifyTrack:获取成功");
      
      console.log(simplized(spotifyTrack.name));
      const tName = simplized(spotifyTrack.name)
          ? simplized(spotifyTrack.name)
          : spotifyTrack.name,
        tAlbumName = spotifyTrack.artists[0].name;
        
      trackItem = {
        id: [],
        tAlbumName,
        tName,
      };

      const m163Tracks = await getMusic163Tracks(tName);

      if (!m163Tracks || m163Tracks.code !== 200) {
        $.log163(JSON.stringify(m163Tracks));
        return {};
      }

      $.log163("m163Tracks:获取成功");
      
      let tracks = m163Tracks.result.songs.filter(
        (item) => {
          console.log(item.name);
          return tName === item.name;
        }
      );

      if (!tracks.length && !m163Tracks.result.songs.length) {
        return {};
      }

      if (!tracks.length) {
        tracks = m163Tracks.result.songs;
      }

      tracks = tracks.map((item) => item.id);

      $.log163("tracks size:" + tracks.length);
      trackItem.id = tracks;
      $.cacheIds[spotifyTrackId] = trackItem;
      $.write($.cacheIds, cacheKey.ids);
    }
    
    let lyics;
    if (typeof trackItem.id === "string") {
      lyics = await getMusic163Lyics(trackItem.id);
    } else {
      for (const item of trackItem.id) {
        lyics = await getMusic163Lyics(item);
        if (lyics.lrc.lyric) {
          break;
        }
      }
    }
    
    if (lyics.code !== 200) {
      $.log163(lyics);
      return {};
    }
    $.log163("m163Lyics:获取成功");
    $.lyicsIds[spotifyTrackId] = lyics.lrc.lyric;
    if ($.lyicsIds[spotifyTrackId]) {
      $.write($.lyicsIds, cacheKey.lyics);
    }
    lyicsData = lyics.lrc.lyric;
  }
  
  $.log163(trackItem);
  const lrc = formatLyirc(lyicsData);
  const result = {
    providerDisplayName: "网易云音乐",
    provider: "网易云音乐",
    providerLyricsId: "music163",
    lines: [],
    language: "en",
  };
  
  Object.keys(lrc).forEach((key) => {
    const item = lrc[key];
    try {
      if (item.indexOf(":") != -1 || [".", "。"].includes(item)) {
        return;
      }
      // $.log163(item);
      if (result.language != "z1") {
        result.language = hasChinese(item) ? "z1" : "auto";
      }
      result.lines.push({
        words: item || "♪",
        endTimeMs: "",
        syllables: [],
        startTimeMs: isIOS ? parseInt(`${key}`) : `${key}`,
      });
    } catch (e) {
      $.log163(e);
    }
  });
  return result;
}

function getSpotifyToken(params) {
  const option = {
    url: "https://accounts.spotify.com/api/token",
    body: `grant_type=client_credentials&client_id=${params.clientId}&client_secret=${params.clientSecret}`,
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
  };
  return $.http.post(option).then((response) => JSON.parse(response.body));
}

function getSpotifyTrack(mid, spotifyToken) {
  const option = {
    url: `https://api.spotify.com/v1/tracks/${mid}`,
    headers: {
      Authorization: `${spotifyToken.token_type} ${spotifyToken.access_token}`,
    },
  };
  return $.http.get(option).then((response) => JSON.parse(response.body));
}

function getMusic163Tracks(name) {
  let params = {
    s: name,
    offset: 0,
    limit: 10,
    type: 1,
  };

  params = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");

  const option = {
    url: `http://music.163.com/api/search/pc?${params}`,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 13_1_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 - mmbWebBrowse - ios",
      cookie: `NMTID=00OImW8FZYRLmd7XU5cuO6K8blcSucAAAGMoACXwQ`,
    },
  };
  return $.http.get(option).then((response) => {
    return JSON.parse(response.body);
  });
}

function getMusic163Lyics(id163) {
  const option = {
    url: `http://music.163.com/api/song/lyric?os=pc&id=${id163}&lv=-1&kv=-1&tv=-1`,
  };
  return $.http.get(option).then((response) => {
    return JSON.parse(response.body);
  });
}

function formatLyirc(str) {
  const array = str.split(`\n`).filter((item) => !!item);
  const data = {};
  array.forEach((item) => {
    try {
      const value = item.split(`]`);
      value[0] = value[0].replace(`[`, "");
      const times = value[0].split(".");
      value[0] = timeToSec(times[0]) + parseInt(times[1]);
      data[value[0]] = value[1];
    } catch (e) {
      console.log(e);
    }
  });
  return data;
}

function timeToSec(time) {
  const v = time.split(":") || [0, 0];
  var min = v[0];
  var sec = v[1];
  var s = parseInt(min * 60) + parseInt(sec);
  return s * 1000;
}

function hasChinese(str) {
  return /[\u4E00-\u9FA5]+/g.test(str);
}

function getQueryVariable(variable) {
  var query = $request.url.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}

// prettier-ignore
function ENV(){const e="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:"undefined"!=typeof $task,isLoon:"undefined"!=typeof $loon,isSurge:"undefined"!=typeof $httpClient&&"undefined"!=typeof $utils,isBrowser:"undefined"!=typeof document,isNode:"function"==typeof require&&!e,isJSBox:e,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}
// prettier-ignore
function HTTP(e={baseURL:""}){const{isQX:t,isLoon:s,isSurge:o,isScriptable:n,isNode:i,isBrowser:r}=ENV(),u=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;const a={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(h=>a[h.toLowerCase()]=(a=>(function(a,h){h="string"==typeof h?{url:h}:h;const d=e.baseURL;d&&!u.test(h.url||"")&&(h.url=d?d+h.url:h.url),h.body&&h.headers&&!h.headers["Content-Type"]&&(h.headers["Content-Type"]="application/x-www-form-urlencoded");const l=(h={...e,...h}).timeout,c={...{onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{}},...h.events};let f,p;if(c.onRequest(a,h),t)f=$task.fetch({method:a,...h});else if(s||o||i)f=new Promise((e,t)=>{(i?require("request"):$httpClient)[a.toLowerCase()](h,(s,o,n)=>{s?t(s):e({statusCode:o.status||o.statusCode,headers:o.headers,body:n})})});else if(n){const e=new Request(h.url);e.method=a,e.headers=h.headers,e.body=h.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}else r&&(f=new Promise((e,t)=>{fetch(h.url,{method:a,headers:h.headers,body:h.body}).then(e=>e.json()).then(t=>e({statusCode:t.status,headers:t.headers,body:t.data})).catch(t)}));const y=l?new Promise((e,t)=>{p=setTimeout(()=>(c.onTimeout(),t(`${a} URL: ${h.url} exceeds the timeout ${l} ms`)),l)}):null;return(y?Promise.race([y,f]).then(e=>(clearTimeout(p),e)):f).then(e=>c.onResponse(e))})(h,a))),a}
// prettier-ignore
function API(e="untitled",t=!1){const{isQX:s,isLoon:o,isSurge:n,isNode:i,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(i){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(o||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),i){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(o||n)&&$persistentStore.write(e,this.name),i&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),n||o)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);i&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n||o?$persistentStore.read(e):s?$prefs.valueForKey(e):i?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),n||o)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);i&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",a="",h={}){const d=h["open-url"],l=h["media-url"];if(s&&$notify(e,t,a,h),n&&$notification.post(e,t,a+`${l?"\n多媒体:"+l:""}`,{url:d}),o){let s={};d&&(s["openUrl"]=d),l&&(s["mediaUrl"]=l),"{}"===JSON.stringify(s)?$notification.post(e,t,a):$notification.post(e,t,a,s)}if(i||u){const s=a+(d?`\n点击跳转: ${d}`:"")+(l?`\n多媒体: ${l}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||o||n?$done(e):i&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}