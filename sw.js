if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(i[c])return;let o={};const t=e=>s(e,c),l={module:{uri:c},exports:o,require:t};i[c]=Promise.all(n.map((e=>l[e]||t(e)))).then((e=>(r(...e),o)))}}define(["./workbox-7cfec069"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/index-9y6G2YEI.css",revision:null},{url:"assets/index-IQE92L07.js",revision:null},{url:"index.html",revision:"1cb9d84f3291fe8037a0881199541bb2"},{url:"registerSW.js",revision:"1f2bd08b7125259f0d7ee59ca488cb9e"},{url:"favicon.png",revision:"01881e7d7e483297843c1de3b3c586a5"},{url:"maskable_icon.png",revision:"e63c75d12836870d6da51a58f81f7360"},{url:"maskable_icon_x192.png",revision:"e28cfa7b936ee64043198232ff789174"},{url:"maskable_icon_x512.png",revision:"e21c35c0cadfe1d3b2f6c9899c01c46d"},{url:"manifest.webmanifest",revision:"a3783fe3d301ed93ee8381cc2fe4f40b"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));