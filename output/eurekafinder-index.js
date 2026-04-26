const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/js/vendor-C9WqxvgN.js","assets/css/vendor-CWXVPzG4.css","assets/js/roleService-B4OicxfU.js","assets/js/deviceInfoService-ClxmVOum.js","assets/js/dataAnalysisService-XyLwaqKJ.js","assets/js/CallbackPage-wMnBzyQR.js","assets/js/wechatAuthService-Ca_XSEDC.js","assets/js/Eureka2Page-BEbVWsnx.js","assets/js/requestManager-CNNKBBWR.js","assets/js/collectionService-DrY_cFcp.js"])))=>i.map(i=>d[i]);
import{r as N,v as Vt,j as c,X as Qi,I as Bl,C as Vl,a as $l,b as Hl,o as wa,_ as ye,u as zl,N as Gl,O as ql,c as Wl,R as Kl,d as ke,e as Zi,B as Jl,A as Xl,f as Yl}from"./vendor-C9WqxvgN.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&r(l)}).observe(document,{childList:!0,subtree:!0});function t(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(i){if(i.ep)return;i.ep=!0;const a=t(i);fetch(i.href,a)}})();const xa=N.createContext(null),zy=()=>{const n=N.useContext(xa);if(!n)throw new Error("useAppContext must be used within an AppProvider");return n},ba=Vt.createContext({showToast:()=>"",updateToast:()=>{},removeToast:()=>{}}),Ql=({children:n})=>{const[e,t]=N.useState([]),r=N.useCallback((_,S="info",T="top-center",k=3e3)=>{const A=`toast-${Date.now()}-${Math.random()}`,D=k===0;return t(P=>[...P,{id:A,message:_,type:S,position:T,persistent:D}]),k>0&&setTimeout(()=>{t(P=>P.filter(O=>O.id!==A))},k),A},[]),i=N.useCallback((_,S,T)=>{t(k=>k.map(A=>A.id===_?{...A,message:S,type:T||A.type}:A))},[]),a=N.useCallback(_=>{t(S=>S.filter(T=>T.id!==_))},[]),l=N.useMemo(()=>({showToast:r,updateToast:i,removeToast:a}),[r,i,a]),d=_=>{switch(_){case"success":return c.jsx(Hl,{size:16,className:"text-emerald-600 flex-shrink-0",strokeWidth:2});case"error":return c.jsx($l,{size:16,className:"text-rose-500 flex-shrink-0",strokeWidth:2});case"warning":return c.jsx(Vl,{size:16,className:"text-amber-500 flex-shrink-0",strokeWidth:2});default:return c.jsx(Bl,{size:16,className:"text-indigo-500 flex-shrink-0",strokeWidth:2})}},g=e.filter(_=>_.position==="top-right"),y=e.filter(_=>!_.position||_.position==="top-center");return c.jsxs(ba.Provider,{value:l,children:[n,c.jsx("div",{className:"fixed top-20 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-2.5 pointer-events-none items-center",children:y.map(_=>c.jsxs("div",{className:`
              bg-white/95 backdrop-blur-md
              border border-gray-200/60
              shadow-[0_4px_20px_rgb(0,0,0,0.06)]
              rounded-full px-4 py-2 min-w-[180px] max-w-sm
              flex items-center gap-2.5 pointer-events-auto
              animate-in slide-in-from-top-2 fade-in duration-200
              hover:shadow-[0_6px_24px_rgb(0,0,0,0.08)] transition-all
            `,children:[d(_.type),c.jsx("p",{className:"flex-1 text-xs font-medium text-gray-800 leading-tight",children:_.message}),!_.persistent&&c.jsx("button",{onClick:()=>a(_.id),className:"text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 p-0.5 rounded-full transition-all flex-shrink-0",children:c.jsx(Qi,{size:12,strokeWidth:2})})]},_.id))}),c.jsx("div",{className:"fixed top-4 right-4 z-[10000] flex flex-col gap-2.5 pointer-events-none items-end",children:g.map(_=>c.jsxs("div",{className:`
              bg-white/95 backdrop-blur-md
              border border-gray-200/60
              shadow-[0_4px_16px_rgb(0,0,0,0.06)]
              rounded-xl pl-4 pr-3 py-3 min-w-[240px] max-w-sm
              flex items-start gap-2.5 pointer-events-auto
              animate-in slide-in-from-right-4 fade-in duration-200
              hover:shadow-[0_6px_20px_rgb(0,0,0,0.08)] transition-all
              ${_.type==="error"?"border-l-2 border-l-rose-500":""}
              ${_.type==="warning"?"border-l-2 border-l-amber-500":""}
            `,children:[c.jsx("div",{className:"mt-0.5 flex-shrink-0",children:d(_.type)}),c.jsx("p",{className:"flex-1 text-xs font-medium text-gray-800 leading-snug pt-0.5",children:_.message}),c.jsx("button",{onClick:()=>a(_.id),className:"text-gray-400 hover:text-gray-600 p-0.5 rounded-lg hover:bg-gray-100/80 transition-all flex-shrink-0 -mt-0.5",children:c.jsx(Qi,{size:12,strokeWidth:2})})]},_.id))})]})},_a=()=>{const n=Vt.useContext(ba);if(!n)throw new Error("useToast must be used within ToastProvider");return n};let cn=null,Ws=null;const eo=(n=!1)=>{if(typeof window>"u")return!1;if(new URLSearchParams(window.location.search).get("force_mobile")==="1")return cn=!0,!0;const r=window.innerWidth;if(!n&&cn!==null&&Ws===r)return cn;const i=navigator.userAgent||navigator.vendor||window.opera,a=i.toLowerCase(),l="ontouchstart"in window||navigator.maxTouchPoints>0,d=/iphone|ipod|android.*mobile|phone/i.test(a);if(a.includes("ipad")||a.includes("macintosh")&&navigator.maxTouchPoints>0||a.includes("android")&&!a.includes("mobile")||l&&window.innerWidth>=768&&!d)return cn=!1,Ws=r,!1;const y=/android|webos|iphone|ipod|blackberry|iemobile|opera mini|mobile|phone/i,_=window.innerWidth<768,S=y.test(i.toLowerCase()),T=window.devicePixelRatio>=2,k="orientation"in window||"onorientationchange"in window,A=window.innerHeight>window.innerWidth,D=_||S||l&&window.innerWidth<1024||l&&T&&k||l&&A&&T;return cn=D,Ws=r,D},Zl=()=>{};var to={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const va=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let i=n.charCodeAt(r);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},eu=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const i=n[t++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const a=n[t++];e[r++]=String.fromCharCode((i&31)<<6|a&63)}else if(i>239&&i<365){const a=n[t++],l=n[t++],d=n[t++],g=((i&7)<<18|(a&63)<<12|(l&63)<<6|d&63)-65536;e[r++]=String.fromCharCode(55296+(g>>10)),e[r++]=String.fromCharCode(56320+(g&1023))}else{const a=n[t++],l=n[t++];e[r++]=String.fromCharCode((i&15)<<12|(a&63)<<6|l&63)}}return e.join("")},Ia={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<n.length;i+=3){const a=n[i],l=i+1<n.length,d=l?n[i+1]:0,g=i+2<n.length,y=g?n[i+2]:0,_=a>>2,S=(a&3)<<4|d>>4;let T=(d&15)<<2|y>>6,k=y&63;g||(k=64,l||(T=64)),r.push(t[_],t[S],t[T],t[k])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(va(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):eu(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<n.length;){const a=t[n.charAt(i++)],d=i<n.length?t[n.charAt(i)]:0;++i;const y=i<n.length?t[n.charAt(i)]:64;++i;const S=i<n.length?t[n.charAt(i)]:64;if(++i,a==null||d==null||y==null||S==null)throw new tu;const T=a<<2|d>>4;if(r.push(T),y!==64){const k=d<<4&240|y>>2;if(r.push(k),S!==64){const A=y<<6&192|S;r.push(A)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class tu extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const nu=function(n){const e=va(n);return Ia.encodeByteArray(e,!0)},ts=function(n){return nu(n).replace(/\./g,"")},Ta=function(n){try{return Ia.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function su(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ru=()=>su().__FIREBASE_DEFAULTS__,iu=()=>{if(typeof process>"u"||typeof to>"u")return;const n=to.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},ou=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Ta(n[1]);return e&&JSON.parse(e)},Sr=()=>{try{return Zl()||ru()||iu()||ou()}catch(n){`${n}`;return}},Ea=n=>{var e,t;return(t=(e=Sr())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},Sa=n=>{const e=Ea(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},Aa=()=>{var n;return(n=Sr())==null?void 0:n.config},ka=n=>{var e;return(e=Sr())==null?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class au{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $t(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Ar(n){return(await fetch(n,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Na(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",i=n.iat||0,a=n.sub||n.user_id;if(!a)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const l={iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:a,user_id:a,firebase:{sign_in_provider:"custom",identities:{}},...n};return[ts(JSON.stringify(t)),ts(JSON.stringify(l)),""].join(".")}const hn={};function cu(){const n={prod:[],emulator:[]};for(const e of Object.keys(hn))hn[e]?n.emulator.push(e):n.prod.push(e);return n}function lu(n){let e=document.getElementById(n),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",n),t=!0),{created:t,element:e}}let no=!1;function kr(n,e){if(typeof window>"u"||typeof document>"u"||!$t(window.location.host)||hn[n]===e||hn[n]||no)return;hn[n]=e;function t(T){return`__firebase__banner__${T}`}const r="__firebase__banner",a=cu().prod.length>0;function l(){const T=document.getElementById(r);T&&T.remove()}function d(T){T.style.display="flex",T.style.background="#7faaf0",T.style.position="fixed",T.style.bottom="5px",T.style.left="5px",T.style.padding=".5em",T.style.borderRadius="5px",T.style.alignItems="center"}function g(T,k){T.setAttribute("width","24"),T.setAttribute("id",k),T.setAttribute("height","24"),T.setAttribute("viewBox","0 0 24 24"),T.setAttribute("fill","none"),T.style.marginLeft="-6px"}function y(){const T=document.createElement("span");return T.style.cursor="pointer",T.style.marginLeft="16px",T.style.fontSize="24px",T.innerHTML=" &times;",T.onclick=()=>{no=!0,l()},T}function _(T,k){T.setAttribute("id",k),T.innerText="Learn more",T.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",T.setAttribute("target","__blank"),T.style.paddingLeft="5px",T.style.textDecoration="underline"}function S(){const T=lu(r),k=t("text"),A=document.getElementById(k)||document.createElement("span"),D=t("learnmore"),P=document.getElementById(D)||document.createElement("a"),O=t("preprendIcon"),M=document.getElementById(O)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(T.created){const $=T.element;d($),_(P,D);const B=y();g(M,O),$.append(M,A,P,B),document.body.appendChild($)}a?(A.innerText="Preview backend disconnected.",M.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(M.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,A.innerText="Preview backend running in this workspace."),A.setAttribute("id",k)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",S):S()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ce(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function uu(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(ce())}function du(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Pa(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function hu(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function fu(){const n=ce();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Ca(){try{return typeof indexedDB=="object"}catch{return!1}}function Ra(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var a;e(((a=i.error)==null?void 0:a.message)||"")}}catch(t){e(t)}})}function gu(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pu="FirebaseError";class xe extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=pu,Object.setPrototypeOf(this,xe.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,St.prototype.create)}}class St{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},i=`${this.service}/${e}`,a=this.errors[e],l=a?mu(a,r):"Error",d=`${this.serviceName}: ${l} (${i}).`;return new xe(i,d,r)}}function mu(n,e){return n.replace(yu,(t,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const yu=/\{\$([^}]+)}/g;function wu(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function it(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const i of t){if(!r.includes(i))return!1;const a=n[i],l=e[i];if(so(a)&&so(l)){if(!it(a,l))return!1}else if(a!==l)return!1}for(const i of r)if(!t.includes(i))return!1;return!0}function so(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _n(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function xu(n,e){const t=new bu(n,e);return t.subscribe.bind(t)}class bu{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let i;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");_u(e,["next","error","complete"])?i=e:i={next:e,error:t,complete:r},i.next===void 0&&(i.next=Ks),i.error===void 0&&(i.error=Ks),i.complete===void 0&&(i.complete=Ks);const a=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),a}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function _u(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function Ks(){}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vu=1e3,Iu=2,Tu=14400*1e3,Eu=.5;function ro(n,e=vu,t=Iu){const r=e*Math.pow(t,n),i=Math.round(Eu*r*(Math.random()-.5)*2);return Math.min(Tu,r+i)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fe(n){return n&&n._delegate?n._delegate:n}class we{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gt="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Su{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new au;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:t});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(i){if(r)return null;throw i}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(ku(e))try{this.getOrInitializeService({instanceIdentifier:gt})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(t);try{const a=this.getOrInitializeService({instanceIdentifier:i});r.resolve(a)}catch{}}}}clearInstance(e=gt){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=gt){return this.instances.has(e)}getOptions(e=gt){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[a,l]of this.instancesDeferred.entries()){const d=this.normalizeInstanceIdentifier(a);r===d&&l.resolve(i)}return i}onInit(e,t){const r=this.normalizeInstanceIdentifier(t),i=this.onInitCallbacks.get(r)??new Set;i.add(e),this.onInitCallbacks.set(r,i);const a=this.instances.get(r);return a&&e(a,r),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const i of r)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Au(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=gt){return this.component?this.component.multipleInstances?e:gt:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Au(n){return n===gt?void 0:n}function ku(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nu{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Su(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var J;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(J||(J={}));const Pu={debug:J.DEBUG,verbose:J.VERBOSE,info:J.INFO,warn:J.WARN,error:J.ERROR,silent:J.SILENT},Cu=J.INFO,Ru={[J.DEBUG]:"log",[J.VERBOSE]:"log",[J.INFO]:"info",[J.WARN]:"warn",[J.ERROR]:"error"},Du=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),i=Ru[e];if(i)console[i](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class fs{constructor(e){this.name=e,this._logLevel=Cu,this._logHandler=Du,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in J))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Pu[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,J.DEBUG,...e),this._logHandler(this,J.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,J.VERBOSE,...e),this._logHandler(this,J.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,J.INFO,...e),this._logHandler(this,J.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,J.WARN,...e),this._logHandler(this,J.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,J.ERROR,...e),this._logHandler(this,J.ERROR,...e)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ju{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(Ou(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function Ou(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const dr="@firebase/app",io="0.14.6";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Be=new fs("@firebase/app"),Lu="@firebase/app-compat",Mu="@firebase/analytics-compat",Fu="@firebase/analytics",Uu="@firebase/app-check-compat",Bu="@firebase/app-check",Vu="@firebase/auth",$u="@firebase/auth-compat",Hu="@firebase/database",zu="@firebase/data-connect",Gu="@firebase/database-compat",qu="@firebase/functions",Wu="@firebase/functions-compat",Ku="@firebase/installations",Ju="@firebase/installations-compat",Xu="@firebase/messaging",Yu="@firebase/messaging-compat",Qu="@firebase/performance",Zu="@firebase/performance-compat",ed="@firebase/remote-config",td="@firebase/remote-config-compat",nd="@firebase/storage",sd="@firebase/storage-compat",rd="@firebase/firestore",id="@firebase/ai",od="@firebase/firestore-compat",ad="firebase",cd="12.6.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hr="[DEFAULT]",ld={[dr]:"fire-core",[Lu]:"fire-core-compat",[Fu]:"fire-analytics",[Mu]:"fire-analytics-compat",[Bu]:"fire-app-check",[Uu]:"fire-app-check-compat",[Vu]:"fire-auth",[$u]:"fire-auth-compat",[Hu]:"fire-rtdb",[zu]:"fire-data-connect",[Gu]:"fire-rtdb-compat",[qu]:"fire-fn",[Wu]:"fire-fn-compat",[Ku]:"fire-iid",[Ju]:"fire-iid-compat",[Xu]:"fire-fcm",[Yu]:"fire-fcm-compat",[Qu]:"fire-perf",[Zu]:"fire-perf-compat",[ed]:"fire-rc",[td]:"fire-rc-compat",[nd]:"fire-gcs",[sd]:"fire-gcs-compat",[rd]:"fire-fst",[od]:"fire-fst-compat",[id]:"fire-vertex","fire-js":"fire-js",[ad]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yn=new Map,ud=new Map,fr=new Map;function oo(n,e){try{n.container.addComponent(e)}catch(t){Be.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Ee(n){const e=n.name;if(fr.has(e))return Be.debug(`There were multiple attempts to register component ${e}.`),!1;fr.set(e,n);for(const t of yn.values())oo(t,n);for(const t of ud.values())oo(t,n);return!0}function ct(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function _e(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dd={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},st=new St("app","Firebase",dd);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hd{constructor(e,t,r){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new we("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw st.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const At=cd;function Nr(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r={name:hr,automaticDataCollectionEnabled:!0,...e},i=r.name;if(typeof i!="string"||!i)throw st.create("bad-app-name",{appName:String(i)});if(t||(t=Aa()),!t)throw st.create("no-options");const a=yn.get(i);if(a){if(it(t,a.options)&&it(r,a.config))return a;throw st.create("duplicate-app",{appName:i})}const l=new Nu(i);for(const g of fr.values())l.addComponent(g);const d=new hd(t,r,l);return yn.set(i,d),d}function gs(n=hr){const e=yn.get(n);if(!e&&n===hr&&Aa())return Nr();if(!e)throw st.create("no-app",{appName:n});return e}function Da(){return Array.from(yn.values())}function de(n,e,t){let r=ld[n]??n;t&&(r+=`-${t}`);const i=r.match(/\s|\//),a=e.match(/\s|\//);if(i||a){const l=[`Unable to register library "${r}" with version "${e}":`];i&&l.push(`library name "${r}" contains illegal characters (whitespace or "/")`),i&&a&&l.push("and"),a&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Be.warn(l.join(" "));return}Ee(new we(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fd="firebase-heartbeat-database",gd=1,wn="firebase-heartbeat-store";let Js=null;function ja(){return Js||(Js=wa(fd,gd,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(wn)}catch(t){console.warn(t)}}}}).catch(n=>{throw st.create("idb-open",{originalErrorMessage:n.message})})),Js}async function pd(n){try{const t=(await ja()).transaction(wn),r=await t.objectStore(wn).get(Oa(n));return await t.done,r}catch(e){if(e instanceof xe)Be.warn(e.message);else{const t=st.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Be.warn(t.message)}}}async function ao(n,e){try{const r=(await ja()).transaction(wn,"readwrite");await r.objectStore(wn).put(e,Oa(n)),await r.done}catch(t){if(t instanceof xe)Be.warn(t.message);else{const r=st.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Be.warn(r.message)}}}function Oa(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const md=1024,yd=30;class wd{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new bd(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),a=co();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===a||this._heartbeatsCache.heartbeats.some(l=>l.date===a))return;if(this._heartbeatsCache.heartbeats.push({date:a,agent:i}),this._heartbeatsCache.heartbeats.length>yd){const l=_d(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(l,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){Be.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=co(),{heartbeatsToSend:r,unsentEntries:i}=xd(this._heartbeatsCache.heartbeats),a=ts(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),a}catch(t){return Be.warn(t),""}}}function co(){return new Date().toISOString().substring(0,10)}function xd(n,e=md){const t=[];let r=n.slice();for(const i of n){const a=t.find(l=>l.agent===i.agent);if(a){if(a.dates.push(i.date),lo(t)>e){a.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),lo(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class bd{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Ca()?Ra().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await pd(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return ao(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return ao(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function lo(n){return ts(JSON.stringify({version:2,heartbeats:n})).length}function _d(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vd(n){Ee(new we("platform-logger",e=>new ju(e),"PRIVATE")),Ee(new we("heartbeat",e=>new wd(e),"PRIVATE")),de(dr,io,n),de(dr,io,"esm2020"),de("fire-js","")}vd("");var Id="firebase",Td="12.7.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */de(Id,Td,"app");var uo=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Pr;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(b,p){function m(){}m.prototype=p.prototype,b.F=p.prototype,b.prototype=new m,b.prototype.constructor=b,b.D=function(x,w,v){for(var f=Array(arguments.length-2),L=2;L<arguments.length;L++)f[L-2]=arguments[L];return p.prototype[w].apply(x,f)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,t),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(b,p,m){m||(m=0);const x=Array(16);if(typeof p=="string")for(var w=0;w<16;++w)x[w]=p.charCodeAt(m++)|p.charCodeAt(m++)<<8|p.charCodeAt(m++)<<16|p.charCodeAt(m++)<<24;else for(w=0;w<16;++w)x[w]=p[m++]|p[m++]<<8|p[m++]<<16|p[m++]<<24;p=b.g[0],m=b.g[1],w=b.g[2];let v=b.g[3],f;f=p+(v^m&(w^v))+x[0]+3614090360&4294967295,p=m+(f<<7&4294967295|f>>>25),f=v+(w^p&(m^w))+x[1]+3905402710&4294967295,v=p+(f<<12&4294967295|f>>>20),f=w+(m^v&(p^m))+x[2]+606105819&4294967295,w=v+(f<<17&4294967295|f>>>15),f=m+(p^w&(v^p))+x[3]+3250441966&4294967295,m=w+(f<<22&4294967295|f>>>10),f=p+(v^m&(w^v))+x[4]+4118548399&4294967295,p=m+(f<<7&4294967295|f>>>25),f=v+(w^p&(m^w))+x[5]+1200080426&4294967295,v=p+(f<<12&4294967295|f>>>20),f=w+(m^v&(p^m))+x[6]+2821735955&4294967295,w=v+(f<<17&4294967295|f>>>15),f=m+(p^w&(v^p))+x[7]+4249261313&4294967295,m=w+(f<<22&4294967295|f>>>10),f=p+(v^m&(w^v))+x[8]+1770035416&4294967295,p=m+(f<<7&4294967295|f>>>25),f=v+(w^p&(m^w))+x[9]+2336552879&4294967295,v=p+(f<<12&4294967295|f>>>20),f=w+(m^v&(p^m))+x[10]+4294925233&4294967295,w=v+(f<<17&4294967295|f>>>15),f=m+(p^w&(v^p))+x[11]+2304563134&4294967295,m=w+(f<<22&4294967295|f>>>10),f=p+(v^m&(w^v))+x[12]+1804603682&4294967295,p=m+(f<<7&4294967295|f>>>25),f=v+(w^p&(m^w))+x[13]+4254626195&4294967295,v=p+(f<<12&4294967295|f>>>20),f=w+(m^v&(p^m))+x[14]+2792965006&4294967295,w=v+(f<<17&4294967295|f>>>15),f=m+(p^w&(v^p))+x[15]+1236535329&4294967295,m=w+(f<<22&4294967295|f>>>10),f=p+(w^v&(m^w))+x[1]+4129170786&4294967295,p=m+(f<<5&4294967295|f>>>27),f=v+(m^w&(p^m))+x[6]+3225465664&4294967295,v=p+(f<<9&4294967295|f>>>23),f=w+(p^m&(v^p))+x[11]+643717713&4294967295,w=v+(f<<14&4294967295|f>>>18),f=m+(v^p&(w^v))+x[0]+3921069994&4294967295,m=w+(f<<20&4294967295|f>>>12),f=p+(w^v&(m^w))+x[5]+3593408605&4294967295,p=m+(f<<5&4294967295|f>>>27),f=v+(m^w&(p^m))+x[10]+38016083&4294967295,v=p+(f<<9&4294967295|f>>>23),f=w+(p^m&(v^p))+x[15]+3634488961&4294967295,w=v+(f<<14&4294967295|f>>>18),f=m+(v^p&(w^v))+x[4]+3889429448&4294967295,m=w+(f<<20&4294967295|f>>>12),f=p+(w^v&(m^w))+x[9]+568446438&4294967295,p=m+(f<<5&4294967295|f>>>27),f=v+(m^w&(p^m))+x[14]+3275163606&4294967295,v=p+(f<<9&4294967295|f>>>23),f=w+(p^m&(v^p))+x[3]+4107603335&4294967295,w=v+(f<<14&4294967295|f>>>18),f=m+(v^p&(w^v))+x[8]+1163531501&4294967295,m=w+(f<<20&4294967295|f>>>12),f=p+(w^v&(m^w))+x[13]+2850285829&4294967295,p=m+(f<<5&4294967295|f>>>27),f=v+(m^w&(p^m))+x[2]+4243563512&4294967295,v=p+(f<<9&4294967295|f>>>23),f=w+(p^m&(v^p))+x[7]+1735328473&4294967295,w=v+(f<<14&4294967295|f>>>18),f=m+(v^p&(w^v))+x[12]+2368359562&4294967295,m=w+(f<<20&4294967295|f>>>12),f=p+(m^w^v)+x[5]+4294588738&4294967295,p=m+(f<<4&4294967295|f>>>28),f=v+(p^m^w)+x[8]+2272392833&4294967295,v=p+(f<<11&4294967295|f>>>21),f=w+(v^p^m)+x[11]+1839030562&4294967295,w=v+(f<<16&4294967295|f>>>16),f=m+(w^v^p)+x[14]+4259657740&4294967295,m=w+(f<<23&4294967295|f>>>9),f=p+(m^w^v)+x[1]+2763975236&4294967295,p=m+(f<<4&4294967295|f>>>28),f=v+(p^m^w)+x[4]+1272893353&4294967295,v=p+(f<<11&4294967295|f>>>21),f=w+(v^p^m)+x[7]+4139469664&4294967295,w=v+(f<<16&4294967295|f>>>16),f=m+(w^v^p)+x[10]+3200236656&4294967295,m=w+(f<<23&4294967295|f>>>9),f=p+(m^w^v)+x[13]+681279174&4294967295,p=m+(f<<4&4294967295|f>>>28),f=v+(p^m^w)+x[0]+3936430074&4294967295,v=p+(f<<11&4294967295|f>>>21),f=w+(v^p^m)+x[3]+3572445317&4294967295,w=v+(f<<16&4294967295|f>>>16),f=m+(w^v^p)+x[6]+76029189&4294967295,m=w+(f<<23&4294967295|f>>>9),f=p+(m^w^v)+x[9]+3654602809&4294967295,p=m+(f<<4&4294967295|f>>>28),f=v+(p^m^w)+x[12]+3873151461&4294967295,v=p+(f<<11&4294967295|f>>>21),f=w+(v^p^m)+x[15]+530742520&4294967295,w=v+(f<<16&4294967295|f>>>16),f=m+(w^v^p)+x[2]+3299628645&4294967295,m=w+(f<<23&4294967295|f>>>9),f=p+(w^(m|~v))+x[0]+4096336452&4294967295,p=m+(f<<6&4294967295|f>>>26),f=v+(m^(p|~w))+x[7]+1126891415&4294967295,v=p+(f<<10&4294967295|f>>>22),f=w+(p^(v|~m))+x[14]+2878612391&4294967295,w=v+(f<<15&4294967295|f>>>17),f=m+(v^(w|~p))+x[5]+4237533241&4294967295,m=w+(f<<21&4294967295|f>>>11),f=p+(w^(m|~v))+x[12]+1700485571&4294967295,p=m+(f<<6&4294967295|f>>>26),f=v+(m^(p|~w))+x[3]+2399980690&4294967295,v=p+(f<<10&4294967295|f>>>22),f=w+(p^(v|~m))+x[10]+4293915773&4294967295,w=v+(f<<15&4294967295|f>>>17),f=m+(v^(w|~p))+x[1]+2240044497&4294967295,m=w+(f<<21&4294967295|f>>>11),f=p+(w^(m|~v))+x[8]+1873313359&4294967295,p=m+(f<<6&4294967295|f>>>26),f=v+(m^(p|~w))+x[15]+4264355552&4294967295,v=p+(f<<10&4294967295|f>>>22),f=w+(p^(v|~m))+x[6]+2734768916&4294967295,w=v+(f<<15&4294967295|f>>>17),f=m+(v^(w|~p))+x[13]+1309151649&4294967295,m=w+(f<<21&4294967295|f>>>11),f=p+(w^(m|~v))+x[4]+4149444226&4294967295,p=m+(f<<6&4294967295|f>>>26),f=v+(m^(p|~w))+x[11]+3174756917&4294967295,v=p+(f<<10&4294967295|f>>>22),f=w+(p^(v|~m))+x[2]+718787259&4294967295,w=v+(f<<15&4294967295|f>>>17),f=m+(v^(w|~p))+x[9]+3951481745&4294967295,b.g[0]=b.g[0]+p&4294967295,b.g[1]=b.g[1]+(w+(f<<21&4294967295|f>>>11))&4294967295,b.g[2]=b.g[2]+w&4294967295,b.g[3]=b.g[3]+v&4294967295}r.prototype.v=function(b,p){p===void 0&&(p=b.length);const m=p-this.blockSize,x=this.C;let w=this.h,v=0;for(;v<p;){if(w==0)for(;v<=m;)i(this,b,v),v+=this.blockSize;if(typeof b=="string"){for(;v<p;)if(x[w++]=b.charCodeAt(v++),w==this.blockSize){i(this,x),w=0;break}}else for(;v<p;)if(x[w++]=b[v++],w==this.blockSize){i(this,x),w=0;break}}this.h=w,this.o+=p},r.prototype.A=function(){var b=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);b[0]=128;for(var p=1;p<b.length-8;++p)b[p]=0;p=this.o*8;for(var m=b.length-8;m<b.length;++m)b[m]=p&255,p/=256;for(this.v(b),b=Array(16),p=0,m=0;m<4;++m)for(let x=0;x<32;x+=8)b[p++]=this.g[m]>>>x&255;return b};function a(b,p){var m=d;return Object.prototype.hasOwnProperty.call(m,b)?m[b]:m[b]=p(b)}function l(b,p){this.h=p;const m=[];let x=!0;for(let w=b.length-1;w>=0;w--){const v=b[w]|0;x&&v==p||(m[w]=v,x=!1)}this.g=m}var d={};function g(b){return-128<=b&&b<128?a(b,function(p){return new l([p|0],p<0?-1:0)}):new l([b|0],b<0?-1:0)}function y(b){if(isNaN(b)||!isFinite(b))return S;if(b<0)return P(y(-b));const p=[];let m=1;for(let x=0;b>=m;x++)p[x]=b/m|0,m*=4294967296;return new l(p,0)}function _(b,p){if(b.length==0)throw Error("number format error: empty string");if(p=p||10,p<2||36<p)throw Error("radix out of range: "+p);if(b.charAt(0)=="-")return P(_(b.substring(1),p));if(b.indexOf("-")>=0)throw Error('number format error: interior "-" character');const m=y(Math.pow(p,8));let x=S;for(let v=0;v<b.length;v+=8){var w=Math.min(8,b.length-v);const f=parseInt(b.substring(v,v+w),p);w<8?(w=y(Math.pow(p,w)),x=x.j(w).add(y(f))):(x=x.j(m),x=x.add(y(f)))}return x}var S=g(0),T=g(1),k=g(16777216);n=l.prototype,n.m=function(){if(D(this))return-P(this).m();let b=0,p=1;for(let m=0;m<this.g.length;m++){const x=this.i(m);b+=(x>=0?x:4294967296+x)*p,p*=4294967296}return b},n.toString=function(b){if(b=b||10,b<2||36<b)throw Error("radix out of range: "+b);if(A(this))return"0";if(D(this))return"-"+P(this).toString(b);const p=y(Math.pow(b,6));var m=this;let x="";for(;;){const w=B(m,p).g;m=O(m,w.j(p));let v=((m.g.length>0?m.g[0]:m.h)>>>0).toString(b);if(m=w,A(m))return v+x;for(;v.length<6;)v="0"+v;x=v+x}},n.i=function(b){return b<0?0:b<this.g.length?this.g[b]:this.h};function A(b){if(b.h!=0)return!1;for(let p=0;p<b.g.length;p++)if(b.g[p]!=0)return!1;return!0}function D(b){return b.h==-1}n.l=function(b){return b=O(this,b),D(b)?-1:A(b)?0:1};function P(b){const p=b.g.length,m=[];for(let x=0;x<p;x++)m[x]=~b.g[x];return new l(m,~b.h).add(T)}n.abs=function(){return D(this)?P(this):this},n.add=function(b){const p=Math.max(this.g.length,b.g.length),m=[];let x=0;for(let w=0;w<=p;w++){let v=x+(this.i(w)&65535)+(b.i(w)&65535),f=(v>>>16)+(this.i(w)>>>16)+(b.i(w)>>>16);x=f>>>16,v&=65535,f&=65535,m[w]=f<<16|v}return new l(m,m[m.length-1]&-2147483648?-1:0)};function O(b,p){return b.add(P(p))}n.j=function(b){if(A(this)||A(b))return S;if(D(this))return D(b)?P(this).j(P(b)):P(P(this).j(b));if(D(b))return P(this.j(P(b)));if(this.l(k)<0&&b.l(k)<0)return y(this.m()*b.m());const p=this.g.length+b.g.length,m=[];for(var x=0;x<2*p;x++)m[x]=0;for(x=0;x<this.g.length;x++)for(let w=0;w<b.g.length;w++){const v=this.i(x)>>>16,f=this.i(x)&65535,L=b.i(w)>>>16,j=b.i(w)&65535;m[2*x+2*w]+=f*j,M(m,2*x+2*w),m[2*x+2*w+1]+=v*j,M(m,2*x+2*w+1),m[2*x+2*w+1]+=f*L,M(m,2*x+2*w+1),m[2*x+2*w+2]+=v*L,M(m,2*x+2*w+2)}for(b=0;b<p;b++)m[b]=m[2*b+1]<<16|m[2*b];for(b=p;b<2*p;b++)m[b]=0;return new l(m,0)};function M(b,p){for(;(b[p]&65535)!=b[p];)b[p+1]+=b[p]>>>16,b[p]&=65535,p++}function $(b,p){this.g=b,this.h=p}function B(b,p){if(A(p))throw Error("division by zero");if(A(b))return new $(S,S);if(D(b))return p=B(P(b),p),new $(P(p.g),P(p.h));if(D(p))return p=B(b,P(p)),new $(P(p.g),p.h);if(b.g.length>30){if(D(b)||D(p))throw Error("slowDivide_ only works with positive integers.");for(var m=T,x=p;x.l(b)<=0;)m=H(m),x=H(x);var w=z(m,1),v=z(x,1);for(x=z(x,2),m=z(m,2);!A(x);){var f=v.add(x);f.l(b)<=0&&(w=w.add(m),v=f),x=z(x,1),m=z(m,1)}return p=O(b,w.j(p)),new $(w,p)}for(w=S;b.l(p)>=0;){for(m=Math.max(1,Math.floor(b.m()/p.m())),x=Math.ceil(Math.log(m)/Math.LN2),x=x<=48?1:Math.pow(2,x-48),v=y(m),f=v.j(p);D(f)||f.l(b)>0;)m-=x,v=y(m),f=v.j(p);A(v)&&(v=T),w=w.add(v),b=O(b,f)}return new $(w,b)}n.B=function(b){return B(this,b).h},n.and=function(b){const p=Math.max(this.g.length,b.g.length),m=[];for(let x=0;x<p;x++)m[x]=this.i(x)&b.i(x);return new l(m,this.h&b.h)},n.or=function(b){const p=Math.max(this.g.length,b.g.length),m=[];for(let x=0;x<p;x++)m[x]=this.i(x)|b.i(x);return new l(m,this.h|b.h)},n.xor=function(b){const p=Math.max(this.g.length,b.g.length),m=[];for(let x=0;x<p;x++)m[x]=this.i(x)^b.i(x);return new l(m,this.h^b.h)};function H(b){const p=b.g.length+1,m=[];for(let x=0;x<p;x++)m[x]=b.i(x)<<1|b.i(x-1)>>>31;return new l(m,b.h)}function z(b,p){const m=p>>5;p%=32;const x=b.g.length-m,w=[];for(let v=0;v<x;v++)w[v]=p>0?b.i(v+m)>>>p|b.i(v+m+1)<<32-p:b.i(v+m);return new l(w,b.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,l.prototype.add=l.prototype.add,l.prototype.multiply=l.prototype.j,l.prototype.modulo=l.prototype.B,l.prototype.compare=l.prototype.l,l.prototype.toNumber=l.prototype.m,l.prototype.toString=l.prototype.toString,l.prototype.getBits=l.prototype.i,l.fromNumber=y,l.fromString=_,Pr=l}).apply(typeof uo<"u"?uo:typeof self<"u"?self:typeof window<"u"?window:{});var Bn=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};(function(){var n,e=Object.defineProperty;function t(s){s=[typeof globalThis=="object"&&globalThis,s,typeof window=="object"&&window,typeof self=="object"&&self,typeof Bn=="object"&&Bn];for(var o=0;o<s.length;++o){var u=s[o];if(u&&u.Math==Math)return u}throw Error("Cannot find global object")}var r=t(this);function i(s,o){if(o)e:{var u=r;s=s.split(".");for(var h=0;h<s.length-1;h++){var I=s[h];if(!(I in u))break e;u=u[I]}s=s[s.length-1],h=u[s],o=o(h),o!=h&&o!=null&&e(u,s,{configurable:!0,writable:!0,value:o})}}i("Symbol.dispose",function(s){return s||Symbol("Symbol.dispose")}),i("Array.prototype.values",function(s){return s||function(){return this[Symbol.iterator]()}}),i("Object.entries",function(s){return s||function(o){var u=[],h;for(h in o)Object.prototype.hasOwnProperty.call(o,h)&&u.push([h,o[h]]);return u}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},l=this||self;function d(s){var o=typeof s;return o=="object"&&s!=null||o=="function"}function g(s,o,u){return s.call.apply(s.bind,arguments)}function y(s,o,u){return y=g,y.apply(null,arguments)}function _(s,o){var u=Array.prototype.slice.call(arguments,1);return function(){var h=u.slice();return h.push.apply(h,arguments),s.apply(this,h)}}function S(s,o){function u(){}u.prototype=o.prototype,s.Z=o.prototype,s.prototype=new u,s.prototype.constructor=s,s.Ob=function(h,I,E){for(var R=Array(arguments.length-2),V=2;V<arguments.length;V++)R[V-2]=arguments[V];return o.prototype[I].apply(h,R)}}var T=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?s=>s&&AsyncContext.Snapshot.wrap(s):s=>s;function k(s){const o=s.length;if(o>0){const u=Array(o);for(let h=0;h<o;h++)u[h]=s[h];return u}return[]}function A(s,o){for(let h=1;h<arguments.length;h++){const I=arguments[h];var u=typeof I;if(u=u!="object"?u:I?Array.isArray(I)?"array":u:"null",u=="array"||u=="object"&&typeof I.length=="number"){u=s.length||0;const E=I.length||0;s.length=u+E;for(let R=0;R<E;R++)s[u+R]=I[R]}else s.push(I)}}class D{constructor(o,u){this.i=o,this.j=u,this.h=0,this.g=null}get(){let o;return this.h>0?(this.h--,o=this.g,this.g=o.next,o.next=null):o=this.i(),o}}function P(s){l.setTimeout(()=>{throw s},0)}function O(){var s=b;let o=null;return s.g&&(o=s.g,s.g=s.g.next,s.g||(s.h=null),o.next=null),o}class M{constructor(){this.h=this.g=null}add(o,u){const h=$.get();h.set(o,u),this.h?this.h.next=h:this.g=h,this.h=h}}var $=new D(()=>new B,s=>s.reset());class B{constructor(){this.next=this.g=this.h=null}set(o,u){this.h=o,this.g=u,this.next=null}reset(){this.next=this.g=this.h=null}}let H,z=!1,b=new M,p=()=>{const s=Promise.resolve(void 0);H=()=>{s.then(m)}};function m(){for(var s;s=O();){try{s.h.call(s.g)}catch(u){P(u)}var o=$;o.j(s),o.h<100&&(o.h++,s.next=o.g,o.g=s)}z=!1}function x(){this.u=this.u,this.C=this.C}x.prototype.u=!1,x.prototype.dispose=function(){this.u||(this.u=!0,this.N())},x.prototype[Symbol.dispose]=function(){this.dispose()},x.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function w(s,o){this.type=s,this.g=this.target=o,this.defaultPrevented=!1}w.prototype.h=function(){this.defaultPrevented=!0};var v=(function(){if(!l.addEventListener||!Object.defineProperty)return!1;var s=!1,o=Object.defineProperty({},"passive",{get:function(){s=!0}});try{const u=()=>{};l.addEventListener("test",u,o),l.removeEventListener("test",u,o)}catch{}return s})();function f(s){return/^[\s\xa0]*$/.test(s)}function L(s,o){w.call(this,s?s.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,s&&this.init(s,o)}S(L,w),L.prototype.init=function(s,o){const u=this.type=s.type,h=s.changedTouches&&s.changedTouches.length?s.changedTouches[0]:null;this.target=s.target||s.srcElement,this.g=o,o=s.relatedTarget,o||(u=="mouseover"?o=s.fromElement:u=="mouseout"&&(o=s.toElement)),this.relatedTarget=o,h?(this.clientX=h.clientX!==void 0?h.clientX:h.pageX,this.clientY=h.clientY!==void 0?h.clientY:h.pageY,this.screenX=h.screenX||0,this.screenY=h.screenY||0):(this.clientX=s.clientX!==void 0?s.clientX:s.pageX,this.clientY=s.clientY!==void 0?s.clientY:s.pageY,this.screenX=s.screenX||0,this.screenY=s.screenY||0),this.button=s.button,this.key=s.key||"",this.ctrlKey=s.ctrlKey,this.altKey=s.altKey,this.shiftKey=s.shiftKey,this.metaKey=s.metaKey,this.pointerId=s.pointerId||0,this.pointerType=s.pointerType,this.state=s.state,this.i=s,s.defaultPrevented&&L.Z.h.call(this)},L.prototype.h=function(){L.Z.h.call(this);const s=this.i;s.preventDefault?s.preventDefault():s.returnValue=!1};var j="closure_listenable_"+(Math.random()*1e6|0),le=0;function C(s,o,u,h,I){this.listener=s,this.proxy=null,this.src=o,this.type=u,this.capture=!!h,this.ha=I,this.key=++le,this.da=this.fa=!1}function U(s){s.da=!0,s.listener=null,s.proxy=null,s.src=null,s.ha=null}function ge(s,o,u){for(const h in s)o.call(u,s[h],h,s)}function lt(s,o){for(const u in s)o.call(void 0,s[u],u,s)}function Zr(s){const o={};for(const u in s)o[u]=s[u];return o}const ei="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function ti(s,o){let u,h;for(let I=1;I<arguments.length;I++){h=arguments[I];for(u in h)s[u]=h[u];for(let E=0;E<ei.length;E++)u=ei[E],Object.prototype.hasOwnProperty.call(h,u)&&(s[u]=h[u])}}function Pn(s){this.src=s,this.g={},this.h=0}Pn.prototype.add=function(s,o,u,h,I){const E=s.toString();s=this.g[E],s||(s=this.g[E]=[],this.h++);const R=vs(s,o,h,I);return R>-1?(o=s[R],u||(o.fa=!1)):(o=new C(o,this.src,E,!!h,I),o.fa=u,s.push(o)),o};function _s(s,o){const u=o.type;if(u in s.g){var h=s.g[u],I=Array.prototype.indexOf.call(h,o,void 0),E;(E=I>=0)&&Array.prototype.splice.call(h,I,1),E&&(U(o),s.g[u].length==0&&(delete s.g[u],s.h--))}}function vs(s,o,u,h){for(let I=0;I<s.length;++I){const E=s[I];if(!E.da&&E.listener==o&&E.capture==!!u&&E.ha==h)return I}return-1}var Is="closure_lm_"+(Math.random()*1e6|0),Ts={};function ni(s,o,u,h,I){if(Array.isArray(o)){for(let E=0;E<o.length;E++)ni(s,o[E],u,h,I);return null}return u=ii(u),s&&s[j]?s.J(o,u,d(h)?!!h.capture:!1,I):ll(s,o,u,!1,h,I)}function ll(s,o,u,h,I,E){if(!o)throw Error("Invalid event type");const R=d(I)?!!I.capture:!!I;let V=Ss(s);if(V||(s[Is]=V=new Pn(s)),u=V.add(o,u,h,R,E),u.proxy)return u;if(h=ul(),u.proxy=h,h.src=s,h.listener=u,s.addEventListener)v||(I=R),I===void 0&&(I=!1),s.addEventListener(o.toString(),h,I);else if(s.attachEvent)s.attachEvent(ri(o.toString()),h);else if(s.addListener&&s.removeListener)s.addListener(h);else throw Error("addEventListener and attachEvent are unavailable.");return u}function ul(){function s(u){return o.call(s.src,s.listener,u)}const o=dl;return s}function si(s,o,u,h,I){if(Array.isArray(o))for(var E=0;E<o.length;E++)si(s,o[E],u,h,I);else h=d(h)?!!h.capture:!!h,u=ii(u),s&&s[j]?(s=s.i,E=String(o).toString(),E in s.g&&(o=s.g[E],u=vs(o,u,h,I),u>-1&&(U(o[u]),Array.prototype.splice.call(o,u,1),o.length==0&&(delete s.g[E],s.h--)))):s&&(s=Ss(s))&&(o=s.g[o.toString()],s=-1,o&&(s=vs(o,u,h,I)),(u=s>-1?o[s]:null)&&Es(u))}function Es(s){if(typeof s!="number"&&s&&!s.da){var o=s.src;if(o&&o[j])_s(o.i,s);else{var u=s.type,h=s.proxy;o.removeEventListener?o.removeEventListener(u,h,s.capture):o.detachEvent?o.detachEvent(ri(u),h):o.addListener&&o.removeListener&&o.removeListener(h),(u=Ss(o))?(_s(u,s),u.h==0&&(u.src=null,o[Is]=null)):U(s)}}}function ri(s){return s in Ts?Ts[s]:Ts[s]="on"+s}function dl(s,o){if(s.da)s=!0;else{o=new L(o,this);const u=s.listener,h=s.ha||s.src;s.fa&&Es(s),s=u.call(h,o)}return s}function Ss(s){return s=s[Is],s instanceof Pn?s:null}var As="__closure_events_fn_"+(Math.random()*1e9>>>0);function ii(s){return typeof s=="function"?s:(s[As]||(s[As]=function(o){return s.handleEvent(o)}),s[As])}function ne(){x.call(this),this.i=new Pn(this),this.M=this,this.G=null}S(ne,x),ne.prototype[j]=!0,ne.prototype.removeEventListener=function(s,o,u,h){si(this,s,o,u,h)};function ie(s,o){var u,h=s.G;if(h)for(u=[];h;h=h.G)u.push(h);if(s=s.M,h=o.type||o,typeof o=="string")o=new w(o,s);else if(o instanceof w)o.target=o.target||s;else{var I=o;o=new w(h,s),ti(o,I)}I=!0;let E,R;if(u)for(R=u.length-1;R>=0;R--)E=o.g=u[R],I=Cn(E,h,!0,o)&&I;if(E=o.g=s,I=Cn(E,h,!0,o)&&I,I=Cn(E,h,!1,o)&&I,u)for(R=0;R<u.length;R++)E=o.g=u[R],I=Cn(E,h,!1,o)&&I}ne.prototype.N=function(){if(ne.Z.N.call(this),this.i){var s=this.i;for(const o in s.g){const u=s.g[o];for(let h=0;h<u.length;h++)U(u[h]);delete s.g[o],s.h--}}this.G=null},ne.prototype.J=function(s,o,u,h){return this.i.add(String(s),o,!1,u,h)},ne.prototype.K=function(s,o,u,h){return this.i.add(String(s),o,!0,u,h)};function Cn(s,o,u,h){if(o=s.i.g[String(o)],!o)return!0;o=o.concat();let I=!0;for(let E=0;E<o.length;++E){const R=o[E];if(R&&!R.da&&R.capture==u){const V=R.listener,ee=R.ha||R.src;R.fa&&_s(s.i,R),I=V.call(ee,h)!==!1&&I}}return I&&!h.defaultPrevented}function hl(s,o){if(typeof s!="function")if(s&&typeof s.handleEvent=="function")s=y(s.handleEvent,s);else throw Error("Invalid listener argument");return Number(o)>2147483647?-1:l.setTimeout(s,o||0)}function oi(s){s.g=hl(()=>{s.g=null,s.i&&(s.i=!1,oi(s))},s.l);const o=s.h;s.h=null,s.m.apply(null,o)}class fl extends x{constructor(o,u){super(),this.m=o,this.l=u,this.h=null,this.i=!1,this.g=null}j(o){this.h=arguments,this.g?this.i=!0:oi(this)}N(){super.N(),this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Gt(s){x.call(this),this.h=s,this.g={}}S(Gt,x);var ai=[];function ci(s){ge(s.g,function(o,u){this.g.hasOwnProperty(u)&&Es(o)},s),s.g={}}Gt.prototype.N=function(){Gt.Z.N.call(this),ci(this)},Gt.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var ks=l.JSON.stringify,gl=l.JSON.parse,pl=class{stringify(s){return l.JSON.stringify(s,void 0)}parse(s){return l.JSON.parse(s,void 0)}};function li(){}function ml(){}var qt={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function Ns(){w.call(this,"d")}S(Ns,w);function Ps(){w.call(this,"c")}S(Ps,w);var Nt={},ui=null;function Cs(){return ui=ui||new ne}Nt.Ia="serverreachability";function di(s){w.call(this,Nt.Ia,s)}S(di,w);function Wt(s){const o=Cs();ie(o,new di(o))}Nt.STAT_EVENT="statevent";function hi(s,o){w.call(this,Nt.STAT_EVENT,s),this.stat=o}S(hi,w);function oe(s){const o=Cs();ie(o,new hi(o,s))}Nt.Ja="timingevent";function fi(s,o){w.call(this,Nt.Ja,s),this.size=o}S(fi,w);function Kt(s,o){if(typeof s!="function")throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){s()},o)}function Jt(){this.g=!0}Jt.prototype.ua=function(){this.g=!1};function yl(s,o,u,h,I,E){s.info(function(){if(s.g)if(E){var R="",V=E.split("&");for(let X=0;X<V.length;X++){var ee=V[X].split("=");if(ee.length>1){const te=ee[0];ee=ee[1];const Ae=te.split("_");R=Ae.length>=2&&Ae[1]=="type"?R+(te+"="+ee+"&"):R+(te+"=redacted&")}}}else R=null;else R=E;return"XMLHTTP REQ ("+h+") [attempt "+I+"]: "+o+`
`+u+`
`+R})}function wl(s,o,u,h,I,E,R){s.info(function(){return"XMLHTTP RESP ("+h+") [ attempt "+I+"]: "+o+`
`+u+`
`+E+" "+R})}function Pt(s,o,u,h){s.info(function(){return"XMLHTTP TEXT ("+o+"): "+bl(s,u)+(h?" "+h:"")})}function xl(s,o){s.info(function(){return"TIMEOUT: "+o})}Jt.prototype.info=function(){};function bl(s,o){if(!s.g)return o;if(!o)return null;try{const E=JSON.parse(o);if(E){for(s=0;s<E.length;s++)if(Array.isArray(E[s])){var u=E[s];if(!(u.length<2)){var h=u[1];if(Array.isArray(h)&&!(h.length<1)){var I=h[0];if(I!="noop"&&I!="stop"&&I!="close")for(let R=1;R<h.length;R++)h[R]=""}}}}return ks(E)}catch{return o}}var Rs={NO_ERROR:0,TIMEOUT:8},_l={},gi;function Ds(){}S(Ds,li),Ds.prototype.g=function(){return new XMLHttpRequest},gi=new Ds;function Xt(s){return encodeURIComponent(String(s))}function vl(s){var o=1;s=s.split(":");const u=[];for(;o>0&&s.length;)u.push(s.shift()),o--;return s.length&&u.push(s.join(":")),u}function He(s,o,u,h){this.j=s,this.i=o,this.l=u,this.S=h||1,this.V=new Gt(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new pi}function pi(){this.i=null,this.g="",this.h=!1}var mi={},js={};function Os(s,o,u){s.M=1,s.A=Dn(Se(o)),s.u=u,s.R=!0,yi(s,null)}function yi(s,o){s.F=Date.now(),Rn(s),s.B=Se(s.A);var u=s.B,h=s.S;Array.isArray(h)||(h=[String(h)]),Pi(u.i,"t",h),s.C=0,u=s.j.L,s.h=new pi,s.g=Ki(s.j,u?o:null,!s.u),s.P>0&&(s.O=new fl(y(s.Y,s,s.g),s.P)),o=s.V,u=s.g,h=s.ba;var I="readystatechange";Array.isArray(I)||(I&&(ai[0]=I.toString()),I=ai);for(let E=0;E<I.length;E++){const R=ni(u,I[E],h||o.handleEvent,!1,o.h||o);if(!R)break;o.g[R.key]=R}o=s.J?Zr(s.J):{},s.u?(s.v||(s.v="POST"),o["Content-Type"]="application/x-www-form-urlencoded",s.g.ea(s.B,s.v,s.u,o)):(s.v="GET",s.g.ea(s.B,s.v,null,o)),Wt(),yl(s.i,s.v,s.B,s.l,s.S,s.u)}He.prototype.ba=function(s){s=s.target;const o=this.O;o&&qe(s)==3?o.j():this.Y(s)},He.prototype.Y=function(s){try{if(s==this.g)e:{const V=qe(this.g),ee=this.g.ya(),X=this.g.ca();if(!(V<3)&&(V!=3||this.g&&(this.h.h||this.g.la()||Mi(this.g)))){this.K||V!=4||ee==7||(ee==8||X<=0?Wt(3):Wt(2)),Ls(this);var o=this.g.ca();this.X=o;var u=Il(this);if(this.o=o==200,wl(this.i,this.v,this.B,this.l,this.S,V,o),this.o){if(this.U&&!this.L){t:{if(this.g){var h,I=this.g;if((h=I.g?I.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!f(h)){var E=h;break t}}E=null}if(s=E)Pt(this.i,this.l,s,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Ms(this,s);else{this.o=!1,this.m=3,oe(12),ut(this),Yt(this);break e}}if(this.R){s=!0;let te;for(;!this.K&&this.C<u.length;)if(te=Tl(this,u),te==js){V==4&&(this.m=4,oe(14),s=!1),Pt(this.i,this.l,null,"[Incomplete Response]");break}else if(te==mi){this.m=4,oe(15),Pt(this.i,this.l,u,"[Invalid Chunk]"),s=!1;break}else Pt(this.i,this.l,te,null),Ms(this,te);if(wi(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),V!=4||u.length!=0||this.h.h||(this.m=1,oe(16),s=!1),this.o=this.o&&s,!s)Pt(this.i,this.l,u,"[Invalid Chunked Response]"),ut(this),Yt(this);else if(u.length>0&&!this.W){this.W=!0;var R=this.j;R.g==this&&R.aa&&!R.P&&(R.j.info("Great, no buffering proxy detected. Bytes received: "+u.length),Gs(R),R.P=!0,oe(11))}}else Pt(this.i,this.l,u,null),Ms(this,u);V==4&&ut(this),this.o&&!this.K&&(V==4?zi(this.j,this):(this.o=!1,Rn(this)))}else Fl(this.g),o==400&&u.indexOf("Unknown SID")>0?(this.m=3,oe(12)):(this.m=0,oe(13)),ut(this),Yt(this)}}}catch{}finally{}};function Il(s){if(!wi(s))return s.g.la();const o=Mi(s.g);if(o==="")return"";let u="";const h=o.length,I=qe(s.g)==4;if(!s.h.i){if(typeof TextDecoder>"u")return ut(s),Yt(s),"";s.h.i=new l.TextDecoder}for(let E=0;E<h;E++)s.h.h=!0,u+=s.h.i.decode(o[E],{stream:!(I&&E==h-1)});return o.length=0,s.h.g+=u,s.C=0,s.h.g}function wi(s){return s.g?s.v=="GET"&&s.M!=2&&s.j.Aa:!1}function Tl(s,o){var u=s.C,h=o.indexOf(`
`,u);return h==-1?js:(u=Number(o.substring(u,h)),isNaN(u)?mi:(h+=1,h+u>o.length?js:(o=o.slice(h,h+u),s.C=h+u,o)))}He.prototype.cancel=function(){this.K=!0,ut(this)};function Rn(s){s.T=Date.now()+s.H,xi(s,s.H)}function xi(s,o){if(s.D!=null)throw Error("WatchDog timer not null");s.D=Kt(y(s.aa,s),o)}function Ls(s){s.D&&(l.clearTimeout(s.D),s.D=null)}He.prototype.aa=function(){this.D=null;const s=Date.now();s-this.T>=0?(xl(this.i,this.B),this.M!=2&&(Wt(),oe(17)),ut(this),this.m=2,Yt(this)):xi(this,this.T-s)};function Yt(s){s.j.I==0||s.K||zi(s.j,s)}function ut(s){Ls(s);var o=s.O;o&&typeof o.dispose=="function"&&o.dispose(),s.O=null,ci(s.V),s.g&&(o=s.g,s.g=null,o.abort(),o.dispose())}function Ms(s,o){try{var u=s.j;if(u.I!=0&&(u.g==s||Fs(u.h,s))){if(!s.L&&Fs(u.h,s)&&u.I==3){try{var h=u.Ba.g.parse(o)}catch{h=null}if(Array.isArray(h)&&h.length==3){var I=h;if(I[0]==0){e:if(!u.v){if(u.g)if(u.g.F+3e3<s.F)Fn(u),Ln(u);else break e;zs(u),oe(18)}}else u.xa=I[1],0<u.xa-u.K&&I[2]<37500&&u.F&&u.A==0&&!u.C&&(u.C=Kt(y(u.Va,u),6e3));vi(u.h)<=1&&u.ta&&(u.ta=void 0)}else ht(u,11)}else if((s.L||u.g==s)&&Fn(u),!f(o))for(I=u.Ba.g.parse(o),o=0;o<I.length;o++){let X=I[o];const te=X[0];if(!(te<=u.K))if(u.K=te,X=X[1],u.I==2)if(X[0]=="c"){u.M=X[1],u.ba=X[2];const Ae=X[3];Ae!=null&&(u.ka=Ae,u.j.info("VER="+u.ka));const ft=X[4];ft!=null&&(u.za=ft,u.j.info("SVER="+u.za));const We=X[5];We!=null&&typeof We=="number"&&We>0&&(h=1.5*We,u.O=h,u.j.info("backChannelRequestTimeoutMs_="+h)),h=u;const Ke=s.g;if(Ke){const Un=Ke.g?Ke.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Un){var E=h.h;E.g||Un.indexOf("spdy")==-1&&Un.indexOf("quic")==-1&&Un.indexOf("h2")==-1||(E.j=E.l,E.g=new Set,E.h&&(Us(E,E.h),E.h=null))}if(h.G){const qs=Ke.g?Ke.g.getResponseHeader("X-HTTP-Session-Id"):null;qs&&(h.wa=qs,Y(h.J,h.G,qs))}}u.I=3,u.l&&u.l.ra(),u.aa&&(u.T=Date.now()-s.F,u.j.info("Handshake RTT: "+u.T+"ms")),h=u;var R=s;if(h.na=Wi(h,h.L?h.ba:null,h.W),R.L){Ii(h.h,R);var V=R,ee=h.O;ee&&(V.H=ee),V.D&&(Ls(V),Rn(V)),h.g=R}else $i(h);u.i.length>0&&Mn(u)}else X[0]!="stop"&&X[0]!="close"||ht(u,7);else u.I==3&&(X[0]=="stop"||X[0]=="close"?X[0]=="stop"?ht(u,7):Hs(u):X[0]!="noop"&&u.l&&u.l.qa(X),u.A=0)}}Wt(4)}catch{}}var El=class{constructor(s,o){this.g=s,this.map=o}};function bi(s){this.l=s||10,l.PerformanceNavigationTiming?(s=l.performance.getEntriesByType("navigation"),s=s.length>0&&(s[0].nextHopProtocol=="hq"||s[0].nextHopProtocol=="h2")):s=!!(l.chrome&&l.chrome.loadTimes&&l.chrome.loadTimes()&&l.chrome.loadTimes().wasFetchedViaSpdy),this.j=s?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function _i(s){return s.h?!0:s.g?s.g.size>=s.j:!1}function vi(s){return s.h?1:s.g?s.g.size:0}function Fs(s,o){return s.h?s.h==o:s.g?s.g.has(o):!1}function Us(s,o){s.g?s.g.add(o):s.h=o}function Ii(s,o){s.h&&s.h==o?s.h=null:s.g&&s.g.has(o)&&s.g.delete(o)}bi.prototype.cancel=function(){if(this.i=Ti(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const s of this.g.values())s.cancel();this.g.clear()}};function Ti(s){if(s.h!=null)return s.i.concat(s.h.G);if(s.g!=null&&s.g.size!==0){let o=s.i;for(const u of s.g.values())o=o.concat(u.G);return o}return k(s.i)}var Ei=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Sl(s,o){if(s){s=s.split("&");for(let u=0;u<s.length;u++){const h=s[u].indexOf("=");let I,E=null;h>=0?(I=s[u].substring(0,h),E=s[u].substring(h+1)):I=s[u],o(I,E?decodeURIComponent(E.replace(/\+/g," ")):"")}}}function ze(s){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let o;s instanceof ze?(this.l=s.l,Qt(this,s.j),this.o=s.o,this.g=s.g,Zt(this,s.u),this.h=s.h,Bs(this,Ci(s.i)),this.m=s.m):s&&(o=String(s).match(Ei))?(this.l=!1,Qt(this,o[1]||"",!0),this.o=en(o[2]||""),this.g=en(o[3]||"",!0),Zt(this,o[4]),this.h=en(o[5]||"",!0),Bs(this,o[6]||"",!0),this.m=en(o[7]||"")):(this.l=!1,this.i=new nn(null,this.l))}ze.prototype.toString=function(){const s=[];var o=this.j;o&&s.push(tn(o,Si,!0),":");var u=this.g;return(u||o=="file")&&(s.push("//"),(o=this.o)&&s.push(tn(o,Si,!0),"@"),s.push(Xt(u).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),u=this.u,u!=null&&s.push(":",String(u))),(u=this.h)&&(this.g&&u.charAt(0)!="/"&&s.push("/"),s.push(tn(u,u.charAt(0)=="/"?Nl:kl,!0))),(u=this.i.toString())&&s.push("?",u),(u=this.m)&&s.push("#",tn(u,Cl)),s.join("")},ze.prototype.resolve=function(s){const o=Se(this);let u=!!s.j;u?Qt(o,s.j):u=!!s.o,u?o.o=s.o:u=!!s.g,u?o.g=s.g:u=s.u!=null;var h=s.h;if(u)Zt(o,s.u);else if(u=!!s.h){if(h.charAt(0)!="/")if(this.g&&!this.h)h="/"+h;else{var I=o.h.lastIndexOf("/");I!=-1&&(h=o.h.slice(0,I+1)+h)}if(I=h,I==".."||I==".")h="";else if(I.indexOf("./")!=-1||I.indexOf("/.")!=-1){h=I.lastIndexOf("/",0)==0,I=I.split("/");const E=[];for(let R=0;R<I.length;){const V=I[R++];V=="."?h&&R==I.length&&E.push(""):V==".."?((E.length>1||E.length==1&&E[0]!="")&&E.pop(),h&&R==I.length&&E.push("")):(E.push(V),h=!0)}h=E.join("/")}else h=I}return u?o.h=h:u=s.i.toString()!=="",u?Bs(o,Ci(s.i)):u=!!s.m,u&&(o.m=s.m),o};function Se(s){return new ze(s)}function Qt(s,o,u){s.j=u?en(o,!0):o,s.j&&(s.j=s.j.replace(/:$/,""))}function Zt(s,o){if(o){if(o=Number(o),isNaN(o)||o<0)throw Error("Bad port number "+o);s.u=o}else s.u=null}function Bs(s,o,u){o instanceof nn?(s.i=o,Rl(s.i,s.l)):(u||(o=tn(o,Pl)),s.i=new nn(o,s.l))}function Y(s,o,u){s.i.set(o,u)}function Dn(s){return Y(s,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),s}function en(s,o){return s?o?decodeURI(s.replace(/%25/g,"%2525")):decodeURIComponent(s):""}function tn(s,o,u){return typeof s=="string"?(s=encodeURI(s).replace(o,Al),u&&(s=s.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),s):null}function Al(s){return s=s.charCodeAt(0),"%"+(s>>4&15).toString(16)+(s&15).toString(16)}var Si=/[#\/\?@]/g,kl=/[#\?:]/g,Nl=/[#\?]/g,Pl=/[#\?@]/g,Cl=/#/g;function nn(s,o){this.h=this.g=null,this.i=s||null,this.j=!!o}function dt(s){s.g||(s.g=new Map,s.h=0,s.i&&Sl(s.i,function(o,u){s.add(decodeURIComponent(o.replace(/\+/g," ")),u)}))}n=nn.prototype,n.add=function(s,o){dt(this),this.i=null,s=Ct(this,s);let u=this.g.get(s);return u||this.g.set(s,u=[]),u.push(o),this.h+=1,this};function Ai(s,o){dt(s),o=Ct(s,o),s.g.has(o)&&(s.i=null,s.h-=s.g.get(o).length,s.g.delete(o))}function ki(s,o){return dt(s),o=Ct(s,o),s.g.has(o)}n.forEach=function(s,o){dt(this),this.g.forEach(function(u,h){u.forEach(function(I){s.call(o,I,h,this)},this)},this)};function Ni(s,o){dt(s);let u=[];if(typeof o=="string")ki(s,o)&&(u=u.concat(s.g.get(Ct(s,o))));else for(s=Array.from(s.g.values()),o=0;o<s.length;o++)u=u.concat(s[o]);return u}n.set=function(s,o){return dt(this),this.i=null,s=Ct(this,s),ki(this,s)&&(this.h-=this.g.get(s).length),this.g.set(s,[o]),this.h+=1,this},n.get=function(s,o){return s?(s=Ni(this,s),s.length>0?String(s[0]):o):o};function Pi(s,o,u){Ai(s,o),u.length>0&&(s.i=null,s.g.set(Ct(s,o),k(u)),s.h+=u.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const s=[],o=Array.from(this.g.keys());for(let h=0;h<o.length;h++){var u=o[h];const I=Xt(u);u=Ni(this,u);for(let E=0;E<u.length;E++){let R=I;u[E]!==""&&(R+="="+Xt(u[E])),s.push(R)}}return this.i=s.join("&")};function Ci(s){const o=new nn;return o.i=s.i,s.g&&(o.g=new Map(s.g),o.h=s.h),o}function Ct(s,o){return o=String(o),s.j&&(o=o.toLowerCase()),o}function Rl(s,o){o&&!s.j&&(dt(s),s.i=null,s.g.forEach(function(u,h){const I=h.toLowerCase();h!=I&&(Ai(this,h),Pi(this,I,u))},s)),s.j=o}function Dl(s,o){const u=new Jt;if(l.Image){const h=new Image;h.onload=_(Ge,u,"TestLoadImage: loaded",!0,o,h),h.onerror=_(Ge,u,"TestLoadImage: error",!1,o,h),h.onabort=_(Ge,u,"TestLoadImage: abort",!1,o,h),h.ontimeout=_(Ge,u,"TestLoadImage: timeout",!1,o,h),l.setTimeout(function(){h.ontimeout&&h.ontimeout()},1e4),h.src=s}else o(!1)}function jl(s,o){const u=new Jt,h=new AbortController,I=setTimeout(()=>{h.abort(),Ge(u,"TestPingServer: timeout",!1,o)},1e4);fetch(s,{signal:h.signal}).then(E=>{clearTimeout(I),E.ok?Ge(u,"TestPingServer: ok",!0,o):Ge(u,"TestPingServer: server error",!1,o)}).catch(()=>{clearTimeout(I),Ge(u,"TestPingServer: error",!1,o)})}function Ge(s,o,u,h,I){try{I&&(I.onload=null,I.onerror=null,I.onabort=null,I.ontimeout=null),h(u)}catch{}}function Ol(){this.g=new pl}function Vs(s){this.i=s.Sb||null,this.h=s.ab||!1}S(Vs,li),Vs.prototype.g=function(){return new jn(this.i,this.h)};function jn(s,o){ne.call(this),this.H=s,this.o=o,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}S(jn,ne),n=jn.prototype,n.open=function(s,o){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=s,this.D=o,this.readyState=1,rn(this)},n.send=function(s){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const o={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};s&&(o.body=s),(this.H||l).fetch(new Request(this.D,o)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,sn(this)),this.readyState=0},n.Pa=function(s){if(this.g&&(this.l=s,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=s.headers,this.readyState=2,rn(this)),this.g&&(this.readyState=3,rn(this),this.g)))if(this.responseType==="arraybuffer")s.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof l.ReadableStream<"u"&&"body"in s){if(this.j=s.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Ri(this)}else s.text().then(this.Oa.bind(this),this.ga.bind(this))};function Ri(s){s.j.read().then(s.Ma.bind(s)).catch(s.ga.bind(s))}n.Ma=function(s){if(this.g){if(this.o&&s.value)this.response.push(s.value);else if(!this.o){var o=s.value?s.value:new Uint8Array(0);(o=this.B.decode(o,{stream:!s.done}))&&(this.response=this.responseText+=o)}s.done?sn(this):rn(this),this.readyState==3&&Ri(this)}},n.Oa=function(s){this.g&&(this.response=this.responseText=s,sn(this))},n.Na=function(s){this.g&&(this.response=s,sn(this))},n.ga=function(){this.g&&sn(this)};function sn(s){s.readyState=4,s.l=null,s.j=null,s.B=null,rn(s)}n.setRequestHeader=function(s,o){this.A.append(s,o)},n.getResponseHeader=function(s){return this.h&&this.h.get(s.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const s=[],o=this.h.entries();for(var u=o.next();!u.done;)u=u.value,s.push(u[0]+": "+u[1]),u=o.next();return s.join(`\r
`)};function rn(s){s.onreadystatechange&&s.onreadystatechange.call(s)}Object.defineProperty(jn.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(s){this.m=s?"include":"same-origin"}});function Di(s){let o="";return ge(s,function(u,h){o+=h,o+=":",o+=u,o+=`\r
`}),o}function $s(s,o,u){e:{for(h in u){var h=!1;break e}h=!0}h||(u=Di(u),typeof s=="string"?u!=null&&Xt(u):Y(s,o,u))}function Q(s){ne.call(this),this.headers=new Map,this.L=s||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}S(Q,ne);var Ll=/^https?$/i,Ml=["POST","PUT"];n=Q.prototype,n.Fa=function(s){this.H=s},n.ea=function(s,o,u,h){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+s);o=o?o.toUpperCase():"GET",this.D=s,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():gi.g(),this.g.onreadystatechange=T(y(this.Ca,this));try{this.B=!0,this.g.open(o,String(s),!0),this.B=!1}catch(E){ji(this,E);return}if(s=u||"",u=new Map(this.headers),h)if(Object.getPrototypeOf(h)===Object.prototype)for(var I in h)u.set(I,h[I]);else if(typeof h.keys=="function"&&typeof h.get=="function")for(const E of h.keys())u.set(E,h.get(E));else throw Error("Unknown input type for opt_headers: "+String(h));h=Array.from(u.keys()).find(E=>E.toLowerCase()=="content-type"),I=l.FormData&&s instanceof l.FormData,!(Array.prototype.indexOf.call(Ml,o,void 0)>=0)||h||I||u.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[E,R]of u)this.g.setRequestHeader(E,R);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(s),this.v=!1}catch(E){ji(this,E)}};function ji(s,o){s.h=!1,s.g&&(s.j=!0,s.g.abort(),s.j=!1),s.l=o,s.o=5,Oi(s),On(s)}function Oi(s){s.A||(s.A=!0,ie(s,"complete"),ie(s,"error"))}n.abort=function(s){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=s||7,ie(this,"complete"),ie(this,"abort"),On(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),On(this,!0)),Q.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?Li(this):this.Xa())},n.Xa=function(){Li(this)};function Li(s){if(s.h&&typeof a<"u"){if(s.v&&qe(s)==4)setTimeout(s.Ca.bind(s),0);else if(ie(s,"readystatechange"),qe(s)==4){s.h=!1;try{const E=s.ca();e:switch(E){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var o=!0;break e;default:o=!1}var u;if(!(u=o)){var h;if(h=E===0){let R=String(s.D).match(Ei)[1]||null;!R&&l.self&&l.self.location&&(R=l.self.location.protocol.slice(0,-1)),h=!Ll.test(R?R.toLowerCase():"")}u=h}if(u)ie(s,"complete"),ie(s,"success");else{s.o=6;try{var I=qe(s)>2?s.g.statusText:""}catch{I=""}s.l=I+" ["+s.ca()+"]",Oi(s)}}finally{On(s)}}}}function On(s,o){if(s.g){s.m&&(clearTimeout(s.m),s.m=null);const u=s.g;s.g=null,o||ie(s,"ready");try{u.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function qe(s){return s.g?s.g.readyState:0}n.ca=function(){try{return qe(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(s){if(this.g){var o=this.g.responseText;return s&&o.indexOf(s)==0&&(o=o.substring(s.length)),gl(o)}};function Mi(s){try{if(!s.g)return null;if("response"in s.g)return s.g.response;switch(s.F){case"":case"text":return s.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in s.g)return s.g.mozResponseArrayBuffer}return null}catch{return null}}function Fl(s){const o={};s=(s.g&&qe(s)>=2&&s.g.getAllResponseHeaders()||"").split(`\r
`);for(let h=0;h<s.length;h++){if(f(s[h]))continue;var u=vl(s[h]);const I=u[0];if(u=u[1],typeof u!="string")continue;u=u.trim();const E=o[I]||[];o[I]=E,E.push(u)}lt(o,function(h){return h.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function on(s,o,u){return u&&u.internalChannelParams&&u.internalChannelParams[s]||o}function Fi(s){this.za=0,this.i=[],this.j=new Jt,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=on("failFast",!1,s),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=on("baseRetryDelayMs",5e3,s),this.Za=on("retryDelaySeedMs",1e4,s),this.Ta=on("forwardChannelMaxRetries",2,s),this.va=on("forwardChannelRequestTimeoutMs",2e4,s),this.ma=s&&s.xmlHttpFactory||void 0,this.Ua=s&&s.Rb||void 0,this.Aa=s&&s.useFetchStreams||!1,this.O=void 0,this.L=s&&s.supportsCrossDomainXhr||!1,this.M="",this.h=new bi(s&&s.concurrentRequestLimit),this.Ba=new Ol,this.S=s&&s.fastHandshake||!1,this.R=s&&s.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=s&&s.Pb||!1,s&&s.ua&&this.j.ua(),s&&s.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&s&&s.detectBufferingProxy||!1,this.ia=void 0,s&&s.longPollingTimeout&&s.longPollingTimeout>0&&(this.ia=s.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=Fi.prototype,n.ka=8,n.I=1,n.connect=function(s,o,u,h){oe(0),this.W=s,this.H=o||{},u&&h!==void 0&&(this.H.OSID=u,this.H.OAID=h),this.F=this.X,this.J=Wi(this,null,this.W),Mn(this)};function Hs(s){if(Ui(s),s.I==3){var o=s.V++,u=Se(s.J);if(Y(u,"SID",s.M),Y(u,"RID",o),Y(u,"TYPE","terminate"),an(s,u),o=new He(s,s.j,o),o.M=2,o.A=Dn(Se(u)),u=!1,l.navigator&&l.navigator.sendBeacon)try{u=l.navigator.sendBeacon(o.A.toString(),"")}catch{}!u&&l.Image&&(new Image().src=o.A,u=!0),u||(o.g=Ki(o.j,null),o.g.ea(o.A)),o.F=Date.now(),Rn(o)}qi(s)}function Ln(s){s.g&&(Gs(s),s.g.cancel(),s.g=null)}function Ui(s){Ln(s),s.v&&(l.clearTimeout(s.v),s.v=null),Fn(s),s.h.cancel(),s.m&&(typeof s.m=="number"&&l.clearTimeout(s.m),s.m=null)}function Mn(s){if(!_i(s.h)&&!s.m){s.m=!0;var o=s.Ea;H||p(),z||(H(),z=!0),b.add(o,s),s.D=0}}function Ul(s,o){return vi(s.h)>=s.h.j-(s.m?1:0)?!1:s.m?(s.i=o.G.concat(s.i),!0):s.I==1||s.I==2||s.D>=(s.Sa?0:s.Ta)?!1:(s.m=Kt(y(s.Ea,s,o),Gi(s,s.D)),s.D++,!0)}n.Ea=function(s){if(this.m)if(this.m=null,this.I==1){if(!s){this.V=Math.floor(Math.random()*1e5),s=this.V++;const I=new He(this,this.j,s);let E=this.o;if(this.U&&(E?(E=Zr(E),ti(E,this.U)):E=this.U),this.u!==null||this.R||(I.J=E,E=null),this.S)e:{for(var o=0,u=0;u<this.i.length;u++){t:{var h=this.i[u];if("__data__"in h.map&&(h=h.map.__data__,typeof h=="string")){h=h.length;break t}h=void 0}if(h===void 0)break;if(o+=h,o>4096){o=u;break e}if(o===4096||u===this.i.length-1){o=u+1;break e}}o=1e3}else o=1e3;o=Vi(this,I,o),u=Se(this.J),Y(u,"RID",s),Y(u,"CVER",22),this.G&&Y(u,"X-HTTP-Session-Id",this.G),an(this,u),E&&(this.R?o="headers="+Xt(Di(E))+"&"+o:this.u&&$s(u,this.u,E)),Us(this.h,I),this.Ra&&Y(u,"TYPE","init"),this.S?(Y(u,"$req",o),Y(u,"SID","null"),I.U=!0,Os(I,u,null)):Os(I,u,o),this.I=2}}else this.I==3&&(s?Bi(this,s):this.i.length==0||_i(this.h)||Bi(this))};function Bi(s,o){var u;o?u=o.l:u=s.V++;const h=Se(s.J);Y(h,"SID",s.M),Y(h,"RID",u),Y(h,"AID",s.K),an(s,h),s.u&&s.o&&$s(h,s.u,s.o),u=new He(s,s.j,u,s.D+1),s.u===null&&(u.J=s.o),o&&(s.i=o.G.concat(s.i)),o=Vi(s,u,1e3),u.H=Math.round(s.va*.5)+Math.round(s.va*.5*Math.random()),Us(s.h,u),Os(u,h,o)}function an(s,o){s.H&&ge(s.H,function(u,h){Y(o,h,u)}),s.l&&ge({},function(u,h){Y(o,h,u)})}function Vi(s,o,u){u=Math.min(s.i.length,u);const h=s.l?y(s.l.Ka,s.l,s):null;e:{var I=s.i;let V=-1;for(;;){const ee=["count="+u];V==-1?u>0?(V=I[0].g,ee.push("ofs="+V)):V=0:ee.push("ofs="+V);let X=!0;for(let te=0;te<u;te++){var E=I[te].g;const Ae=I[te].map;if(E-=V,E<0)V=Math.max(0,I[te].g-100),X=!1;else try{E="req"+E+"_"||"";try{var R=Ae instanceof Map?Ae:Object.entries(Ae);for(const[ft,We]of R){let Ke=We;d(We)&&(Ke=ks(We)),ee.push(E+ft+"="+encodeURIComponent(Ke))}}catch(ft){throw ee.push(E+"type="+encodeURIComponent("_badmap")),ft}}catch{h&&h(Ae)}}if(X){R=ee.join("&");break e}}R=void 0}return s=s.i.splice(0,u),o.G=s,R}function $i(s){if(!s.g&&!s.v){s.Y=1;var o=s.Da;H||p(),z||(H(),z=!0),b.add(o,s),s.A=0}}function zs(s){return s.g||s.v||s.A>=3?!1:(s.Y++,s.v=Kt(y(s.Da,s),Gi(s,s.A)),s.A++,!0)}n.Da=function(){if(this.v=null,Hi(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var s=4*this.T;this.j.info("BP detection timer enabled: "+s),this.B=Kt(y(this.Wa,this),s)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,oe(10),Ln(this),Hi(this))};function Gs(s){s.B!=null&&(l.clearTimeout(s.B),s.B=null)}function Hi(s){s.g=new He(s,s.j,"rpc",s.Y),s.u===null&&(s.g.J=s.o),s.g.P=0;var o=Se(s.na);Y(o,"RID","rpc"),Y(o,"SID",s.M),Y(o,"AID",s.K),Y(o,"CI",s.F?"0":"1"),!s.F&&s.ia&&Y(o,"TO",s.ia),Y(o,"TYPE","xmlhttp"),an(s,o),s.u&&s.o&&$s(o,s.u,s.o),s.O&&(s.g.H=s.O);var u=s.g;s=s.ba,u.M=1,u.A=Dn(Se(o)),u.u=null,u.R=!0,yi(u,s)}n.Va=function(){this.C!=null&&(this.C=null,Ln(this),zs(this),oe(19))};function Fn(s){s.C!=null&&(l.clearTimeout(s.C),s.C=null)}function zi(s,o){var u=null;if(s.g==o){Fn(s),Gs(s),s.g=null;var h=2}else if(Fs(s.h,o))u=o.G,Ii(s.h,o),h=1;else return;if(s.I!=0){if(o.o)if(h==1){u=o.u?o.u.length:0,o=Date.now()-o.F;var I=s.D;h=Cs(),ie(h,new fi(h,u)),Mn(s)}else $i(s);else if(I=o.m,I==3||I==0&&o.X>0||!(h==1&&Ul(s,o)||h==2&&zs(s)))switch(u&&u.length>0&&(o=s.h,o.i=o.i.concat(u)),I){case 1:ht(s,5);break;case 4:ht(s,10);break;case 3:ht(s,6);break;default:ht(s,2)}}}function Gi(s,o){let u=s.Qa+Math.floor(Math.random()*s.Za);return s.isActive()||(u*=2),u*o}function ht(s,o){if(s.j.info("Error code "+o),o==2){var u=y(s.bb,s),h=s.Ua;const I=!h;h=new ze(h||"//www.google.com/images/cleardot.gif"),l.location&&l.location.protocol=="http"||Qt(h,"https"),Dn(h),I?Dl(h.toString(),u):jl(h.toString(),u)}else oe(2);s.I=0,s.l&&s.l.pa(o),qi(s),Ui(s)}n.bb=function(s){s?(this.j.info("Successfully pinged google.com"),oe(2)):(this.j.info("Failed to ping google.com"),oe(1))};function qi(s){if(s.I=0,s.ja=[],s.l){const o=Ti(s.h);(o.length!=0||s.i.length!=0)&&(A(s.ja,o),A(s.ja,s.i),s.h.i.length=0,k(s.i),s.i.length=0),s.l.oa()}}function Wi(s,o,u){var h=u instanceof ze?Se(u):new ze(u);if(h.g!="")o&&(h.g=o+"."+h.g),Zt(h,h.u);else{var I=l.location;h=I.protocol,o=o?o+"."+I.hostname:I.hostname,I=+I.port;const E=new ze(null);h&&Qt(E,h),o&&(E.g=o),I&&Zt(E,I),u&&(E.h=u),h=E}return u=s.G,o=s.wa,u&&o&&Y(h,u,o),Y(h,"VER",s.ka),an(s,h),h}function Ki(s,o,u){if(o&&!s.L)throw Error("Can't create secondary domain capable XhrIo object.");return o=s.Aa&&!s.ma?new Q(new Vs({ab:u})):new Q(s.ma),o.Fa(s.L),o}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Ji(){}n=Ji.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function pe(s,o){ne.call(this),this.g=new Fi(o),this.l=s,this.h=o&&o.messageUrlParams||null,s=o&&o.messageHeaders||null,o&&o.clientProtocolHeaderRequired&&(s?s["X-Client-Protocol"]="webchannel":s={"X-Client-Protocol":"webchannel"}),this.g.o=s,s=o&&o.initMessageHeaders||null,o&&o.messageContentType&&(s?s["X-WebChannel-Content-Type"]=o.messageContentType:s={"X-WebChannel-Content-Type":o.messageContentType}),o&&o.sa&&(s?s["X-WebChannel-Client-Profile"]=o.sa:s={"X-WebChannel-Client-Profile":o.sa}),this.g.U=s,(s=o&&o.Qb)&&!f(s)&&(this.g.u=s),this.A=o&&o.supportsCrossDomainXhr||!1,this.v=o&&o.sendRawJson||!1,(o=o&&o.httpSessionIdParam)&&!f(o)&&(this.g.G=o,s=this.h,s!==null&&o in s&&(s=this.h,o in s&&delete s[o])),this.j=new Rt(this)}S(pe,ne),pe.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},pe.prototype.close=function(){Hs(this.g)},pe.prototype.o=function(s){var o=this.g;if(typeof s=="string"){var u={};u.__data__=s,s=u}else this.v&&(u={},u.__data__=ks(s),s=u);o.i.push(new El(o.Ya++,s)),o.I==3&&Mn(o)},pe.prototype.N=function(){this.g.l=null,delete this.j,Hs(this.g),delete this.g,pe.Z.N.call(this)};function Xi(s){Ns.call(this),s.__headers__&&(this.headers=s.__headers__,this.statusCode=s.__status__,delete s.__headers__,delete s.__status__);var o=s.__sm__;if(o){e:{for(const u in o){s=u;break e}s=void 0}(this.i=s)&&(s=this.i,o=o!==null&&s in o?o[s]:void 0),this.data=o}else this.data=s}S(Xi,Ns);function Yi(){Ps.call(this),this.status=1}S(Yi,Ps);function Rt(s){this.g=s}S(Rt,Ji),Rt.prototype.ra=function(){ie(this.g,"a")},Rt.prototype.qa=function(s){ie(this.g,new Xi(s))},Rt.prototype.pa=function(s){ie(this.g,new Yi)},Rt.prototype.oa=function(){ie(this.g,"b")},pe.prototype.send=pe.prototype.o,pe.prototype.open=pe.prototype.m,pe.prototype.close=pe.prototype.close,Rs.NO_ERROR=0,Rs.TIMEOUT=8,Rs.HTTP_ERROR=6,_l.COMPLETE="complete",ml.EventType=qt,qt.OPEN="a",qt.CLOSE="b",qt.ERROR="c",qt.MESSAGE="d",ne.prototype.listen=ne.prototype.J,Q.prototype.listenOnce=Q.prototype.K,Q.prototype.getLastError=Q.prototype.Ha,Q.prototype.getLastErrorCode=Q.prototype.ya,Q.prototype.getStatus=Q.prototype.ca,Q.prototype.getResponseJson=Q.prototype.La,Q.prototype.getResponseText=Q.prototype.la,Q.prototype.send=Q.prototype.ea,Q.prototype.setWithCredentials=Q.prototype.Fa}).apply(typeof Bn<"u"?Bn:typeof self<"u"?self:typeof window<"u"?window:{});const ho="@firebase/firestore",fo="4.9.3";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ae{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}ae.UNAUTHENTICATED=new ae(null),ae.GOOGLE_CREDENTIALS=new ae("google-credentials-uid"),ae.FIRST_PARTY=new ae("first-party-uid"),ae.MOCK_USER=new ae("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let vn="12.7.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ut=new fs("@firebase/firestore");function ve(n,...e){if(Ut.logLevel<=J.DEBUG){const t=e.map(Cr);Ut.debug(`Firestore (${vn}): ${n}`,...t)}}function La(n,...e){if(Ut.logLevel<=J.ERROR){const t=e.map(Cr);Ut.error(`Firestore (${vn}): ${n}`,...t)}}function Ed(n,...e){if(Ut.logLevel<=J.WARN){const t=e.map(Cr);Ut.warn(`Firestore (${vn}): ${n}`,...t)}}function Cr(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return(function(t){return JSON.stringify(t)})(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xn(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,Ma(n,r,t)}function Ma(n,e,t){let r=`FIRESTORE (${vn}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw La(r),new Error(r)}function fn(n,e,t,r){let i="Unexpected state";typeof t=="string"?i=t:r=t,n||Ma(e,i,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const q={CANCELLED:"cancelled",INVALID_ARGUMENT:"invalid-argument",FAILED_PRECONDITION:"failed-precondition"};class W extends xe{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gn{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fa{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Sd{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(ae.UNAUTHENTICATED)))}shutdown(){}}class Ad{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class kd{constructor(e){this.t=e,this.currentUser=ae.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){fn(this.o===void 0,42304);let r=this.i;const i=g=>this.i!==r?(r=this.i,t(g)):Promise.resolve();let a=new gn;this.o=()=>{this.i++,this.currentUser=this.u(),a.resolve(),a=new gn,e.enqueueRetryable((()=>i(this.currentUser)))};const l=()=>{const g=a;e.enqueueRetryable((async()=>{await g.promise,await i(this.currentUser)}))},d=g=>{ve("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=g,this.o&&(this.auth.addAuthTokenListener(this.o),l())};this.t.onInit((g=>d(g))),setTimeout((()=>{if(!this.auth){const g=this.t.getImmediate({optional:!0});g?d(g):(ve("FirebaseAuthCredentialsProvider","Auth not yet detected"),a.resolve(),a=new gn)}}),0),l()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((r=>this.i!==e?(ve("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(fn(typeof r.accessToken=="string",31837,{l:r}),new Fa(r.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return fn(e===null||typeof e=="string",2055,{h:e}),new ae(e)}}class Nd{constructor(e,t,r){this.P=e,this.T=t,this.I=r,this.type="FirstParty",this.user=ae.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class Pd{constructor(e,t,r){this.P=e,this.T=t,this.I=r}getToken(){return Promise.resolve(new Nd(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable((()=>t(ae.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class go{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Cd{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,_e(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){fn(this.o===void 0,3512);const r=a=>{a.error!=null&&ve("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${a.error.message}`);const l=a.token!==this.m;return this.m=a.token,ve("FirebaseAppCheckTokenProvider",`Received ${l?"new":"existing"} token.`),l?t(a.token):Promise.resolve()};this.o=a=>{e.enqueueRetryable((()=>r(a)))};const i=a=>{ve("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=a,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit((a=>i(a))),setTimeout((()=>{if(!this.appCheck){const a=this.V.getImmediate({optional:!0});a?i(a):ve("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.p)return Promise.resolve(new go(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(fn(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new go(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rd(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dd{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const i=Rd(40);for(let a=0;a<i.length;++a)r.length<20&&i[a]<t&&(r+=e.charAt(i[a]%62))}return r}}function ot(n,e){return n<e?-1:n>e?1:0}function jd(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const i=n.charAt(r),a=e.charAt(r);if(i!==a)return Xs(i)===Xs(a)?ot(i,a):Xs(i)?1:-1}return ot(n.length,e.length)}const Od=55296,Ld=57343;function Xs(n){const e=n.charCodeAt(0);return e>=Od&&e<=Ld}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const po="__name__";class Pe{constructor(e,t,r){t===void 0?t=0:t>e.length&&xn(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&xn(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return Pe.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Pe?e.forEach((r=>{t.push(r)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let i=0;i<r;i++){const a=Pe.compareSegments(e.get(i),t.get(i));if(a!==0)return a}return ot(e.length,t.length)}static compareSegments(e,t){const r=Pe.isNumericId(e),i=Pe.isNumericId(t);return r&&!i?-1:!r&&i?1:r&&i?Pe.extractNumericId(e).compare(Pe.extractNumericId(t)):jd(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Pr.fromString(e.substring(4,e.length-2))}}class be extends Pe{construct(e,t,r){return new be(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new W(q.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter((i=>i.length>0)))}return new be(t)}static emptyPath(){return new be([])}}const Md=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class pt extends Pe{construct(e,t,r){return new pt(e,t,r)}static isValidIdentifier(e){return Md.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),pt.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===po}static keyField(){return new pt([po])}static fromServerFormat(e){const t=[];let r="",i=0;const a=()=>{if(r.length===0)throw new W(q.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let l=!1;for(;i<e.length;){const d=e[i];if(d==="\\"){if(i+1===e.length)throw new W(q.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const g=e[i+1];if(g!=="\\"&&g!=="."&&g!=="`")throw new W(q.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=g,i+=2}else d==="`"?(l=!l,i++):d!=="."||l?(r+=d,i++):(a(),i++)}if(a(),l)throw new W(q.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new pt(t)}static emptyPath(){return new pt([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mt{constructor(e){this.path=e}static fromPath(e){return new mt(be.fromString(e))}static fromName(e){return new mt(be.fromString(e).popFirst(5))}static empty(){return new mt(be.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&be.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return be.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new mt(new be(e.slice()))}}function Fd(n,e,t,r){if(e===!0&&r===!0)throw new W(q.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function Ud(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function Bd(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=(function(r){return r.constructor?r.constructor.name:null})(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":xn(12329,{type:typeof n})}function Vd(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new W(q.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Bd(n);throw new W(q.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Z(n,e){const t={typeString:n};return e&&(t.value=e),t}function In(n,e){if(!Ud(n))throw new W(q.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const i=e[r].typeString,a="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const l=n[r];if(i&&typeof l!==i){t=`JSON field '${r}' must be a ${i}.`;break}if(a!==void 0&&l!==a.value){t=`Expected '${r}' field to equal '${a.value}'`;break}}if(t)throw new W(q.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mo=-62135596800,yo=1e6;class Ce{static now(){return Ce.fromMillis(Date.now())}static fromDate(e){return Ce.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*yo);return new Ce(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new W(q.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new W(q.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<mo)throw new W(q.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new W(q.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/yo}_compareTo(e){return this.seconds===e.seconds?ot(this.nanoseconds,e.nanoseconds):ot(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:Ce._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(In(e,Ce._jsonSchema))return new Ce(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-mo;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}Ce._jsonSchemaVersion="firestore/timestamp/1.0",Ce._jsonSchema={type:Z("string",Ce._jsonSchemaVersion),seconds:Z("number"),nanoseconds:Z("number")};function $d(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hd extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vt{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(i){try{return atob(i)}catch(a){throw typeof DOMException<"u"&&a instanceof DOMException?new Hd("Invalid base64 string: "+a):a}})(e);return new vt(t)}static fromUint8Array(e){const t=(function(i){let a="";for(let l=0;l<i.length;++l)a+=String.fromCharCode(i[l]);return a})(e);return new vt(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return ot(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}vt.EMPTY_BYTE_STRING=new vt("");const gr="(default)";class ns{constructor(e,t){this.projectId=e,this.database=t||gr}static empty(){return new ns("","")}get isDefaultDatabase(){return this.database===gr}isEqual(e){return e instanceof ns&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zd{constructor(e,t=null,r=[],i=[],a=null,l="F",d=null,g=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=i,this.limit=a,this.limitType=l,this.startAt=d,this.endAt=g,this.Ie=null,this.Ee=null,this.de=null,this.startAt,this.endAt}}function Gd(n){return new zd(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var wo,G;(G=wo||(wo={}))[G.OK=0]="OK",G[G.CANCELLED=1]="CANCELLED",G[G.UNKNOWN=2]="UNKNOWN",G[G.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",G[G.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",G[G.NOT_FOUND=5]="NOT_FOUND",G[G.ALREADY_EXISTS=6]="ALREADY_EXISTS",G[G.PERMISSION_DENIED=7]="PERMISSION_DENIED",G[G.UNAUTHENTICATED=16]="UNAUTHENTICATED",G[G.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",G[G.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",G[G.ABORTED=10]="ABORTED",G[G.OUT_OF_RANGE=11]="OUT_OF_RANGE",G[G.UNIMPLEMENTED=12]="UNIMPLEMENTED",G[G.INTERNAL=13]="INTERNAL",G[G.UNAVAILABLE=14]="UNAVAILABLE",G[G.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new Pr([4294967295,4294967295],0);/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qd=41943040;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wd=1048576;function Ys(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kd{constructor(e,t,r=1e3,i=1.5,a=6e4){this.Mi=e,this.timerId=t,this.d_=r,this.A_=i,this.R_=a,this.V_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.V_=0}g_(){this.V_=this.R_}p_(e){this.cancel();const t=Math.floor(this.V_+this.y_()),r=Math.max(0,Date.now()-this.f_),i=Math.max(0,t-r);i>0&&ve("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.V_} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.m_=this.Mi.enqueueAfterDelay(this.timerId,i,(()=>(this.f_=Date.now(),e()))),this.V_*=this.A_,this.V_<this.d_&&(this.V_=this.d_),this.V_>this.R_&&(this.V_=this.R_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.V_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rr{constructor(e,t,r,i,a){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=i,this.removalCallback=a,this.deferred=new gn,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((l=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,i,a){const l=Date.now()+r,d=new Rr(e,t,l,i,a);return d.start(r),d}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new W(q.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}var xo,bo;(bo=xo||(xo={})).Ma="default",bo.Cache="cache";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jd(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _o=new Map;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ua="firestore.googleapis.com",vo=!0;class Io{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new W(q.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Ua,this.ssl=vo}else this.host=e.host,this.ssl=e.ssl??vo;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=qd;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<Wd)throw new W(q.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Fd("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Jd(e.experimentalLongPollingOptions??{}),(function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new W(q.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new W(q.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new W(q.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(r,i){return r.timeoutSeconds===i.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Ba{constructor(e,t,r,i){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Io({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new W(q.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new W(q.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Io(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(r){if(!r)return new Sd;switch(r.type){case"firstParty":return new Pd(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new W(q.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const r=_o.get(t);r&&(ve("ComponentProvider","Removing Datastore"),_o.delete(t),r.terminate())})(this),Promise.resolve()}}function Xd(n,e,t,r={}){var y;n=Vd(n,Ba);const i=$t(e),a=n._getSettings(),l={...a,emulatorOptions:n._getEmulatorOptions()},d=`${e}:${t}`;i&&(Ar(`https://${d}`),kr("Firestore",!0)),a.host!==Ua&&a.host!==d&&Ed("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const g={...a,host:d,ssl:i,emulatorOptions:r};if(!it(g,l)&&(n._setSettings(g),r.mockUserToken)){let _,S;if(typeof r.mockUserToken=="string")_=r.mockUserToken,S=ae.MOCK_USER;else{_=Na(r.mockUserToken,(y=n._app)==null?void 0:y.options.projectId);const T=r.mockUserToken.sub||r.mockUserToken.user_id;if(!T)throw new W(q.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");S=new ae(T)}n._authCredentials=new Ad(new Fa(_,S))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dr{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Dr(this.firestore,e,this._query)}}class Re{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new jr(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Re(this.firestore,e,this._key)}toJSON(){return{type:Re._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(In(t,Re._jsonSchema))return new Re(e,r||null,new mt(be.fromString(t.referencePath)))}}Re._jsonSchemaVersion="firestore/documentReference/1.0",Re._jsonSchema={type:Z("string",Re._jsonSchemaVersion),referencePath:Z("string")};class jr extends Dr{constructor(e,t,r){super(e,t,Gd(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Re(this.firestore,null,new mt(e))}withConverter(e){return new jr(this.firestore,e,this._path)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const To="AsyncQueue";class Eo{constructor(e=Promise.resolve()){this.Xu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new Kd(this,"async_queue_retry"),this._c=()=>{const r=Ys();r&&ve(To,"Visibility state changed to "+r.visibilityState),this.M_.w_()},this.ac=e;const t=Ys();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;const t=Ys();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise((()=>{}));const t=new gn;return this.cc((()=>this.ec&&this.sc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.Xu.push(e),this.lc())))}async lc(){if(this.Xu.length!==0){try{await this.Xu[0](),this.Xu.shift(),this.M_.reset()}catch(e){if(!$d(e))throw e;ve(To,"Operation failed with retryable error: "+e)}this.Xu.length>0&&this.M_.p_((()=>this.lc()))}}cc(e){const t=this.ac.then((()=>(this.rc=!0,e().catch((r=>{throw this.nc=r,this.rc=!1,La("INTERNAL UNHANDLED ERROR: ",So(r)),r})).then((r=>(this.rc=!1,r))))));return this.ac=t,t}enqueueAfterDelay(e,t,r){this.uc(),this.oc.indexOf(e)>-1&&(t=0);const i=Rr.createAndSchedule(this,e,t,r,(a=>this.hc(a)));return this.tc.push(i),i}uc(){this.nc&&xn(47125,{Pc:So(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ic(e){for(const t of this.tc)if(t.timerId===e)return!0;return!1}Ec(e){return this.Tc().then((()=>{this.tc.sort(((t,r)=>t.targetTimeMs-r.targetTimeMs));for(const t of this.tc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Tc()}))}dc(e){this.oc.push(e)}hc(e){const t=this.tc.indexOf(e);this.tc.splice(t,1)}}function So(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class Yd extends Ba{constructor(e,t,r,i){super(e,t,r,i),this.type="firestore",this._queue=new Eo,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Eo(e),this._firestoreClient=void 0,await e}}}function Qd(n,e){const t=typeof n=="object"?n:gs(),r=typeof n=="string"?n:gr,i=ct(t,"firestore").getImmediate({identifier:r});if(!i._initialized){const a=Sa("firestore");a&&Xd(i,...a)}return i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Me{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Me(vt.fromBase64String(e))}catch(t){throw new W(q.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Me(vt.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:Me._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(In(e,Me._jsonSchema))return Me.fromBase64String(e.bytes)}}Me._jsonSchemaVersion="firestore/bytes/1.0",Me._jsonSchema={type:Z("string",Me._jsonSchemaVersion),bytes:Z("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Va{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new W(q.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new pt(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wt{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new W(q.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new W(q.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return ot(this._lat,e._lat)||ot(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:wt._jsonSchemaVersion}}static fromJSON(e){if(In(e,wt._jsonSchema))return new wt(e.latitude,e.longitude)}}wt._jsonSchemaVersion="firestore/geoPoint/1.0",wt._jsonSchema={type:Z("string",wt._jsonSchemaVersion),latitude:Z("number"),longitude:Z("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xt{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(r,i){if(r.length!==i.length)return!1;for(let a=0;a<r.length;++a)if(r[a]!==i[a])return!1;return!0})(this._values,e._values)}toJSON(){return{type:xt._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(In(e,xt._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new xt(e.vectorValues);throw new W(q.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}xt._jsonSchemaVersion="firestore/vectorValue/1.0",xt._jsonSchema={type:Z("string",xt._jsonSchemaVersion),vectorValues:Z("object")};const Zd=new RegExp("[~\\*/\\[\\]]");function eh(n,e,t){if(e.search(Zd)>=0)throw Ao(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n);try{return new Va(...e.split("."))._internalPath}catch{throw Ao(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n)}}function Ao(n,e,t,r,i){let a=`Function ${e}() called with invalid data`;a+=". ";let l="";return new W(q.INVALID_ARGUMENT,a+n+l)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $a{constructor(e,t,r,i,a){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=i,this._converter=a}get id(){return this._key.path.lastSegment()}get ref(){return new Re(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new th(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(Ha("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class th extends $a{data(){return super.data()}}function Ha(n,e){return typeof e=="string"?eh(n,e):e instanceof Va?e._internalPath:e._delegate._internalPath}class Vn{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Ot extends $a{constructor(e,t,r,i,a,l){super(e,t,r,i,l),this._firestore=e,this._firestoreImpl=e,this.metadata=a}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Xn(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Ha("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new W(q.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=Ot._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}Ot._jsonSchemaVersion="firestore/documentSnapshot/1.0",Ot._jsonSchema={type:Z("string",Ot._jsonSchemaVersion),bundleSource:Z("string","DocumentSnapshot"),bundleName:Z("string"),bundle:Z("string")};class Xn extends Ot{data(e={}){return super.data(e)}}class pn{constructor(e,t,r,i){this._firestore=e,this._userDataWriter=t,this._snapshot=i,this.metadata=new Vn(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((r=>{e.call(t,new Xn(this._firestore,this._userDataWriter,r.key,r,new Vn(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new W(q.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(i,a){if(i._snapshot.oldDocs.isEmpty()){let l=0;return i._snapshot.docChanges.map((d=>{const g=new Xn(i._firestore,i._userDataWriter,d.doc.key,d.doc,new Vn(i._snapshot.mutatedKeys.has(d.doc.key),i._snapshot.fromCache),i.query.converter);return d.doc,{type:"added",doc:g,oldIndex:-1,newIndex:l++}}))}{let l=i._snapshot.oldDocs;return i._snapshot.docChanges.filter((d=>a||d.type!==3)).map((d=>{const g=new Xn(i._firestore,i._userDataWriter,d.doc.key,d.doc,new Vn(i._snapshot.mutatedKeys.has(d.doc.key),i._snapshot.fromCache),i.query.converter);let y=-1,_=-1;return d.type!==0&&(y=l.indexOf(d.doc.key),l=l.delete(d.doc.key)),d.type!==1&&(l=l.add(d.doc),_=l.indexOf(d.doc.key)),{type:nh(d.type),doc:g,oldIndex:y,newIndex:_}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new W(q.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=pn._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Dd.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],i=[];return this.docs.forEach((a=>{a._document!==null&&(t.push(a._document),r.push(this._userDataWriter.convertObjectMap(a._document.data.value.mapValue.fields,"previous")),i.push(a.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function nh(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return xn(61501,{type:n})}}pn._jsonSchemaVersion="firestore/querySnapshot/1.0",pn._jsonSchema={type:Z("string",pn._jsonSchemaVersion),bundleSource:Z("string","QuerySnapshot"),bundleName:Z("string"),bundle:Z("string")};(function(e,t=!0){(function(i){vn=i})(At),Ee(new we("firestore",((r,{instanceIdentifier:i,options:a})=>{const l=r.getProvider("app").getImmediate(),d=new Yd(new kd(r.getProvider("auth-internal")),new Cd(l,r.getProvider("app-check-internal")),(function(y,_){if(!Object.prototype.hasOwnProperty.apply(y.options,["projectId"]))throw new W(q.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new ns(y.options.projectId,_)})(l,i),l);return a={useFetchStreams:t,...a},d._setSettings(a),d}),"PUBLIC").setMultipleInstances(!0)),de(ho,fo,e),de(ho,fo,"esm2020")})();function za(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const sh=za,Ga=new St("auth","Firebase",za());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ss=new fs("@firebase/auth");function rh(n,...e){ss.logLevel<=J.WARN&&ss.warn(`Auth (${At}): ${n}`,...e)}function Yn(n,...e){ss.logLevel<=J.ERROR&&ss.error(`Auth (${At}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ve(n,...e){throw Or(n,...e)}function De(n,...e){return Or(n,...e)}function qa(n,e,t){const r={...sh(),[e]:t};return new St("auth","Firebase",r).create(e,{appName:n.name})}function bt(n){return qa(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Or(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return Ga.create(n,...e)}function F(n,e,...t){if(!n)throw Or(e,...t)}function Fe(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Yn(e),new Error(e)}function $e(n,e){n||Fe(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pr(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.href)||""}function ih(){return ko()==="http:"||ko()==="https:"}function ko(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oh(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(ih()||Pa()||"connection"in navigator)?navigator.onLine:!0}function ah(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tn{constructor(e,t){this.shortDelay=e,this.longDelay=t,$e(t>e,"Short delay should be less than long delay!"),this.isMobile=uu()||hu()}get(){return oh()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lr(n,e){$e(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wa{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Fe("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Fe("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Fe("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ch={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lh=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],uh=new Tn(3e4,6e4);function Mr(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function Ht(n,e,t,r,i={}){return Ka(n,i,async()=>{let a={},l={};r&&(e==="GET"?l=r:a={body:JSON.stringify(r)});const d=_n({key:n.config.apiKey,...l}).slice(1),g=await n._getAdditionalHeaders();g["Content-Type"]="application/json",n.languageCode&&(g["X-Firebase-Locale"]=n.languageCode);const y={method:e,headers:g,...a};return du()||(y.referrerPolicy="no-referrer"),n.emulatorConfig&&$t(n.emulatorConfig.host)&&(y.credentials="include"),Wa.fetch()(await Ja(n,n.config.apiHost,t,d),y)})}async function Ka(n,e,t){n._canInitEmulator=!1;const r={...ch,...e};try{const i=new hh(n),a=await Promise.race([t(),i.promise]);i.clearNetworkTimeout();const l=await a.json();if("needConfirmation"in l)throw $n(n,"account-exists-with-different-credential",l);if(a.ok&&!("errorMessage"in l))return l;{const d=a.ok?l.errorMessage:l.error.message,[g,y]=d.split(" : ");if(g==="FEDERATED_USER_ID_ALREADY_LINKED")throw $n(n,"credential-already-in-use",l);if(g==="EMAIL_EXISTS")throw $n(n,"email-already-in-use",l);if(g==="USER_DISABLED")throw $n(n,"user-disabled",l);const _=r[g]||g.toLowerCase().replace(/[_\s]+/g,"-");if(y)throw qa(n,_,y);Ve(n,_)}}catch(i){if(i instanceof xe)throw i;Ve(n,"network-request-failed",{message:String(i)})}}async function dh(n,e,t,r,i={}){const a=await Ht(n,e,t,r,i);return"mfaPendingCredential"in a&&Ve(n,"multi-factor-auth-required",{_serverResponse:a}),a}async function Ja(n,e,t,r){const i=`${e}${t}?${r}`,a=n,l=a.config.emulator?Lr(n.config,i):`${n.config.apiScheme}://${i}`;return lh.includes(t)&&(await a._persistenceManagerAvailable,a._getPersistenceType()==="COOKIE")?a._getPersistence()._getFinalTarget(l).toString():l}class hh{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(De(this.auth,"network-request-failed")),uh.get())})}}function $n(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const i=De(n,e,r);return i.customData._tokenResponse=t,i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fh(n,e){return Ht(n,"POST","/v1/accounts:delete",e)}async function rs(n,e){return Ht(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mn(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function gh(n,e=!1){const t=fe(n),r=await t.getIdToken(e),i=Fr(r);F(i&&i.exp&&i.auth_time&&i.iat,t.auth,"internal-error");const a=typeof i.firebase=="object"?i.firebase:void 0,l=a==null?void 0:a.sign_in_provider;return{claims:i,token:r,authTime:mn(Qs(i.auth_time)),issuedAtTime:mn(Qs(i.iat)),expirationTime:mn(Qs(i.exp)),signInProvider:l||null,signInSecondFactor:(a==null?void 0:a.sign_in_second_factor)||null}}function Qs(n){return Number(n)*1e3}function Fr(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return Yn("JWT malformed, contained fewer than 3 sections"),null;try{const i=Ta(t);return i?JSON.parse(i):(Yn("Failed to decode base64 JWT payload"),null)}catch(i){return Yn("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function No(n){const e=Fr(n);return F(e,"internal-error"),F(typeof e.exp<"u","internal-error"),F(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function bn(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof xe&&ph(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function ph({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mh{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mr{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=mn(this.lastLoginAt),this.creationTime=mn(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function is(n){var S;const e=n.auth,t=await n.getIdToken(),r=await bn(n,rs(e,{idToken:t}));F(r==null?void 0:r.users.length,e,"internal-error");const i=r.users[0];n._notifyReloadListener(i);const a=(S=i.providerUserInfo)!=null&&S.length?Xa(i.providerUserInfo):[],l=wh(n.providerData,a),d=n.isAnonymous,g=!(n.email&&i.passwordHash)&&!(l!=null&&l.length),y=d?g:!1,_={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:l,metadata:new mr(i.createdAt,i.lastLoginAt),isAnonymous:y};Object.assign(n,_)}async function yh(n){const e=fe(n);await is(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function wh(n,e){return[...n.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function Xa(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function xh(n,e){const t=await Ka(n,{},async()=>{const r=_n({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:a}=n.config,l=await Ja(n,i,"/v1/token",`key=${a}`),d=await n._getAdditionalHeaders();d["Content-Type"]="application/x-www-form-urlencoded";const g={method:"POST",headers:d,body:r};return n.emulatorConfig&&$t(n.emulatorConfig.host)&&(g.credentials="include"),Wa.fetch()(l,g)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function bh(n,e){return Ht(n,"POST","/v2/accounts:revokeToken",Mr(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lt{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){F(e.idToken,"internal-error"),F(typeof e.idToken<"u","internal-error"),F(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):No(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){F(e.length!==0,"internal-error");const t=No(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(F(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:i,expiresIn:a}=await xh(e,t);this.updateTokensAndExpiration(r,i,Number(a))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:i,expirationTime:a}=t,l=new Lt;return r&&(F(typeof r=="string","internal-error",{appName:e}),l.refreshToken=r),i&&(F(typeof i=="string","internal-error",{appName:e}),l.accessToken=i),a&&(F(typeof a=="number","internal-error",{appName:e}),l.expirationTime=a),l}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Lt,this.toJSON())}_performRefresh(){return Fe("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Je(n,e){F(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class Ie{constructor({uid:e,auth:t,stsTokenManager:r,...i}){this.providerId="firebase",this.proactiveRefresh=new mh(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new mr(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const t=await bn(this,this.stsTokenManager.getToken(this.auth,e));return F(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return gh(this,e)}reload(){return yh(this)}_assign(e){this!==e&&(F(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Ie({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){F(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await is(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(_e(this.auth.app))return Promise.reject(bt(this.auth));const e=await this.getIdToken();return await bn(this,fh(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const r=t.displayName??void 0,i=t.email??void 0,a=t.phoneNumber??void 0,l=t.photoURL??void 0,d=t.tenantId??void 0,g=t._redirectEventId??void 0,y=t.createdAt??void 0,_=t.lastLoginAt??void 0,{uid:S,emailVerified:T,isAnonymous:k,providerData:A,stsTokenManager:D}=t;F(S&&D,e,"internal-error");const P=Lt.fromJSON(this.name,D);F(typeof S=="string",e,"internal-error"),Je(r,e.name),Je(i,e.name),F(typeof T=="boolean",e,"internal-error"),F(typeof k=="boolean",e,"internal-error"),Je(a,e.name),Je(l,e.name),Je(d,e.name),Je(g,e.name),Je(y,e.name),Je(_,e.name);const O=new Ie({uid:S,auth:e,email:i,emailVerified:T,displayName:r,isAnonymous:k,photoURL:l,phoneNumber:a,tenantId:d,stsTokenManager:P,createdAt:y,lastLoginAt:_});return A&&Array.isArray(A)&&(O.providerData=A.map(M=>({...M}))),g&&(O._redirectEventId=g),O}static async _fromIdTokenResponse(e,t,r=!1){const i=new Lt;i.updateFromServerResponse(t);const a=new Ie({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await is(a),a}static async _fromGetAccountInfoResponse(e,t,r){const i=t.users[0];F(i.localId!==void 0,"internal-error");const a=i.providerUserInfo!==void 0?Xa(i.providerUserInfo):[],l=!(i.email&&i.passwordHash)&&!(a!=null&&a.length),d=new Lt;d.updateFromIdToken(r);const g=new Ie({uid:i.localId,auth:e,stsTokenManager:d,isAnonymous:l}),y={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:a,metadata:new mr(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(a!=null&&a.length)};return Object.assign(g,y),g}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Po=new Map;function Ue(n){$e(n instanceof Function,"Expected a class definition");let e=Po.get(n);return e?($e(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Po.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ya{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Ya.type="NONE";const Co=Ya;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qn(n,e,t){return`firebase:${n}:${e}:${t}`}class Mt{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:i,name:a}=this.auth;this.fullUserKey=Qn(this.userKey,i.apiKey,a),this.fullPersistenceKey=Qn("persistence",i.apiKey,a),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await rs(this.auth,{idToken:e}).catch(()=>{});return t?Ie._fromGetAccountInfoResponse(this.auth,t,e):null}return Ie._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new Mt(Ue(Co),e,r);const i=(await Promise.all(t.map(async y=>{if(await y._isAvailable())return y}))).filter(y=>y);let a=i[0]||Ue(Co);const l=Qn(r,e.config.apiKey,e.name);let d=null;for(const y of t)try{const _=await y._get(l);if(_){let S;if(typeof _=="string"){const T=await rs(e,{idToken:_}).catch(()=>{});if(!T)break;S=await Ie._fromGetAccountInfoResponse(e,T,_)}else S=Ie._fromJSON(e,_);y!==a&&(d=S),a=y;break}}catch{}const g=i.filter(y=>y._shouldAllowMigration);return!a._shouldAllowMigration||!g.length?new Mt(a,e,r):(a=g[0],d&&await a._set(l,d.toJSON()),await Promise.all(t.map(async y=>{if(y!==a)try{await y._remove(l)}catch{}})),new Mt(a,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ro(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(tc(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Qa(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(sc(e))return"Blackberry";if(rc(e))return"Webos";if(Za(e))return"Safari";if((e.includes("chrome/")||ec(e))&&!e.includes("edge/"))return"Chrome";if(nc(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Qa(n=ce()){return/firefox\//i.test(n)}function Za(n=ce()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function ec(n=ce()){return/crios\//i.test(n)}function tc(n=ce()){return/iemobile/i.test(n)}function nc(n=ce()){return/android/i.test(n)}function sc(n=ce()){return/blackberry/i.test(n)}function rc(n=ce()){return/webos/i.test(n)}function Ur(n=ce()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function _h(n=ce()){var e;return Ur(n)&&!!((e=window.navigator)!=null&&e.standalone)}function vh(){return fu()&&document.documentMode===10}function ic(n=ce()){return Ur(n)||nc(n)||rc(n)||sc(n)||/windows phone/i.test(n)||tc(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oc(n,e=[]){let t;switch(n){case"Browser":t=Ro(ce());break;case"Worker":t=`${Ro(ce())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${At}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ih{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=a=>new Promise((l,d)=>{try{const g=e(a);l(g)}catch(g){d(g)}});r.onAbort=t,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const i of t)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Th(n,e={}){return Ht(n,"GET","/v2/passwordPolicy",Mr(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Eh=6;class Sh{constructor(e){var r;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??Eh,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((r=e.allowedNonAlphanumericCharacters)==null?void 0:r.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),i&&(t.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,i,a){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=a))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ah{constructor(e,t,r,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Do(this),this.idTokenSubscription=new Do(this),this.beforeStateQueue=new Ih(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Ga,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(a=>this._resolvePersistenceManagerAvailable=a)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Ue(t)),this._initializationPromise=this.queue(async()=>{var r,i,a;if(!this._deleted&&(this.persistenceManager=await Mt.create(this,e),(r=this._resolvePersistenceManagerAvailable)==null||r.call(this),!this._deleted)){if((i=this._popupRedirectResolver)!=null&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((a=this.currentUser)==null?void 0:a.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await rs(this,{idToken:e}),r=await Ie._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var a;if(_e(this.app)){const l=this.app.settings.authIdToken;return l?new Promise(d=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(l).then(d,d))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let r=t,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const l=(a=this.redirectUser)==null?void 0:a._redirectEventId,d=r==null?void 0:r._redirectEventId,g=await this.tryRedirectSignIn(e);(!l||l===d)&&(g!=null&&g.user)&&(r=g.user,i=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(r)}catch(l){r=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(l))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return F(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await is(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=ah()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(_e(this.app))return Promise.reject(bt(this));const t=e?fe(e):null;return t&&F(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&F(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return _e(this.app)?Promise.reject(bt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return _e(this.app)?Promise.reject(bt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Ue(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Th(this),t=new Sh(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new St("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await bh(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Ue(e)||this._popupRedirectResolver;F(t,this,"argument-error"),this.redirectPersistenceManager=await Mt.create(this,[Ue(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,i){if(this._deleted)return()=>{};const a=typeof t=="function"?t:t.next.bind(t);let l=!1;const d=this._isInitialized?Promise.resolve():this._initializationPromise;if(F(d,this,"internal-error"),d.then(()=>{l||a(this.currentUser)}),typeof t=="function"){const g=e.addObserver(t,r,i);return()=>{l=!0,g()}}else{const g=e.addObserver(t);return()=>{l=!0,g()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return F(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=oc(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var i;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((i=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:i.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){var t;if(_e(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&rh(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function ps(n){return fe(n)}class Do{constructor(e){this.auth=e,this.observer=null,this.addObserver=xu(t=>this.observer=t)}get next(){return F(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Br={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function kh(n){Br=n}function Nh(n){return Br.loadJS(n)}function Ph(){return Br.gapiScript}function Ch(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rh(n,e){const t=ct(n,"auth");if(t.isInitialized()){const i=t.getImmediate(),a=t.getOptions();if(it(a,e??{}))return i;Ve(i,"already-initialized")}return t.initialize({options:e})}function Dh(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(Ue);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function jh(n,e,t){const r=ps(n);F(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!1,a=ac(e),{host:l,port:d}=Oh(e),g=d===null?"":`:${d}`,y={url:`${a}//${l}${g}/`},_=Object.freeze({host:l,port:d,protocol:a.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!r._canInitEmulator){F(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),F(it(y,r.config.emulator)&&it(_,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=y,r.emulatorConfig=_,r.settings.appVerificationDisabledForTesting=!0,$t(l)?(Ar(`${a}//${l}${g}`),kr("Auth",!0)):Lh()}function ac(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function Oh(n){const e=ac(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const a=i[1];return{host:a,port:jo(r.substr(a.length+1))}}else{const[a,l]=r.split(":");return{host:a,port:jo(l)}}}function jo(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function Lh(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cc{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Fe("not implemented")}_getIdTokenResponse(e){return Fe("not implemented")}_linkToIdToken(e,t){return Fe("not implemented")}_getReauthenticationResolver(e){return Fe("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ft(n,e){return dh(n,"POST","/v1/accounts:signInWithIdp",Mr(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mh="http://localhost";class It extends cc{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new It(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):Ve("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i,...a}=t;if(!r||!i)return null;const l=new It(r,i);return l.idToken=a.idToken||void 0,l.accessToken=a.accessToken||void 0,l.secret=a.secret,l.nonce=a.nonce,l.pendingToken=a.pendingToken||null,l}_getIdTokenResponse(e){const t=this.buildRequest();return Ft(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Ft(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Ft(e,t)}buildRequest(){const e={requestUri:Mh,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=_n(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lc{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class En extends lc{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qe extends En{constructor(){super("facebook.com")}static credential(e){return It._fromParams({providerId:Qe.PROVIDER_ID,signInMethod:Qe.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Qe.credentialFromTaggedObject(e)}static credentialFromError(e){return Qe.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Qe.credential(e.oauthAccessToken)}catch{return null}}}Qe.FACEBOOK_SIGN_IN_METHOD="facebook.com";Qe.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ze extends En{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return It._fromParams({providerId:Ze.PROVIDER_ID,signInMethod:Ze.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Ze.credentialFromTaggedObject(e)}static credentialFromError(e){return Ze.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return Ze.credential(t,r)}catch{return null}}}Ze.GOOGLE_SIGN_IN_METHOD="google.com";Ze.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class et extends En{constructor(){super("github.com")}static credential(e){return It._fromParams({providerId:et.PROVIDER_ID,signInMethod:et.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return et.credentialFromTaggedObject(e)}static credentialFromError(e){return et.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return et.credential(e.oauthAccessToken)}catch{return null}}}et.GITHUB_SIGN_IN_METHOD="github.com";et.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tt extends En{constructor(){super("twitter.com")}static credential(e,t){return It._fromParams({providerId:tt.PROVIDER_ID,signInMethod:tt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return tt.credentialFromTaggedObject(e)}static credentialFromError(e){return tt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return tt.credential(t,r)}catch{return null}}}tt.TWITTER_SIGN_IN_METHOD="twitter.com";tt.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,i=!1){const a=await Ie._fromIdTokenResponse(e,r,i),l=Oo(r);return new Bt({user:a,providerId:l,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const i=Oo(r);return new Bt({user:e,providerId:i,_tokenResponse:r,operationType:t})}}function Oo(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class os extends xe{constructor(e,t,r,i){super(t.code,t.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,os.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,i){return new os(e,t,r,i)}}function uc(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(a=>{throw a.code==="auth/multi-factor-auth-required"?os._fromErrorAndOperation(n,a,e,r):a})}async function Fh(n,e,t=!1){const r=await bn(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return Bt._forOperation(n,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Uh(n,e,t=!1){const{auth:r}=n;if(_e(r.app))return Promise.reject(bt(r));const i="reauthenticate";try{const a=await bn(n,uc(r,i,e,n),t);F(a.idToken,r,"internal-error");const l=Fr(a.idToken);F(l,r,"internal-error");const{sub:d}=l;return F(n.uid===d,r,"user-mismatch"),Bt._forOperation(n,i,a)}catch(a){throw(a==null?void 0:a.code)==="auth/user-not-found"&&Ve(r,"user-mismatch"),a}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Bh(n,e,t=!1){if(_e(n.app))return Promise.reject(bt(n));const r="signIn",i=await uc(n,r,e),a=await Bt._fromIdTokenResponse(n,r,i);return t||await n._updateCurrentUser(a.user),a}function Vh(n,e,t,r){return fe(n).onIdTokenChanged(e,t,r)}function $h(n,e,t){return fe(n).beforeAuthStateChanged(e,t)}function Hh(n,e,t,r){return fe(n).onAuthStateChanged(e,t,r)}function dc(n){return fe(n).signOut()}const as="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hc{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(as,"1"),this.storage.removeItem(as),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zh=1e3,Gh=10;class fc extends hc{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=ic(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),i=this.localCache[t];r!==i&&e(t,i,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((l,d,g)=>{this.notifyListeners(l,g)});return}const r=e.key;t?this.detachListener():this.stopPolling();const i=()=>{const l=this.storage.getItem(r);!t&&this.localCache[r]===l||this.notifyListeners(r,l)},a=this.storage.getItem(r);vh()&&a!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,Gh):i()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},zh)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}fc.type="LOCAL";const qh=fc;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gc extends hc{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}gc.type="SESSION";const pc=gc;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wh(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ms{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(i=>i.isListeningto(e));if(t)return t;const r=new ms(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:i,data:a}=t.data,l=this.handlersMap[i];if(!(l!=null&&l.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const d=Array.from(l).map(async y=>y(t.origin,a)),g=await Wh(d);t.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:g})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}ms.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vr(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kh{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let a,l;return new Promise((d,g)=>{const y=Vr("",20);i.port1.start();const _=setTimeout(()=>{g(new Error("unsupported_event"))},r);l={messageChannel:i,onMessage(S){const T=S;if(T.data.eventId===y)switch(T.data.status){case"ack":clearTimeout(_),a=setTimeout(()=>{g(new Error("timeout"))},3e3);break;case"done":clearTimeout(a),d(T.data.response);break;default:clearTimeout(_),clearTimeout(a),g(new Error("invalid_response"));break}}},this.handlers.add(l),i.port1.addEventListener("message",l.onMessage),this.target.postMessage({eventType:e,eventId:y,data:t},[i.port2])}).finally(()=>{l&&this.removeMessageHandler(l)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function je(){return window}function Jh(n){je().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mc(){return typeof je().WorkerGlobalScope<"u"&&typeof je().importScripts=="function"}async function Xh(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function Yh(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function Qh(){return mc()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yc="firebaseLocalStorageDb",Zh=1,cs="firebaseLocalStorage",wc="fbase_key";class Sn{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function ys(n,e){return n.transaction([cs],e?"readwrite":"readonly").objectStore(cs)}function ef(){const n=indexedDB.deleteDatabase(yc);return new Sn(n).toPromise()}function yr(){const n=indexedDB.open(yc,Zh);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(cs,{keyPath:wc})}catch(i){t(i)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(cs)?e(r):(r.close(),await ef(),e(await yr()))})})}async function Lo(n,e,t){const r=ys(n,!0).put({[wc]:e,value:t});return new Sn(r).toPromise()}async function tf(n,e){const t=ys(n,!1).get(e),r=await new Sn(t).toPromise();return r===void 0?null:r.value}function Mo(n,e){const t=ys(n,!0).delete(e);return new Sn(t).toPromise()}const nf=800,sf=3;class xc{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await yr(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>sf)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return mc()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=ms._getInstance(Qh()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,r;if(this.activeServiceWorker=await Xh(),!this.activeServiceWorker)return;this.sender=new Kh(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||Yh()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await yr();return await Lo(e,as,"1"),await Mo(e,as),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>Lo(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>tf(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Mo(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const a=ys(i,!1).getAll();return new Sn(a).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:a}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(a)&&(this.notifyListeners(i,a),t.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),t.push(i));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),nf)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}xc.type="LOCAL";const rf=xc;new Tn(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function of(n,e){return e?Ue(e):(F(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $r extends cc{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Ft(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Ft(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Ft(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function af(n){return Bh(n.auth,new $r(n),n.bypassAuthState)}function cf(n){const{auth:e,user:t}=n;return F(t,e,"internal-error"),Uh(t,new $r(n),n.bypassAuthState)}async function lf(n){const{auth:e,user:t}=n;return F(t,e,"internal-error"),Fh(t,new $r(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bc{constructor(e,t,r,i,a=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=a,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:i,tenantId:a,error:l,type:d}=e;if(l){this.reject(l);return}const g={auth:this.auth,requestUri:t,sessionId:r,tenantId:a||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(d)(g))}catch(y){this.reject(y)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return af;case"linkViaPopup":case"linkViaRedirect":return lf;case"reauthViaPopup":case"reauthViaRedirect":return cf;default:Ve(this.auth,"internal-error")}}resolve(e){$e(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){$e(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uf=new Tn(2e3,1e4);class jt extends bc{constructor(e,t,r,i,a){super(e,t,i,a),this.provider=r,this.authWindow=null,this.pollId=null,jt.currentPopupAction&&jt.currentPopupAction.cancel(),jt.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return F(e,this.auth,"internal-error"),e}async onExecution(){$e(this.filter.length===1,"Popup operations only handle one event");const e=Vr();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(De(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(De(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,jt.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if((r=(t=this.authWindow)==null?void 0:t.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(De(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,uf.get())};e()}}jt.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const df="pendingRedirect",Zn=new Map;class hf extends bc{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Zn.get(this.auth._key());if(!e){try{const r=await ff(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Zn.set(this.auth._key(),e)}return this.bypassAuthState||Zn.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function ff(n,e){const t=mf(e),r=pf(n);if(!await r._isAvailable())return!1;const i=await r._get(t)==="true";return await r._remove(t),i}function gf(n,e){Zn.set(n._key(),e)}function pf(n){return Ue(n._redirectPersistence)}function mf(n){return Qn(df,n.config.apiKey,n.name)}async function yf(n,e){return await ps(n)._initializationPromise,_c(n,e,!1)}async function _c(n,e,t=!1){if(_e(n.app))return Promise.reject(bt(n));const r=ps(n),i=of(r,e),l=await new hf(r,i,t).execute();return l&&!t&&(delete l.user._redirectEventId,await r._persistUserIfCurrent(l.user),await r._setRedirectUser(null,e)),l}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wf=600*1e3;class xf{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!bf(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!vc(e)){const i=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";t.onError(De(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=wf&&this.cachedEventUids.clear(),this.cachedEventUids.has(Fo(e))}saveEventToCache(e){this.cachedEventUids.add(Fo(e)),this.lastProcessedEventTime=Date.now()}}function Fo(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function vc({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function bf(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return vc(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _f(n,e={}){return Ht(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vf=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,If=/^https?/;async function Tf(n){if(n.config.emulator)return;const{authorizedDomains:e}=await _f(n);for(const t of e)try{if(Ef(t))return}catch{}Ve(n,"unauthorized-domain")}function Ef(n){const e=pr(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const l=new URL(n);return l.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&l.hostname===r}if(!If.test(t))return!1;if(vf.test(n))return r===n;const i=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sf=new Tn(3e4,6e4);function Uo(){const n=je().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function Af(n){return new Promise((e,t)=>{var i,a,l;function r(){Uo(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Uo(),t(De(n,"network-request-failed"))},timeout:Sf.get()})}if((a=(i=je().gapi)==null?void 0:i.iframes)!=null&&a.Iframe)e(gapi.iframes.getContext());else if((l=je().gapi)!=null&&l.load)r();else{const d=Ch("iframefcb");return je()[d]=()=>{gapi.load?r():t(De(n,"network-request-failed"))},Nh(`${Ph()}?onload=${d}`).catch(g=>t(g))}}).catch(e=>{throw es=null,e})}let es=null;function kf(n){return es=es||Af(n),es}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nf=new Tn(5e3,15e3),Pf="__/auth/iframe",Cf="emulator/auth/iframe",Rf={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Df=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function jf(n){const e=n.config;F(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Lr(e,Cf):`https://${n.config.authDomain}/${Pf}`,r={apiKey:e.apiKey,appName:n.name,v:At},i=Df.get(n.config.apiHost);i&&(r.eid=i);const a=n._getFrameworks();return a.length&&(r.fw=a.join(",")),`${t}?${_n(r).slice(1)}`}async function Of(n){const e=await kf(n),t=je().gapi;return F(t,n,"internal-error"),e.open({where:document.body,url:jf(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Rf,dontclear:!0},r=>new Promise(async(i,a)=>{await r.restyle({setHideOnLeave:!1});const l=De(n,"network-request-failed"),d=je().setTimeout(()=>{a(l)},Nf.get());function g(){je().clearTimeout(d),i(r)}r.ping(g).then(g,()=>{a(l)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lf={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Mf=500,Ff=600,Uf="_blank",Bf="http://localhost";class Bo{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Vf(n,e,t,r=Mf,i=Ff){const a=Math.max((window.screen.availHeight-i)/2,0).toString(),l=Math.max((window.screen.availWidth-r)/2,0).toString();let d="";const g={...Lf,width:r.toString(),height:i.toString(),top:a,left:l},y=ce().toLowerCase();t&&(d=ec(y)?Uf:t),Qa(y)&&(e=e||Bf,g.scrollbars="yes");const _=Object.entries(g).reduce((T,[k,A])=>`${T}${k}=${A},`,"");if(_h(y)&&d!=="_self")return $f(e||"",d),new Bo(null);const S=window.open(e||"",d,_);F(S,n,"popup-blocked");try{S.focus()}catch{}return new Bo(S)}function $f(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hf="__/auth/handler",zf="emulator/auth/handler",Gf=encodeURIComponent("fac");async function Vo(n,e,t,r,i,a){F(n.config.authDomain,n,"auth-domain-config-required"),F(n.config.apiKey,n,"invalid-api-key");const l={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:At,eventId:i};if(e instanceof lc){e.setDefaultLanguage(n.languageCode),l.providerId=e.providerId||"",wu(e.getCustomParameters())||(l.customParameters=JSON.stringify(e.getCustomParameters()));for(const[_,S]of Object.entries({}))l[_]=S}if(e instanceof En){const _=e.getScopes().filter(S=>S!=="");_.length>0&&(l.scopes=_.join(","))}n.tenantId&&(l.tid=n.tenantId);const d=l;for(const _ of Object.keys(d))d[_]===void 0&&delete d[_];const g=await n._getAppCheckToken(),y=g?`#${Gf}=${encodeURIComponent(g)}`:"";return`${qf(n)}?${_n(d).slice(1)}${y}`}function qf({config:n}){return n.emulator?Lr(n,zf):`https://${n.authDomain}/${Hf}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zs="webStorageSupport";class Wf{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=pc,this._completeRedirectFn=_c,this._overrideRedirectResult=gf}async _openPopup(e,t,r,i){var l;$e((l=this.eventManagers[e._key()])==null?void 0:l.manager,"_initialize() not called before _openPopup()");const a=await Vo(e,t,r,pr(),i);return Vf(e,a,Vr())}async _openRedirect(e,t,r,i){await this._originValidation(e);const a=await Vo(e,t,r,pr(),i);return Jh(a),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:i,promise:a}=this.eventManagers[t];return i?Promise.resolve(i):($e(a,"If manager is not set, promise should be"),a)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await Of(e),r=new xf(e);return t.register("authEvent",i=>(F(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Zs,{type:Zs},i=>{var l;const a=(l=i==null?void 0:i[0])==null?void 0:l[Zs];a!==void 0&&t(!!a),Ve(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=Tf(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return ic()||Za()||Ur()}}const Kf=Wf;var $o="@firebase/auth",Ho="1.12.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jf{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){F(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xf(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Yf(n){Ee(new we("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),a=e.getProvider("app-check-internal"),{apiKey:l,authDomain:d}=r.options;F(l&&!l.includes(":"),"invalid-api-key",{appName:r.name});const g={apiKey:l,authDomain:d,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:oc(n)},y=new Ah(r,i,a,g);return Dh(y,t),y},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Ee(new we("auth-internal",e=>{const t=ps(e.getProvider("auth").getImmediate());return(r=>new Jf(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),de($o,Ho,Xf(n)),de($o,Ho,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qf=300,Zf=ka("authIdTokenMaxAge")||Qf;let zo=null;const eg=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>Zf)return;const i=t==null?void 0:t.token;zo!==i&&(zo=i,await fetch(n,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function tg(n=gs()){const e=ct(n,"auth");if(e.isInitialized())return e.getImmediate();const t=Rh(n,{popupRedirectResolver:Kf,persistence:[rf,qh,pc]}),r=ka("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const a=new URL(r,location.origin);if(location.origin===a.origin){const l=eg(a.toString());$h(t,l,()=>l(t.currentUser)),Vh(t,d=>l(d))}}const i=Ea("auth");return i&&jh(t,`http://${i}`),t}function ng(){var n;return((n=document.getElementsByTagName("head"))==null?void 0:n[0])??document}kh({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=i=>{const a=De("internal-error");a.customData=i,t(a)},r.type="text/javascript",r.charset="UTF-8",ng().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Yf("Browser");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ic="firebasestorage.googleapis.com",sg="storageBucket",rg=120*1e3,ig=600*1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Le extends xe{constructor(e,t,r=0){super(er(e),`Firebase Storage: ${t} (${er(e)})`),this.status_=r,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,Le.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return er(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var Oe;(function(n){n.UNKNOWN="unknown",n.OBJECT_NOT_FOUND="object-not-found",n.BUCKET_NOT_FOUND="bucket-not-found",n.PROJECT_NOT_FOUND="project-not-found",n.QUOTA_EXCEEDED="quota-exceeded",n.UNAUTHENTICATED="unauthenticated",n.UNAUTHORIZED="unauthorized",n.UNAUTHORIZED_APP="unauthorized-app",n.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",n.INVALID_CHECKSUM="invalid-checksum",n.CANCELED="canceled",n.INVALID_EVENT_NAME="invalid-event-name",n.INVALID_URL="invalid-url",n.INVALID_DEFAULT_BUCKET="invalid-default-bucket",n.NO_DEFAULT_BUCKET="no-default-bucket",n.CANNOT_SLICE_BLOB="cannot-slice-blob",n.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",n.NO_DOWNLOAD_URL="no-download-url",n.INVALID_ARGUMENT="invalid-argument",n.INVALID_ARGUMENT_COUNT="invalid-argument-count",n.APP_DELETED="app-deleted",n.INVALID_ROOT_OPERATION="invalid-root-operation",n.INVALID_FORMAT="invalid-format",n.INTERNAL_ERROR="internal-error",n.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(Oe||(Oe={}));function er(n){return"storage/"+n}function og(){const n="An unknown error occurred, please check the error payload for server response.";return new Le(Oe.UNKNOWN,n)}function ag(){return new Le(Oe.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function cg(){return new Le(Oe.CANCELED,"User canceled the upload/download.")}function lg(n){return new Le(Oe.INVALID_URL,"Invalid URL '"+n+"'.")}function ug(n){return new Le(Oe.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+n+"'.")}function Go(n){return new Le(Oe.INVALID_ARGUMENT,n)}function Tc(){return new Le(Oe.APP_DELETED,"The Firebase app was deleted.")}function dg(n){return new Le(Oe.INVALID_ROOT_OPERATION,"The operation '"+n+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Te{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let r;try{r=Te.makeFromUrl(e,t)}catch{return new Te(e,"")}if(r.path==="")return r;throw ug(e)}static makeFromUrl(e,t){let r=null;const i="([A-Za-z0-9.\\-_]+)";function a(B){B.path.charAt(B.path.length-1)==="/"&&(B.path_=B.path_.slice(0,-1))}const l="(/(.*))?$",d=new RegExp("^gs://"+i+l,"i"),g={bucket:1,path:3};function y(B){B.path_=decodeURIComponent(B.path)}const _="v[A-Za-z0-9_]+",S=t.replace(/[.]/g,"\\."),T="(/([^?#]*).*)?$",k=new RegExp(`^https?://${S}/${_}/b/${i}/o${T}`,"i"),A={bucket:1,path:3},D=t===Ic?"(?:storage.googleapis.com|storage.cloud.google.com)":t,P="([^?#]*)",O=new RegExp(`^https?://${D}/${i}/${P}`,"i"),$=[{regex:d,indices:g,postModify:a},{regex:k,indices:A,postModify:y},{regex:O,indices:{bucket:1,path:2},postModify:y}];for(let B=0;B<$.length;B++){const H=$[B],z=H.regex.exec(e);if(z){const b=z[H.indices.bucket];let p=z[H.indices.path];p||(p=""),r=new Te(b,p),H.postModify(r);break}}if(r==null)throw lg(e);return r}}class hg{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fg(n,e,t){let r=1,i=null,a=null,l=!1,d=0;function g(){return d===2}let y=!1;function _(...P){y||(y=!0,e.apply(null,P))}function S(P){i=setTimeout(()=>{i=null,n(k,g())},P)}function T(){a&&clearTimeout(a)}function k(P,...O){if(y){T();return}if(P){T(),_.call(null,P,...O);return}if(g()||l){T(),_.call(null,P,...O);return}r<64&&(r*=2);let $;d===1?(d=2,$=0):$=(r+Math.random())*1e3,S($)}let A=!1;function D(P){A||(A=!0,T(),!y&&(i!==null?(P||(d=2),clearTimeout(i),S(0)):P||(d=1)))}return S(0),a=setTimeout(()=>{l=!0,D(!0)},t),D}function gg(n){n(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pg(n){return n!==void 0}function qo(n,e,t,r){if(r<e)throw Go(`Invalid value for '${n}'. Expected ${e} or greater.`);if(r>t)throw Go(`Invalid value for '${n}'. Expected ${t} or less.`)}function mg(n){const e=encodeURIComponent;let t="?";for(const r in n)if(n.hasOwnProperty(r)){const i=e(r)+"="+e(n[r]);t=t+i+"&"}return t=t.slice(0,-1),t}var ls;(function(n){n[n.NO_ERROR=0]="NO_ERROR",n[n.NETWORK_ERROR=1]="NETWORK_ERROR",n[n.ABORT=2]="ABORT"})(ls||(ls={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yg(n,e){const t=n>=500&&n<600,i=[408,429].indexOf(n)!==-1,a=e.indexOf(n)!==-1;return t||i||a}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wg{constructor(e,t,r,i,a,l,d,g,y,_,S,T=!0,k=!1){this.url_=e,this.method_=t,this.headers_=r,this.body_=i,this.successCodes_=a,this.additionalRetryCodes_=l,this.callback_=d,this.errorCallback_=g,this.timeout_=y,this.progressCallback_=_,this.connectionFactory_=S,this.retry=T,this.isUsingEmulator=k,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((A,D)=>{this.resolve_=A,this.reject_=D,this.start_()})}start_(){const e=(r,i)=>{if(i){r(!1,new Hn(!1,null,!0));return}const a=this.connectionFactory_();this.pendingConnection_=a;const l=d=>{const g=d.loaded,y=d.lengthComputable?d.total:-1;this.progressCallback_!==null&&this.progressCallback_(g,y)};this.progressCallback_!==null&&a.addUploadProgressListener(l),a.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&a.removeUploadProgressListener(l),this.pendingConnection_=null;const d=a.getErrorCode()===ls.NO_ERROR,g=a.getStatus();if(!d||yg(g,this.additionalRetryCodes_)&&this.retry){const _=a.getErrorCode()===ls.ABORT;r(!1,new Hn(!1,null,_));return}const y=this.successCodes_.indexOf(g)!==-1;r(!0,new Hn(y,a))})},t=(r,i)=>{const a=this.resolve_,l=this.reject_,d=i.connection;if(i.wasSuccessCode)try{const g=this.callback_(d,d.getResponse());pg(g)?a(g):a()}catch(g){l(g)}else if(d!==null){const g=og();g.serverResponse=d.getErrorText(),this.errorCallback_?l(this.errorCallback_(d,g)):l(g)}else if(i.canceled){const g=this.appDelete_?Tc():cg();l(g)}else{const g=ag();l(g)}};this.canceled_?t(!1,new Hn(!1,null,!0)):this.backoffId_=fg(e,t,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&gg(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class Hn{constructor(e,t,r){this.wasSuccessCode=e,this.connection=t,this.canceled=!!r}}function xg(n,e){e!==null&&e.length>0&&(n.Authorization="Firebase "+e)}function bg(n,e){n["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function _g(n,e){e&&(n["X-Firebase-GMPID"]=e)}function vg(n,e){e!==null&&(n["X-Firebase-AppCheck"]=e)}function Ig(n,e,t,r,i,a,l=!0,d=!1){const g=mg(n.urlParams),y=n.url+g,_=Object.assign({},n.headers);return _g(_,e),xg(_,t),bg(_,a),vg(_,r),new wg(y,n.method,_,n.body,n.successCodes,n.additionalRetryCodes,n.handler,n.errorHandler,n.timeout,n.progressCallback,i,l,d)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tg(n){if(n.length===0)return null;const e=n.lastIndexOf("/");return e===-1?"":n.slice(0,e)}function Eg(n){const e=n.lastIndexOf("/",n.length-2);return e===-1?n:n.slice(e+1)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class us{constructor(e,t){this._service=e,t instanceof Te?this._location=t:this._location=Te.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new us(e,t)}get root(){const e=new Te(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return Eg(this._location.path)}get storage(){return this._service}get parent(){const e=Tg(this._location.path);if(e===null)return null;const t=new Te(this._location.bucket,e);return new us(this._service,t)}_throwIfRoot(e){if(this._location.path==="")throw dg(e)}}function Wo(n,e){const t=e==null?void 0:e[sg];return t==null?null:Te.makeFromBucketSpec(t,n)}function Sg(n,e,t,r={}){n.host=`${e}:${t}`;const i=$t(e);i&&(Ar(`https://${n.host}/b`),kr("Storage",!0)),n._isUsingEmulator=!0,n._protocol=i?"https":"http";const{mockUserToken:a}=r;a&&(n._overrideAuthToken=typeof a=="string"?a:Na(a,n.app.options.projectId))}class Ag{constructor(e,t,r,i,a,l=!1){this.app=e,this._authProvider=t,this._appCheckProvider=r,this._url=i,this._firebaseVersion=a,this._isUsingEmulator=l,this._bucket=null,this._host=Ic,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=rg,this._maxUploadRetryTime=ig,this._requests=new Set,i!=null?this._bucket=Te.makeFromBucketSpec(i,this._host):this._bucket=Wo(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=Te.makeFromBucketSpec(this._url,e):this._bucket=Wo(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){qo("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){qo("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const t=await e.getToken();if(t!==null)return t.accessToken}return null}async _getAppCheckToken(){if(_e(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new us(this,e)}_makeRequest(e,t,r,i,a=!0){if(this._deleted)return new hg(Tc());{const l=Ig(e,this._appId,r,i,t,this._firebaseVersion,a,this._isUsingEmulator);return this._requests.add(l),l.getPromise().then(()=>this._requests.delete(l),()=>this._requests.delete(l)),l}}async makeRequestWithTokens(e,t){const[r,i]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,r,i).getPromise()}}const Ko="@firebase/storage",Jo="0.14.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ec="storage";function kg(n=gs(),e){n=fe(n);const r=ct(n,Ec).getImmediate({identifier:e}),i=Sa("storage");return i&&Ng(r,...i),r}function Ng(n,e,t,r={}){Sg(n,e,t,r)}function Pg(n,{instanceIdentifier:e}){const t=n.getProvider("app").getImmediate(),r=n.getProvider("auth-internal"),i=n.getProvider("app-check-internal");return new Ag(t,r,i,e,At)}function Cg(){Ee(new we(Ec,Pg,"PUBLIC").setMultipleInstances(!0)),de(Ko,Jo,""),de(Ko,Jo,"esm2020")}Cg();const Rg=()=>!0,Dg=window.__FIREBASE_CONFIG__,Xo=Dg||{apiKey:"AIzaSyAvSKdOJjV1QxCt5jAL1YEyeE6osYGsWqw",authDomain:"gen-lang-client-0420977017.firebaseapp.com",projectId:"gen-lang-client-0420977017",storageBucket:"gs://gen-lang-client-0420977017.firebasestorage.app",messagingSenderId:"1035759192694",appId:"1:1035759192694:web:bbe252f079c54e46746d57"};let ln=null,at=null;if(!Rg()){Xo.apiKey||console.error("[Firebase] Config missing! Check environment variables.");const n=Da();n.length>0?ln=n[0]:ln=Nr(Xo),Qd(ln),at=tg(ln),kg(ln)}let jg=null,Og=null;const Lg=async()=>{try{const n=localStorage.getItem("eureka_token");n&&n.length>500&&localStorage.removeItem("eureka_token");const e=await fetch("/api/auth/oa/user-info",{method:"GET",credentials:"include"});if(!e.ok)return!1;const t=await e.json();if(t.success&&t.user){const r={id:t.user.id,email:`${t.user.id}@tencent.com`,name:t.user.name,picture:t.user.picture,isGuest:!1,roleTags:["work_engineer"]};return jg=r,Og=t.user.id,localStorage.setItem("eureka_user",JSON.stringify(r)),t.token&&localStorage.setItem("eureka_token",t.token),!0}return!1}catch(n){return console.error("[OA Login] è·åç¨æ·ä¿¡æ¯å¼å¸¸:",n),!1}},Mg=()=>{const n=new URLSearchParams(window.location.search);if(n.has("code")||n.has("login_ticket")){const e=window.location.origin+window.location.pathname;window.history.replaceState({},"",e)}},Fg=()=>{let n=!1,e="default";if(typeof document<"u"){const t=document.querySelector('meta[name="enable-guest-login"]');if(t){const r=t.getAttribute("content");r&&(n=String(r).trim().toLowerCase()==="true",e="meta-tag")}}return e==="default"&&(n=String("false").trim().toLowerCase()==="true",e="env-var"),n},Ug=Fg(),Bg="æ¸¸å®¢æ¢ç´¢è",Vg="guest+{id}@local.test",$g="/guest-avatar.svg",Hg=["work_engineer"],Yo=(n,e)=>n?n.includes("{id}")?n.replace("{id}",e):n:e;let tr=null;const zg=async()=>(tr||(tr=ye(()=>import("./vendor-C9WqxvgN.js").then(n=>n.bx),__vite__mapDeps([0,1])).then(n=>n.load())),tr),Gg=n=>{const e=Hg.slice(0,3);return e.length>0?e:["work_engineer"]},qg=async()=>{Hh(at,async n=>{if(n)await Qo(n);else{const e=me();if(e){if(e.authProvider==="wechat")return;localStorage.removeItem("eureka_user"),localStorage.removeItem("eureka_token"),window.dispatchEvent(new CustomEvent("eureka:user-logout"))}}});try{const n=await yf(at);n!=null&&n.user&&await Qo(n.user)}catch(n){console.error("[Auth] Redirect result error:",n)}};async function Qo(n){try{const e=n.isAnonymous;if(e&&!Ug){console.warn("[Auth] Guest login is disabled, signing out anonymous user"),await dc(at),localStorage.removeItem("eureka_user"),localStorage.removeItem("eureka_token"),window.dispatchEvent(new CustomEvent("eureka:user-logout"));return}const t=localStorage.getItem("eureka_user");let r,i;if(t)try{const d=JSON.parse(t);r=d.role,i=d.roleTags}catch{}let a;if(e){const d=await zg(),{visitorId:g}=await d.get(),y=i||Gg();a={id:n.uid,name:Yo(Bg,g.substring(0,6)),email:Yo(Vg,g),picture:$g,roleTags:y,isGuest:!0,...r&&{role:r}}}else a={id:n.uid,email:n.email||"",name:n.displayName||"",picture:n.photoURL||"",isGuest:!1,...r&&{role:r},...i&&{roleTags:i}};const l=await n.getIdToken();localStorage.setItem("eureka_user",JSON.stringify(a)),localStorage.setItem("eureka_token",l),setTimeout(async()=>{try{const{loadUserRoleTagsFromBackend:d}=await ye(async()=>{const{loadUserRoleTagsFromBackend:g}=await import("./roleService-B4OicxfU.js");return{loadUserRoleTagsFromBackend:g}},__vite__mapDeps([2,0,1]));await d()}catch(d){console.warn("[Auth] Failed to load role tags from backend:",d)}},100),setTimeout(()=>{ye(async()=>{const{setAnalyticsUserId:d,logAnalyticsEvent:g,AnalyticsEvents:y,setAnalyticsUserProperties:_}=await Promise.resolve().then(()=>Ry);return{setAnalyticsUserId:d,logAnalyticsEvent:g,AnalyticsEvents:y,setAnalyticsUserProperties:_}},void 0).then(({setAnalyticsUserId:d,logAnalyticsEvent:g,AnalyticsEvents:y,setAnalyticsUserProperties:_})=>{d(a.id),_({email:a.email||"",name:a.name||""}),g(y.USER_LOGIN,{user_id:a.id,email:a.email})}).catch(d=>console.warn("[Auth] Failed to log analytics:",d)),ye(async()=>{const{setRUMUserId:d,reportRUMEvent:g,RUMEvents:y}=await Promise.resolve().then(()=>Vy);return{setRUMUserId:d,reportRUMEvent:g,RUMEvents:y}},void 0).then(({setRUMUserId:d,reportRUMEvent:g,RUMEvents:y})=>{d(a.id),g(y.USER_LOGIN,{user_id:a.id,login_method:"firebase"})}).catch(d=>console.warn("[Auth] Failed to set RUM user ID:",d))},100),setTimeout(()=>{ye(async()=>{const{saveDeviceInfo:d}=await import("./deviceInfoService-ClxmVOum.js");return{saveDeviceInfo:d}},__vite__mapDeps([3,0,1])).then(({saveDeviceInfo:d})=>{var S;const g=a.isGuest||!1;let y="unknown",_;if(g)y="anonymous";else if(n.providerData&&n.providerData.length>0){const T=(S=n.providerData[0])==null?void 0:S.providerId;T==="google.com"?(y="google",_=n.email||n.displayName||void 0):T==="password"?(y="email",_=n.email||void 0):_=n.email||n.displayName||void 0}else _=n.email||n.displayName||void 0;d(l,a.id,g,y,_,a.name).catch(T=>{console.warn("[Auth] Failed to save device info:",T)})}).catch(d=>console.warn("[Auth] Failed to load deviceInfoService:",d))},200),window.dispatchEvent(new CustomEvent("eureka:user-login",{detail:{...a,_loginMeta:{auto:!1,source:"google_or_email"}}}))}catch(e){console.error("[Auth] Failed to handle Firebase user:",e)}}const Wg=async()=>{const n=me(),e=(n==null?void 0:n.isGuest)===!0;try{const{requestManager:t}=await ye(async()=>{const{requestManager:r}=await import("./requestManager-CNNKBBWR.js");return{requestManager:r}},[]);t.cancelAll()}catch(t){console.warn("[Auth] åæ¶è¯·æ±æ¶åºé:",t)}try{at.currentUser&&await dc(at)}catch(t){console.error("[Auth] Firebase Auth sign out error:",t)}e||(localStorage.removeItem("eureka_user"),localStorage.removeItem("eureka_token"),document.cookie.split(";").forEach(r=>{const i=r.indexOf("="),a=i>-1?r.substr(0,i).trim():r.trim();a&&(document.cookie=`${a}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`,document.cookie=`${a}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${window.location.pathname}`)})),window.dispatchEvent(new CustomEvent("eureka:user-logout"))},me=()=>{try{const n=localStorage.getItem("eureka_user");return n?JSON.parse(n):null}catch{return null}},Sc=()=>{var r;const n=localStorage.getItem("eureka_token"),e=me();if(!n||!e)return!1;const t=n.split(".");if(t.length!==3)return!1;try{const i=JSON.parse(atob(t[1]));return!(i.firebase||(r=i.iss)!=null&&r.includes("securetoken.google.com"))}catch{return!0}},Kg=async()=>Sc()&&me()?(localStorage.removeItem("eureka_token"),!0):!1,Ac=async()=>{var n;try{if("tencent"==="devcloud"||!at){const r=localStorage.getItem("eureka_token"),i=localStorage.getItem("eureka_user");return r&&i?r:null}const t=at.currentUser;if(!t){const r=localStorage.getItem("eureka_token");return r?(localStorage.getItem("eureka_user"),r):null}try{const r=await t.getIdToken(!1);return localStorage.setItem("eureka_token",r),r}catch(r){if(r.code==="auth/quota-exceeded"){console.warn("[Auth] â ï¸ Firebase quota exceeded, using cached token");const i=localStorage.getItem("eureka_token");if(i)return i;throw new Error("Firebase service temporarily unavailable. Please try again later.")}throw r}}catch(e){if(console.error("[Auth] Failed to get auth token:",e),(n=e.message)!=null&&n.includes("quota")||e.code==="auth/quota-exceeded"){const t=localStorage.getItem("eureka_token");if(t)return console.warn("[Auth] â ï¸ Falling back to cached token due to quota limit"),t}return null}},Jg=Object.freeze(Object.defineProperty({__proto__:null,getAuthToken:Ac,getCurrentUser:me,handleTokenMigration:Kg,initializeGoogleAuth:qg,logout:Wg,needsReauth:Sc},Symbol.toStringTag,{value:"Module"})),wr="eureka:token-expired";function Xg(n){console.warn("[TokenExpiry] Token expired, triggering login modal",{reason:n}),window.dispatchEvent(new CustomEvent(wr,{detail:{reason:n,timestamp:Date.now()}}))}function Yg(n){const e=t=>{n(t.detail)};return window.addEventListener(wr,e),()=>{window.removeEventListener(wr,e)}}function Gy(n){return n.status===401?typeof window<"u"&&(window.location.hostname.includes("woa.com")||window.location.origin.includes("datamind"))?(console.warn("[TokenExpiry] 401 detected in DevCloud, triggering silent OA sync..."),window.dispatchEvent(new CustomEvent("eureka:oa-sync-required")),!0):(Xg("401 Unauthorized"),!0):!1}function Qg(n,e){N.useEffect(()=>{const t=Yg(r=>{console.warn("[useTokenExpiredHandler] Token expired, showing login modal",r),e&&e("æ¨çç»å½å·²è¿æï¼è¯·éæ°ç»å½ä»¥ç»§ç»­ä½¿ç¨","warning","top-center"),setTimeout(()=>{n(!0)},500)});return()=>{t()}},[n,e])}function Zg({t:n,onAutoGuestLogin:e,onLogout:t}){const{showToast:r}=_a(),[i,a]=N.useState(me()),[l,d]=N.useState(!1),[g,y]=N.useState(!1),[_,S]=N.useState(!1),[T,k]=N.useState(!1),[A,D]=N.useState(""),[P,O]=N.useState(""),[M,$]=N.useState(!1),B=N.useRef(null);return Qg(d,r),N.useEffect(()=>{const H=p=>{const m=p.detail,x=(m==null?void 0:m._loginMeta)||{};if(`${m==null?void 0:m.id}${Date.now()}`,B.current===(m==null?void 0:m.id))return;m==null||m.id,m==null||m.isGuest,x.auto,x.source,B.current=m==null?void 0:m.id;const{_loginMeta:w,...v}=m;a(v),m!=null&&m.isGuest&&x.auto===!0?e==null||e():m!=null&&m.isGuest&&x.auto===!1&&r(n.enteredGuestMode||"å·²è¿å¥æ¸¸å®¢æ¨¡å¼ï¼å¼å§æ¢ç´¢å§ï¼","success","top-center"),setTimeout(()=>{B.current=null},500)},z=()=>{a(null),t==null||t()},b=()=>{d(!1)};return window.addEventListener("eureka:user-login",H),window.addEventListener("eureka:user-logout",z),window.addEventListener("eureka:oa-login-success",b),()=>{window.removeEventListener("eureka:user-login",H),window.removeEventListener("eureka:user-logout",z),window.removeEventListener("eureka:oa-login-success",b)}},[n,r,e,t]),{user:i,setUser:a,showLoginModal:l,setShowLoginModal:d,isLoggingIn:g,setIsLoggingIn:y,isEmailLoading:_,setIsEmailLoading:S,showEmailLogin:T,setShowEmailLogin:k,email:A,setEmail:D,password:P,setPassword:O,isRegisterMode:M,setIsRegisterMode:$}}const ep={slogans:["ä» {æç´¢} å° {æ¢ç´¢} ï¼æå¼ç­æ¡çæ°æ¹å¼","æ¯æ{æ¬å° AI}æ¨¡å¼ï¼æ³¨ééç§ï¼å®å¨ä¸ç¬ç«","AI é©±å¨çæ·±åº¦æ´å¯ï¼å¯å{æªç¥}ççµæè¿æ¥"],seo:{title:"Eureka - AI é©±å¨çæ éç»å¸ç¥è¯æç´¢ä¸å¯è§åç®¡ç",description:"Eureka æ¯ä¸æ¬¾é©å½æ§ç AI ç¥è¯æ¢ç´¢å¼æãå®å°å¤æçæç´¢ç»æè½¬åä¸ºäº¤äºå¼ç¥è¯å¾è°±ï¼æ¯æ PDF åæãæ·±åº¦ AI æç´¢åæ°æ®æ´å¯ãæç»ç¢çåï¼æå»ºæ¨çå¯è§åç¬¬äºå¤§èã",keywords:"AIæç´¢, ç¥è¯å¾è°±, æç»´å¯¼å¾, Perplexityæ¿ä»£, NotebookLM, å¯è§åå­¦ä¹ , æç®åæ, ç¬¬äºå¤§è, æ éç»å¸, çäº§åå·¥å·, å°¤éå¡, eurekafinder"},explorationMode:{world:"æ¢ç´¢ä¸ç",data:"æ¢ç´¢æ°æ®",lab:"å®éªå®¤",search:"æç´¢",worldDesc:"æé®æä¸ä¼ ææ¡£ï¼æ¢ç´¢ä¸çç¥è¯",dataDesc:"ä¸ä¼  Excel/CSV æä»¶ï¼æ¢ç´¢æ°æ®æ´å¯",labDesc:"ä½éªå®éªæ§ AI åè½",searchDesc:"æç´¢äºèç½ç¥è¯ï¼AI ä¸ºä½ æ´åç²¾ç¼",newFeatureBadge:"æ°åè½",switchToWorld:"åæ¢å°ä¸çæ¢ç´¢",switchToData:"åæ¢å°æ°æ®æ¢ç´¢",switchToLab:"åæ¢å°å®éªå®¤",switchToSearch:"åæ¢å°æç´¢æ¨¡å¼",labTitle:"Eureka å®éªå®¤",labSubtitle:"æ¢ç´¢ AI çæ éå¯è½ï¼å­µåæªæ¥çç¥è¯å½¢æã",labFeatures:[{title:"AI è¾©è®ºåº",desc:"è®©ä¸¤ä¸ª AI éå¯¹ä½ çè¯é¢è¿è¡æ·±åº¦è¾©è®ºï¼çæ¸æ­£åè§ç¹ã"},{title:"å¤ç»´ç¥è¯å¾è°±",desc:"å¨ 3D ç©ºé´ä¸­æ¼«æ¸¸ç¥è¯èç¹ï¼åç°éèçå³èã"},{title:"å³æ¶æ­å®¢",desc:"å°ä»»ææç« æä¸»é¢ä¸é®è½¬åä¸ºåäººå¯¹è°æ­å®¢ã"}],comingSoon:"æ¬è¯·æå¾"},searchPlaceholder:"ä»å¤©çä½ å¥½å¥ä»ä¹ï¼",dataSearchPlaceholder:"ä¸ä¼ æ°æ®æä»¶æè¾å¥é®é¢...",searchModeSearchPlaceholder:"è¾å¥å³é®è¯ï¼AI å¸®ä½ æç´¢å¹¶æ´åç¥è¯...",chatPlaceholder:"å Eureka èè...",aiExplore:"AI æ¢ç´¢",brandStory:'å°¤éå¡ï¼å¤å¸èè¯­ Îµá½ÏÎ·ÎºÎ±ï¼æä¸º"æåç°äºï¼"ï¼å é¿åºç±³å¾·æ´æ¾¡åç°æµ®åå®å¾é«åèåºåã',pageTitleSuffix:"ï½ Eureka-ä»æç´¢å°æ¢ç´¢ï¼æå¼ç­æ¡çæ°æ¹å¼",uploadKnowledge:"ä¸ä¼ ä¸ªäººç¥è¯",featureNotReady:"åè½ææªå¼æ¾ï¼æ¬¢è¿åä½èç³»",backToHome:"è¿åé¦é¡µ",locationError:"AI æå¡å¨æ¨å½åå°åºä¸å¯ç¨ï¼å·²åæ¢è³æ¨¡ææ¨¡å¼ãè¯·å°è¯ä½¿ç¨VPNåéè¯ã",deleteConfirmTitle:"ç¡®è®¤å é¤",deleteConfirmDesc:"è¿ä¸ªæä½æ æ³æ¤éãæ­¤å¡çåå¶ææåç»­æ¢ç´¢åæ¯é½å°è¢«æ°¸ä¹å é¤ã",cancel:"åæ¶",confirmDelete:"ç¡®è®¤å é¤",loadingLog:"AIæ­£å¨ææç¥è¯èç»...",loadingPlan:"AIæ­£å¨è§åæ¢ç´¢è·¯å¾...",regenerating:"æ­£å¨éæ°çæ...",thinkTitle:"æè·¯åèç¨¿",tools:{ai_explore:"AI æ¢ç´¢",lite_app:"äºå¨å·¥å·",concept_tree:"ç¥è¯å°å¾",timeline:"æ¶é´çº¿",gallery:"ç¸å³å¾ç",video:"ç¸å³è§é¢",trivia:"è¶£å³ç¥è¯",quiz:"èªæµä¸ä¸",follow_up:"æ¥çé®",follow_up_analysis:"æ¥çåæ",retract:"ç¹å»æ¤å",collapse:"æ¶èµ·",expand:"å±å¼",data_analysis_explore:"æ°æ®åææ¢ç´¢",analysis_path:"åæè·¯å¾",data_visualization:"æ°æ®å¯è§å",trend_analysis:"è¶å¿åæ",correlation:"ç¸å³æ§åæ",anomaly_detection:"å¼å¸¸æ£æµ",distribution:"åå¸åæ",data_insights:"æ°æ®æ´å¯",data_query:"æ°æ®æé®"},prompts:{analyze:"å¸®æåæè¿ä»½æ°æ®",summarize:"å¸®æå½çº³è¿ä¸ªææ¡£"},actions:{delete:"å é¤",refresh:"éæ°çæ",bookmark:"æ¶è",export:"å¯¼åº",exportUnavailable:"å¯¼åºåè½ä¸å¯ç¨ãè¯·æ£æ¥ html2canvas æ¯å¦æ­£ç¡®å è½½ã",exportSuccess:"å¯¼åºæå",exportFailed:"å¯¼åºå¤±è´¥: {error}ãè¯·æ£æ¥æµè§å¨æ§å¶å°è·åæ´å¤ä¿¡æ¯ã",send:"åé",done:"å®æ",share:"åäº«",save:"ä¿å­",saveSuccess:"ä¿å­æå",saveFail:"ä¿å­å¤±è´¥",shareCard:"åäº«",shareCanvas:"åäº«ç»å¸",shareSuccess:"é¾æ¥å·²å¤å¶å°åªè´´æ¿ï¼",shareFail:"å¤å¶å¤±è´¥ï¼è¯·éè¯",shareRequiresLogin:"åäº«åè½éè¦ç»å½",shareRequiresLoginDesc:"æ¸¸å®¢æ¨¡å¼ä¸çæ°æ®ä»ä¿å­å¨æ¬å°ï¼æ æ³åäº«ãè¯·åç»å½ä»¥ä½¿ç¨åäº«åè½ã",editRole:"ä¿®æ¹è§è²åºæ¯",zoomIn:"æ¾å¤§",zoomOut:"ç¼©å°",rotate:"æè½¬",reset:"éç½®",close:"å³é­",logout:"éåºç»å½",loggingOut:"éåºä¸­...",autoLayout:"èªå¨å¸å±"},role:{title:"éæ©æ¨çè§è²åºæ¯ï¼æå¤3ä¸ªï¼",subtitle:"å¸®å©æä»¬ä¸ºæ¨æä¾æ´ä¸ªæ§åçåå®¹ä½éª",selectRole:"éæ©è§è²",currentRole:"å½åè§è²",changeRole:"ä¿®æ¹è§è²åºæ¯",confirm:"ç¡®è®¤",skip:"è·³è¿",examples:"ä¾å¦ï¼",selectedCount:"å·²éæ© {count}/{max} ä¸ªæ ç­¾",educationScene:"æè²åºæ¯",learningScene:"å­¦ä¹ åºæ¯",workScene:"èä¸åºæ¯",other:"å¶ä»"},loginRequired:"éè¦ç»å½",loginDesc:"ä¸ºäºä¿å­æ¨çæ¢ç´¢åå²å¹¶æä¾ä¸ªæ§åä½éªï¼è¯·åç»å½ã",loginWithGoogle:"ä½¿ç¨ Google ç»å½",signingIn:"ç»å½ä¸­...",loginFailed:"ç»å½å¤±è´¥",loginFailedRetry:"ç»å½å¤±è´¥ï¼è¯·éè¯",signInWithEmail:"ä½¿ç¨é®ç®±ç»å½",email:"é®ç®±",password:"å¯ç ",enterEmail:"è¯·è¾å¥é®ç®±",enterPassword:"è¯·è¾å¥å¯ç ",enterEmailAndPassword:"è¯·è¾å¥é®ç®±åå¯ç ",register:"æ³¨å",signIn:"ç»å½",haveAccount:"å·²æè´¦å·ï¼ç»å½",noAccount:"æ²¡æè´¦å·ï¼æ³¨å",back:"è¿å",or:"æ",enteredGuestMode:"å·²è¿å¥æ¸¸å®¢æ¨¡å¼",guestLoginFailed:"æ¸¸å®¢æ¨¡å¼ç»å½å¤±è´¥ï¼è¯·éè¯",enterAsGuest:"æ¸¸å®¢æ¨¡å¼è¿å¥",guestModeDesc:"æ°æ®ä»ä¿å­å¨æµè§å¨ï¼ä¸æ¯æäºç«¯å­å¨",guestModeNotice:"æ¨å½åæ¯ä¸´æ¶æ¸¸å®¢èº«ä»½ï¼æ°æ®ä»ä¿å­å¨æµè§å¨ï¼ä¸æ¯æäºç«¯å­å¨ã",history:"åå²",sessionHistory:"åå²ä¼è¯",loading:"å è½½ä¸­...",noSessionHistory:"ææ åå²ä¼è¯",today:"ä»å¤©",yesterday:"æ¨å¤©",daysAgo:"{days}å¤©å",nodes:"ä¸ªèç¹",globalSearch:{placeholder:"æç´¢åå²è®°å½ãä¼è¯...",noResults:"æªæ¾å°ç¸å³ç»æ",emptyState:"è¾å¥å³é®è¯å¼å§æç´¢",toOpen:"å¤èµ·æç´¢",recentSearches:"æè¿æç´¢",recentSessions:"æè¿ä¼è¯",clearHistory:"æ¸é¤",navigate:"å¯¼èª",select:"éæ©",close:"å³é­"},common:{justNow:"åå",minutesAgo:"åéå",hoursAgo:"å°æ¶å",daysAgo:"å¤©å",nodes:"èç¹",cloud:"äºç«¯"},personalization:"ä¸ªæ§åè®¾ç½®",personalizationLevel:"ä¸ªæ§åå¼ºåº¦è®¾ç½®",adjustPersonalization:"è°æ´åå®¹æ¨èçä¸ªæ§åç¨åº¦",currentSetting:"å½åè®¾ç½®",inspireNodes:"è·¨çå¯åèç¹: {min}%-{max}%",followUpTitle:"æ³æ¥çé®ä»ä¹ï¼",followUpPlaceholder:"è¾å¥é®é¢...",clickToExplore:"ç¹å»æ¥çæ¢ç´¢",from:"æ¥èª",quiz:{submit:"æäº¤ç­æ¡",correct:"åç­æ­£ç¡®ï¼",incorrect:"åç­éè¯¯ã"},errors:{locationTitle:"AIæå¡åºåéå¶",locationDesc:"å Googleå°åºæ¿ç­ï¼Gemini AI æå¡å¨å½åå°åºä¸å¯ç¨ãè¯·å°è¯ä½¿ç¨VPNåæ¢å°æ¯æçåºåï¼å¦ç¾å½ï¼ï¼ç¶åç¹æ­¤",refresh:"å·æ°",contentFailed:"åå®¹çæå¤±è´¥ãè¯·æ£æ¥ç½ç»æAPI Keyã",jsonError:"åå®¹çæå¤±è´¥ï¼JSONæ ¼å¼éè¯¯ã",regionRestricted:"å¾æ±æ­ï¼Gemini API å¨æ¨æå¨çå°åºä¸å¯ç¨ãç³»ç»æ­£å¨å°è¯ä½¿ç¨å¤ç¨ AI æå¡ï¼è¯·ç¨å...",regionRestrictedNoFallback:"å¾æ±æ­ï¼Gemini API å¨æ¨æå¨çå°åºä¸å¯ç¨ï¼ä¸å¤ç¨æå¡æªéç½®ãè¯·èç³»ç®¡çåæå°è¯ä½¿ç¨ VPNã",loginRequired:"è¯·åç»å½ååä½¿ç¨ AI åè½ã",loadShareFailed:"å è½½åäº«é¾æ¥å¤±è´¥",explorationFailed:"æ¢ç´¢å¤±è´¥ï¼è¯·éè¯",unknownError:"æªç¥éè¯¯",loginCancelled:"ç»å½å·²åæ¶",loginFailed:"ç»å½å¤±è´¥",requestAborted:"è¯·æ±å·²ä¸­æ­ï¼å¯è½æ¯ç±äºé¡µé¢åæ¢æç½ç»è¶æ¶ãè¯·ç¹å»å·æ°æé®éè¯ã"},login:{loginRequired:"è¯·åç»å½",loginDesc:"ç»å½åå¯ä½¿ç¨é«çº§åè½",loginWithGoogle:"ä½¿ç¨ Google ç»å½",loginWithEmail:"ä½¿ç¨é®ç®±/å¯ç ç»å½",email:"é®ç®±",emailPlaceholder:"è¯·è¾å¥é®ç®±",password:"å¯ç ",passwordPlaceholder:"è¯·è¾å¥å¯ç ",emailPasswordRequired:"é®ç®±åå¯ç ä¸è½ä¸ºç©º",login:"ç»å½",register:"æ³¨å",loggingIn:"ç»å½ä¸­...",registering:"æ³¨åä¸­...",success:"ç»å½æå",error:"ç»å½å¤±è´¥",registerSuccess:"æ³¨åæå",registerError:"æ³¨åå¤±è´¥",guestSuccess:"æ¸¸å®¢ç»å½æå",guestError:"æ¸¸å®¢ç»å½å¤±è´¥",continueAsGuest:"æ¸¸å®¢æ¨¡å¼",enterAsGuest:"æ¸¸å®¢æ¨¡å¼è¿å¥",switchToLogin:"å·²æè´¦å·ï¼ç»å½",switchToRegister:"æ²¡æè´¦å·ï¼æ³¨å",backToOptions:"è¿åç»å½éé¡¹",or:"æ",cancel:"åæ¶",guestModeDesc:"æ¸¸å®¢æ¨¡å¼åè½åé",wechatNotEnabled:"å¾®ä¿¡ç»å½æªå¯ç¨",loadingWeChatConfig:"æ­£å¨å è½½å¾®ä¿¡ç»å½éç½®..."},uploadPDFRequired:"éè¦ç»å½åæè½ä¸ä¼  PDF",dataUploadRequired:"è¯·ç»å½åæ·»å æ°æ®",pdfAnalysisRequired:"è¯·åç»å½åä½¿ç¨ PDF åæåè½",linkGenerated:"é¾æ¥å·²çæï¼{url}",loadingSharedContent:"å è½½åäº«åå®¹...",imageViewerHint:"æ»å¨ç¼©æ¾ Â· ææ½ç§»å¨ Â· ESCå³é­",animation:"å¨ç»æ¼ç¤º",animationDesc:"AI çæçå¨ææ¼ç¤ºã",animationPlaceholder:"å¨ç»åå®¹å ä½ç¬¦ï¼å¾å®ç°ï¼",dataVisualizer:"æ°æ®å¯è§å",dataVisualizerDesc:"AI çæçäº¤äºå¼æ°æ®å¯è§åã",dataVisualizerPlaceholder:"å¯è§åå¾è¡¨å ä½ç¬¦ï¼å¾å®ç°ï¼",simulator:"æ¨¡æå¨",simulatorDesc:"AI çæçäº¤äºå¼æ¨¡æå¨ã",simulatorPlaceholder:"æ¨¡æå¨çé¢å ä½ç¬¦ï¼å¾å®ç°ï¼",upload:{selectFile:"éæ© PDF ææ¡£",uploading:"ä¸ä¼ ä¸­",parsing:"æ­£å¨è§£æ PDF",analyzing:"AI æ­£å¨åæææ¡£",chunking:"æ­£å¨åæææ¬ç»æ",building:"æ­£å¨æå»ºç¥è¯å¾è°±",complete:"ç¥è¯å¾è°±çææå",success:"PDF ä¸ä¼ æåï¼",failed:"PDF ä¸ä¼ å¤±è´¥",invalidFileType:"ä»æ¯æ PDF æ ¼å¼æä»¶",fileTooLarge:"PDF æä»¶è¶è¿ 50MB éå¶",fileTooSmall:"æä»¶æ æææå",pdfEncrypted:"æ­¤ PDF å·²å å¯ï¼è¯·ç§»é¤å¯ç ä¿æ¤åéè¯",pdfInvalid:"PDF æä»¶æåææ ¼å¼æ æ",pdfWorkerError:"PDF å è½½å¤±è´¥ï¼è¯·éè¯",pdfParseError:"PDF è§£æå¤±è´¥",tooltip:"ç®åæ¯æ100M ä»¥å PDF æä»¶"},dataUpload:{selectFile:"æ·»å æ°æ®",uploading:"ä¸ä¼ ä¸­",parsing:"æ­£å¨è§£ææ°æ®æä»¶",analyzing:"AI æ­£å¨åææ°æ®",success:"æ°æ®æä»¶ä¸ä¼ æåï¼",failed:"æ°æ®æä»¶ä¸ä¼ å¤±è´¥",invalidFileType:"ä»æ¯æ Excel (.xlsx, .xls) æ CSV æ ¼å¼æä»¶",fileTooLarge:"æä»¶è¶è¿ 10MB éå¶ãè¯·åç¼©æä»¶æåæ¹ä¸ä¼ ã",fileTooSmall:"æä»¶æ æææå",parseError:"æ°æ®æä»¶è§£æå¤±è´¥",rowLimitExceeded:"æ°æ®è¡æ°è¾å¤ï¼è¶è¿5ä¸è¡ï¼ï¼åæå¯è½éè¦è¾é¿æ¶é´ã",columnLimitExceeded:"æ°æ®åæ°è¾å¤ï¼è¶è¿1000åï¼ï¼å»ºè®®ç§»é¤ä¸å¿è¦çåä»¥æåæ§è½ã",quotaExceeded:"æµè§å¨å­å¨ç©ºé´ä¸è¶³ãè¯·æ¸çæ§æä»¶æéæ¾ç£çç©ºé´ã",quotaExceededWithDetails:"æµè§å¨å­å¨ç©ºé´ä¸è¶³ãå·²ä½¿ç¨ {used} / {max}ãè¯·æ¸çæ§æä»¶ã",tooltip:"æ¯æ Excel / CSV æä»¶ï¼å»ºè®®åæä»¶ä¸è¶è¿ 100MB ä»¥ä¿è¯æä½³æ§è½ãæ¬å°å­å¨ï¼æ æ°ééå¶ã",fileLimits:"å»ºè®®åæä»¶ < 100MBï¼æ¬å°å­å¨å®¹éåå³äºæ¨çç£çç©ºé´",enterDirectly:"ç´æ¥è¿å¥",enterDirectlyTooltip:"ç´æ¥è¿å¥ç»å¸ï¼ç¨ååéæ©æ°æ®",dataRetention:"æ°æ®ä¿ç 30 å¤©",dataRetentionTooltip:"ä¸ä¼ å°æµè§å¨çæ°æ®æä»¶å°ä¿å­ 30 å¤©ã30 å¤©åç³»ç»å°èªå¨æ¸çï¼ä»¥éæ¾å­å¨ç©ºé´ãå»ºè®®åæ¶å¯¼åºéè¦æ°æ®ã",localFilesPersistent:"çµèæä»¶ä¸åéå¶",localFilesPersistentTooltip:"è¿äºæä»¶å­å¨å¨æ¨ççµèç¡¬çä¸ãEureka åªæ¯æ å°è®¿é®ï¼ä¸ä¼å é¤æ¨çåå§æä»¶ã"},dataFiles:{title:"æ¬å°èµæåº",currentSession:"å½åä¼è¯",allFiles:"æææä»¶",empty:"ææ æ°æ®æä»¶",emptyDesc:"ä¸ä¼  Excel/CSV æä»¶å¼å§æ¢ç´¢æ°æ®",addFromExcel:"ä» Excel/CSV æ·»å ",addFromPDF:"ä» PDF æ·»å ",addFromWeb:"ä»ç½é¡µæ·»å "},dataTools:{validationError:"è¯·å¡«åææå¿å¡«é¡¹"},guide:{title:"AI æç»´åå¯¼",subtitle:"æ·±åº¦å¯¹è¯ & å®æ¶äº§ç©",selectMentor:"éæ©ä½ çæç»´å¯¼å¸",exit:"éåºåå¯¼",mentors:{feynman:{name:"è´¹æ¼",desc:"ç±»æ¯å¤§å¸",logic:"æ·±å¥æµåºï¼åç¹ä¸ºç®"},musk:{name:"é©¬æ¯å",desc:"ç¬¬ä¸æ§åç",logic:"ç©çæéï¼ææ¬æè§£"},mckinsey:{name:"éº¦è¯é¡",desc:"ç»æåæç»´",logic:"MECEæ³åï¼é»è¾ä¸¥å¯"},davinci:{name:"è¾¾è¬å¥",desc:"è·¨çéæ",logic:"è§è§æ¨¡å¼ï¼ä¸ç©äºè"},socrates:{name:"èæ ¼æåº",desc:"æ¹å¤æ§åæ",logic:"ä¸æ­è¿½é®ï¼å¯»æ¾çç"},none:{name:"éç¨AI",desc:"æºè½å©æ",logic:"å¨é¢å®¢è§ï¼å¤è§åº¦åæ"}},chat:{placeholder:"å {name} æé®...",thinking:"æèä¸­...",error:"æèè¿ç¨è¢«ææ­ï¼è¯·éè¯ã",welcome:"ææ¯{name}ãæä»¬å¼å§å§ï¼ä½ å¯¹ä»ä¹æå´è¶£ï¼",hint:"éä¾¿é®ç¹ä»ä¹ï¼æä¼ç¨å¾å½¢å¸®ä½ çè§£"},artifact:{emptyState:"ç­å¾äº§ç©çæ...",emptyHint:"å¨å³ä¾§ä¸å¯¼å¸å¯¹è¯ï¼è¿éå°å®æ¶å±ç¤ºæç»´äº§ç©ã",loading:"æ­£å¨ç»å¶..."},quotes:{feynman:"ææ æ³åé çä¸è¥¿ï¼æå°±ä¸çè§£ã",musk:"ç©çå­¦æ¯å¯ä¸çççï¼å¶ä»é½æ¯å»ºè®®ã",mckinsey:"æ²¡æç»æï¼å°±æ²¡ææ´å¯ã",davinci:"ç®åæ¯ç»æçå¤æã",socrates:"æå¯ä¸ç¥éçï¼å°±æ¯æä¸æ æç¥ã"}},outputMenu:{title:"è¾åºææ¡£",createNew:"çææ°ææ¡£",ppt:"PPT",doc:"ææ¡£",generated:"å·²çæçææ¡£",empty:"ææ è¡çç©ææ¡£",minutesAgo:"{time}åéå",hoursAgo:"{time}å°æ¶å",daysAgo:"{time}å¤©å",justNow:"åå"},inspiration:[{title:"åå¡å¥é¨æå",domain:"çæ´»",desc:"ä»è±å­å°å²ç®çå®æ´ç¥è¯ä½ç³»ã"},{title:"é¸æ§è®¾è®¡",domain:"è®¾è®¡",desc:"éè¹è²å½©ä¸æ½è±¡è§è§çç°ä»£è®¾è®¡é£æ ¼ã"},{title:"è½¬è¡äº§åç»ç",domain:"èä¸",desc:"é¶åºç¡è½¬å PM çå®æ´è·¯å¾ã"},{title:"å®ç§°ä¸å®æ",domain:"ç©ç",desc:"å¼±ç¸äºä½ç¨ä¸­çå·¦å³ä¸å¯¹ç§°æ§ã"},{title:"æ¥æ¬ææ¸¸æ»ç¥",domain:"æè¡",desc:"å³è¥¿ 7 æ¥æ¸¸è·¯çº¿ä¸ç¾é£æ¨èã"},{title:"åè±ªæ¯",domain:"è®¾è®¡",desc:"å½¢å¼è¿½éåè½ï¼å ä½ä¸æç®çç°ä»£ä¸»ä¹è®¾è®¡ã"},{title:"æ°è½æºæ±½è½¦æ¨ªè¯",domain:"æ±½è½¦",desc:"åä»·ä½çº¯çµè½¦åæ·±åº¦å¯¹æ¯ã"},{title:"ç­å§å¿çå­¦",domain:"å¿çå­¦",desc:"ç­å§åå¼æ¯ä»ä¹æ¶è´¹å¿çï¼"},{title:"Mac mini éè´­æå",domain:"æ°ç äº§å",desc:"ååå·éç½®å¯¹æ¯ä¸éè´­å»ºè®®ã"},{title:"ååä½ç¨",domain:"çç©",desc:"æ¤ç©å¦ä½å°åè½è½¬åä¸ºåå­¦è½ã"},{title:"å¥èº«åèè®¡å",domain:"å¥åº·",desc:"ç§å­¦åèçè®­ç»ä¸é¥®é£æ¹æ¡ã"},{title:"é£æºä¸ºä»ä¹ä¼é£",domain:"ç©ç",desc:"ç©ºæ°å¨åå­¦ä¸åååçã"},{title:"åºéå®æç­ç¥",domain:"çè´¢",desc:"å¦ä½æå»ºç¨³å¥çå®æç»åï¼"},{title:"èµåæå",domain:"æªæ¥/ç§æ",desc:"é«ç§æä½çæ´»ï¼éè¹ä¸æºæ¢°çæªæ¥ç¾å­¦ã"},{title:"å¹¼å¿å­éæ©",domain:"æè²",desc:"å¬ç«ãç§ç«ãå½éå­å¦ä½éï¼"},{title:"è¾¾è¾¾ä¸»ä¹",domain:"èºæ¯",desc:"åèºæ¯ä¸éæºæ§ã"},{title:"æµ·å¤åå¯ç»å½",domain:"äº§å",desc:"å¦ä½è®¾è®¡æ å¯ç ç»å½æµç¨ï¼"}],eureka2:{welcome:{title:"æ¢ç´¢ï¼ä»å¥½å¥å¼å§",subtitle:"AI é©±å¨çæ·±åº¦å­¦ä¹ ä½éªãéè¿å¯è§åãäºå¨å®éªåå¤ç»´æè§£ï¼è®©å¤ææ¦å¿µåå¾è§¦æå¯åã",placeholder:"è¾å¥ä½ æ³æ·±å¥çè§£çä¸»é¢...",slogan:"AI é©±å¨çå¯è§åå­¦ä¹ å¼æ"},homePage:{heroTitle:"ä»å¤©æ³å¼æä»ä¹ï¼",heroSubtitle:"çæ­£çæµè¾¾ï¼æ¯è®©èå°é¿åºç¿è",defaultPlaceholder:"ä»å¤©æ³å¼æä»ä¹",skillPlaceholder:{excalidraw:"è¾å¥è¦ç»çå¾ï¼å¦ãååä½ç¨æµç¨ã",interactiveSimulation:"è¾å¥è¦æ¨¡æçç©ç/æ°å­¦åºæ¯",threeD:"è¾å¥ 3D ä¸»é¢ï¼å¦ãæé¾ãæãè¡æè¿å¨ã",arLab:"è¾å¥è¦æ¢ç´¢ç AR å®éªåºæ¯",studyCards:"ä¸ä¼ å¾ç/PDFï¼æç²è´´æå­ï¼AI å¸®ä½ æ´çæç»ä¹ "},myClassroom:"æçè¯¾å®¤",courseNav:"è¯¾ç¨å¯¼èª",courseNavBrowseAll:"æµè§å¨é¨",featuredExperiences:"ç¹è²ä½éª",featuredExperiencesHint:"ç¹å»å¡çé¢è§åå®¹ï¼æè¾å¥èªå®ä¹ä¸»é¢çæ",physicsWorld:"ç©çä¸ç",physicsWorldDesc:"æ¢ç´¢åå­¦ãåå­¦ç­è¶£å³å®éª",gestureLab:"æå¿å®éªå®¤",gestureLabDesc:"ç¨æå¿ææ§ 3D å®éªåºæ¯",threeDExperiment:"3D å®éª",threeDExperimentDesc:"é¼ æ æµè§ç²¾é 3D æ¨¡å",natureExplore:"èªç¶æ¢ç´¢",natureExploreDesc:"æç§è¯è±ï¼æ¢ç´¢æ¤ç©ä¸ç",mathWorld:"æ°å­¦ä¸ç",mathWorldDesc:"æ¢ç´¢å½æ°ãå ä½ç­è¶£å³æ°å­¦å®éª",biologyWorld:"çç©ä¸ç",biologyWorldDesc:"é¶ãç»èãéä¼ ãçæç­å¯äº¤äºå®éª",enlightenment:"ç§å­¦å¯è",enlightenmentDesc:"å­¦é¾å Â· è®¤è¯èº«è¾¹çå¨æ¤ç©ãå¤©æ°åå·ç­",exploration:"ç§å­¦æ¢ç´¢",explorationDesc:"å°å­¦ Â· å¨æåå®éªãè®°è§å¯ãæ¾è§å¾",feedback:"æè§åé¦",contactUs:"èç³»æä»¬"},examples:{physics:{title:"ä¸ç©åç",questions:["æ æåçæ¯ä»ä¹ï¼è®©æå¨æè¯è¯","åçæå°ååå°æ¯æä¹åäºï¼"]},digital:{title:"æ°å­ä¸ç",questions:["æåºç®æ³æ¯æä¹å·¥ä½çï¼å¯è§åæ¼ç¤º","éå½æ¯ä»ä¹ï¼ç¨ææ³¢é£å¥æ°åè§£é"]},thought:{title:"æç»´å®éª",questions:["ä¾ç»åéæ±å¦ä½å½±åä»·æ ¼ï¼æ¨¡æä¸ä¸","çæç³»ç»æ¯å¦ä½ä¿æå¹³è¡¡çï¼"]},daily:{title:"æ¥å¸¸ç§å­¦",questions:["äºæ¬¡å½æ°å¾åæ¯ä»ä¹æ ·çï¼","å¤å©è®¡ç®æ¯æä¹åäºï¼72æ³åæ¯ä»ä¹"]}},sidebar:{newTask:"æ°å»ºä»»å¡",startNewLearning:"å¼å§æ°çå­¦ä¹ ",skillStore:"è½ååº",gameLab:"æ¸¸æå®éªç°",studyCabin:"å­¦ä¹ å¡ç",recentChats:"æè¿å¯¹è¯",history:"åå²è®°å½",noHistory:"ææ åå²",noTasks:"ææ æ¢ç´¢è®°å½",untitled:"æªå½åæ¢ç´¢",expandSidebar:"å±å¼ä¾§è¾¹æ ",collapseSidebar:"æ¶èµ·ä¾§è¾¹æ ",search:"æç´¢",searchPlaceholder:"æç´¢åå²å¯¹è¯...",noSearchResult:"æ²¡ææ¾å°ç¸å³å¯¹è¯",searchHint:"è¾å¥å³é®è¯æç´¢",pressEsc:"æ ESC å³é­",quickSearch:"å¿«éæç´¢"},studyCabin:{entryTitle:"æä¸é¡µä¹¦ï¼æä¸ä¼ ä¸å¼ é¢",entrySubtitle:"æ´çæç»ä¹ ï¼å¨æåä¸å",entryCta:"å»å­¦ä¹ å¡ç",homeHeroTitle:"æå­¦ä¹ èµæï¼åæä¸å¥ç»ä¹ å¡ç",homeHeroSubtitle:"æç§ Â· æå­ Â· ææ Â· PDFï¼AI èªå¨æ´çç¥è¯ç¹ + åºé¢ + è®²è§£",actionPhotoTitle:"æç§ä¸ä¼ ",actionPhotoDesc:"æä¸è¯¾æ¬ãä¹ é¢ãç¬è®°",actionTextTitle:"æå­ç²è´´",actionTextDesc:"ä»å¬ä¼å·ãå¾®ä¿¡å¤å¶",actionTextbookTitle:"ä»ææé",actionTextbookDesc:"äººæçå°å­¦æ°å­¦ 1-6 å¹´çº§",actionPdfTitle:"ä¸ä¼  PDF",actionPdfDesc:"è¯å·ãè®²ä¹ãçµå­ä¹¦",recentSessions:"æçå­¦ä¹ å¡ç",noRecentSessions:"è¿æ²¡æå¼å§ç¬¬ä¸æ¬¡å­¦ä¹ ï¼åè¯è¯ä¸é¢ä»»ä¸ç§æ¹å¼",backToHome:"è¿åå­¦ä¹ å¡ç",comingSoon:"å³å°ä¸çº¿",comingSoonDesc:"æä»¬æ­£å¨å¨åæç£¨è¿ä¸ªåè½ï¼æ¬è¯·æå¾"},skillTabs:{chat:"é®ä¸é®","study-cards":"å­¦ä¹ å¡ç","interactive-simulation":"äº¤äºæ¨¡æ","3d":"3D å­¦ä¹ ","ar-lab":"AR æå¿å®éªå®¤",excalidraw:"å¾è¡¨çæ"},inputHints:{send:"åé",newLine:"æ¢è¡"},subjects:{physics:{label:"ç©ç",desc:"å®éªä¸æ¨¡æ"},math:{label:"æ°å­¦",desc:"ä»åºç¡å°ç«èµ"},geography:{label:"å°ç",desc:"å¯è§åå°å¾"}},onboarding:{title:"åè¯æä½ çå­¦ä¹ èµ·ç¹",subtitle:"éä¸éå¹´çº§ãç¥è¯ç¹åå­¦ä¹ æ¹å¼ï¼æä¼ç»ä½ æ´åéçåå®¹",stageLabel:"å­¦æ®µï¼éå¡«ï¼",gradeLabel:"å¹´çº§",ageLabel:"å¹´é¾",agePlaceholder:"å¦ 8",topicLabel:"æ³å­¦çç¥è¯ç¹",topicPlaceholder:"åä¸ä¸ªä½ æ³å¼æçä¸»é¢",textbookLabel:"ä»ææç®å½éé",orCustomTopicLabel:"æèªå·±å¡«ä¸ä¸ªä¸»é¢",customTopicPlaceholder:"æ³å­¦ææä»¥å¤çåå®¹ï¼åå¨è¿é",quickStartHint:"æä»æ¨èä¸»é¢å¼å§",modeLabel:"å­¦ä¹ æ¹å¼",recommendedHint:"å¸¦ãæ¨èãçæ´éåè¿ä¸ªå­¦ç§",chooseGradeHint:"åæä¸ä¸ªå¹´çº§",chooseUnitHint:"éä¸ä¸ªæ³å­¦çåå",startButton:"å¼å§å­¦ä¹ ",skipButton:"è·³è¿å¼å¯¼"},user:{login:"ç»å½",logout:"éåºç»å½",loggingOut:"éåºä¸­...",editRole:"ç¼è¾è§è²",preferences:"ä¸ªæ§ååå¥½",aiPrivacy:"AI éç§è®¾ç½®",language:"è¯­è¨"},deleteDialog:{title:"å é¤å¯¹è¯",message:"å é¤åå°æ æ³æ¢å¤ï¼ç¡®å®è¦ç»§ç»­åï¼",cancel:"åæ¶",confirm:"å é¤"},taskMenu:{rename:"éå½å",delete:"å é¤"},timeGroup:{today:"ä»å¤©",yesterday:"æ¨å¤©",week:"æè¿ 7 å¤©",older:"æ´æ©",justNow:"åå",minutesAgo:"{n} åéå",hoursAgo:"{n} å°æ¶å",daysAgo:"{n} å¤©å"},depth:{adjust:"è°æ´",simplify:"è¯·ç¨æ´ç®åçæ¹å¼è§£éä¸ä¸åæçåå®¹",detail:"è¯·æ´æ·±å¥å°è§£éä¸ä¸åæçåå®¹",quiz:"è¯·éå¯¹åæçåå®¹åºä¸ééæ©é¢èèæ",simplifyBtn:"æ´ç®å",detailBtn:"æ´æ·±å¥"},code:{copy:"å¤å¶ä»£ç ",copied:"å·²å¤å¶"},toast:{copiedToClipboard:"å·²å¤å¶å°åªè´´æ¿"},chat:{newChat:"æ°å¯¹è¯",share:"åäº«å¯¹è¯",export:"å¯¼åºå¯¹è¯",send:"åéæ¶æ¯"},artifact:{explore:"æ¢ç´¢äº§ç©"},preview:{title:"æä»¶é¢è§",close:"å³é­é¢è§",selectFile:"éæ©æä»¶é¢è§",clickBelow:"ç¹å»ä¸æ¹æä»¶å¡ç",generatedFiles:"çææä»¶",noPreview:"ææ é¢è§åå®¹",playground:"ä»£ç ",excalidraw:"å¾è¡¨",game:"äºå¨"},artifactCard:{playground:"äº¤äºæ¼ç¤º",excalidraw:"ç¥è¯å¾è°±",game:"äºå¨æ¸¸æ",unknown:"æªç¥ç±»å"},pictureBook:{loading:"æ­£å¨å è½½ç»æ¬...",puzzle:"é¯å³",page:"é¡µ",readPage:"æè¯»",pauseRead:"æå",resumeRead:"ç»§ç»­",stopRead:"åæ­¢",share:"åäº«"},puzzleGame:{title:"æ¼å¾é¯å³",cards:"å¼ å¡ç",difficulty:"é¾åº¦",easy:"ç®å",medium:"ä¸­ç­",hard:"å°é¾",start:"å¼å§ææ",level:"ç¬¬ {n} å³",moves:"æ­¥æ°",time:"æ¶é´",complete:"å®æï¼",stars:"æ",next:"ä¸ä¸å³",back:"è¿å",restart:"éæ°å¼å§",progress:"å·²å®æ {completed}/{total} å³",totalStars:"å±è·å¾ {stars} é¢æ",locked:"æªè§£é"},primaryTabs:{children:"å¿ç«¥ä¹å­",physics:"ç©çä¸ç",arLab:"æå¿å®éªå®¤"},placeholders:{children:"è¾å¥å¤è¯åææäºä¸»é¢ï¼AI ä¸ºä½ çæä¸å±ç»æ¬...",physics:"è¾å¥ç©çæ¦å¿µæç°è±¡ï¼è®©æå¸¦ä½ å¨ææ¢ç´¢...",arLab:"æè¿°ä½ æ³ä½éªçæå¿äº¤äºï¼å¦ãç¨æå¿æ§å¶å°çæè½¬ã"},secondaryTabs:{all:"å¨é¨",poetry:"å¤è¯",idiom:"æè¯­",fable:"å¯è¨",myth:"ç¥è¯",mechanics:"åå­¦",optics:"åå­¦",electromagnetics:"çµç£",thermodynamics:"ç­å­¦",waves:"æ³¢å¨",physics:"ç©ç",astronomy:"å¤©æ",chemistry:"åå­¦"},bottomHint:"ç¹å»å¡çé¢è§åå®¹ï¼æè¾å¥èªå®ä¹ä¸»é¢çæ",contact:{entry:"èç³»æä»¬",title:"èç³»æä»¬",copied:"å·²å¤å¶",copyFailed:"å¤å¶å¤±è´¥",footerHint:"æ·»å å¾®ä¿¡å¤æ³¨ãEurekaãÂ· å¯æä½ å¥ç¾¤",channels:{wechat:"å¾®ä¿¡å·",wechatHint:"å·²å¤å¶å¾®ä¿¡å·ï¼æå¼å¾®ä¿¡æ·»å å¥½å",wechatGroup:"å¾®ä¿¡ç¾¤",groupHint:"å·²å¤å¶å¾®ä¿¡å·ï¼æ·»å åå¤æ³¨ãå¥ç¾¤ã",xiaohongshu:"å°çº¢ä¹¦",channels:"è§é¢å·"}},feedback:{entry:"æè§åé¦",title:"æè§åé¦",subtitle:"ä½ çåé¦å¸®å©æä»¬åå¾æ´å¥½",bug:"é®é¢åé¦",feature:"åè½å»ºè®®",other:"å¶ä»",placeholder:"æè¿°ä½ éå°çé®é¢æä½ çå»ºè®®...",submit:"æäº¤åé¦",success:"æè°¢ä½ çåé¦ï¼æä»¬ä¼è®¤çæ¥ç",emptyWarning:"è¯·è¾å¥åé¦åå®¹"},model:{title:"AI æ¨¡å",auto:"èªå¨",autoDesc:"æºè½éæ©æä½³æ¨¡å",geminiFlash:"Gemini Flash",geminiFlashDesc:"å¿«éååºï¼éåæ¥å¸¸å¯¹è¯",geminiPro:"Gemini Pro",geminiProDesc:"æ·±åº¦æ¨çï¼å¤æä»»å¡é¦é",deepseek:"DeepSeek",deepseekDesc:"ä¸­æçè§£å¼ºï¼æ°çé»è¾ä½³"},inputToolbar:{attach:"æ·»å éä»¶",enterToSend:"Enter åé Â· Shift+Enter æ¢è¡"},knowledgeSpine:{title:"è¯¾ç¨å¯¼èª",math:"æ°å­¦",physics:"ç©ç",chinese:"è¯­æ",geography:"å°ç",biology:"çç©",mathDesc:"ä»åºç¡å°ç«èµ",physicsDesc:"å®éªä¸æ¨¡æ",chineseDesc:"å¤è¯æé´èµ",geographyDesc:"å¯è§åå°å¾",biologyDesc:"å¾®è§æ¢ç´¢"}}},tp={slogans:["From search to exploration, a new way to reveal answers","Answers are not just links, but a map of relationships","AI-powered deep insights, sparking serendipitous connections","Learning is like visiting a gallery, curated for your curiosity","Click more, understand more. From a point to a plane","Local AI Mode supported. Safe, private, independent"],seo:{title:"Eureka - Visual AI Research Assistant & Infinite Knowledge Canvas",description:"Eureka is an AI-powered infinite canvas for knowledge discovery. Transform your research and notes into interactive knowledge maps. Experience Visual RAG and spatial thinking for deeper insights.",keywords:"Visual RAG, Knowledge Discovery, AI Search, Spatial Thinking, Infinite Canvas, Research Assistant, Mind Map 2.0, Eureka Finder, Knowledge Graph, eurekaweb"},explorationMode:{world:"Explore World",data:"Explore Data",lab:"Lab",search:"Search",worldDesc:"Ask questions or upload documents to explore world knowledge",dataDesc:"Upload Excel/CSV files to explore data insights",labDesc:"Experience experimental AI features",searchDesc:"Search the web, AI refines the knowledge",newFeatureBadge:"New",switchToWorld:"Switch to World Exploration",switchToData:"Switch to Data Exploration",switchToLab:"Switch to Lab",switchToSearch:"Switch to Search Mode",labTitle:"Eureka Lab",labSubtitle:"Exploring infinite possibilities of AI, incubating future knowledge forms.",labFeatures:[{title:"AI Debate Arena",desc:"Let two AIs debate your topic to clarify pros and cons."},{title:"Multi-dim Knowledge Graph",desc:"Roam knowledge nodes in 3D space to discover hidden connections."},{title:"Instant Podcast",desc:"Convert any article or topic into a two-person podcast conversation instantly."}],comingSoon:"Coming Soon"},searchPlaceholder:"What are you curious about today?",dataSearchPlaceholder:"Upload data file or enter question...",searchModeSearchPlaceholder:"Enter keywords, AI will search and synthesize...",chatPlaceholder:"Chat with Eureka...",aiExplore:"AI Explore",brandStory:"Eureka (Greek: Îµá½ÏÎ·ÎºÎ±) means 'I have discovered it!', famous for Archimedes' exclamation upon discovering the principle of buoyancy.",pageTitleSuffix:"ï½ Eureka-From search to exploration, a new way to open answers",uploadKnowledge:"Upload Personal Knowledge",featureNotReady:"Feature coming soon, contact us for partnership",backToHome:"Back to Home",locationError:"AI Service not available in your region. Switched to mock mode. Please try VPN.",deleteConfirmTitle:"Confirm Delete",deleteConfirmDesc:"This action cannot be undone. This card and all subsequent branches will be permanently deleted.",cancel:"Cancel",confirmDelete:"Delete",loadingLog:"AI is excavating knowledge...",loadingPlan:"AI is planning the path...",regenerating:"Regenerating...",thinkTitle:"Thoughts & Drafts",tools:{ai_explore:"AI Explore",lite_app:"Interactive Tool",concept_tree:"Knowledge Map",timeline:"Timeline",gallery:"Related Images",video:"Related Videos",trivia:"Fun Facts",quiz:"Quick Quiz",follow_up:"Follow-up",follow_up_analysis:"Continue Analysis",retract:"Retract",collapse:"Collapse",expand:"Expand",data_analysis_explore:"Data Analysis Explore",analysis_path:"Analysis Path",data_visualization:"Data Visualization",trend_analysis:"Trend Analysis",correlation:"Correlation Analysis",anomaly_detection:"Anomaly Detection",distribution:"Distribution Analysis",data_insights:"Data Insights",data_query:"Data Query"},prompts:{analyze:"Help me analyze this data",summarize:"Help me summarize this document"},actions:{delete:"Delete",refresh:"Regenerate",bookmark:"Bookmark",export:"Export",exportUnavailable:"Export unavailable. Please check if html2canvas is loaded correctly.",exportSuccess:"Export successful",exportFailed:"Export failed: {error}. Check browser console for details.",send:"Send",done:"Done",share:"Share",save:"Save",saveSuccess:"Saved successfully",saveFail:"Save failed",shareCard:"Share",shareCanvas:"Share Canvas",shareSuccess:"Link copied to clipboard!",shareFail:"Copy failed, please try again",shareRequiresLogin:"Login Required for Sharing",shareRequiresLoginDesc:"Guest mode data is stored locally only and cannot be shared. Please login to use the share feature.",editRole:"Edit Role",zoomIn:"Zoom In",zoomOut:"Zoom Out",rotate:"Rotate",reset:"Reset",close:"Close",logout:"Logout",loggingOut:"Logging out...",autoLayout:"Auto Layout"},role:{title:"Select Your Role Tags (up to 3)",subtitle:"Help us provide a more personalized content experience",selectRole:"Select Role",currentRole:"Current Role",changeRole:"Change Role",confirm:"Confirm",skip:"Skip",examples:"Examples:",selectedCount:"Selected {count}/{max} tags",educationScene:"Education",learningScene:"Learning",workScene:"Work",other:"Other"},loginRequired:"Login Required",loginDesc:"Please login to save your exploration history and personalize your experience.",loginWithGoogle:"Sign in with Google",signingIn:"Signing in...",loginFailed:"Login failed",loginFailedRetry:"Login failed, please try again",signInWithEmail:"Sign in with Email",email:"Email",password:"Password",enterEmail:"Enter your email",enterPassword:"Enter your password",enterEmailAndPassword:"Please enter email and password",register:"Register",signIn:"Sign In",haveAccount:"Have an account? Sign in",noAccount:"No account? Register",back:"Back",or:"or",enteredGuestMode:"Entered guest mode",guestLoginFailed:"Guest login failed, please try again",enterAsGuest:"Enter as Guest",guestModeDesc:"Data saved in browser only, cloud storage not available",guestModeNotice:"You are using guest mode: data saved in browser only, cloud storage not available.",history:"History",sessionHistory:"Session History",loading:"Loading...",noSessionHistory:"No session history",today:"Today",yesterday:"Yesterday",daysAgo:"{days} days ago",nodes:"nodes",globalSearch:{placeholder:"Search history, sessions...",noResults:"No results found",emptyState:"Enter keywords to start searching",toOpen:"to open search",recentSearches:"Recent Searches",recentSessions:"Recent Sessions",clearHistory:"Clear",navigate:"Navigate",select:"Select",close:"Close"},common:{justNow:"Just now",minutesAgo:"minutes ago",hoursAgo:"hours ago",daysAgo:"days ago",nodes:"nodes",cloud:"Cloud"},personalization:"Personalization",personalizationLevel:"Personalization Level",adjustPersonalization:"Adjust the level of content personalization",currentSetting:"Current Setting",inspireNodes:"Inspire Nodes: {min}%-{max}%",followUpTitle:"What to ask next?",followUpPlaceholder:"Type your question...",clickToExplore:"Click to explore",from:"From",quiz:{submit:"Submit",correct:"Correct!",incorrect:"Incorrect."},errors:{locationTitle:"Region Restricted",locationDesc:"Gemini AI service is not available in your current region due to Google policies. Please try using a VPN (e.g., US region) and click here to",refresh:"Refresh",contentFailed:"Content generation failed. Check network or API Key.",jsonError:"JSON format error.",regionRestricted:"Sorry, Gemini API is not available in your region. The system is attempting to use a backup AI service, please wait...",regionRestrictedNoFallback:"Sorry, Gemini API is not available in your region, and no backup service is configured. Please contact the administrator or try using a VPN.",loginRequired:"Please login to use AI features.",loadShareFailed:"Failed to load shared link",explorationFailed:"Exploration failed, please try again",unknownError:"Unknown error",loginCancelled:"Login cancelled",loginFailed:"Login failed",requestAborted:"Request was interrupted, possibly due to page navigation or network timeout. Please click refresh to retry."},login:{loginRequired:"Please Login",loginDesc:"Login is required to use advanced features",loginWithGoogle:"Sign in with Google",loginWithEmail:"Sign in with Email/Password",email:"Email",emailPlaceholder:"Enter your email",password:"Password",passwordPlaceholder:"Enter your password",emailPasswordRequired:"Email and password are required",login:"Sign In",register:"Sign Up",loggingIn:"Signing in...",registering:"Signing up...",success:"Login successful",error:"Login failed",registerSuccess:"Registration successful",registerError:"Registration failed",guestSuccess:"Guest login successful",guestError:"Guest login failed",continueAsGuest:"Continue as Guest",enterAsGuest:"Guest Mode",switchToLogin:"Already have an account? Sign in",switchToRegister:"Don't have an account? Sign up",backToOptions:"Back to login options",or:"OR",cancel:"Cancel",guestModeDesc:"Guest mode has limited features",wechatNotEnabled:"WeChat login is not enabled",loadingWeChatConfig:"Loading WeChat login configuration..."},uploadPDFRequired:"Please login to upload PDF",dataUploadRequired:"Please login to add data",pdfAnalysisRequired:"Please login to use PDF analysis",linkGenerated:"Link generated: {url}",loadingSharedContent:"Loading shared content...",imageViewerHint:"Scroll to zoom Â· Drag to move Â· ESC to close",animation:"Animation",animationDesc:"AI-generated dynamic demonstration.",animationPlaceholder:"Animation placeholder (to be implemented)",dataVisualizer:"Data Visualizer",dataVisualizerDesc:"AI-generated interactive data visualization.",dataVisualizerPlaceholder:"Visualization chart placeholder (to be implemented)",simulator:"Simulator",simulatorDesc:"AI-generated interactive simulator.",simulatorPlaceholder:"Simulator UI placeholder (to be implemented)",upload:{selectFile:"Select PDF File",uploading:"Uploading",parsing:"Parsing PDF",analyzing:"AI analyzing document",chunking:"Analyzing text structure",building:"Building knowledge graph",complete:"Knowledge graph created",success:"PDF uploaded successfully!",failed:"PDF upload failed",invalidFileType:"Only PDF format is supported",fileTooLarge:"PDF file exceeds 10MB limit",fileTooSmall:"Invalid or corrupted file",pdfEncrypted:"This PDF is encrypted, please remove password protection",pdfInvalid:"PDF file is corrupted or invalid",pdfWorkerError:"PDF loading failed, please retry",pdfParseError:"PDF parsing failed",tooltip:"Currently supports PDF files up to 100MB"},dataUpload:{selectFile:"Add Data",uploading:"Uploading",parsing:"Parsing data file",analyzing:"AI analyzing data",success:"Data file uploaded successfully!",failed:"Data file upload failed",invalidFileType:"Only Excel (.xlsx, .xls) or CSV format is supported",fileTooLarge:"File exceeds 10MB limit. Please compress the file or upload in batches.",fileTooSmall:"Invalid or corrupted file",parseError:"Data file parsing failed",rowLimitExceeded:"æ°æ®è¡æ°è¾å¤ï¼è¶è¿5ä¸è¡ï¼ï¼åæå¯è½éè¦è¾é¿æ¶é´ã",columnLimitExceeded:"æ°æ®åæ°è¾å¤ï¼è¶è¿1000åï¼ï¼å»ºè®®ç§»é¤ä¸å¿è¦çåä»¥æåæ§è½ã",quotaExceeded:"æµè§å¨å­å¨ç©ºé´ä¸è¶³ãè¯·æ¸çæ§æä»¶æéæ¾ç£çç©ºé´ã",quotaExceededWithDetails:"æµè§å¨å­å¨ç©ºé´ä¸è¶³ãå·²ä½¿ç¨ {used} / {max}ãè¯·æ¸çæ§æä»¶ã",tooltip:"æ¯æ Excel / CSV æä»¶ï¼å»ºè®®åæä»¶ä¸è¶è¿ 100MB ä»¥ä¿è¯æä½³æ§è½ãæ¬å°å­å¨ï¼æ æ°ééå¶ã",fileLimits:"å»ºè®®åæä»¶ < 100MBï¼æ¬å°å­å¨å®¹éåå³äºæ¨çç£çç©ºé´",enterDirectly:"Enter Directly",enterDirectlyTooltip:"Enter canvas directly, select data later",dataRetention:"Data kept for 30 days",dataRetentionTooltip:"Data files uploaded to the browser will be stored for 30 days. After 30 days, the system will automatically clean them up to free storage space. Please export important data in time.",localFilesPersistent:"Local files unrestricted",localFilesPersistentTooltip:"These files are stored on your computer's hard drive. Eureka only maps access and will not delete your original files."},dataFiles:{title:"Data Files",currentSession:"Current Session",allFiles:"All Files",empty:"No data files",emptyDesc:"Upload Excel/CSV files to start exploring data",addFromExcel:"Add from Excel/CSV",addFromPDF:"Add from PDF",addFromWeb:"Add from Web"},dataTools:{validationError:"Please fill in all required fields"},guide:{title:"AI Mental Guide",subtitle:"Deep Chat & Live Artifacts",selectMentor:"Select Your Mental Guide",exit:"Exit Guide",mentors:{feynman:{name:"Feynman",desc:"Master of Analogy",logic:"Simplicity & Metaphor"},musk:{name:"Musk",desc:"First Principles",logic:"Physics Limits & Cost"},mckinsey:{name:"McKinsey",desc:"Structured Thinking",logic:"MECE Framework"},davinci:{name:"Da Vinci",desc:"Visual Patterns",logic:"Cross-disciplinary"},socrates:{name:"Socrates",desc:"Critical Reflection",logic:"Socratic Method"},none:{name:"General AI",desc:"Smart Assistant",logic:"Comprehensive & Objective"}},chat:{placeholder:"Ask {name}...",thinking:"Thinking...",error:"Thinking interrupted. Please try again.",welcome:"I am {name}. Let's begin. What's on your mind?",hint:"Ask me anything, I'll explain with diagrams"},artifact:{emptyState:"Waiting for artifact...",emptyHint:"Chat with the mentor to generate live artifacts here.",loading:"Drawing..."},quotes:{feynman:"What I cannot create, I cannot understand.",musk:"Physics is the law, everything else is a recommendation.",mckinsey:"Without structure, there is no insight.",davinci:"Simplicity is the ultimate sophistication.",socrates:"The only true wisdom is in knowing you know nothing."}},outputMenu:{title:"Export",createNew:"Create New",ppt:"Presentation",doc:"Document",generated:"Generated Artifacts",empty:"No artifacts yet",minutesAgo:"{time}m ago",hoursAgo:"{time}h ago",daysAgo:"{time}d ago",justNow:"Just now"},inspiration:[{title:"Coffee Beginner's Guide",domain:"Life",desc:"Complete knowledge from beans to brewing."},{title:"Acid Design",domain:"Design",desc:"Neon colors and abstract visuals in modern design."},{title:"Career Switch to PM",domain:"Career",desc:"Complete path to product manager from scratch."},{title:"Parity Violation",domain:"Physics",desc:"Left-right asymmetry in weak interactions."},{title:"Japan Travel Guide",domain:"Travel",desc:"Kansai 7-day itinerary and food recommendations."},{title:"Bauhaus",domain:"Design",desc:"Form follows function - geometric minimalist modernism."},{title:"EV Comparison",domain:"Auto",desc:"In-depth comparison of electric vehicles at the same price."},{title:"Short Drama Psychology",domain:"Psychology",desc:"What consumer psychology drives short drama monetization?"},{title:"Mac mini Buying Guide",domain:"Tech",desc:"Model comparison and purchase recommendations."},{title:"Photosynthesis",domain:"Biology",desc:"How plants convert light into chemical energy."},{title:"Fitness Fat Loss Plan",domain:"Health",desc:"Scientific training and diet plan for fat loss."},{title:"Why Airplanes Fly",domain:"Physics",desc:"Aerodynamics and the principle of lift."},{title:"Fund Investment Strategy",domain:"Finance",desc:"How to build a stable investment portfolio?"},{title:"Cyberpunk",domain:"Future/Tech",desc:"High tech, low life - neon aesthetics of the future."},{title:"Choosing a Kindergarten",domain:"Education",desc:"Public, private, or international - how to choose?"},{title:"Dadaism",domain:"Art",desc:"Anti-art and randomness."},{title:"Passwordless Login",domain:"Product",desc:"How to design seamless authentication flows?"}],eureka2:{welcome:{title:"Explore, Starting with Curiosity",subtitle:"AI-powered deep learning experience. Through visualization, interactive experiments and multi-dimensional breakdowns, making complex concepts accessible.",placeholder:"Enter a topic you want to deeply understand...",slogan:"AI-Powered Visual Learning Engine"},homePage:{heroTitle:"What do you want to understand today?",heroSubtitle:"True arrival is when footprints grow wings",defaultPlaceholder:"What do you want to understand today",skillPlaceholder:{excalidraw:'Draw a diagram, e.g. "Photosynthesis Process"',interactiveSimulation:"Enter a physics/math scenario to simulate",threeD:'Enter a 3D topic, e.g. "Dinosaur" or "Planetary Motion"',arLab:"Enter an AR experiment to explore",studyCards:"Upload an image/PDF or paste text â I'll turn it into a drill"},myClassroom:"My Classroom",courseNav:"Course Nav",courseNavBrowseAll:"Browse All",featuredExperiences:"Featured Experiences",featuredExperiencesHint:"Click a card to preview, or type a custom topic to generate",physicsWorld:"Physics World",physicsWorldDesc:"Explore fun experiments in mechanics, optics & more",gestureLab:"Gesture Lab",gestureLabDesc:"Control 3D experiments with hand gestures",threeDExperiment:"3D Experiment",threeDExperimentDesc:"Browse curated 3D models interactively",natureExplore:"Nature Explore",natureExploreDesc:"Snap a photo to identify plants & explore nature",mathWorld:"Math World",mathWorldDesc:"Explore functions, geometry & fun math experiments",biologyWorld:"Biology World",biologyWorldDesc:"Enzymes, cells, genetics & ecology interactive experiments",enlightenment:"Science Sparks",enlightenmentDesc:"Preschool Â· Plants, weather & everyday wonders",exploration:"Science Quest",explorationDesc:"Primary Â· Experiment, observe, find patterns",feedback:"Feedback",contactUs:"Contact Us"},examples:{physics:{title:"Physical World",questions:["What is the lever principle? Let me try it","How does light refraction and reflection work?"]},digital:{title:"Digital World",questions:["How do sorting algorithms work? Visualize it","What is recursion? Explain with Fibonacci"]},thought:{title:"Thought Experiments",questions:["How do supply and demand affect prices? Simulate it","How do ecosystems maintain balance?"]},daily:{title:"Daily Science",questions:["What does a quadratic function look like?","How does compound interest work? What's the 72 rule?"]}},sidebar:{newTask:"New Task",startNewLearning:"Start New Learning",skillStore:"Skills",studyCabin:"Study Cabin",gameLab:"Game Lab",recentChats:"Recent Chats",history:"History",noHistory:"No history",noTasks:"No explorations yet",untitled:"Untitled exploration",expandSidebar:"Expand sidebar",collapseSidebar:"Collapse sidebar",search:"Search",searchPlaceholder:"Search conversations...",noSearchResult:"No conversations found",searchHint:"Enter keywords to search",pressEsc:"Press ESC to close",quickSearch:"Quick search"},studyCabin:{entryTitle:"Snap a page, or upload a problem",entrySubtitle:"Turn it into a drill you can work through",entryCta:"Open Study Cabin",homeHeroTitle:"Turn any study material into a practice deck",homeHeroSubtitle:"Photo Â· Text Â· Textbook Â· PDF â AI builds notes, quizzes and lessons",actionPhotoTitle:"Take Photo",actionPhotoDesc:"Snap textbook, exercise or notes",actionTextTitle:"Paste Text",actionTextDesc:"Copy from anywhere",actionTextbookTitle:"From Textbook",actionTextbookDesc:"PEP Math Grade 1-6",actionPdfTitle:"Upload PDF",actionPdfDesc:"Tests, handouts, ebooks",recentSessions:"Recent Study",noRecentSessions:"No study session yet. Try one of the options above.",backToHome:"Back to Study Cabin",comingSoon:"Coming Soon",comingSoonDesc:"We're polishing this feature. Stay tuned."},skillTabs:{chat:"Ask","study-cards":"Flashcards","interactive-simulation":"Simulation","3d":"3D Learning","ar-lab":"AR Gesture Lab",excalidraw:"Charts"},inputHints:{send:"Send",newLine:"New line"},subjects:{physics:{label:"Physics",desc:"Experiments & Simulation"},math:{label:"Math",desc:"From Basics to Competitions"},geography:{label:"Geography",desc:"Visual Maps"}},onboarding:{title:"Tell me where you're starting",subtitle:"Pick your stage, topic and learning style to get better content",stageLabel:"Stage (optional)",gradeLabel:"Grade",ageLabel:"Age",agePlaceholder:"e.g. 8",topicLabel:"Topic",topicPlaceholder:"Type a topic you want to explore",textbookLabel:"Pick from textbook",orCustomTopicLabel:"Or type your own topic",customTopicPlaceholder:"Want something outside the textbook? Type it here",quickStartHint:"Or jump into a recommended topic",modeLabel:"Learning mode",recommendedHint:"Items marked Recommended fit this subject best",chooseGradeHint:"Pick a grade first",chooseUnitHint:"Select a unit to learn",startButton:"Start learning",skipButton:"Skip"},user:{login:"Login",logout:"Logout",loggingOut:"Logging out...",editRole:"Edit Role",preferences:"Preferences",aiPrivacy:"AI Privacy Settings",language:"Language"},deleteDialog:{title:"Delete Conversation",message:"This action cannot be undone. Are you sure you want to continue?",cancel:"Cancel",confirm:"Delete"},taskMenu:{rename:"Rename",delete:"Delete"},timeGroup:{today:"Today",yesterday:"Yesterday",week:"Last 7 days",older:"Older",justNow:"Just now",minutesAgo:"{n} min ago",hoursAgo:"{n} hr ago",daysAgo:"{n} days ago"},depth:{adjust:"Adjust",simplify:"Please explain the content in a simpler way",detail:"Please explain the content in more detail",quiz:"Please give me a quiz about this content",simplifyBtn:"Simpler",detailBtn:"Deeper"},code:{copy:"Copy code",copied:"Copied"},toast:{copiedToClipboard:"Copied to clipboard"},chat:{newChat:"New chat",share:"Share conversation",export:"Export conversation",send:"Send message"},artifact:{explore:"Explore Artifact"},preview:{title:"File Preview",close:"Close Preview",selectFile:"Select file to preview",clickBelow:"Click file card below",generatedFiles:"Generated Files",noPreview:"No preview available",playground:"Code",excalidraw:"Diagram",game:"Interactive"},artifactCard:{playground:"Interactive Demo",excalidraw:"Knowledge Map",game:"Interactive Game",unknown:"Unknown Type"},pictureBook:{loading:"Loading picture book...",puzzle:"Challenge",page:"Page",readPage:"Read",pauseRead:"Pause",resumeRead:"Resume",stopRead:"Stop",share:"Share"},puzzleGame:{title:"Puzzle Challenge",cards:"cards",difficulty:"Difficulty",easy:"Easy",medium:"Medium",hard:"Hard",start:"Start Challenge",level:"Level {n}",moves:"Moves",time:"Time",complete:"Complete!",stars:"stars",next:"Next Level",back:"Back",restart:"Restart",progress:"Completed {completed}/{total} levels",totalStars:"Total {stars} stars",locked:"Locked"},primaryTabs:{children:"Kids Zone",physics:"Physics Lab",arLab:"Gesture Lab"},placeholders:{children:"Enter a poem title or story theme, AI will create a picture book for you...",physics:"Enter a physics concept, let me guide you through hands-on exploration...",arLab:"Describe a gesture interaction, e.g., 'Control the Earth rotation with hand gestures'"},secondaryTabs:{all:"All",poetry:"Poetry",idiom:"Idioms",fable:"Fables",myth:"Myths",mechanics:"Mechanics",optics:"Optics",electromagnetics:"E&M",thermodynamics:"Thermo",waves:"Waves",physics:"Physics",astronomy:"Astronomy",chemistry:"Chemistry"},bottomHint:"Click a card to preview, or enter a custom theme to generate",contact:{entry:"Contact",title:"Contact Us",copied:"Copied",copyFailed:"Copy failed",footerHint:'Note "Eureka" when adding WeChat',channels:{wechat:"WeChat",wechatHint:"WeChat ID copied, open WeChat to add",wechatGroup:"WeChat Group",groupHint:'Copied, add and note "join group"',xiaohongshu:"Xiaohongshu",channels:"Channels"}},feedback:{entry:"Feedback",title:"Feedback",subtitle:"Your feedback helps us improve",bug:"Bug Report",feature:"Feature Request",other:"Other",placeholder:"Describe the issue or your suggestion...",submit:"Submit Feedback",success:"Thanks for your feedback! We'll review it carefully",emptyWarning:"Please enter your feedback"}}},Zo={zh:ep,en:tp},K=(n,...e)=>console.log(`[MiniProgram:${n}]`,...e),rt=(n,...e)=>console.log(`[MiniProgram:${n}] â`,...e),xr=(n,...e)=>console.warn(`[MiniProgram:${n}] â ï¸`,...e),Xe=(n,...e)=>console.error(`[MiniProgram:${n}] â`,...e);let Ye=null;function kc(){if(typeof window>"u")return!1;try{return new URLSearchParams(window.location.search).get("from")==="miniprogram"}catch{return!1}}function np(){return typeof navigator>"u"?!1:/MicroMessenger/i.test(navigator.userAgent)}function Hr(){var n;return Ye!==null?Ye:typeof window>"u"||typeof navigator>"u"?(Ye=!1,!1):(K("Detection","==================== ç¯å¢æ£æµ ===================="),K("Detection","URL:",window.location.href),K("Detection","UA:",navigator.userAgent),K("Detection","__wxjs_environment:",window.__wxjs_environment),K("Detection","window.wx å­å¨:",typeof window.wx<"u"),K("Detection","wx.miniProgram å­å¨:",!!((n=window.wx)!=null&&n.miniProgram)),K("Detection","URL from åæ°:",new URLSearchParams(window.location.search).get("from")),kc()?(rt("Detection","éè¿ URL åæ° from=miniprogram å¤å®ä¸ºå°ç¨åºç¯å¢"),Ye=!0,!0):window.__wxjs_environment==="miniprogram"?(rt("Detection","éè¿ __wxjs_environment æ£æµå°å°ç¨åºç¯å¢"),Ye=!0,!0):/miniprogram/i.test(navigator.userAgent)?(rt("Detection","éè¿ User Agent æ£æµå°å°ç¨åºç¯å¢"),Ye=!0,!0):(K("Detection","å¤å®ä¸ºéå°ç¨åºç¯å¢"),Ye=!1,!1))}async function qy(){return Hr()}function sp(){if(typeof window>"u")return null;K("Token","==================== è§£æ URL åæ° ===================="),K("Token","URL:",window.location.href);const n=new URLSearchParams(window.location.search),e=n.get("token"),t=n.get("from"),r=n.get("name"),i=n.get("picture");return K("Token","åæ° from:",t),K("Token","åæ° token:",e?`${e.substring(0,20)}...`:"æ "),K("Token","åæ° name:",r),K("Token","åæ° picture:",i?"å·²è®¾ç½®":"æ "),t==="miniprogram"&&e?(rt("Token","æåè·åå°ç¨åºä¼ éç Token"),e):(t==="miniprogram"&&!e&&xr("Token","æ¥èªå°ç¨åºä½æ²¡æ tokenï¼æ¸¸å®¢æ¨¡å¼ï¼"),null)}function rp(n=3e3){return new Promise(e=>{const t=window.wx;if(t!=null&&t.miniProgram){K("Login","wx.miniProgram å·²å°±ç»ªï¼ç«å³å¯ç¨ï¼"),K("Login","reLaunch ç±»å:",typeof t.miniProgram.reLaunch),e(t);return}K("Login","wx.miniProgram å°æªå¯ç¨ï¼å¼å§ç­å¾ JSSDK å è½½..."),K("Login","window.wx å­å¨:",typeof window.wx<"u");const r=Date.now(),i=setInterval(()=>{const a=window.wx,l=Date.now()-r;a!=null&&a.miniProgram?(clearInterval(i),rt("Login",`wx.miniProgram å·²å°±ç»ªï¼ç­å¾äº ${l}msï¼`),K("Login","reLaunch ç±»å:",typeof a.miniProgram.reLaunch),e(a)):l>=n&&(clearInterval(i),Xe("Login",`ç­å¾ wx.miniProgram è¶æ¶ï¼${n}msï¼`),K("Login","window.wx:",typeof window.wx),K("Login","wx å¯¹è±¡åå®¹:",window.wx?Object.keys(window.wx).join(", "):"ä¸å­å¨"),e(window.wx||null))},50)})}async function Wy(){K("Login","==================== è¯·æ±å°ç¨åºç»å½ ====================");const n=await rp();if(!(n!=null&&n.miniProgram)){Xe("Login","wx.miniProgram ä¸å¯ç¨ï¼æ æ³è·³è½¬"),Xe("Login","å¯è½åå : 1) ä¸å¨å°ç¨åº web-view ä¸­ 2) å¾®ä¿¡çæ¬è¿ä½ 3) æ³¨å¥è¢«è¦ç");return}try{const t=Object.keys(n.miniProgram||{});K("Login","wx.miniProgram å¯ç¨æ¹æ³:",t.join(", "))}catch{K("Login","æ æ³æä¸¾ wx.miniProgram æ¹æ³")}const e="/pages/index/index?action=login";K("Login","ç®æ  URL:",e),K("Login","typeof reLaunch:",typeof n.miniProgram.reLaunch),K("Login","typeof navigateTo:",typeof n.miniProgram.navigateTo),K("Login","typeof redirectTo:",typeof n.miniProgram.redirectTo),typeof n.miniProgram.reLaunch=="function"?(K("Login",">>> è°ç¨ reLaunch..."),n.miniProgram.reLaunch({url:e,success:()=>rt("Login","reLaunch success"),fail:t=>Xe("Login","reLaunch fail:",JSON.stringify(t)),complete:()=>K("Login","reLaunch complete")})):typeof n.miniProgram.navigateTo=="function"?(xr("Login","reLaunch ä¸å¯ç¨ï¼å°è¯ navigateTo..."),n.miniProgram.navigateTo({url:e,success:()=>rt("Login","navigateTo success"),fail:t=>Xe("Login","navigateTo fail:",JSON.stringify(t)),complete:()=>K("Login","navigateTo complete")})):typeof n.miniProgram.redirectTo=="function"?(xr("Login","navigateTo ä¸å¯ç¨ï¼å°è¯ redirectTo..."),n.miniProgram.redirectTo({url:e,success:()=>rt("Login","redirectTo success"),fail:t=>Xe("Login","redirectTo fail:",JSON.stringify(t)),complete:()=>K("Login","redirectTo complete")})):(Xe("Login","ææå¯¼èªæ¹æ³åä¸å¯ç¨ï¼"),Xe("Login","å¯ç¨ç key:",Object.keys(n.miniProgram||{}).join(", ")))}function ip(){var n;return typeof window>"u"?{error:"Window is undefined"}:{isInMiniProgram:Hr(),cachedResult:Ye,userAgent:navigator.userAgent,wxEnvironment:window.__wxjs_environment,hasWxObject:typeof window.wx<"u",hasMiniProgram:typeof((n=window.wx)==null?void 0:n.miniProgram)<"u",hasFromParam:kc(),isWeChatBrowser:np(),urlParams:{from:new URLSearchParams(window.location.search).get("from"),hasToken:!!new URLSearchParams(window.location.search).get("token")}}}const An=()=>{if(typeof window<"u"){const n=window.location.hostname,e=window.location.origin;if(n.includes("woa.com")||n.includes("devcloud")||e.includes("datamind"))return"devcloud";if(n.includes("eurekafinder.com")||n.includes("43.139.123.115"))return"tencent"}try{return"tencent"}catch{}return"gcp"},Ky=()=>{const n=An();return n==="devcloud"?"oa":n==="tencent"?"wechat":"firebase"},Jy=()=>An()!=="devcloud",op=()=>{const n=An();return n==="devcloud"||n==="tencent"?!1:n==="gcp"},br=()=>An()==="devcloud",ap=()=>An()==="tencent";function kt(){return""}const Nc=kt();async function Pc(){const n=await Ac();return n?{"Content-Type":"application/json",Authorization:`Bearer ${n}`}:null}async function Xy(){var n;try{const e=Nc,t=await Pc(),r=await fetch(`${e}/api/profile`,{method:"GET",headers:t});if(!r.ok){const a=await r.json().catch(()=>({error:"Unknown error"}));throw new Error(((n=a.error)==null?void 0:n.message)||`HTTP ${r.status}`)}const i=await r.json();if(!i.success)throw new Error(i.error||"Failed to get user profile");return i.data}catch(e){throw console.error("[Backend Profile] Failed to get profile:",e),e}}async function cp(n){var e;try{const t=Nc,r=await Pc();if(!r){console.warn("[Backend Profile] No auth token, skipping onboarding save");return}const i=await fetch(`${t}/api/profile/device`,{method:"PUT",headers:r,body:JSON.stringify({onboarding:n})});if(!i.ok){const a=await i.json().catch(()=>({error:"Unknown error"}));throw new Error(((e=a.error)==null?void 0:e.message)||`HTTP ${i.status}`)}}catch(t){console.error("[Backend Profile] Failed to save onboarding data:",t)}}const lp=[{group:"å¹¼å¿å­",grades:["å°ç­","ä¸­ç­","å¤§ç­"]},{group:"å°å­¦",grades:["ä¸å¹´çº§","äºå¹´çº§","ä¸å¹´çº§","åå¹´çº§","äºå¹´çº§","å­å¹´çº§"]},{group:"åä¸­",grades:["åä¸","åäº","åä¸"]},{group:"é«ä¸­",grades:["é«ä¸","é«äº","é«ä¸"]}],up=["æ°å­¦","ç©ç","åå­¦","è¯­æ","è±è¯­","çç©","å°ç","åå²"],dp=["å¾®ä¿¡","å°çº¢ä¹¦","Bç«","æé³","èå¸æ¨è","æåæ¨è","æç´¢å¼æ","å¶ä»"],ea=4;function hp(n,e){try{localStorage.setItem(`eureka_onboarding_${n}`,JSON.stringify(e)),localStorage.setItem(`eureka_onboarding_completed_${n}`,"true")}catch(t){console.warn("[Onboarding] Failed to save to localStorage:",t)}cp(e)}function ta(n){try{return localStorage.getItem(`eureka_onboarding_completed_${n}`)==="true"}catch{return!1}}function fp({current:n,total:e}){return c.jsx("div",{className:"flex items-center gap-2 mb-8",children:Array.from({length:e}).map((t,r)=>c.jsx("div",{className:`h-1 flex-1 rounded-full transition-all duration-300 ${r<n?"bg-orange-500":"bg-gray-100"}`},r))})}function zr({label:n,selected:e,onClick:t}){return c.jsx("button",{onClick:t,className:`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 border ${e?"bg-[rgba(248,134,34,0.08)] border-[rgba(248,134,34,0.5)] text-[#E26A00]":"bg-white border-gray-200 text-gray-600 hover:border-[rgba(248,134,34,0.3)] hover:bg-[rgba(248,134,34,0.04)]"}`,children:n})}function gp({role:n,roleOther:e,onRoleChange:t,onRoleOtherChange:r}){const i=[{value:"student",label:"å­¦ç",emoji:"ð"},{value:"teacher",label:"èå¸",emoji:"ð©âð«"},{value:"parent",label:"å®¶é¿",emoji:"ð¨âð©âð§"},{value:"other",label:"å¶ä»",emoji:"â¨"}];return c.jsxs("div",{children:[c.jsx("h2",{className:"text-2xl font-bold text-gray-900 mb-2",children:"ä½ çè§è²æ¯ï¼"}),c.jsxs("p",{className:"text-sm text-gray-500 mb-6",children:["å¸®å©æä»¬ä¸ºä½ æä¾æ´åéçåå®¹ ",c.jsx("span",{className:"text-teal-600 font-medium",children:"å¿å¡«"})]}),c.jsx("div",{className:"grid grid-cols-2 gap-3",children:i.map(a=>c.jsxs("button",{onClick:()=>t(a.value),className:`flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border-2 transition-all duration-150 ${n===a.value?"bg-[rgba(248,134,34,0.08)] border-[rgba(248,134,34,0.5)] text-[#E26A00]":"bg-white border-gray-100 text-gray-600 hover:border-[rgba(248,134,34,0.3)] hover:bg-[rgba(248,134,34,0.04)]"}`,children:[c.jsx("span",{className:"text-3xl",children:a.emoji}),c.jsx("span",{className:"text-sm font-medium",children:a.label})]},a.value))}),n==="other"&&c.jsx("input",{type:"text",value:e,onChange:a=>r(a.target.value),placeholder:"è¯·æè¿°ä½ çèº«ä»½...",className:"mt-4 w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-400 focus:shadow-[0_0_0_2px_rgba(248,134,34,0.15)] transition-all",autoFocus:!0})]})}function pp({role:n,grade:e,onGradeChange:t}){const r=n==="parent"?"ä½ çå­©å­å¨åªä¸ªå¹´çº§ï¼":"ä½ å¨åªä¸ªå¹´çº§ï¼";return c.jsxs("div",{children:[c.jsx("h2",{className:"text-2xl font-bold text-gray-900 mb-2",children:r}),c.jsxs("p",{className:"text-sm text-gray-500 mb-6",children:["è®©æä»¬å¹ééåçå­¦ä¹ åå®¹ ",c.jsx("span",{className:"text-teal-600 font-medium",children:"å¿å¡«"})]}),c.jsx("div",{className:"space-y-4",children:lp.map(i=>c.jsxs("div",{children:[c.jsx("p",{className:"text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2",children:i.group}),c.jsx("div",{className:"flex flex-wrap gap-2",children:i.grades.map(a=>c.jsx(zr,{label:a,selected:e===`${i.group}${a}`,onClick:()=>t(`${i.group}${a}`)},a))})]},i.group))})]})}function mp(n){switch(n){case"teacher":return{title:"ä½ ä¸»è¦æåªäºå­¦ç§ï¼",sub:"å¯å¤éï¼ä¹å¯ä»¥è·³è¿"};case"parent":return{title:"å­©å­ä¸»è¦å­¦åªäºå­¦ç§ï¼",sub:"å¯å¤éï¼ä¹å¯ä»¥è·³è¿"};case"student":return{title:"ææ³å­¦åªäºå­¦ç§ï¼",sub:"å¯å¤éï¼ä¹å¯ä»¥è·³è¿"};default:return{title:"ææå´è¶£çå­¦ç§æåªäºï¼",sub:"å¯å¤éï¼ä¹å¯ä»¥è·³è¿"}}}function yp({role:n,subjects:e,onToggle:t}){const{title:r,sub:i}=mp(n);return c.jsxs("div",{children:[c.jsx("h2",{className:"text-2xl font-bold text-gray-900 mb-2",children:r}),c.jsxs("p",{className:"text-sm text-gray-500 mb-6",children:[i," ",c.jsx("span",{className:"text-gray-400 font-medium",children:"éå¡«"})]}),c.jsx("div",{className:"flex flex-wrap gap-3",children:up.map(a=>c.jsx(zr,{label:a,selected:e.includes(a),onClick:()=>t(a)},a))})]})}function wp({referralSource:n,referralOther:e,onReferralChange:t,onReferralOtherChange:r}){return c.jsxs("div",{children:[c.jsx("h2",{className:"text-2xl font-bold text-gray-900 mb-2",children:"ä»åªéç¥éæä»¬çï¼"}),c.jsxs("p",{className:"text-sm text-gray-500 mb-6",children:["å¸®å©æä»¬äºè§£ç¨æ·æ¥æºï¼å¯ä»¥è·³è¿ ",c.jsx("span",{className:"text-gray-400 font-medium",children:"éå¡«"})]}),c.jsx("div",{className:"flex flex-wrap gap-3",children:dp.map(i=>c.jsx(zr,{label:i,selected:n===i,onClick:()=>t(n===i?"":i)},i))}),n==="å¶ä»"&&c.jsx("input",{type:"text",value:e,onChange:i=>r(i.target.value),placeholder:"è¯·è¯´ææ¥æº...",className:"mt-4 w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-400 focus:shadow-[0_0_0_2px_rgba(248,134,34,0.15)] transition-all",autoFocus:!0})]})}function xp({userId:n,onComplete:e}){const[t,r]=N.useState(1),[i,a]=N.useState(""),[l,d]=N.useState(""),[g,y]=N.useState(""),[_,S]=N.useState([]),[T,k]=N.useState(""),[A,D]=N.useState(""),P=i==="student"||i==="parent",O=x=>{S(w=>w.includes(x)?w.filter(v=>v!==x):[...w,x])},M=()=>t===1?i!==""&&(i!=="other"||l.trim()!==""):t===2?g!=="":!0,$=()=>{if(t===1&&!P){r(3);return}t<ea?r(x=>x+1):H()},B=()=>{if(t===3&&!P){r(1);return}r(x=>x-1)},H=()=>{const x={role:i,roleOther:l,grade:g,subjects:_,referralSource:T,referralOther:A,completedAt:Date.now()};hp(n,x),e(x)},z=t===3&&!P?2:t===4&&!P?3:t,b=P?4:3,p=t===ea,m=t===3||t===4;return c.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm",children:c.jsxs("div",{className:"relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden",children:[c.jsx("div",{className:"h-1 bg-gradient-to-r from-orange-400 to-amber-400"}),c.jsxs("div",{className:"p-8",children:[c.jsx(fp,{current:z,total:b}),c.jsxs("div",{className:"min-h-[280px]",children:[t===1&&c.jsx(gp,{role:i,roleOther:l,onRoleChange:a,onRoleOtherChange:d}),t===2&&P&&c.jsx(pp,{role:i,grade:g,onGradeChange:y}),t===3&&c.jsx(yp,{role:i,subjects:_,onToggle:O}),t===4&&c.jsx(wp,{referralSource:T,referralOther:A,onReferralChange:k,onReferralOtherChange:D})]}),c.jsxs("div",{className:"flex items-center justify-between mt-8 pt-6 border-t border-gray-50",children:[c.jsx("button",{onClick:B,className:`text-sm text-gray-400 hover:text-gray-600 transition-colors ${t===1?"invisible":""}`,children:"â ä¸ä¸æ­¥"}),c.jsxs("div",{className:"flex items-center gap-3",children:[m&&!p&&c.jsx("button",{onClick:()=>r(x=>x+1),className:"text-sm text-gray-400 hover:text-gray-600 transition-colors",children:"è·³è¿"}),m&&p&&c.jsx("button",{onClick:H,className:"text-sm text-gray-400 hover:text-gray-600 transition-colors",children:"è·³è¿"}),c.jsx("button",{onClick:$,disabled:!M(),className:`px-6 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${M()?"bg-orange-500 text-white hover:bg-orange-600 shadow-sm":"bg-gray-100 text-gray-400 cursor-not-allowed"}`,children:p?"å®æ ð":"ä¸ä¸æ­¥ â"})]})]})]})]})})}const bp=()=>{try{const n=localStorage.getItem("eureka_language");if(n&&["zh","en"].includes(n))return n;if(typeof navigator<"u"&&navigator.language){const e=navigator.language.toLowerCase();if(e.startsWith("zh"))return"zh";if(e.startsWith("en"))return"en"}}catch(n){console.warn("Failed to detect language:",n)}return"zh"},_p=n=>{try{localStorage.setItem("eureka_language",n)}catch(e){console.warn("Failed to save language to localStorage:",e)}},vp=n=>{const e={zh:"Eureka - ä»æç´¢å°æ¢ç´¢ï¼æå¼ç­æ¡çæ°æ¹å¼",en:"Eureka - From search to exploration, a new way to open answers"},t={zh:"Eureka - æç¥è¯å¯è§åï¼è®©å­¦ä¹ åéå±è§ä¸æ ·æè¶£",en:"Eureka - Visualize Knowledge, make learning as interesting as visiting a gallery"};document.title=e[n]||e.zh;let r=document.querySelector('meta[name="description"]');r||(r=document.createElement("meta"),r.setAttribute("name","description"),document.head.appendChild(r)),r.setAttribute("content",t[n]||t.zh)},Ip=()=>{const{showToast:n}=_a(),e=typeof window<"u"&&new URLSearchParams(window.location.search).get("force_mobile")==="1",[t,r]=N.useState(()=>e||eo()),[i,a]=N.useState(()=>bp()),l=N.useCallback(A=>{a(A),_p(A)},[]),d=Zo[i]||Zo.zh,g=Zg({t:d}),[y,_]=N.useState(!1),[S,T]=N.useState("");N.useEffect(()=>{if(new URLSearchParams(window.location.search).get("show_onboarding")==="1"){const D=me();if(D&&!D.isGuest){localStorage.removeItem(`eureka_onboarding_completed_${D.id}`),T(D.id),_(!0);const P=new URL(window.location.href);P.searchParams.delete("show_onboarding"),window.history.replaceState({},"",P.toString())}}},[]);const k=N.useRef(!1);return N.useEffect(()=>{const A=async()=>{if(br()){k.current=!0;try{if(await Lg()){const M=me();M&&(M.name,window.dispatchEvent(new CustomEvent("eureka:user-login",{detail:M})),window.dispatchEvent(new CustomEvent("eureka:oa-login-success")))}else console.warn("[Auth] OA èº«ä»½åæ­¥å¤±è´¥ï¼è¯·æ£æ¥ç½å³ Header éä¼ ")}catch(O){console.error("[Auth] OA åæ­¥å¼å¸¸:",O)}}};if(br()&&!k.current){const O=me(),M=localStorage.getItem("eureka_token");(!O||O.isGuest||!M)&&A(),Mg()}const D=()=>{k.current=!1,A()};if(window.addEventListener("eureka:oa-sync-required",D),Hr()){ip();const O=sp();if(O){const M=new URLSearchParams(window.location.search),$=M.get("name")||"å¾®ä¿¡ç¨æ·",B=M.get("picture")||"";localStorage.setItem("eureka_token",O);let H="miniprogram_user";try{const b=JSON.parse(atob(O.split(".")[1]));H=b.userId||b.sub||b.id||H}catch{console.warn("[MiniProgram] æ æ³è§£æ JWT tokenï¼ä½¿ç¨é»è®¤ ID")}const z={id:H,name:decodeURIComponent($),picture:decodeURIComponent(B),provider:"wechat_miniprogram",isGuest:!1};localStorage.setItem("eureka_user",JSON.stringify(z)),window.dispatchEvent(new CustomEvent("eureka:user-login",{detail:z}))}}return()=>{window.removeEventListener("eureka:oa-sync-required",D)}},[]),N.useEffect(()=>{const A=me();A&&!A.isGuest&&!ta(A.id)&&(T(A.id),_(!0))},[]),N.useEffect(()=>{const A=D=>{g.setShowLoginModal(!1);const P=(D==null?void 0:D.detail)||me();P&&!P.isGuest&&!ta(P.id)&&(T(P.id),_(!0))};return window.addEventListener("eureka:user-login",A),()=>window.removeEventListener("eureka:user-login",A)},[g]),N.useEffect(()=>{let A=null;const D=()=>{A&&clearTimeout(A),A=setTimeout(()=>{r(eo()),A=null},300)};return window.addEventListener("resize",D),()=>{window.removeEventListener("resize",D),A&&clearTimeout(A)}},[]),N.useEffect(()=>{vp(i)},[i]),{showToast:n,isMobile:t,lang:i,setLang:l,t:d,auth:g,showOnboarding:y,setShowOnboarding:_,onboardingUserId:S}},na=({children:n})=>{const e=Ip(),{showOnboarding:t,setShowOnboarding:r,onboardingUserId:i}=e;return c.jsxs(xa.Provider,{value:e,children:[n,t&&i&&c.jsx(xp,{userId:i,onComplete:()=>r(!1)})]})},Tp="eureka_db",Ep=1,Ne="sessions";class Sp{constructor(){this.db=null,this.initPromise=null}async init(){if(!this.db)return this.initPromise?this.initPromise:(this.initPromise=new Promise((e,t)=>{if(typeof window>"u"||!window.indexedDB){t(new Error("IndexedDB not supported"));return}const r=indexedDB.open(Tp,Ep);r.onerror=()=>{console.error("[IndexedDB] Failed to open database:",r.error),t(r.error)},r.onsuccess=()=>{this.db=r.result,e()},r.onupgradeneeded=i=>{const a=i.target.result;if(!a.objectStoreNames.contains(Ne)){const l=a.createObjectStore(Ne,{keyPath:"id"});l.createIndex("userId","userId",{unique:!1}),l.createIndex("updatedAt","updatedAt",{unique:!1}),l.createIndex("userId_updatedAt",["userId","updatedAt"],{unique:!1})}}}),this.initPromise)}async saveSession(e){try{return await this.init(),new Promise((t,r)=>{const l=this.db.transaction([Ne],"readwrite").objectStore(Ne).put(e);l.onsuccess=()=>{e.id,t()},l.onerror=()=>{console.error("[IndexedDB] Failed to save session:",l.error),r(l.error)}})}catch(t){throw console.error("[IndexedDB] Save error:",t),t}}async getSession(e){try{return await this.init(),new Promise((t,r)=>{const l=this.db.transaction([Ne],"readonly").objectStore(Ne).get(e);l.onsuccess=()=>{t(l.result||null)},l.onerror=()=>{console.error("[IndexedDB] Failed to get session:",l.error),r(l.error)}})}catch(t){return console.error("[IndexedDB] Get error:",t),null}}async getUserSessions(e,t=50){try{return await this.init(),new Promise((r,i)=>{const d=this.db.transaction([Ne],"readonly").objectStore(Ne).index("userId_updatedAt"),g=IDBKeyRange.bound([e,0],[e,Date.now()],!1,!1),y=d.openCursor(g,"prev"),_=[];let S=0;y.onsuccess=T=>{const k=T.target.result;k&&S<t?(_.push(k.value),S++,k.continue()):(_.length,r(_))},y.onerror=()=>{console.error("[IndexedDB] Failed to get sessions:",y.error),i(y.error)}})}catch(r){return console.error("[IndexedDB] Get sessions error:",r),[]}}async deleteSession(e){try{return await this.init(),new Promise((t,r)=>{const l=this.db.transaction([Ne],"readwrite").objectStore(Ne).delete(e);l.onsuccess=()=>{t()},l.onerror=()=>{console.error("[IndexedDB] Failed to delete session:",l.error),r(l.error)}})}catch(t){throw console.error("[IndexedDB] Delete error:",t),t}}async cleanupOldSessions(e,t=50){try{const r=await this.getUserSessions(e,1e3);if(r.length<=t)return 0;const i=r.slice(t);let a=0;for(const l of i)try{await this.deleteSession(l.id),a++}catch(d){console.warn("[IndexedDB] Failed to delete old session:",l.id,d)}return a}catch(r){return console.error("[IndexedDB] Cleanup error:",r),0}}async getStorageEstimate(){if(typeof navigator<"u"&&navigator.storage&&navigator.storage.estimate)try{const e=await navigator.storage.estimate(),t=e.usage||0,r=e.quota||0,i=r>0?t/r*100:0;return`${(t/1024/1024).toFixed(2)}`,`${(r/1024/1024).toFixed(2)}`,`${i.toFixed(2)}`,{usage:t,quota:r,percentage:i}}catch(e){console.warn("[IndexedDB] Failed to get storage estimate:",e)}return{usage:0,quota:0,percentage:0}}async migrateFromLocalStorage(e){try{const r=localStorage.getItem(`eureka_sessions_${e}`);if(!r)return 0;const i=JSON.parse(r);let a=0;for(const l of i)try{l.allNodes&&l.allNodes.length>0&&(await this.saveSession(l),a++)}catch(d){console.warn("[IndexedDB] Failed to migrate session:",l.id,d)}return a}catch(t){return console.error("[IndexedDB] Migration error:",t),0}}}const sa=new Sp;let ra=!1;async function Ap(){if(!ra)try{const n=me();if(!n)return;const e=await sa.migrateFromLocalStorage(n.id);if(e>0){`${e}`;const t=await sa.getStorageEstimate();`${(t.usage/1024/1024).toFixed(2)}`,`${(t.quota/1024/1024).toFixed(2)}`,`${t.percentage.toFixed(2)}`}ra=!0}catch(n){console.error("[Migration] Migration failed:",n)}}function kp(){if(typeof window>"u")return;const n=window.console.error;window.console.error=(...e)=>{var r;const t=((r=e[0])==null?void 0:r.toString())||"";t.includes("ResizeObserver loop limit exceeded")||t.includes("ResizeObserver loop completed with undelivered notifications")||n.apply(console,e)},window.addEventListener("unhandledrejection",e=>{var r;const t=((r=e.reason)==null?void 0:r.toString())||"";(t.includes("ResizeObserver")||t.includes("MutationObserver")||t.includes("IntersectionObserver"))&&(console.warn("[Observer] Unhandled rejection:",t),e.preventDefault())}),window.addEventListener("error",e=>{const t=e.message||"";if(t.includes("ResizeObserver")||t.includes("MutationObserver")||t.includes("IntersectionObserver"))return console.warn("[Observer] Global error:",t),e.preventDefault(),!0})}const Np="eureka_assets_db",ue="assets",Pp=2;class Cp{constructor(){this.dbPromise=null}async getDB(){return this.dbPromise?this.dbPromise:(this.dbPromise=new Promise((e,t)=>{const r=indexedDB.open(Np,Pp);r.onupgradeneeded=i=>{const a=i.target.result;if(!a.objectStoreNames.contains(ue)){const l=a.createObjectStore(ue,{keyPath:"id"});l.createIndex("type","type",{unique:!1}),l.createIndex("createdAt","createdAt",{unique:!1}),l.createIndex("syncStatus","syncStatus",{unique:!1})}},r.onsuccess=i=>{e(i.target.result)},r.onerror=i=>{t(i.target.error)}}),this.dbPromise)}async saveAsset(e){const t=await this.getDB();return new Promise((r,i)=>{const d=t.transaction([ue],"readwrite").objectStore(ue).put(e);d.onsuccess=()=>r(),d.onerror=()=>i(d.error)})}async createAsset(e,t,r){const a={id:`asset_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,name:e.name,type:t,size:e.size,mimeType:e.type,createdAt:Date.now(),updatedAt:Date.now(),syncStatus:"local",blob:e,...r};return await this.saveAsset(a),a}async getAsset(e){const t=await this.getDB();return new Promise((r,i)=>{const d=t.transaction([ue],"readonly").objectStore(ue).get(e);d.onsuccess=()=>r(d.result||null),d.onerror=()=>i(d.error)})}async getAllMetadata(e){const t=await this.getDB();return new Promise((r,i)=>{const l=t.transaction([ue],"readonly").objectStore(ue);let d;e?d=l.index("type").getAll(e):d=l.getAll(),d.onsuccess=()=>{const y=d.result.map(({blob:_,...S})=>S);r(y)},d.onerror=()=>i(d.error)})}async deleteAsset(e){const t=await this.getDB();return new Promise((r,i)=>{const d=t.transaction([ue],"readwrite").objectStore(ue).delete(e);d.onsuccess=()=>r(),d.onerror=()=>i(d.error)})}async clearAll(){const e=await this.getDB();return new Promise((t,r)=>{const l=e.transaction([ue],"readwrite").objectStore(ue).clear();l.onsuccess=()=>t(),l.onerror=()=>r(l.error)})}async getStorageEstimate(){if(navigator.storage&&navigator.storage.estimate){const e=await navigator.storage.estimate();return{usage:e.usage||0,quota:e.quota||0}}return{usage:0,quota:0}}async requestPersistentStorage(){return navigator.storage&&navigator.storage.persist?await navigator.storage.persist():!1}async isStoragePersisted(){return navigator.storage&&navigator.storage.persisted?await navigator.storage.persisted():!1}async findImageByOriginalUrl(e){const t=await this.getDB();return new Promise((r,i)=>{const g=t.transaction([ue],"readonly").objectStore(ue).index("type").openCursor("image");g.onsuccess=y=>{const _=y.target.result;if(_){const S=_.value;if(S.originalUrl===e){r(S);return}_.continue()}else r(null)},g.onerror=()=>i(g.error)})}async getImageBlobUrl(e){const t=await this.getAsset(e);return!t||t.type!=="image"?null:URL.createObjectURL(t.blob)}}const _r=new Cp;class Rp{constructor(){this.dataFiles=new Map,this.nodeToDataFile=new Map}async registerDataFile(e,t,r,i,a,l){const d=`data_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,g=l||this.generateDefaultColumnDescriptions(e.headers,e.columnStats||[]);try{const _=new Blob([JSON.stringify(e)],{type:"application/json"});await _r.saveAsset({id:d,name:t,type:"other",size:_.size,mimeType:"application/json",createdAt:Date.now(),updatedAt:Date.now(),syncStatus:"local",blob:_,rowCount:e.rowCount})}catch(_){throw console.error("[DataFileManager] â Failed to register to LocalAssetService:",_),new Error(`æ°æ®æä»¶æ¬å°å­å¨å¤±è´¥: ${_.message}`)}try{const{registerDataFileToBackend:_}=await ye(async()=>{const{registerDataFileToBackend:S}=await import("./dataAnalysisService-XyLwaqKJ.js");return{registerDataFileToBackend:S}},__vite__mapDeps([4,0,1]));await _(d,t,e)}catch(_){console.error("[DataFileManager] â Failed to register to Backend DuckDB:",_),console.warn("[DataFileManager] â ï¸ ç»§ç»­ä½¿ç¨åç«¯ IndexedDB æ°æ®ï¼ä½åç«¯æ¥è¯¢åè½å°ä¸å¯ç¨")}const y={id:d,fileName:t,fileSize:r,uploadTime:Date.now(),rowCount:e.rowCount,columnCount:e.columnCount,rootNodeId:i,canvasId:a,columnDescriptions:g,expiresAt:Date.now()+1440*60*1e3,dataContext:{headers:e.headers,rowCount:e.rowCount,columnCount:e.columnCount,data:[],columnStats:[],dataSummary:void 0,preview:""}};return this.dataFiles.set(d,y),this.nodeToDataFile.set(i,d),this.saveToLocalStorage(),d}generateDefaultColumnDescriptions(e,t){return e.map((r,i)=>{const a=t[i],l=this.inferEnglishKey(r);let d=[];return a!=null&&a.sampleValues&&(d=a.sampleValues.slice(0,20).map(g=>String(g)),a.uniqueCount&&a.uniqueCount>20&&d.push("...")),{englishKey:l,displayName:r,localizedName:void 0,businessMeaning:"",valueList:d}})}inferEnglishKey(e){return/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(e)?e:e.replace(/[^\w\s]/g,"").replace(/\s+/g,"_").toLowerCase()}async updateColumnDescriptions(e,t){const r=this.dataFiles.get(e);if(!r)throw new Error(`Data file not found: ${e}`);r.columnDescriptions=t,this.dataFiles.set(e,r),this.saveToLocalStorage()}getDataFileByNodeId(e){const t=this.nodeToDataFile.get(e);return t&&this.dataFiles.get(t)||null}getDataFileById(e){return this.dataFiles.get(e)||null}getAllDataFiles(){return Array.from(this.dataFiles.values())}getDataFilesByCanvasId(e){return Array.from(this.dataFiles.values()).filter(t=>t.canvasId===e)}getDataFilesByNodes(e){const t=new Set;return e.forEach(r=>{const i=this.nodeToDataFile.get(r.id);i&&t.add(i)}),Array.from(t).map(r=>this.dataFiles.get(r)).filter(Boolean)}removeDataFile(e){const t=this.dataFiles.get(e);t&&(this.nodeToDataFile.delete(t.rootNodeId),this.dataFiles.delete(e),this.saveToLocalStorage())}saveToLocalStorage(){try{const e=Array.from(this.dataFiles.entries()).map(([a,l])=>[a,{id:l.id,fileName:l.fileName,fileSize:l.fileSize,uploadTime:l.uploadTime,rowCount:l.rowCount,columnCount:l.columnCount,rootNodeId:l.rootNodeId,canvasId:l.canvasId,columnDescriptions:l.columnDescriptions,dataContext:{headers:l.dataContext.headers,rowCount:l.dataContext.rowCount,columnCount:l.dataContext.columnCount}}]),t={files:e,nodeMapping:Array.from(this.nodeToDataFile.entries()),version:"1.0"},r=JSON.stringify(t),i=new Blob([r]).size/1024/1024;if(i>4){console.warn(`[DataFileManager] â ï¸ localStorage æ°æ®è¿å¤§ (${i.toFixed(2)}MB)ï¼æ¸çæ§æ°æ®`);const l=e.sort((g,y)=>y[1].uploadTime-g[1].uploadTime).slice(0,10),d={files:l,nodeMapping:Array.from(this.nodeToDataFile.entries()).filter(([g,y])=>l.some(([_])=>_===y)),version:"1.0"};localStorage.setItem("eureka_data_files",JSON.stringify(d)),`${l.length}`}else localStorage.setItem("eureka_data_files",r)}catch(e){if(e.name==="QuotaExceededError"){console.error("[DataFileManager] â localStorage éé¢è¶åºï¼æ¸çæ§æ°æ®");const t=Array.from(this.dataFiles.entries()).sort((r,i)=>i[1].uploadTime-r[1].uploadTime).slice(0,5);this.dataFiles.clear(),this.nodeToDataFile.clear(),t.forEach(([r,i])=>{this.dataFiles.set(r,i),this.nodeToDataFile.set(i.rootNodeId,r)});try{this.saveToLocalStorage()}catch{console.error("[DataFileManager] â æ¸çåä»æ æ³ä¿å­ï¼è¯·æ£æ¥ localStorage ç©ºé´")}}else console.warn("[DataFileManager] Failed to save to localStorage:",e)}}loadFromLocalStorage(){try{const e=localStorage.getItem("eureka_data_files");if(!e)return;const t=JSON.parse(e);t.files&&Array.isArray(t.files)&&(this.dataFiles=new Map(t.files)),t.nodeMapping&&Array.isArray(t.nodeMapping)&&(this.nodeToDataFile=new Map(t.nodeMapping))}catch(e){console.warn("[DataFileManager] Failed to load from localStorage:",e)}}cleanupOldDataFiles(){const e=Date.now()-2592e6,t=[];this.dataFiles.forEach((r,i)=>{r.uploadTime<e&&t.push(i)}),t.forEach(r=>this.removeDataFile(r))}async validateAndCleanupStaleMetadata(){const e=[];for(const[t,r]of this.dataFiles.entries())try{const i=await _r.getAsset(t);(!i||!i.blob)&&(console.warn(`[DataFileManager] â ï¸ æä»¶ ${t} (${r.fileName}) çæ°æ®å·²è¢«æ¸çï¼ç§»é¤åæ°æ®`),e.push(t))}catch(i){console.warn(`[DataFileManager] â ï¸ éªè¯æä»¶ ${t} å¤±è´¥ï¼ç§»é¤åæ°æ®:`,i),e.push(t)}e.length>0&&e.forEach(t=>this.removeDataFile(t))}}const un=new Rp;typeof window<"u"&&(un.loadFromLocalStorage(),un.validateAndCleanupStaleMetadata().catch(n=>{console.error("[DataFileManager] å¯å¨æ¶éªè¯åæ°æ®å¤±è´¥:",n)}),setInterval(()=>{un.cleanupOldDataFiles(),un.validateAndCleanupStaleMetadata().catch(n=>{console.error("[DataFileManager] å®æéªè¯åæ°æ®å¤±è´¥:",n)})},1440*60*1e3));const Gr="eureka_admin_token",Cc=()=>`${kt()}/api/admin`,Dp=[{to:"/admin/analytics",label:"æ°æ®çæ¿",icon:"ð",description:"DAU / PV / çå­ç"},{to:"/admin/token-usage",label:"Token ç¨é",icon:"ðª",description:"æ¨¡åè°ç¨ä¸è´¹ç¨ç»è®¡"},{to:"/admin/feedback",label:"ç¨æ·åé¦",icon:"ð¬",description:"é®é¢åé¦ä¸åè½å»ºè®®"},{to:"/admin/game-feedback",label:"æ¸¸æåé¦",icon:"ð®",description:"æ¸¸æåéå³åè¯åä¸å»ºè®®"},{to:"/admin/onboarding",label:"ç¨æ·è°ç ",icon:"ð",description:"ç¨æ·ç»åä¸æ¥æºæ¸ é"}];function Rc(){return localStorage.getItem(Gr)}function jp(n){localStorage.setItem(Gr,n)}function ia(){localStorage.removeItem(Gr)}function kn(n,e){const t=Rc(),r=new Headers(e==null?void 0:e.headers);return t&&r.set("Authorization",`Bearer ${t}`),fetch(n,{...e,headers:r})}function Op({onSuccess:n}){const[e,t]=N.useState(""),[r,i]=N.useState(""),[a,l]=N.useState(!1),[d,g]=N.useState(""),y=async _=>{if(_.preventDefault(),!e.trim()||!r.trim()){g("è¯·è¾å¥è´¦å·åå¯ç ");return}l(!0),g("");try{const T=await(await fetch(`${Cc()}/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:e.trim(),password:r})})).json();T.success&&T.token?(jp(T.token),n()):g(T.message||"ç»å½å¤±è´¥")}catch{g("æ æ³è¿æ¥æå¡å¨ï¼è¯·ç¡®è®¤åç«¯å·²å¯å¨")}finally{l(!1)}};return c.jsx("div",{className:"h-screen bg-[#FAF7F2] flex items-center justify-center",children:c.jsxs("div",{className:"w-full max-w-sm",children:[c.jsxs("div",{className:"text-center mb-8",children:[c.jsxs("span",{className:"font-serif font-bold text-3xl tracking-tight select-none",children:["Eureka",c.jsx("span",{className:"text-[#F97316]",children:"."})]}),c.jsx("p",{className:"text-sm text-gray-400 mt-2",children:"ç®¡çåå°"})]}),c.jsxs("form",{onSubmit:y,className:"bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4",children:[c.jsxs("div",{children:[c.jsx("label",{className:"block text-xs font-medium text-gray-500 mb-1.5",children:"è´¦å·"}),c.jsx("input",{type:"text",value:e,onChange:_=>t(_.target.value),autoFocus:!0,autoComplete:"username",className:"w-full px-3.5 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[rgba(249,115,22,0.2)] transition-colors",placeholder:"è¯·è¾å¥ç®¡çåè´¦å·"})]}),c.jsxs("div",{children:[c.jsx("label",{className:"block text-xs font-medium text-gray-500 mb-1.5",children:"å¯ç "}),c.jsx("input",{type:"password",value:r,onChange:_=>i(_.target.value),autoComplete:"current-password",className:"w-full px-3.5 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[rgba(249,115,22,0.2)] transition-colors",placeholder:"è¯·è¾å¥å¯ç "})]}),d&&c.jsx("div",{className:"text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2",children:d}),c.jsx("button",{type:"submit",disabled:a,className:"w-full py-2.5 text-sm font-medium text-white bg-[#F97316] hover:bg-[#EA6C0E] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",children:a?"ç»å½ä¸­...":"ç»å½"})]}),c.jsx("p",{className:"text-center text-[11px] text-gray-300 mt-4",children:"ä»éææç®¡çåè®¿é®"})]})})}function Lp(){const n=zl(),[e,t]=N.useState(!1),[r,i]=N.useState(!0),a=N.useCallback(async()=>{const d=Rc();if(!d){t(!1),i(!1);return}try{(await(await fetch(`${Cc()}/verify`,{headers:{Authorization:`Bearer ${d}`}})).json()).success?t(!0):(ia(),t(!1))}catch{t(!0)}finally{i(!1)}},[]);N.useEffect(()=>{a()},[a]);const l=()=>{ia(),t(!1)};return r?c.jsx("div",{className:"h-screen bg-[#FAF7F2] flex items-center justify-center",children:c.jsx("div",{className:"text-sm text-gray-400",children:"éªè¯ç»å½ç¶æ..."})}):e?c.jsxs("div",{className:"h-screen flex bg-[#FAF7F2]",children:[c.jsxs("aside",{className:"w-[220px] shrink-0 bg-[#F3F0EB] border-r border-[rgba(0,0,0,0.06)] flex flex-col",children:[c.jsx("div",{className:"px-5 pt-5 pb-4",children:c.jsxs("button",{onClick:()=>n("/"),className:"flex items-center gap-2 group",children:[c.jsxs("span",{className:"font-serif font-bold text-xl tracking-tight select-none",children:["Eureka",c.jsx("span",{className:"text-[#F97316]",children:"."})]}),c.jsx("span",{className:"text-[11px] text-gray-400 font-medium",children:"Admin"})]})}),c.jsx("nav",{className:"flex-1 px-3 space-y-1",children:Dp.map(d=>c.jsxs(Gl,{to:d.to,className:({isActive:g})=>["flex items-center gap-3 px-3 py-2.5 transition-all duration-200 border",g?"bg-[rgba(255,255,255,0.42)] border-[rgba(255,255,255,0.42)] text-[#666666]":"border-transparent text-[#666666] hover:bg-[rgba(255,255,255,0.32)]"].join(" "),style:{borderRadius:"12px"},children:[c.jsx("span",{className:"text-lg leading-none",children:d.icon}),c.jsxs("div",{className:"min-w-0",children:[c.jsx("div",{className:"text-sm font-medium leading-tight",children:d.label}),c.jsx("div",{className:"text-[11px] text-gray-400 leading-tight mt-0.5 truncate",children:d.description})]})]},d.to))}),c.jsxs("div",{className:"px-3 pb-4 space-y-1",children:[c.jsxs("button",{onClick:l,className:"w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:text-red-500 hover:bg-[rgba(255,255,255,0.32)] transition-all duration-200 border border-transparent",style:{borderRadius:"12px"},children:[c.jsx("svg",{width:"16",height:"16",viewBox:"0 0 20 20",fill:"none",stroke:"currentColor",strokeWidth:"2",children:c.jsx("path",{d:"M7 10h10M14 6l3 4-3 4M7 4H4v12h3"})}),c.jsx("span",{children:"éåºç»å½"})]}),c.jsxs("button",{onClick:()=>n("/"),className:"w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-400 hover:text-gray-600 hover:bg-[rgba(255,255,255,0.32)] transition-all duration-200 border border-transparent",style:{borderRadius:"12px"},children:[c.jsx("svg",{width:"16",height:"16",viewBox:"0 0 20 20",fill:"none",stroke:"currentColor",strokeWidth:"2",children:c.jsx("path",{d:"M15 10H5M5 10L10 5M5 10L10 15"})}),c.jsx("span",{children:"è¿åé¦é¡µ"})]})]})]}),c.jsx("main",{className:"flex-1 overflow-y-auto",children:c.jsx(ql,{})})]}):c.jsx(Op,{onSuccess:()=>t(!0)})}const Dc={student:"å­¦ç",teacher:"èå¸",parent:"å®¶é¿",other:"å¶ä»"},oa=["bg-orange-400","bg-amber-400","bg-yellow-400","bg-teal-400","bg-cyan-400","bg-blue-400","bg-indigo-400","bg-purple-400","bg-pink-400","bg-rose-400"];function zn(n,e){const t={};for(const r of n){const i=e(r);if(Array.isArray(i))for(const a of i)t[a]=(t[a]||0)+1;else t[i]=(t[i]||0)+1}return Object.entries(t).map(([r,i])=>({name:r,count:i})).sort((r,i)=>i.count-r.count)}function Gn({title:n,data:e,total:t}){var i;const r=((i=e[0])==null?void 0:i.count)||1;return c.jsxs("div",{className:"bg-white rounded-2xl border border-gray-100 shadow-sm p-5",children:[c.jsx("h3",{className:"text-sm font-semibold text-gray-700 mb-4",children:n}),c.jsxs("div",{className:"space-y-2.5",children:[e.map((a,l)=>{const d=t>0?Math.round(a.count/t*100):0,g=r>0?Math.max(a.count/r*100,4):4;return c.jsxs("div",{className:"group",children:[c.jsxs("div",{className:"flex items-center justify-between mb-1",children:[c.jsx("span",{className:"text-xs text-gray-600 truncate max-w-[60%]",children:a.name}),c.jsxs("span",{className:"text-xs text-gray-400 tabular-nums",children:[a.count," äºº Â· ",d,"%"]})]}),c.jsx("div",{className:"h-5 bg-gray-50 rounded-full overflow-hidden",children:c.jsx("div",{className:`h-full rounded-full transition-all duration-500 ${oa[l%oa.length]}`,style:{width:`${g}%`}})})]},a.name)}),e.length===0&&c.jsx("p",{className:"text-xs text-gray-300 text-center py-3",children:"ææ æ°æ®"})]})]})}function qn({label:n,value:e,sub:t}){return c.jsxs("div",{className:"bg-white rounded-2xl p-5 border border-gray-100 shadow-sm",children:[c.jsx("p",{className:"text-xs text-gray-400 mb-1",children:n}),c.jsx("p",{className:"text-2xl font-bold text-gray-900",children:e}),t&&c.jsx("p",{className:"text-xs text-gray-400 mt-1",children:t})]})}function Mp({records:n}){var g,y,_,S,T;const e=n.length,t=zn(n,k=>{var A,D;return Dc[((A=k.onboarding)==null?void 0:A.role)||""]||((D=k.onboarding)==null?void 0:D.role)||"æªç¥"}),r=zn(n,k=>{var A;return((A=k.onboarding)==null?void 0:A.grade)||"æªå¡«"}),i=zn(n,k=>{var D;const A=(D=k.onboarding)==null?void 0:D.subjects;return A!=null&&A.length?A:["æªå¡«"]}),a=zn(n,k=>{var P,O;const A=(P=k.onboarding)==null?void 0:P.referralSource;if(!A)return"æªå¡«";const D=(O=k.onboarding)==null?void 0:O.referralOther;return D?`${A}ï¼${D}ï¼`:A}),l=(()=>{const k=Date.now(),A=864e5,D=[];for(let P=6;P>=0;P--){const O=k-P*A,M=O+A,$=new Date(O),B=`${$.getMonth()+1}/${$.getDate()}`,H=n.filter(z=>{var p;const b=(p=z.onboarding)==null?void 0:p.completedAt;return b&&b>=O-O%A&&b<M-M%A}).length;D.push({label:B,count:H})}return D})(),d=Math.max(...l.map(k=>k.count),1);return c.jsxs("div",{className:"space-y-6 mb-8",children:[c.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4",children:[c.jsx(qn,{label:"å¡«åæ»æ°",value:e,sub:"å®æå¼å¯¼çç¨æ·"}),c.jsx(qn,{label:"å­¦çå æ¯",value:e?`${Math.round((((g=t.find(k=>k.name==="å­¦ç"))==null?void 0:g.count)||0)/e*100)}%`:"-",sub:`å± ${((y=t.find(k=>k.name==="å­¦ç"))==null?void 0:y.count)||0} äºº`}),c.jsx(qn,{label:"èå¸å æ¯",value:e?`${Math.round((((_=t.find(k=>k.name==="èå¸"))==null?void 0:_.count)||0)/e*100)}%`:"-",sub:`å± ${((S=t.find(k=>k.name==="èå¸"))==null?void 0:S.count)||0} äºº`}),c.jsx(qn,{label:"ä»æ¥æ°å¢",value:((T=l[l.length-1])==null?void 0:T.count)||0,sub:`è¿7å¤©å± ${l.reduce((k,A)=>k+A.count,0)} äºº`})]}),c.jsxs("div",{className:"bg-white rounded-2xl border border-gray-100 shadow-sm p-5",children:[c.jsx("h3",{className:"text-sm font-semibold text-gray-700 mb-4",children:"è¿ 7 å¤©å¡«åè¶å¿"}),c.jsx("div",{className:"flex items-end gap-2 h-24",children:l.map(k=>c.jsxs("div",{className:"flex-1 flex flex-col items-center gap-1",children:[c.jsx("span",{className:"text-[10px] text-gray-400 tabular-nums",children:k.count}),c.jsx("div",{className:"w-full flex justify-center",children:c.jsx("div",{className:"w-full max-w-[32px] bg-orange-300 rounded-t-md transition-all duration-500",style:{height:`${Math.max(k.count/d*64,2)}px`}})}),c.jsx("span",{className:"text-[10px] text-gray-400",children:k.label})]},k.label))})]}),c.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[c.jsx(Gn,{title:"è§è²åå¸",data:t,total:e}),c.jsx(Gn,{title:"æ¥æºæ¸ éåå¸",data:a,total:e}),c.jsx(Gn,{title:"å¹´çº§åå¸",data:r,total:e}),c.jsx(Gn,{title:"æå´è¶£å­¦ç§åå¸",data:i,total:e})]})]})}function Fp(n){return n?new Date(n).toLocaleString("zh-CN",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"-"}function Up(){const[n,e]=N.useState([]),[t,r]=N.useState(!0),[i,a]=N.useState("");N.useEffect(()=>{const d=kt();kn(`${d}/api/admin/onboarding`).then(g=>{if(!g.ok)throw new Error(`è¯·æ±å¤±è´¥ (${g.status})`);return g.json()}).then(g=>{if(!g.success)throw new Error(g.error||"æ¥è¯¢å¤±è´¥");const y=g.users.filter(_=>_.onboarding);e(y)}).catch(g=>a(g.message||"å è½½å¤±è´¥")).finally(()=>r(!1))},[]);const l=N.useMemo(()=>[...n].sort((d,g)=>{var S,T;const y=((S=d.onboarding)==null?void 0:S.completedAt)||0;return(((T=g.onboarding)==null?void 0:T.completedAt)||0)-y}),[n]);return t?c.jsx("div",{className:"h-screen bg-[#fafafa] flex items-center justify-center",children:c.jsx("div",{className:"text-gray-400 text-sm",children:"å è½½ä¸­..."})}):i?c.jsx("div",{className:"h-screen bg-[#fafafa] flex items-center justify-center",children:c.jsxs("div",{className:"text-center",children:[c.jsx("p",{className:"text-2xl mb-2",children:"â ï¸"}),c.jsx("p",{className:"text-red-500 text-sm font-medium mb-1",children:i}),c.jsx("p",{className:"text-gray-400 text-xs",children:"è¯·ç¡®è®¤ä½ çè´¦å·å·æç®¡çåæé"})]})}):c.jsx("div",{className:"h-screen bg-[#fafafa] overflow-y-auto",children:c.jsxs("div",{className:"max-w-6xl mx-auto px-6 py-8",children:[c.jsxs("div",{className:"mb-8",children:[c.jsx("h1",{className:"text-2xl font-bold text-gray-900 mb-1",children:"ç¨æ·è°ç æ°æ®"}),c.jsxs("p",{className:"text-sm text-gray-500",children:["ç¨æ·ç»å½æ¶å¡«åçåºæ¬ä¿¡æ¯ï¼ç¨äºäºè§£ç®æ ç¨æ·ç»å Â· å± ",n.length," æ¡"]})]}),c.jsx(Mp,{records:n}),c.jsxs("div",{className:"mb-4",children:[c.jsx("h2",{className:"text-base font-semibold text-gray-700",children:"è¯¦ç»æ°æ®"}),c.jsx("p",{className:"text-xs text-gray-400 mt-0.5",children:"æå¡«åæ¶é´ç±è¿å°è¿æå"})]}),l.length===0?c.jsx("div",{className:"bg-white rounded-2xl border border-gray-100 p-12 text-center",children:c.jsx("p",{className:"text-gray-400 text-sm",children:"ææ æ°æ®ï¼ç¨æ·å®æå¼å¯¼åå°å¨æ­¤æ¾ç¤º"})}):c.jsx("div",{className:"bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto",children:c.jsxs("table",{className:"w-full text-sm",children:[c.jsx("thead",{children:c.jsxs("tr",{className:"border-b border-gray-100 bg-gray-50",children:[c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-10",children:"#"}),c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide",children:"è§è²"}),c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide",children:"å¹´çº§"}),c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide",children:"æå´è¶£å­¦ç§"}),c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide",children:"æ¥æºæ¸ é"}),c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide",children:"å¡«åæ¶é´"})]})}),c.jsx("tbody",{className:"divide-y divide-gray-50",children:l.map((d,g)=>{var y,_,S,T,k,A,D,P;return c.jsxs("tr",{className:"hover:bg-gray-50/50 transition-colors",children:[c.jsx("td",{className:"px-5 py-4 text-xs text-gray-300 tabular-nums",children:g+1}),c.jsx("td",{className:"px-5 py-4",children:c.jsxs("span",{className:"inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[rgba(248,134,34,0.08)] text-[#E26A00]",children:[Dc[((y=d.onboarding)==null?void 0:y.role)||""]||((_=d.onboarding)==null?void 0:_.role)||"-",((S=d.onboarding)==null?void 0:S.roleOther)&&`ï¼${d.onboarding.roleOther}ï¼`]})}),c.jsx("td",{className:"px-5 py-4 text-gray-600",children:((T=d.onboarding)==null?void 0:T.grade)||c.jsx("span",{className:"text-gray-300",children:"-"})}),c.jsx("td",{className:"px-5 py-4",children:(A=(k=d.onboarding)==null?void 0:k.subjects)!=null&&A.length?c.jsx("div",{className:"flex flex-wrap gap-1",children:d.onboarding.subjects.map(O=>c.jsx("span",{className:"px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs",children:O},O))}):c.jsx("span",{className:"text-gray-300",children:"æªå¡«"})}),c.jsx("td",{className:"px-5 py-4 text-gray-600",children:(D=d.onboarding)!=null&&D.referralSource?c.jsxs(c.Fragment,{children:[d.onboarding.referralSource,d.onboarding.referralOther&&`ï¼${d.onboarding.referralOther}ï¼`]}):c.jsx("span",{className:"text-gray-300",children:"æªå¡«"})}),c.jsx("td",{className:"px-5 py-4 text-gray-400 text-xs tabular-nums whitespace-nowrap",children:Fp((P=d.onboarding)==null?void 0:P.completedAt)})]},d.userId)})})]})}),c.jsx("p",{className:"mt-4 text-xs text-gray-400 text-center pb-8",children:"æ­¤é¡µé¢ä»ç®¡çåå¯è®¿é® Â· æ°æ®å®æ¶ä»åç«¯è¯»å"})]})})}function vr(n){if(!n)return null;if(typeof n=="object"){const t=n._seconds??n.seconds;return t!=null?new Date(t*1e3):null}const e=new Date(n);return isNaN(e.getTime())?null:e}function jc(n){const e=vr(n);return e?e.toLocaleString("zh-CN",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"-"}function nr(n,e=60){return n?n.length>e?n.slice(0,e)+"...":n:""}function Bp(n){const e=["æ¶é´","ç¨æ·æµç§°","ç»å½é®ç®±","ç»å½æ¹å¼","ç¨æ·ææº","é®é¢åé¦","åè½å»ºè®®","å¶ä»","è¡¨åå¾®ä¿¡","è¡¨åææº","è¡¨åé®ç®±","ç¨æ·ID"],t=g=>`"${(g||"").replace(/"/g,'""')}"`,r=n.map(g=>{var y,_,S,T;return[jc(g.createdAt),t(((y=g.userInfo)==null?void 0:y.nickname)||g.userName||""),t(((_=g.userInfo)==null?void 0:_.email)||g.userEmail||""),t(((S=g.userInfo)==null?void 0:S.authProvider)||""),t(((T=g.userInfo)==null?void 0:T.phone)||""),t(g.bugReport),t(g.featureSuggestion),t(g.other),t(g.wechat),t(g.phone),t(g.email),g.userId].join(",")}),i="\uFEFF"+[e.join(","),...r].join(`
`),a=new Blob([i],{type:"text/csv;charset=utf-8;"}),l=URL.createObjectURL(a),d=document.createElement("a");d.href=l,d.download=`eureka_feedback_${new Date().toISOString().slice(0,10)}.csv`,d.click(),URL.revokeObjectURL(l)}function Wn({label:n,value:e,sub:t}){return c.jsxs("div",{className:"bg-white rounded-2xl p-5 border border-gray-100 shadow-sm",children:[c.jsx("p",{className:"text-xs text-gray-400 mb-1",children:n}),c.jsx("p",{className:"text-2xl font-bold text-gray-900",children:e}),t&&c.jsx("p",{className:"text-xs text-gray-400 mt-1",children:t})]})}const aa="px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer select-none",ca="bg-gray-800 text-white",la="bg-white text-gray-500 border border-gray-200 hover:bg-gray-50";function Vp(){const[n,e]=N.useState([]),[t,r]=N.useState(!0),[i,a]=N.useState(""),[l,d]=N.useState(null),[g,y]=N.useState("all"),[_,S]=N.useState("all"),[T,k]=N.useState(""),[A,D]=N.useState(""),[P,O]=N.useState(1),[M,$]=N.useState(20),B=N.useCallback(async()=>{try{r(!0);const f=kt(),L=await kn(`${f}/api/admin/feedback?limit=500`);if(!L.ok)throw new Error(`è¯·æ±å¤±è´¥ (${L.status})`);const j=await L.json();if(j.success)e(j.data||[]);else throw new Error(j.message||"æ¥è¯¢å¤±è´¥")}catch(f){a(f.message||"å è½½å¤±è´¥")}finally{r(!1)}},[]);N.useEffect(()=>{B()},[B]);const H=N.useMemo(()=>{let f=n;if(g==="bug"?f=f.filter(L=>{var j;return(j=L.bugReport)==null?void 0:j.trim()}):g==="feature"?f=f.filter(L=>{var j;return(j=L.featureSuggestion)==null?void 0:j.trim()}):g==="other"&&(f=f.filter(L=>{var j;return(j=L.other)==null?void 0:j.trim()})),_==="wechat"?f=f.filter(L=>{var j;return(j=L.wechat)==null?void 0:j.trim()}):_==="phone"?f=f.filter(L=>{var j;return(j=L.phone)==null?void 0:j.trim()}):_==="email"?f=f.filter(L=>{var j;return(j=L.email)==null?void 0:j.trim()}):_==="none"&&(f=f.filter(L=>{var j,le,C;return!((j=L.wechat)!=null&&j.trim())&&!((le=L.phone)!=null&&le.trim())&&!((C=L.email)!=null&&C.trim())})),T){const L=new Date(T);f=f.filter(j=>{const le=vr(j.createdAt);return le&&le>=L})}if(A){const L=new Date(A+"T23:59:59");f=f.filter(j=>{const le=vr(j.createdAt);return le&&le<=L})}return f},[n,g,_,T,A]);N.useEffect(()=>{O(1)},[g,_,T,A]);const z=Math.max(1,Math.ceil(H.length/M)),b=H.slice((P-1)*M,P*M),p=n.length,m=n.filter(f=>f.bugReport).length,x=n.filter(f=>f.featureSuggestion).length,w=n.filter(f=>f.wechat||f.phone||f.email).length,v=g!=="all"||_!=="all"||T||A;return t?c.jsx("div",{className:"min-h-screen bg-[#fafafa] flex items-center justify-center",children:c.jsx("div",{className:"text-gray-400 text-sm",children:"å è½½ä¸­..."})}):i?c.jsx("div",{className:"min-h-screen bg-[#fafafa] flex items-center justify-center",children:c.jsxs("div",{className:"text-center",children:[c.jsx("p",{className:"text-2xl mb-2",children:"â ï¸"}),c.jsx("p",{className:"text-red-500 text-sm font-medium mb-1",children:i}),c.jsx("p",{className:"text-gray-400 text-xs",children:"è¯·ç¡®è®¤è´¦å·å·ææé"})]})}):c.jsx("div",{className:"min-h-screen bg-[#fafafa] p-8",children:c.jsxs("div",{className:"max-w-6xl mx-auto",children:[c.jsxs("div",{className:"flex items-center justify-between mb-8",children:[c.jsxs("div",{children:[c.jsx("h1",{className:"text-2xl font-bold text-gray-900 mb-1",children:"ç¨æ·åé¦"}),c.jsx("p",{className:"text-sm text-gray-500",children:"æ¥çç¨æ·æäº¤çé®é¢åé¦ãåè½å»ºè®®åèç³»æ¹å¼"})]}),c.jsxs("div",{className:"flex items-center gap-2",children:[c.jsx("button",{onClick:()=>Bp(H),disabled:H.length===0,className:"px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed",children:"å¯¼åº CSV"}),c.jsx("button",{onClick:B,className:"px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors",children:"å·æ°"})]})]}),c.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4 mb-6",children:[c.jsx(Wn,{label:"åé¦æ»æ°",value:p,sub:"ç´¯è®¡æ¶å°çåé¦"}),c.jsx(Wn,{label:"é®é¢åé¦",value:m,sub:`å æ¯ ${p?Math.round(m/p*100):0}%`}),c.jsx(Wn,{label:"åè½å»ºè®®",value:x,sub:`å æ¯ ${p?Math.round(x/p*100):0}%`}),c.jsx(Wn,{label:"çèç³»æ¹å¼",value:w,sub:`å æ¯ ${p?Math.round(w/p*100):0}%`})]}),c.jsxs("div",{className:"bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6",children:[c.jsxs("div",{className:"flex flex-wrap items-center gap-x-6 gap-y-3",children:[c.jsxs("div",{className:"flex items-center gap-2",children:[c.jsx("span",{className:"text-xs text-gray-400 font-medium shrink-0",children:"æ¶é´"}),c.jsx("input",{type:"date",value:T,onChange:f=>k(f.target.value),className:"px-2.5 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300"}),c.jsx("span",{className:"text-xs text-gray-300",children:"~"}),c.jsx("input",{type:"date",value:A,onChange:f=>D(f.target.value),className:"px-2.5 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300"})]}),c.jsx("div",{className:"w-px h-5 bg-gray-200"}),c.jsxs("div",{className:"flex items-center gap-1.5",children:[c.jsx("span",{className:"text-xs text-gray-400 font-medium shrink-0 mr-1",children:"åå®¹"}),[["all","å¨é¨"],["bug","é®é¢åé¦"],["feature","åè½å»ºè®®"],["other","å¶ä»"]].map(([f,L])=>c.jsx("button",{onClick:()=>y(f),className:`${aa} ${g===f?ca:la}`,children:L},f))]}),c.jsx("div",{className:"w-px h-5 bg-gray-200"}),c.jsxs("div",{className:"flex items-center gap-1.5",children:[c.jsx("span",{className:"text-xs text-gray-400 font-medium shrink-0 mr-1",children:"èç³»æ¹å¼"}),[["all","å¨é¨"],["wechat","å¾®ä¿¡"],["phone","ææº"],["email","é®ç®±"],["none","æªç"]].map(([f,L])=>c.jsx("button",{onClick:()=>S(f),className:`${aa} ${_===f?ca:la}`,children:L},f))]}),v&&c.jsx("button",{onClick:()=>{y("all"),S("all"),k(""),D("")},className:"text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 ml-auto",children:"æ¸é¤ç­é"})]}),v&&c.jsxs("p",{className:"text-[11px] text-gray-400 mt-2",children:["ç­éç»æ: ",H.length," / ",p," æ¡"]})]}),H.length===0?c.jsx("div",{className:"bg-white rounded-2xl border border-gray-100 p-12 text-center",children:c.jsx("p",{className:"text-gray-400 text-sm",children:v?"æ å¹éçåé¦æ°æ®ï¼è¯è¯è°æ´ç­éæ¡ä»¶":"ææ åé¦æ°æ®"})}):c.jsx("div",{className:"bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden",children:c.jsxs("table",{className:"w-full text-sm",children:[c.jsx("thead",{children:c.jsxs("tr",{className:"border-b border-gray-100 bg-gray-50",children:[c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[140px]",children:"æ¶é´"}),c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[180px]",children:"ç¨æ·"}),c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide",children:"é®é¢åé¦"}),c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide",children:"åè½å»ºè®®"}),c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide",children:"å¶ä»"}),c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[170px]",children:"èç³»æ¹å¼"})]})}),c.jsx("tbody",{className:"divide-y divide-gray-50",children:b.map(f=>{const L=l===f.id,j=f.userInfo;return c.jsxs("tr",{onClick:()=>d(L?null:f.id),className:"hover:bg-gray-50/50 transition-colors cursor-pointer",children:[c.jsx("td",{className:"px-5 py-4 text-gray-400 text-xs whitespace-nowrap align-top",children:jc(f.createdAt)}),c.jsx("td",{className:"px-5 py-4 align-top",children:j?c.jsxs("div",{className:"flex items-start gap-2",children:[j.avatar&&c.jsx("img",{src:j.avatar,alt:"",className:"w-7 h-7 rounded-full shrink-0 mt-0.5",referrerPolicy:"no-referrer"}),c.jsxs("div",{className:"min-w-0 text-xs space-y-0.5",children:[c.jsx("div",{className:"font-medium text-gray-700 truncate",title:j.nickname,children:j.nickname||"ç¨æ·"}),j.authProvider&&c.jsx("div",{className:"text-[10px] text-gray-400",children:j.authProvider==="wechat"?"å¾®ä¿¡":j.authProvider==="wechat_mp"?"æå¡å·":j.authProvider==="wechat_miniprogram"?"å°ç¨åº":j.authProvider==="google"?"Google":j.authProvider==="email"?"é®ç®±":j.authProvider}),j.email&&c.jsx("div",{className:"text-[10px] text-gray-500 truncate",title:j.email,children:j.email}),j.phone&&c.jsx("div",{className:"text-[10px] text-gray-500",children:j.phone}),j.wechatOpenId&&c.jsxs("div",{className:"text-[10px] text-gray-400 truncate",title:j.wechatOpenId,children:["OpenID: ",j.wechatOpenId.slice(0,10),"..."]})]})]}):c.jsx("div",{className:"text-xs text-gray-300",children:f.userId==="anonymous"?"å¿å":c.jsxs("span",{className:"text-gray-400",title:f.userId,children:[f.userId.slice(0,12),"..."]})})}),c.jsx("td",{className:"px-5 py-4 text-gray-700 align-top",children:f.bugReport?c.jsx("span",{className:L?"whitespace-pre-wrap":"",children:L?f.bugReport:nr(f.bugReport)}):c.jsx("span",{className:"text-gray-300",children:"-"})}),c.jsx("td",{className:"px-5 py-4 text-gray-700 align-top",children:f.featureSuggestion?c.jsx("span",{className:L?"whitespace-pre-wrap":"",children:L?f.featureSuggestion:nr(f.featureSuggestion)}):c.jsx("span",{className:"text-gray-300",children:"-"})}),c.jsx("td",{className:"px-5 py-4 text-gray-700 align-top",children:f.other?c.jsx("span",{className:L?"whitespace-pre-wrap":"",children:L?f.other:nr(f.other)}):c.jsx("span",{className:"text-gray-300",children:"-"})}),c.jsx("td",{className:"px-5 py-4 align-top",children:c.jsxs("div",{className:"space-y-0.5 text-xs",children:[f.wechat&&c.jsxs("div",{className:"text-gray-600",children:["å¾®ä¿¡: ",c.jsx("span",{className:"font-medium",children:f.wechat})]}),f.phone&&c.jsxs("div",{className:"text-gray-600",children:["ææº: ",c.jsx("span",{className:"font-medium",children:f.phone})]}),f.email&&c.jsxs("div",{className:"text-gray-600",children:["é®ç®±: ",c.jsx("span",{className:"font-medium",children:f.email})]}),!f.wechat&&!f.phone&&!f.email&&c.jsx("span",{className:"text-gray-300",children:"æªç"})]})})]},f.id)})})]})}),H.length>0&&c.jsxs("div",{className:"flex items-center justify-between mt-4 px-1",children:[c.jsxs("div",{className:"flex items-center gap-2 text-xs text-gray-400",children:[c.jsx("span",{children:"æ¯é¡µ"}),c.jsx("select",{value:M,onChange:f=>{$(Number(f.target.value)),O(1)},className:"px-2 py-1 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white focus:outline-none",children:[10,20,50,100].map(f=>c.jsxs("option",{value:f,children:[f," æ¡"]},f))}),c.jsxs("span",{className:"ml-2",children:["å± ",H.length," æ¡ï¼ç¬¬ ",(P-1)*M+1,"-",Math.min(P*M,H.length)," æ¡"]})]}),c.jsxs("div",{className:"flex items-center gap-1",children:[c.jsx("button",{onClick:()=>O(1),disabled:P<=1,className:"px-2.5 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",children:"é¦é¡µ"}),c.jsx("button",{onClick:()=>O(f=>Math.max(1,f-1)),disabled:P<=1,className:"px-2.5 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",children:"ä¸ä¸é¡µ"}),c.jsxs("span",{className:"px-3 py-1.5 text-xs font-medium text-gray-700",children:[P," / ",z]}),c.jsx("button",{onClick:()=>O(f=>Math.min(z,f+1)),disabled:P>=z,className:"px-2.5 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",children:"ä¸ä¸é¡µ"}),c.jsx("button",{onClick:()=>O(z),disabled:P>=z,className:"px-2.5 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",children:"æ«é¡µ"})]})]}),c.jsx("p",{className:"mt-3 text-xs text-gray-400 text-center",children:"ç¹å»è¡å¯å±å¼/æ¶èµ·å®æ´åå®¹ Â· æ°æ®å®æ¶ä»åç«¯è¯»å"})]})})}const $p={"physics-cannon-quest":"ð¯ ç©çå¤§ç®ææ","chemistry-escape-room":"ð§ª åå­¦å¯å®¤è§£è°","math-chicken-rabbit":"ð é¸¡ååç¬¼","paper-fold-to-moon":"ð çº¸æå°æç","stack-tower":"ðï¸ ç¥è¯å å é«","math-sprint":"â¡ éç®ææ",math24:"ð¢ 24ç¹ææ","merge-game":"ð® ç¥è¯ååä¹","rhythm-knowledge":"ðµ èå¥ç¥è¯é"},Hp={student:"å­¦ç",teacher:"èå¸",parent:"å®¶é¿",other:"å¶ä»"};function Ir(n){if(!n)return null;if(typeof n=="object"){const t=n._seconds??n.seconds;return t!=null?new Date(t*1e3):null}const e=new Date(n);return isNaN(e.getTime())?null:e}function Oc(n){const e=Ir(n);return e?e.toLocaleString("zh-CN",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"-"}function Tr(n){return $p[n]||n}function Lc(n){return Hp[n]||"-"}function zp(n){const e=["æ¶é´","æ¸¸æ","è¯å","èº«ä»½","æ³è¦æ´å¤","éå³å°ç¬¬å å³","æ¸¸ææ¶é¿(ç§)","ä¸å¥è¯æå","ç¨æ·æµç§°","ç»å½æ¹å¼","ç¨æ·ID"],t=g=>`"${(g||"").replace(/"/g,'""')}"`,r=n.map(g=>{var y,_;return[Oc(g.createdAt),t(Tr(g.gameId)),String(g.rating),t(Lc(g.userType)),g.wantMore?"æ¯":"å¦",g.level!=null?String(g.level):"",g.duration!=null?String(g.duration):"",t(g.comment||""),t(((y=g.userInfo)==null?void 0:y.nickname)||g.userName||""),t(((_=g.userInfo)==null?void 0:_.authProvider)||""),g.userId].join(",")}),i="\uFEFF"+[e.join(","),...r].join(`
`),a=new Blob([i],{type:"text/csv;charset=utf-8;"}),l=URL.createObjectURL(a),d=document.createElement("a");d.href=l,d.download=`eureka_game_feedback_${new Date().toISOString().slice(0,10)}.csv`,d.click(),URL.revokeObjectURL(l)}function Kn({label:n,value:e,sub:t,color:r="#f97316"}){return c.jsxs("div",{className:"bg-white rounded-2xl p-5 border border-gray-100 shadow-sm",children:[c.jsx("p",{className:"text-xs text-gray-400 mb-1",children:n}),c.jsx("p",{className:"text-2xl font-bold",style:{color:r},children:e}),t&&c.jsx("p",{className:"text-xs text-gray-400 mt-1",children:t})]})}function Gp({rating:n}){return c.jsxs("span",{className:"inline-flex items-center gap-0.5",children:[[1,2,3,4,5].map(e=>c.jsx("span",{className:"text-sm",style:{color:e<=n?"#FBBF24":"#E5E7EB"},children:"â"},e)),c.jsx("span",{className:"ml-1 text-xs text-gray-400",children:n})]})}const sr="px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer select-none",rr="bg-gray-800 text-white",ir="bg-white text-gray-500 border border-gray-200 hover:bg-gray-50";function qp(){const[n,e]=N.useState([]),[t,r]=N.useState(!0),[i,a]=N.useState(""),[l,d]=N.useState("all"),[g,y]=N.useState("all"),[_,S]=N.useState("all"),[T,k]=N.useState("all"),[A,D]=N.useState(""),[P,O]=N.useState(""),[M,$]=N.useState(1),[B,H]=N.useState(20),z=N.useCallback(async()=>{try{r(!0);const C=kt(),U=await kn(`${C}/api/admin/game-feedback?limit=500`);if(!U.ok)throw new Error(`è¯·æ±å¤±è´¥ (${U.status})`);const ge=await U.json();if(ge.success)e(ge.data||[]);else throw new Error(ge.message||"æ¥è¯¢å¤±è´¥")}catch(C){a(C.message||"å è½½å¤±è´¥")}finally{r(!1)}},[]);N.useEffect(()=>{z()},[z]);const b=N.useMemo(()=>{const C=new Set(n.map(U=>U.gameId));return Array.from(C)},[n]),p=N.useMemo(()=>{let C=n;if(l!=="all"&&(C=C.filter(U=>U.gameId===l)),g!=="all"&&(C=C.filter(U=>U.rating===Number(g))),_!=="all"&&(_==="unknown"?C=C.filter(U=>!U.userType):C=C.filter(U=>U.userType===_)),T==="yes"?C=C.filter(U=>U.wantMore===!0):T==="no"&&(C=C.filter(U=>U.wantMore===!1)),A){const U=new Date(A);C=C.filter(ge=>{const lt=Ir(ge.createdAt);return lt&&lt>=U})}if(P){const U=new Date(P+"T23:59:59");C=C.filter(ge=>{const lt=Ir(ge.createdAt);return lt&&lt<=U})}return C},[n,l,g,_,T,A,P]);N.useEffect(()=>{$(1)},[l,g,_,T,A,P]);const m=Math.max(1,Math.ceil(p.length/B)),x=p.slice((M-1)*B,M*B),w=n.length,v=w>0?(n.reduce((C,U)=>C+U.rating,0)/w).toFixed(1):"-",f=n.filter(C=>C.wantMore).length,L=w>0?Math.round(f/w*100):0,j=n.filter(C=>C.userType).length,le=l!=="all"||g!=="all"||_!=="all"||T!=="all"||A||P;return t?c.jsx("div",{className:"min-h-screen bg-[#fafafa] flex items-center justify-center",children:c.jsx("div",{className:"text-gray-400 text-sm",children:"å è½½ä¸­..."})}):i?c.jsx("div",{className:"min-h-screen bg-[#fafafa] flex items-center justify-center",children:c.jsxs("div",{className:"text-center",children:[c.jsx("p",{className:"text-2xl mb-2",children:"â ï¸"}),c.jsx("p",{className:"text-red-500 text-sm font-medium mb-1",children:i}),c.jsx("p",{className:"text-gray-400 text-xs",children:"è¯·ç¡®è®¤è´¦å·å·ææé"})]})}):c.jsx("div",{className:"min-h-screen bg-[#fafafa] p-8",children:c.jsxs("div",{className:"max-w-6xl mx-auto",children:[c.jsxs("div",{className:"flex items-center justify-between mb-8",children:[c.jsxs("div",{children:[c.jsx("h1",{className:"text-2xl font-bold text-gray-900 mb-1",children:"æ¸¸æåé¦"}),c.jsx("p",{className:"text-sm text-gray-500",children:"ç©å®¶éå³åæäº¤çè¯åãèº«ä»½ä¸ä½éªæå"})]}),c.jsxs("div",{className:"flex items-center gap-2",children:[c.jsx("button",{onClick:()=>zp(p),disabled:p.length===0,className:"px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed",children:"å¯¼åº CSV"}),c.jsx("button",{onClick:z,className:"px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors",children:"å·æ°"})]})]}),c.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4 mb-6",children:[c.jsx(Kn,{label:"åé¦æ»æ°",value:w,sub:"ç´¯è®¡æäº¤çåé¦"}),c.jsx(Kn,{label:"å¹³åè¯å",value:v,sub:"æ»¡å 5 æ",color:"#FBBF24"}),c.jsx(Kn,{label:"æ³è¦æ´å¤",value:`${L}%`,sub:`${f} äººéæ©"æ¯"`,color:"#10B981"}),c.jsx(Kn,{label:"å¡«åèº«ä»½",value:j,sub:`å æ¯ ${w?Math.round(j/w*100):0}%`,color:"#0EA5E9"})]}),c.jsxs("div",{className:"bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6",children:[c.jsxs("div",{className:"flex flex-wrap items-center gap-x-6 gap-y-3",children:[c.jsxs("div",{className:"flex items-center gap-2",children:[c.jsx("span",{className:"text-xs text-gray-400 font-medium shrink-0",children:"æ¶é´"}),c.jsx("input",{type:"date",value:A,onChange:C=>D(C.target.value),className:"px-2.5 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300"}),c.jsx("span",{className:"text-xs text-gray-300",children:"~"}),c.jsx("input",{type:"date",value:P,onChange:C=>O(C.target.value),className:"px-2.5 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300"})]}),c.jsx("div",{className:"w-px h-5 bg-gray-200"}),c.jsxs("div",{className:"flex items-center gap-2",children:[c.jsx("span",{className:"text-xs text-gray-400 font-medium shrink-0",children:"æ¸¸æ"}),c.jsxs("select",{value:l,onChange:C=>d(C.target.value),className:"px-2.5 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg bg-white focus:outline-none",children:[c.jsx("option",{value:"all",children:"å¨é¨"}),b.map(C=>c.jsx("option",{value:C,children:Tr(C)},C))]})]}),c.jsx("div",{className:"w-px h-5 bg-gray-200"}),c.jsxs("div",{className:"flex items-center gap-1.5",children:[c.jsx("span",{className:"text-xs text-gray-400 font-medium shrink-0 mr-1",children:"è¯å"}),["all","5","4","3","2","1"].map(C=>c.jsx("button",{onClick:()=>y(C),className:`${sr} ${g===C?rr:ir}`,children:C==="all"?"å¨é¨":`${C}â`},C))]})]}),c.jsxs("div",{className:"flex flex-wrap items-center gap-x-6 gap-y-3 mt-3",children:[c.jsxs("div",{className:"flex items-center gap-1.5",children:[c.jsx("span",{className:"text-xs text-gray-400 font-medium shrink-0 mr-1",children:"èº«ä»½"}),[["all","å¨é¨"],["student","å­¦ç"],["teacher","èå¸"],["parent","å®¶é¿"],["other","å¶ä»"],["unknown","æªå¡«"]].map(([C,U])=>c.jsx("button",{onClick:()=>S(C),className:`${sr} ${_===C?rr:ir}`,children:U},C))]}),c.jsx("div",{className:"w-px h-5 bg-gray-200"}),c.jsxs("div",{className:"flex items-center gap-1.5",children:[c.jsx("span",{className:"text-xs text-gray-400 font-medium shrink-0 mr-1",children:"æ³è¦æ´å¤"}),[["all","å¨é¨"],["yes","æ¯"],["no","å¦"]].map(([C,U])=>c.jsx("button",{onClick:()=>k(C),className:`${sr} ${T===C?rr:ir}`,children:U},C))]}),le&&c.jsx("button",{onClick:()=>{d("all"),y("all"),S("all"),k("all"),D(""),O("")},className:"text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 ml-auto",children:"æ¸é¤ç­é"})]}),le&&c.jsxs("p",{className:"text-[11px] text-gray-400 mt-2",children:["ç­éç»æ: ",p.length," / ",w," æ¡"]})]}),p.length===0?c.jsx("div",{className:"bg-white rounded-2xl border border-gray-100 p-12 text-center",children:c.jsx("p",{className:"text-gray-400 text-sm",children:le?"æ å¹éçåé¦ï¼è¯è¯è°æ´ç­éæ¡ä»¶":"ææ æ¸¸æåé¦æ°æ®"})}):c.jsx("div",{className:"bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden",children:c.jsxs("table",{className:"w-full text-sm",children:[c.jsx("thead",{children:c.jsxs("tr",{className:"border-b border-gray-100 bg-gray-50",children:[c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[140px]",children:"æ¶é´"}),c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[180px]",children:"æ¸¸æ"}),c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[120px]",children:"è¯å"}),c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[80px]",children:"èº«ä»½"}),c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[100px]",children:"æ³è¦æ´å¤"}),c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[80px]",children:"éå³"}),c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide",children:"ä¸å¥è¯æå"}),c.jsx("th",{className:"text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[140px]",children:"ç¨æ·"})]})}),c.jsx("tbody",{className:"divide-y divide-gray-50",children:x.map(C=>{const U=C.userInfo;return c.jsxs("tr",{className:"hover:bg-gray-50/50 transition-colors",children:[c.jsx("td",{className:"px-5 py-4 text-gray-400 text-xs whitespace-nowrap align-top",children:Oc(C.createdAt)}),c.jsx("td",{className:"px-5 py-4 align-top text-xs text-gray-700",children:Tr(C.gameId)}),c.jsx("td",{className:"px-5 py-4 align-top",children:c.jsx(Gp,{rating:C.rating})}),c.jsx("td",{className:"px-5 py-4 align-top text-xs text-gray-600",children:C.userType?Lc(C.userType):c.jsx("span",{className:"text-gray-300",children:"æªå¡«"})}),c.jsx("td",{className:"px-5 py-4 align-top",children:c.jsx("span",{className:"inline-block px-2 py-0.5 rounded-full text-[11px] font-medium",style:{background:C.wantMore?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.08)",color:C.wantMore?"#059669":"#DC2626"},children:C.wantMore?"â æ¯":"â å¦"})}),c.jsx("td",{className:"px-5 py-4 align-top text-xs text-gray-500",children:C.level!=null?`ç¬¬ ${C.level} å³`:"-"}),c.jsx("td",{className:"px-5 py-4 align-top text-gray-700 text-xs",children:C.comment?c.jsx("span",{className:"whitespace-pre-wrap",children:C.comment}):c.jsx("span",{className:"text-gray-300",children:"-"})}),c.jsx("td",{className:"px-5 py-4 align-top",children:U?c.jsxs("div",{className:"flex items-start gap-2",children:[U.avatar&&c.jsx("img",{src:U.avatar,alt:"",className:"w-6 h-6 rounded-full shrink-0 mt-0.5",referrerPolicy:"no-referrer"}),c.jsxs("div",{className:"min-w-0 text-xs",children:[c.jsx("div",{className:"font-medium text-gray-700 truncate",title:U.nickname,children:U.nickname||"ç¨æ·"}),U.authProvider&&c.jsx("div",{className:"text-[10px] text-gray-400",children:U.authProvider==="wechat"?"å¾®ä¿¡":U.authProvider==="wechat_mp"?"æå¡å·":U.authProvider==="wechat_miniprogram"?"å°ç¨åº":U.authProvider==="google"?"Google":U.authProvider==="email"?"é®ç®±":U.authProvider})]})]}):c.jsx("div",{className:"text-xs text-gray-300",children:C.userId==="anonymous"?"å¿å":c.jsxs("span",{className:"text-gray-400",title:C.userId,children:[C.userId.slice(0,8),"..."]})})})]},C.id)})})]})}),p.length>0&&c.jsxs("div",{className:"flex items-center justify-between mt-4 px-1",children:[c.jsxs("div",{className:"flex items-center gap-2 text-xs text-gray-400",children:[c.jsx("span",{children:"æ¯é¡µ"}),c.jsx("select",{value:B,onChange:C=>{H(Number(C.target.value)),$(1)},className:"px-2 py-1 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white focus:outline-none",children:[10,20,50,100].map(C=>c.jsxs("option",{value:C,children:[C," æ¡"]},C))}),c.jsxs("span",{className:"ml-2",children:["å± ",p.length," æ¡ï¼ç¬¬ ",(M-1)*B+1,"-",Math.min(M*B,p.length)," æ¡"]})]}),c.jsxs("div",{className:"flex items-center gap-1",children:[c.jsx("button",{onClick:()=>$(1),disabled:M<=1,className:"px-2.5 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",children:"é¦é¡µ"}),c.jsx("button",{onClick:()=>$(C=>Math.max(1,C-1)),disabled:M<=1,className:"px-2.5 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",children:"ä¸ä¸é¡µ"}),c.jsxs("span",{className:"px-3 py-1.5 text-xs font-medium text-gray-700",children:[M," / ",m]}),c.jsx("button",{onClick:()=>$(C=>Math.min(m,C+1)),disabled:M>=m,className:"px-2.5 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",children:"ä¸ä¸é¡µ"}),c.jsx("button",{onClick:()=>$(m),disabled:M>=m,className:"px-2.5 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",children:"æ«é¡µ"})]})]}),c.jsx("p",{className:"mt-3 text-xs text-gray-400 text-center",children:"æ°æ®å®æ¶ä»åç«¯è¯»å Â· ä»æ¸¸æåæäº¤çåé¦"})]})})}const Wp=()=>`${kt()}/api/admin/analytics`;async function Kp(n){try{const e=await kn(`${Wp()}${n}`);if(!e.ok)return{data:null,error:`è¯·æ±å¤±è´¥ (${e.status})`};const t=await e.json();return t.success?{data:t.data}:{data:null,error:t.error||"Unknown error"}}catch(e){const t=e.message||"";return t.includes("Failed to fetch")||t.includes("NetworkError")?{data:null,error:"æ æ³è¿æ¥åç«¯æå¡ï¼è¯·ç¡®è®¤åç«¯å·²å¯å¨ï¼npm run devï¼"}:{data:null,error:t}}}function Dt({title:n,value:e,subValue:t,icon:r,color:i}){return c.jsxs("div",{className:"bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow",children:[c.jsxs("div",{className:"flex items-center gap-3 mb-2",children:[c.jsx("span",{className:"text-2xl",children:r}),c.jsx("span",{className:"text-sm text-gray-500 font-medium",children:n})]}),c.jsx("div",{className:`text-3xl font-bold ${i} tracking-tight`,children:typeof e=="number"?e.toLocaleString():e}),t&&c.jsx("div",{className:"text-xs text-gray-400 mt-1 space-y-0.5",children:t.split(`
`).map((a,l)=>c.jsx("div",{children:a},l))})]})}function Jn({label:n,value:e,color:t,formula:r,avgBase:i,avgReturn:a,samples:l,periodLabel:d}){return c.jsxs("div",{className:"bg-white rounded-xl p-5 shadow-sm border border-gray-100",children:[c.jsxs("div",{className:"text-center mb-3",children:[c.jsx("div",{className:"text-sm text-gray-500 mb-1",children:n}),c.jsx("div",{className:`text-3xl font-bold ${t}`,children:e!==null?`${e}%`:"-"})]}),c.jsxs("div",{className:"border-t border-gray-100 pt-3 space-y-1.5",children:[c.jsxs("div",{className:"text-[11px] text-gray-400",children:[c.jsx("span",{className:"font-medium text-gray-500",children:"è®¡ç®æ¹å¼ï¼"}),r]}),c.jsxs("div",{className:"text-[11px] text-gray-400 flex items-center gap-3 flex-wrap",children:[c.jsxs("span",{children:["å¹³åæ¯æ¥ç»å½ç¨æ· ",c.jsx("span",{className:"font-semibold text-gray-600",children:i??"-"})," äºº"]}),c.jsxs("span",{children:["å¹³å",d,"åè®¿ ",c.jsx("span",{className:"font-semibold text-gray-600",children:a??"-"})," äºº"]})]}),c.jsxs("div",{className:"text-[11px] text-gray-400",children:["æ ·æ¬å¤©æ° ",c.jsx("span",{className:"font-semibold text-gray-600",children:l??"-"})," å¤©"]})]})]})}function Jp(){const[n,e]=N.useState(!0),[t,r]=N.useState(null),[i,a]=N.useState(null),[l,d]=N.useState(null),[g,y]=N.useState([]),[_,S]=N.useState(0);N.useEffect(()=>{if(!n){S(0);return}const k=setInterval(()=>{S(A=>A+1)},1e3);return()=>clearInterval(k)},[n]);const T=N.useCallback(async()=>{var D,P,O;e(!0),d(null);const k=await Kp("/dashboard");k.error&&!k.data&&d(k.error);const A=[];k.error&&A.push(k.error),(D=k.data)!=null&&D.warnings&&A.push(...k.data.warnings),y(A),r(((P=k.data)==null?void 0:P.overview)||null),a(((O=k.data)==null?void 0:O.retention)||null),e(!1)},[]);return N.useEffect(()=>{T()},[T]),l&&!t?c.jsx("div",{className:"h-full flex items-center justify-center",children:c.jsxs("div",{className:"bg-white rounded-2xl p-8 shadow-lg max-w-md text-center",children:[c.jsx("div",{className:"text-4xl mb-4",children:"ð"}),c.jsx("h2",{className:"text-xl font-bold text-gray-800 mb-2",children:"è®¿é®åé"}),c.jsx("p",{className:"text-gray-500 mb-4",children:l})]})}):c.jsxs("div",{className:"h-full overflow-y-auto bg-[#FAF7F2]",children:[c.jsx("header",{className:"bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40",children:c.jsxs("div",{className:"max-w-7xl mx-auto px-6 py-4 flex items-center justify-between",children:[c.jsx("h1",{className:"text-xl font-bold text-gray-800",children:"æ°æ®çæ¿"}),c.jsx("button",{onClick:T,disabled:n,className:"px-3 py-1.5 text-sm bg-[rgba(248,134,34,0.12)] text-[#E26A00] border border-[rgba(248,134,34,0.20)] hover:bg-[rgba(248,134,34,0.24)] transition disabled:opacity-50",style:{borderRadius:"12px"},children:n?"å è½½ä¸­...":"å·æ°"})]})}),c.jsxs("div",{className:"max-w-7xl mx-auto px-6 py-6 space-y-6",children:[g.length>0&&c.jsxs("div",{className:"bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2",children:[c.jsx("span",{className:"text-amber-500 mt-0.5",children:"â ï¸"}),c.jsxs("div",{className:"text-sm text-amber-700",children:[c.jsx("span",{className:"font-medium",children:"é¨åæ°æ®å è½½å¤±è´¥ï¼"}),g.map((k,A)=>c.jsx("span",{className:"block text-xs mt-0.5 text-amber-600",children:k},A))]})]}),n&&!t?c.jsxs("div",{className:"flex flex-col items-center justify-center",style:{minHeight:"calc(100vh - 200px)"},children:[c.jsxs("div",{className:"relative flex items-center justify-center mb-6",children:[c.jsx("div",{className:"absolute w-16 h-16 rounded-full border-2 border-[rgba(248,134,34,0.15)] animate-ping"}),c.jsx("div",{className:"absolute w-12 h-12 rounded-full border-2 border-[rgba(248,134,34,0.25)] animate-pulse"}),c.jsx("div",{className:"w-10 h-10 rounded-full bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center shadow-lg shadow-orange-200/50",children:c.jsx("svg",{className:"w-5 h-5 text-white animate-spin",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",children:c.jsx("path",{d:"M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"})})})]}),c.jsx("p",{className:"text-sm font-medium text-gray-500 tracking-wide",children:"æ°æ®å è½½ä¸­"}),c.jsx("p",{className:"text-xs text-gray-400 mt-1",children:_<3?"æ­£å¨è·åææ°ç»è®¡æ°æ®...":_<8?`å·²ç­å¾ ${_} ç§ï¼é¢è®¡éè¦ 60 ç§ï¼è¯·èå¿ç­å¾...`:`å·²ç­å¾ ${_} ç§ï¼æ°æ®éè¾å¤§å è½½ç¨æ¢ï¼è¯·ç¨å...`})]}):c.jsxs(c.Fragment,{children:[c.jsxs("section",{children:[c.jsx("h2",{className:"text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3",children:"æ ¸å¿ææ "}),c.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3",children:[c.jsx(Dt,{icon:"ð",title:"ä»æ¥ DAU",value:(t==null?void 0:t.today.uv)??0,color:"text-indigo-600",subValue:[t==null?void 0:t.today.label,(t==null?void 0:t.today.loggedIn)!=null?`ð ç»å½ ${t.today.loggedIn}  ð¤ æ¸¸å®¢ ${t.today.guest??0}`:void 0].filter(Boolean).join(`
`)}),c.jsx(Dt,{icon:"ð",title:"ä»æ¥ PV",value:(t==null?void 0:t.today.pv)??0,color:"text-blue-600",subValue:"é¡µé¢æµè§é"}),c.jsx(Dt,{icon:"ð",title:"WAU",value:(t==null?void 0:t.week.uv)??0,color:"text-teal-600",subValue:[t==null?void 0:t.week.range,(t==null?void 0:t.week.loggedIn)!=null?`ð ç»å½ ${t.week.loggedIn}  ð¤ æ¸¸å®¢ ${t.week.guest??0}`:void 0].filter(Boolean).join(`
`)}),c.jsx(Dt,{icon:"ð",title:"æ¬å¨ PV",value:(t==null?void 0:t.week.pv)??0,color:"text-cyan-600",subValue:t==null?void 0:t.week.range}),c.jsx(Dt,{icon:"ð",title:"MAU",value:(t==null?void 0:t.month.uv)??0,color:"text-purple-600",subValue:[t==null?void 0:t.month.range,(t==null?void 0:t.month.loggedIn)!=null?`ð ç»å½ ${t.month.loggedIn}  ð¤ æ¸¸å®¢ ${t.month.guest??0}`:void 0].filter(Boolean).join(`
`)}),c.jsx(Dt,{icon:"ð",title:"æ¬æ PV",value:(t==null?void 0:t.month.pv)??0,color:"text-pink-600",subValue:t==null?void 0:t.month.range})]})]}),i&&c.jsxs("section",{children:[c.jsx("h2",{className:"text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3",children:"å¹³åçå­ç"}),c.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3",children:[c.jsx(Jn,{label:"æ¬¡æ¥çå­",value:i.avgRetention.day1,color:"text-green-600",formula:"Day(i) ä¸ Day(i+1) ç»å½ç¨æ·äº¤é / Day(i) ç»å½ç¨æ·æ°",avgBase:i.avgRetention.day1AvgBase,avgReturn:i.avgRetention.day1AvgReturn,samples:i.avgRetention.day1Samples,periodLabel:"æ¬¡æ¥"}),c.jsx(Jn,{label:"7æ¥çå­",value:i.avgRetention.day7,color:"text-blue-600",formula:"Day(i) ä¸ Day(i+7) ç»å½ç¨æ·äº¤é / Day(i) ç»å½ç¨æ·æ°",avgBase:i.avgRetention.day7AvgBase,avgReturn:i.avgRetention.day7AvgReturn,samples:i.avgRetention.day7Samples,periodLabel:"7æ¥å"}),c.jsx(Jn,{label:"14æ¥çå­",value:i.avgRetention.day14,color:"text-orange-600",formula:"Day(i) ä¸ Day(i+14) ç»å½ç¨æ·äº¤é / Day(i) ç»å½ç¨æ·æ°",avgBase:i.avgRetention.day14AvgBase,avgReturn:i.avgRetention.day14AvgReturn,samples:i.avgRetention.day14Samples,periodLabel:"14æ¥å"}),c.jsx(Jn,{label:"30æ¥çå­",value:i.avgRetention.day30,color:"text-purple-600",formula:"Day(i) ä¸ Day(i+30) ç»å½ç¨æ·äº¤é / Day(i) ç»å½ç¨æ·æ°",avgBase:i.avgRetention.day30AvgBase,avgReturn:i.avgRetention.day30AvgReturn,samples:i.avgRetention.day30Samples,periodLabel:"30æ¥å"})]}),c.jsx("p",{className:"text-[10px] text-gray-400 mt-2",children:"åºäºç»å½ç¨æ· uin éåäº¤éè®¡ç®ï¼æ¸¸å®¢ä¸åä¸çå­ç»è®¡"})]})]})]})]})}function Xp(n){const[e,t]=N.useState(!0),[r,i]=N.useState(null),[a,l]=N.useState(null),d=N.useCallback(async()=>{t(!0),i(null);try{const y=await(await kn(`${kt()}/api/admin/token-usage/users?days=${n}`)).json();if(!y.success){i(y.message||"è¯·æ±å¤±è´¥");return}l({users:y.users,totalTokens:y.totalTokens})}catch(g){i((g==null?void 0:g.message)||"æªç¥éè¯¯")}finally{t(!1)}},[n]);return N.useEffect(()=>{d()},[d]),{loading:e,error:r,data:a,refresh:d}}function dn(n){return n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${(n/1e3).toFixed(1)}K`:n.toLocaleString()}function Yp(n){return n.length<=16?n:n.slice(0,8)+"â¦"+n.slice(-6)}function Qp({row:n,index:e}){return c.jsxs("tr",{className:"border-b border-gray-50 transition-colors hover:bg-gray-50/50",children:[c.jsx("td",{className:"py-2.5 px-4 text-gray-400 tabular-nums",children:e+1}),c.jsx("td",{className:"py-2.5 px-4",children:c.jsxs("div",{className:"flex flex-col",children:[n.userName?c.jsx("span",{className:"text-xs font-medium text-gray-800",children:n.userName}):null,c.jsx("span",{className:"font-mono text-[11px] text-gray-500",title:n.userId,children:Yp(n.userId)})]})}),c.jsx("td",{className:"py-2.5 px-4 text-right tabular-nums font-medium text-gray-800",children:dn(n.periodTokens)}),c.jsx("td",{className:"py-2.5 px-4 text-right tabular-nums text-gray-500",children:dn(n.periodPromptTokens)}),c.jsx("td",{className:"py-2.5 px-4 text-right tabular-nums text-gray-500",children:dn(n.periodCompletionTokens)}),c.jsx("td",{className:"py-2.5 px-4 text-right tabular-nums text-gray-400 text-xs",children:dn(n.totalTokens)})]})}const Zp=[7,14,30,90];function em(){const[n,e]=N.useState(30),{loading:t,error:r,data:i,refresh:a}=Xp(n);return c.jsxs("div",{className:"h-full overflow-y-auto bg-[#FAF7F2]",children:[c.jsx("header",{className:"bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40",children:c.jsxs("div",{className:"max-w-7xl mx-auto px-6 py-4 flex items-center justify-between",children:[c.jsx("h1",{className:"text-xl font-bold text-gray-800",children:"Token ç¨é"}),c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("div",{className:"flex gap-1.5",children:Zp.map(l=>c.jsxs("button",{onClick:()=>e(l),className:`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${n===l?"bg-gray-800 text-white":"bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`,children:[l," å¤©"]},l))}),c.jsx("button",{onClick:a,disabled:t,className:"px-3 py-1.5 text-sm rounded-xl bg-[rgba(248,134,34,0.12)] text-[#E26A00] border border-[rgba(248,134,34,0.20)] hover:bg-[rgba(248,134,34,0.24)] transition disabled:opacity-50",children:t?"â¦":"å·æ°"})]})]})}),c.jsxs("div",{className:"max-w-7xl mx-auto px-6 py-6",children:[i&&c.jsxs("div",{className:"flex items-center gap-6 mb-4 text-sm text-gray-500",children:[c.jsxs("span",{children:["å± ",c.jsx("b",{className:"text-gray-800",children:i.users.length})," ä¸ªç¨æ·"]}),c.jsxs("span",{children:["è¿ ",n," å¤© Token ",c.jsx("b",{className:"text-gray-800",children:dn(i.totalTokens)})]})]}),r&&c.jsx("div",{className:"bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4",children:r}),c.jsx("div",{className:"bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden",children:c.jsxs("table",{className:"w-full text-sm",children:[c.jsx("thead",{children:c.jsxs("tr",{className:"border-b border-gray-100 bg-gray-50/50",children:[c.jsx("th",{className:"text-left py-3 px-4 text-xs font-semibold text-gray-500",children:"#"}),c.jsx("th",{className:"text-left py-3 px-4 text-xs font-semibold text-gray-500",children:"ç¨æ·"}),c.jsxs("th",{className:"text-right py-3 px-4 text-xs font-semibold text-gray-500",children:["è¿ ",n," å¤© Tokens"]}),c.jsx("th",{className:"text-right py-3 px-4 text-xs font-semibold text-gray-500",children:"Prompt"}),c.jsx("th",{className:"text-right py-3 px-4 text-xs font-semibold text-gray-500",children:"Completion"}),c.jsx("th",{className:"text-right py-3 px-4 text-xs font-semibold text-gray-400",children:"ç´¯è®¡æ»é"})]})}),c.jsx("tbody",{children:t&&!i?c.jsx("tr",{children:c.jsx("td",{colSpan:6,className:"text-center py-16 text-gray-400",children:"å è½½ä¸­..."})}):!i||i.users.length===0?c.jsx("tr",{children:c.jsx("td",{colSpan:6,className:"text-center py-16 text-gray-400",children:"ææ æ°æ®"})}):i.users.map((l,d)=>c.jsx(Qp,{row:l,index:d},l.userId))})]})})]})]})}const tm=Vt.lazy(()=>ye(()=>import("./CallbackPage-wMnBzyQR.js"),__vite__mapDeps([5,0,1,2,6])).then(n=>({default:n.AuthCallbackPage}))),nm=Vt.lazy(()=>ye(()=>import("./Eureka2Page-BEbVWsnx.js").then(n=>n.E),__vite__mapDeps([7,0,1,8])));typeof window<"u"&&(kp(),un.loadFromLocalStorage(),ye(async()=>{const{clearOldVersionCache:n}=await import("./dataObjectImageGenerator-DjBJE7XZ.js");return{clearOldVersionCache:n}},[]).then(({clearOldVersionCache:n})=>{n()}),_r.requestPersistentStorage().then(n=>{}),window.addEventListener("eureka:user-login",()=>{Ap().catch(n=>{console.error("[App] Migration failed:",n)})}));const Mc=({className:n="",style:e})=>c.jsx("div",{className:`flex items-center justify-center ${n}`,style:e,children:c.jsxs("span",{className:"font-serif font-bold text-5xl md:text-7xl tracking-tight font-playfair select-none",children:["Eureka",c.jsx("span",{className:"text-indigo-600",children:"."})]})}),sm=({isExiting:n})=>c.jsx("div",{className:"fixed inset-0 bg-[#FAF7F2] flex items-center justify-center z-[9999]",children:c.jsx("div",{style:{transform:n?"translateY(-80px)":"translateY(0)",opacity:n?0:1,transition:"transform 500ms ease-out, opacity 500ms ease-out"},children:c.jsx(Mc,{})})}),rm=()=>{const n=Wl(),[e,t]=N.useState(!1),[r,i]=N.useState(!1);return N.useEffect(()=>{},[]),N.useEffect(()=>{},[]),N.useEffect(()=>{const a=n.pathname;if(["/auth/callback","/admin"].some(y=>a.startsWith(y))){t(!1);return}t(!0),i(!1);const g=requestAnimationFrame(()=>{i(!0),setTimeout(()=>{t(!1)},500)});return()=>{cancelAnimationFrame(g)}},[n.pathname]),c.jsxs(c.Fragment,{children:[e&&c.jsx(sm,{isExiting:r}),c.jsx(Vt.Suspense,{fallback:c.jsx("div",{className:"fixed inset-0 bg-[#FAF7F2] flex items-center justify-center z-50",children:c.jsx(Mc,{className:"animate-pulse"})}),children:c.jsxs(Kl,{children:[c.jsx(ke,{path:"/auth/callback",element:c.jsx(tm,{})}),c.jsxs(ke,{path:"/admin",element:c.jsx(na,{children:c.jsx(Lp,{})}),children:[c.jsx(ke,{index:!0,element:c.jsx(Zi,{to:"/admin/analytics",replace:!0})}),c.jsx(ke,{path:"analytics",element:c.jsx(Jp,{})}),c.jsx(ke,{path:"token-usage",element:c.jsx(em,{})}),c.jsx(ke,{path:"feedback",element:c.jsx(Vp,{})}),c.jsx(ke,{path:"game-feedback",element:c.jsx(qp,{})}),c.jsx(ke,{path:"onboarding",element:c.jsx(Up,{})})]}),c.jsx(ke,{path:"/",element:c.jsx(na,{children:c.jsx(nm,{})})}),c.jsx(ke,{path:"*",element:c.jsx(Zi,{to:"/",replace:!0})})]})})]})},im=({children:n})=>c.jsx(Jl,{children:c.jsx(Ql,{children:n})}),Fc="@firebase/installations",qr="0.6.19";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uc=1e4,Bc=`w:${qr}`,Vc="FIS_v2",om="https://firebaseinstallations.googleapis.com/v1",am=3600*1e3,cm="installations",lm="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const um={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},Tt=new St(cm,lm,um);function $c(n){return n instanceof xe&&n.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hc({projectId:n}){return`${om}/projects/${n}/installations`}function zc(n){return{token:n.token,requestStatus:2,expiresIn:hm(n.expiresIn),creationTime:Date.now()}}async function Gc(n,e){const r=(await e.json()).error;return Tt.create("request-failed",{requestName:n,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})}function qc({apiKey:n}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":n})}function dm(n,{refreshToken:e}){const t=qc(n);return t.append("Authorization",fm(e)),t}async function Wc(n){const e=await n();return e.status>=500&&e.status<600?n():e}function hm(n){return Number(n.replace("s","000"))}function fm(n){return`${Vc} ${n}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function gm({appConfig:n,heartbeatServiceProvider:e},{fid:t}){const r=Hc(n),i=qc(n),a=e.getImmediate({optional:!0});if(a){const y=await a.getHeartbeatsHeader();y&&i.append("x-firebase-client",y)}const l={fid:t,authVersion:Vc,appId:n.appId,sdkVersion:Bc},d={method:"POST",headers:i,body:JSON.stringify(l)},g=await Wc(()=>fetch(r,d));if(g.ok){const y=await g.json();return{fid:y.fid||t,registrationStatus:2,refreshToken:y.refreshToken,authToken:zc(y.authToken)}}else throw await Gc("Create Installation",g)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kc(n){return new Promise(e=>{setTimeout(e,n)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pm(n){return btoa(String.fromCharCode(...n)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mm=/^[cdef][\w-]{21}$/,Er="";function ym(){try{const n=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(n),n[0]=112+n[0]%16;const t=wm(n);return mm.test(t)?t:Er}catch{return Er}}function wm(n){return pm(n).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ws(n){return`${n.appName}!${n.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jc=new Map;function Xc(n,e){const t=ws(n);Yc(t,e),xm(t,e)}function Yc(n,e){const t=Jc.get(n);if(t)for(const r of t)r(e)}function xm(n,e){const t=bm();t&&t.postMessage({key:n,fid:e}),_m()}let yt=null;function bm(){return!yt&&"BroadcastChannel"in self&&(yt=new BroadcastChannel("[Firebase] FID Change"),yt.onmessage=n=>{Yc(n.data.key,n.data.fid)}),yt}function _m(){Jc.size===0&&yt&&(yt.close(),yt=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vm="firebase-installations-database",Im=1,Et="firebase-installations-store";let or=null;function Wr(){return or||(or=wa(vm,Im,{upgrade:(n,e)=>{switch(e){case 0:n.createObjectStore(Et)}}})),or}async function ds(n,e){const t=ws(n),i=(await Wr()).transaction(Et,"readwrite"),a=i.objectStore(Et),l=await a.get(t);return await a.put(e,t),await i.done,(!l||l.fid!==e.fid)&&Xc(n,e.fid),e}async function Qc(n){const e=ws(n),r=(await Wr()).transaction(Et,"readwrite");await r.objectStore(Et).delete(e),await r.done}async function xs(n,e){const t=ws(n),i=(await Wr()).transaction(Et,"readwrite"),a=i.objectStore(Et),l=await a.get(t),d=e(l);return d===void 0?await a.delete(t):await a.put(d,t),await i.done,d&&(!l||l.fid!==d.fid)&&Xc(n,d.fid),d}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Kr(n){let e;const t=await xs(n.appConfig,r=>{const i=Tm(r),a=Em(n,i);return e=a.registrationPromise,a.installationEntry});return t.fid===Er?{installationEntry:await e}:{installationEntry:t,registrationPromise:e}}function Tm(n){const e=n||{fid:ym(),registrationStatus:0};return Zc(e)}function Em(n,e){if(e.registrationStatus===0){if(!navigator.onLine){const i=Promise.reject(Tt.create("app-offline"));return{installationEntry:e,registrationPromise:i}}const t={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},r=Sm(n,t);return{installationEntry:t,registrationPromise:r}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:Am(n)}:{installationEntry:e}}async function Sm(n,e){try{const t=await gm(n,e);return ds(n.appConfig,t)}catch(t){throw $c(t)&&t.customData.serverCode===409?await Qc(n.appConfig):await ds(n.appConfig,{fid:e.fid,registrationStatus:0}),t}}async function Am(n){let e=await ua(n.appConfig);for(;e.registrationStatus===1;)await Kc(100),e=await ua(n.appConfig);if(e.registrationStatus===0){const{installationEntry:t,registrationPromise:r}=await Kr(n);return r||t}return e}function ua(n){return xs(n,e=>{if(!e)throw Tt.create("installation-not-found");return Zc(e)})}function Zc(n){return km(n)?{fid:n.fid,registrationStatus:0}:n}function km(n){return n.registrationStatus===1&&n.registrationTime+Uc<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Nm({appConfig:n,heartbeatServiceProvider:e},t){const r=Pm(n,t),i=dm(n,t),a=e.getImmediate({optional:!0});if(a){const y=await a.getHeartbeatsHeader();y&&i.append("x-firebase-client",y)}const l={installation:{sdkVersion:Bc,appId:n.appId}},d={method:"POST",headers:i,body:JSON.stringify(l)},g=await Wc(()=>fetch(r,d));if(g.ok){const y=await g.json();return zc(y)}else throw await Gc("Generate Auth Token",g)}function Pm(n,{fid:e}){return`${Hc(n)}/${e}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Jr(n,e=!1){let t;const r=await xs(n.appConfig,a=>{if(!el(a))throw Tt.create("not-registered");const l=a.authToken;if(!e&&Dm(l))return a;if(l.requestStatus===1)return t=Cm(n,e),a;{if(!navigator.onLine)throw Tt.create("app-offline");const d=Om(a);return t=Rm(n,d),d}});return t?await t:r.authToken}async function Cm(n,e){let t=await da(n.appConfig);for(;t.authToken.requestStatus===1;)await Kc(100),t=await da(n.appConfig);const r=t.authToken;return r.requestStatus===0?Jr(n,e):r}function da(n){return xs(n,e=>{if(!el(e))throw Tt.create("not-registered");const t=e.authToken;return Lm(t)?{...e,authToken:{requestStatus:0}}:e})}async function Rm(n,e){try{const t=await Nm(n,e),r={...e,authToken:t};return await ds(n.appConfig,r),t}catch(t){if($c(t)&&(t.customData.serverCode===401||t.customData.serverCode===404))await Qc(n.appConfig);else{const r={...e,authToken:{requestStatus:0}};await ds(n.appConfig,r)}throw t}}function el(n){return n!==void 0&&n.registrationStatus===2}function Dm(n){return n.requestStatus===2&&!jm(n)}function jm(n){const e=Date.now();return e<n.creationTime||n.creationTime+n.expiresIn<e+am}function Om(n){const e={requestStatus:1,requestTime:Date.now()};return{...n,authToken:e}}function Lm(n){return n.requestStatus===1&&n.requestTime+Uc<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Mm(n){const e=n,{installationEntry:t,registrationPromise:r}=await Kr(e);return r?r.catch(console.error):Jr(e).catch(console.error),t.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Fm(n,e=!1){const t=n;return await Um(t),(await Jr(t,e)).token}async function Um(n){const{registrationPromise:e}=await Kr(n);e&&await e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bm(n){if(!n||!n.options)throw ar("App Configuration");if(!n.name)throw ar("App Name");const e=["projectId","apiKey","appId"];for(const t of e)if(!n.options[t])throw ar(t);return{appName:n.name,projectId:n.options.projectId,apiKey:n.options.apiKey,appId:n.options.appId}}function ar(n){return Tt.create("missing-app-config-values",{valueName:n})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tl="installations",Vm="installations-internal",$m=n=>{const e=n.getProvider("app").getImmediate(),t=Bm(e),r=ct(e,"heartbeat");return{app:e,appConfig:t,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},Hm=n=>{const e=n.getProvider("app").getImmediate(),t=ct(e,tl).getImmediate();return{getId:()=>Mm(t),getToken:i=>Fm(t,i)}};function zm(){Ee(new we(tl,$m,"PUBLIC")),Ee(new we(Vm,Hm,"PRIVATE"))}zm();de(Fc,qr);de(Fc,qr,"esm2020");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hs="analytics",Gm="firebase_id",qm="origin",Wm=60*1e3,Km="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig",Xr="https://www.googletagmanager.com/gtag/js";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const re=new fs("@firebase/analytics");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jm={"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."},he=new St("analytics","Analytics",Jm);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xm(n){if(!n.startsWith(Xr)){const e=he.create("invalid-gtag-resource",{gtagURL:n});return re.warn(e.message),""}return n}function nl(n){return Promise.all(n.map(e=>e.catch(t=>t)))}function Ym(n,e){let t;return window.trustedTypes&&(t=window.trustedTypes.createPolicy(n,e)),t}function Qm(n,e){const t=Ym("firebase-js-sdk-policy",{createScriptURL:Xm}),r=document.createElement("script"),i=`${Xr}?l=${n}&id=${e}`;r.src=t?t==null?void 0:t.createScriptURL(i):i,r.async=!0,document.head.appendChild(r)}function Zm(n){let e=[];return Array.isArray(window[n])?e=window[n]:window[n]=e,e}async function ey(n,e,t,r,i,a){const l=r[i];try{if(l)await e[l];else{const g=(await nl(t)).find(y=>y.measurementId===i);g&&await e[g.appId]}}catch(d){re.error(d)}n("config",i,a)}async function ty(n,e,t,r,i){try{let a=[];if(i&&i.send_to){let l=i.send_to;Array.isArray(l)||(l=[l]);const d=await nl(t);for(const g of l){const y=d.find(S=>S.measurementId===g),_=y&&e[y.appId];if(_)a.push(_);else{a=[];break}}}a.length===0&&(a=Object.values(e)),await Promise.all(a),n("event",r,i||{})}catch(a){re.error(a)}}function ny(n,e,t,r){async function i(a,...l){try{if(a==="event"){const[d,g]=l;await ty(n,e,t,d,g)}else if(a==="config"){const[d,g]=l;await ey(n,e,t,r,d,g)}else if(a==="consent"){const[d,g]=l;n("consent",d,g)}else if(a==="get"){const[d,g,y]=l;n("get",d,g,y)}else if(a==="set"){const[d]=l;n("set",d)}else n(a,...l)}catch(d){re.error(d)}}return i}function sy(n,e,t,r,i){let a=function(...l){window[r].push(arguments)};return window[i]&&typeof window[i]=="function"&&(a=window[i]),window[i]=ny(a,n,e,t),{gtagCore:a,wrappedGtag:window[i]}}function ry(n){const e=window.document.getElementsByTagName("script");for(const t of Object.values(e))if(t.src&&t.src.includes(Xr)&&t.src.includes(n))return t;return null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iy=30,oy=1e3;class ay{constructor(e={},t=oy){this.throttleMetadata=e,this.intervalMillis=t}getThrottleMetadata(e){return this.throttleMetadata[e]}setThrottleMetadata(e,t){this.throttleMetadata[e]=t}deleteThrottleMetadata(e){delete this.throttleMetadata[e]}}const sl=new ay;function cy(n){return new Headers({Accept:"application/json","x-goog-api-key":n})}async function ly(n){var l;const{appId:e,apiKey:t}=n,r={method:"GET",headers:cy(t)},i=Km.replace("{app-id}",e),a=await fetch(i,r);if(a.status!==200&&a.status!==304){let d="";try{const g=await a.json();(l=g.error)!=null&&l.message&&(d=g.error.message)}catch{}throw he.create("config-fetch-failed",{httpStatus:a.status,responseMessage:d})}return a.json()}async function uy(n,e=sl,t){const{appId:r,apiKey:i,measurementId:a}=n.options;if(!r)throw he.create("no-app-id");if(!i){if(a)return{measurementId:a,appId:r};throw he.create("no-api-key")}const l=e.getThrottleMetadata(r)||{backoffCount:0,throttleEndTimeMillis:Date.now()},d=new fy;return setTimeout(async()=>{d.abort()},Wm),rl({appId:r,apiKey:i,measurementId:a},l,d,e)}async function rl(n,{throttleEndTimeMillis:e,backoffCount:t},r,i=sl){var d;const{appId:a,measurementId:l}=n;try{await dy(r,e)}catch(g){if(l)return re.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${l} provided in the "measurementId" field in the local Firebase config. [${g==null?void 0:g.message}]`),{appId:a,measurementId:l};throw g}try{const g=await ly(n);return i.deleteThrottleMetadata(a),g}catch(g){const y=g;if(!hy(y)){if(i.deleteThrottleMetadata(a),l)return re.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${l} provided in the "measurementId" field in the local Firebase config. [${y==null?void 0:y.message}]`),{appId:a,measurementId:l};throw g}const _=Number((d=y==null?void 0:y.customData)==null?void 0:d.httpStatus)===503?ro(t,i.intervalMillis,iy):ro(t,i.intervalMillis),S={throttleEndTimeMillis:Date.now()+_,backoffCount:t+1};return i.setThrottleMetadata(a,S),re.debug(`Calling attemptFetch again in ${_} millis`),rl(n,S,r,i)}}function dy(n,e){return new Promise((t,r)=>{const i=Math.max(e-Date.now(),0),a=setTimeout(t,i);n.addEventListener(()=>{clearTimeout(a),r(he.create("fetch-throttle",{throttleEndTimeMillis:e}))})})}function hy(n){if(!(n instanceof xe)||!n.customData)return!1;const e=Number(n.customData.httpStatus);return e===429||e===500||e===503||e===504}class fy{constructor(){this.listeners=[]}addEventListener(e){this.listeners.push(e)}abort(){this.listeners.forEach(e=>e())}}async function gy(n,e,t,r,i){if(i&&i.global){n("event",t,r);return}else{const a=await e,l={...r,send_to:a};n("event",t,l)}}async function py(n,e,t,r){{const i=await e;n("config",i,{update:!0,user_id:t})}}async function my(n,e,t,r){if(r&&r.global){const i={};for(const a of Object.keys(t))i[`user_properties.${a}`]=t[a];return n("set",i),Promise.resolve()}else{const i=await e;n("config",i,{update:!0,user_properties:t})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function yy(){if(Ca())try{await Ra()}catch(n){return re.warn(he.create("indexeddb-unavailable",{errorInfo:n==null?void 0:n.toString()}).message),!1}else return re.warn(he.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;return!0}async function wy(n,e,t,r,i,a,l){const d=uy(n);d.then(T=>{t[T.measurementId]=T.appId,n.options.measurementId&&T.measurementId!==n.options.measurementId&&re.warn(`The measurement ID in the local Firebase config (${n.options.measurementId}) does not match the measurement ID fetched from the server (${T.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(T=>re.error(T)),e.push(d);const g=yy().then(T=>{if(T)return r.getId()}),[y,_]=await Promise.all([d,g]);ry(a)||Qm(a,y.measurementId),i("js",new Date);const S=(l==null?void 0:l.config)??{};return S[qm]="firebase",S.update=!0,_!=null&&(S[Gm]=_),i("config",y.measurementId,S),y.measurementId}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xy{constructor(e){this.app=e}_delete(){return delete _t[this.app.options.appId],Promise.resolve()}}let _t={},ha=[];const fa={};let cr="dataLayer",by="gtag",ga,bs,pa=!1;function _y(){const n=[];if(Pa()&&n.push("This is a browser extension environment."),gu()||n.push("Cookies are not available."),n.length>0){const e=n.map((r,i)=>`(${i+1}) ${r}`).join(" "),t=he.create("invalid-analytics-context",{errorInfo:e});re.warn(t.message)}}function vy(n,e,t){_y();const r=n.options.appId;if(!r)throw he.create("no-app-id");if(!n.options.apiKey)if(n.options.measurementId)re.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${n.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw he.create("no-api-key");if(_t[r]!=null)throw he.create("already-exists",{id:r});if(!pa){Zm(cr);const{wrappedGtag:a,gtagCore:l}=sy(_t,ha,fa,cr,by);bs=a,ga=l,pa=!0}return _t[r]=wy(n,ha,fa,e,ga,cr,t),new xy(n)}function Iy(n=gs()){n=fe(n);const e=ct(n,hs);return e.isInitialized()?e.getImmediate():Ty(n)}function Ty(n,e={}){const t=ct(n,hs);if(t.isInitialized()){const i=t.getImmediate();if(it(e,t.getOptions()))return i;throw he.create("already-initialized")}return t.initialize({options:e})}function Ey(n,e,t){n=fe(n),py(bs,_t[n.app.options.appId],e).catch(r=>re.error(r))}function il(n,e,t){n=fe(n),my(bs,_t[n.app.options.appId],e,t).catch(r=>re.error(r))}function ol(n,e,t,r){n=fe(n),gy(bs,_t[n.app.options.appId],e,t,r).catch(i=>re.error(i))}const ma="@firebase/analytics",ya="0.10.19";function Sy(){Ee(new we(hs,(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("installations-internal").getImmediate();return vy(r,i,t)},"PUBLIC")),Ee(new we("analytics-internal",n,"PRIVATE")),de(ma,ya),de(ma,ya,"esm2020");function n(e){try{const t=e.getProvider(hs).getImmediate();return{logEvent:(r,i,a)=>ol(t,r,i,a),setUserProperties:(r,i)=>il(t,r,i)}}catch(t){throw he.create("interop-component-reg-failed",{reason:t})}}}Sy();const Ay=window.__FIREBASE_CONFIG__,lr=Ay||{apiKey:"AIzaSyAvSKdOJjV1QxCt5jAL1YEyeE6osYGsWqw",authDomain:"gen-lang-client-0420977017.firebaseapp.com",projectId:"gen-lang-client-0420977017",storageBucket:"gs://gen-lang-client-0420977017.firebasestorage.app",messagingSenderId:"1035759192694",appId:"1:1035759192694:web:bbe252f079c54e46746d57"};let se=null;const Nn=typeof window<"u"&&(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"||window.location.hostname==="::1"||window.location.hostname.endsWith(".local")),zt=()=>{try{if(Nn)return null;if(se)return se;if(!lr.apiKey||!lr.appId)return console.warn("[Analytics] Firebase config missing, Analytics will not be initialized"),null;let n;const e=Da();return e.length>0?n=e[0]:n=Nr(lr),typeof window<"u"?(se=Iy(n),se):null}catch(n){return console.error("[Analytics] Failed to initialize:",n),null}},ky=(n,e)=>{try{if(Nn)return;se||(se=zt()),se?ol(se,n,e):console.warn(`[Analytics] Analytics not initialized, event not logged: ${n}`)}catch(t){console.error(`[Analytics] Failed to log event ${n}:`,t)}},Ny=n=>{try{if(Nn)return;se||(se=zt()),se&&n&&Ey(se,n)}catch(e){console.error("[Analytics] Failed to set user ID:",e)}},Py=n=>{try{if(Nn)return;se||(se=zt()),se&&il(se,n)}catch(e){console.error("[Analytics] Failed to set user properties:",e)}},Cy={PAGE_VIEW:"page_view",LANDING_PAGE_VIEW:"landing_page_view",CANVAS_PAGE_VIEW:"canvas_page_view",USER_LOGIN:"user_login",USER_LOGOUT:"user_logout",START_EXPLORATION:"start_exploration",CARD_CREATE:"card_create",CARD_EXPAND:"card_expand",CARD_DELETE:"card_delete",CARD_REFRESH:"card_refresh",CARD_SHARE:"card_share",CARD_EXPORT:"card_export",TOOL_AI_EXPLORE:"tool_ai_explore",TOOL_LITE_APP:"tool_lite_app",TOOL_CONCEPT_TREE:"tool_concept_tree",TOOL_TIMELINE:"tool_timeline",TOOL_GALLERY:"tool_gallery",TOOL_VIDEO:"tool_video",TOOL_TRIVIA:"tool_trivia",TOOL_QUIZ:"tool_quiz",TOOL_FOLLOW_UP:"tool_follow_up",SHARE_CANVAS:"share_canvas",SHARE_CARD:"share_card",LOAD_SHARED_SESSION:"load_shared_session",SESSION_SAVE:"session_save",SESSION_LOAD:"session_load",PDF_UPLOAD_START:"pdf_upload_start",PDF_UPLOAD_SUCCESS:"pdf_upload_success",PDF_UPLOAD_FAILURE:"pdf_upload_failure",SAVE_CANVAS:"save_canvas",ERROR_LOCATION:"error_location",ERROR_API:"error_api",ERROR_CONTENT_GENERATION:"error_content_generation",CONTACT_ENTRY_CLICK:"contact_entry_click",CONTACT_CHANNEL_CLICK:"contact_channel_click",CONTACT_CHANNEL_COPY:"contact_channel_copy",FEEDBACK_ENTRY_CLICK:"feedback_entry_click",FEEDBACK_SUBMIT:"feedback_submit"};typeof window<"u"&&setTimeout(()=>{Nn||zt()},100);const Ry=Object.freeze(Object.defineProperty({__proto__:null,AnalyticsEvents:Cy,initializeAnalytics:zt,logAnalyticsEvent:ky,setAnalyticsUserId:Ny,setAnalyticsUserProperties:Py},Symbol.toStringTag,{value:"Module"})),Dy="0GP15szlvKX3LopYz1",jy="https://rumt-zh.com",Oy={PAGE_VIEW:"page_view",LANDING_PAGE:"landing_page",CANVAS_PAGE:"canvas_page",USER_LOGIN:"user_login",USER_LOGOUT:"user_logout",START_EXPLORATION:"start_exploration",CARD_CREATE:"card_create",CARD_EXPAND:"card_expand",TOOL_USAGE:"tool_usage",SHARE_CANVAS:"share_canvas",SHARE_CARD:"share_card",AI_EXPLORE:"ai_explore",AI_PPT:"ai_ppt",AI_GAME:"ai_game",FIRST_CONTENT_PAINT:"first_content_paint",API_SLOW:"api_slow"};let nt=null;const Yr=typeof window<"u"&&(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"||window.location.hostname==="::1"||window.location.hostname.endsWith(".local")),ur="eureka_utm_channel";function Ly(){if(typeof window>"u")return"";const n=new URLSearchParams(window.location.search),e=n.get("utm_source")||"",t=n.get("utm_medium")||"",r=n.get("utm_campaign")||"";return[e,t,r].filter(Boolean).join("|")}function My(){if(typeof document>"u"||!document.referrer)return"";try{const n=new URL(document.referrer).hostname.toLowerCase(),e={"xiaohongshu.com":"xiaohongshu","xhslink.com":"xiaohongshu","douyin.com":"douyin","tiktok.com":"douyin","weibo.com":"weibo","weibo.cn":"weibo","zhihu.com":"zhihu","bilibili.com":"bilibili","b23.tv":"bilibili","baidu.com":"baidu","sogou.com":"sogou","bing.com":"bing","google.com":"google","mp.weixin.qq.com":"wechat_article"};for(const[t,r]of Object.entries(e))if(n.includes(t))return r;return`ref:${n}`}catch{return""}}function Fy(){const n=Ly();if(n){try{sessionStorage.setItem(ur,n)}catch{}return n}const e=My();if(e){try{sessionStorage.setItem(ur,e)}catch{}return e}try{const t=sessionStorage.getItem(ur);if(t)return t}catch{}return typeof window<"u"&&new URLSearchParams(window.location.search).get("from")==="miniprogram"?"miniprogram":"direct"}const Qr=()=>ap()||br(),al=()=>{try{if(Yr||!Qr())return null;if(nt)return nt;const n=Fy();return nt=new Xl({id:Dy,uin:"",reportApiSpeed:!0,reportAssetSpeed:!0,spa:!0,hostUrl:jy,pagePerformance:!0,onError:!0,api:{apiDetail:!0,reportRequest:!0},ext1:window.location.hostname,ext2:"production",ext3:n}),nt}catch(n){return console.error("[RUM] Failed to initialize:",n),null}},Uy=n=>{try{if(Yr||!Qr()||!nt)return;nt.setConfig({uin:n})}catch(e){console.error("[RUM] Failed to set user ID:",e)}},By=(n,e)=>{try{if(Yr||!Qr()||!nt)return;nt.reportEvent({name:n,ext1:e?JSON.stringify(e):void 0})}catch(t){console.error(`[RUM] Failed to report event ${n}:`,t)}},Vy=Object.freeze(Object.defineProperty({__proto__:null,RUMEvents:Oy,initializeRUM:al,reportRUMEvent:By,setRUMUserId:Uy},Symbol.toStringTag,{value:"Module"}));typeof window<"u"&&setTimeout(async()=>{if(op())try{const{initializeGoogleAuth:e,handleTokenMigration:t}=await ye(async()=>{const{initializeGoogleAuth:r,handleTokenMigration:i}=await Promise.resolve().then(()=>Jg);return{initializeGoogleAuth:r,handleTokenMigration:i}},void 0);await e(),await t()}catch(e){console.error("[Init] Failed to initialize Firebase Auth:",e)}zt(),al(),setTimeout(async()=>{try{const{syncCollectionsToBackend:e}=await ye(async()=>{const{syncCollectionsToBackend:t}=await import("./collectionService-DrY_cFcp.js");return{syncCollectionsToBackend:t}},__vite__mapDeps([9,0,1]));await e()}catch(e){console.warn("[Init] Failed to sync collections:",e)}},500)},100);const cl=document.getElementById("root");if(!cl)throw new Error("Could not find root element to mount to");const $y=Yl.createRoot(cl);$y.render(c.jsx(Vt.StrictMode,{children:c.jsx(im,{children:c.jsx(rm,{})})}));export{Nc as A,Zo as T,Ac as a,Ky as b,Gy as c,ap as d,me as e,ky as f,kt as g,_a as h,Hr as i,qy as j,eo as k,Wg as l,Xy as m,Jy as n,Vy as o,Wy as r,zy as u};

