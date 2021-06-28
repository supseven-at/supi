!function(){"use strict";var e={22:function(e,t){var o=this&&this.__read||function(e,t){var o="function"==typeof Symbol&&e[Symbol.iterator];if(!o)return e;var i,l,n=o.call(e),a=[];try{for(;(void 0===t||t-- >0)&&!(i=n.next()).done;)a.push(i.value)}catch(e){l={error:e}}finally{try{i&&!i.done&&(o=n.return)&&o.call(n)}finally{if(l)throw l.error}}return a},i=this&&this.__values||function(e){var t="function"==typeof Symbol&&Symbol.iterator,o=t&&e[t],i=0;if(o)return o.call(e);if(e&&"number"==typeof e.length)return{next:function(){return e&&i>=e.length&&(e=void 0),{value:e&&e[i++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")};t.__esModule=!0,t.cookie=void 0,t.cookie=new(function(){function e(){var e=this;this.values=new Map,this.lifetime=7,document.cookie.split("; ").forEach((function(t){var l,n,a=o(t.split("="),2),s=a[0],r=a[1];if("supi"==s){var u=JSON.parse(decodeURIComponent(r));try{for(var c=i(Object.keys(u)),d=c.next();!d.done;d=c.next()){var h=d.value;e.values.set(h,u[h])}}catch(e){l={error:e}}finally{try{d&&!d.done&&(n=c.return)&&n.call(c)}finally{if(l)throw l.error}}}}))}return e.prototype.get=function(e){return this.values.has(e)?this.values.get(e):null},e.prototype.has=function(e){return this.values.has(e)},e.prototype.set=function(e,t){this.values.set(e,t),this.persist()},e.prototype.setLifetime=function(e){e>0&&e<367&&(this.lifetime=e,this.persist())},e.prototype.remove=function(e){this.values.delete(e),this.persist()},e.prototype.persist=function(){var e=this;this.persistTimeout&&clearTimeout(this.persistTimeout),this.persistTimeout=setTimeout((function(){e.persistTimeout=null;var t=new Date,o={};e.values.forEach((function(e,t){o[t]=e})),t.setTime(t.getTime()+24*e.lifetime*60*60*1e3);var i="supi="+encodeURIComponent(JSON.stringify(o))+"; expires="+t.toUTCString()+"; path=/;";window.MSInputMethodContext||document.documentMode||(i+="; SameSite=Strict","https:"==location.protocol&&(i+="; Secure")),document.cookie=i}),20)},e.prototype.getCookieNames=function(){return document.cookie.split("; ").map((function(e){return e.split("=").shift()})).filter((function(e){return"supi"!==e}))},e.prototype.purgeCookie=function(e){var t=new Date;t.setTime(t.getTime()-216e6),document.cookie=e+"=x; expires="+t.toUTCString()+"; path=/"},e}())},642:function(e,t){var o,i,l,n;t.__esModule=!0,t.findAll=t.findOne=void 0,t.findOne=function(e,t){return void 0===t&&(t=null),(t||document).querySelector(e)},t.findAll=function(e,t){return void 0===t&&(t=null),Array.from((t||document).querySelectorAll(e))},Array.from||(Array.from=(o=Object.prototype.toString,i=function(e){return"function"==typeof e||"[object Function]"===o.call(e)},l=Math.pow(2,53)-1,n=function(e){var t=function(e){var t=Number(e);return isNaN(t)?0:0!==t&&isFinite(t)?(t>0?1:-1)*Math.floor(Math.abs(t)):t}(e);return Math.min(Math.max(t,0),l)},function(e){var t=this,o=Object(e);if(null==e)throw new TypeError("Array.from requires an array-like object - not null or undefined");var l,a=arguments.length>1?arguments[1]:void 0;if(void 0!==a){if(!i(a))throw new TypeError("Array.from: when provided, the second argument must be a function");arguments.length>2&&(l=arguments[2])}for(var s,r=n(o.length),u=i(t)?Object(new t(r)):new Array(r),c=0;c<r;)s=o[c],u[c]=a?void 0===l?a(s,c):a.call(l,s,c):s,c+=1;return u.length=r,u}))},429:function(e,t,o){var i=this&&this.__read||function(e,t){var o="function"==typeof Symbol&&e[Symbol.iterator];if(!o)return e;var i,l,n=o.call(e),a=[];try{for(;(void 0===t||t-- >0)&&!(i=n.next()).done;)a.push(i.value)}catch(e){l={error:e}}finally{try{i&&!i.done&&(o=n.return)&&o.call(n)}finally{if(l)throw l.error}}return a},l=this&&this.__spread||function(){for(var e=[],t=0;t<arguments.length;t++)e=e.concat(i(arguments[t]));return e};t.__esModule=!0;var n=o(905),a=o(642),s=o(22),r=function(){function e(){var e,t,o,i,l,r,u,c,d,h,f,p,v=this;this.cookieNameStatus="status",this.cookieNameAllowed="allowed",this.cookieNameYoutube="yt",this.cookieNameGoogleMaps="gmaps",this.overlay=!1,this.allowed=[],this.ttlAll=30,this.ttlReduced=7,this.allowAll=!1,this.allowYoutube=!1,this.allowMaps=!1,this.writeLog=!1,this.root=a.findOne("#supi"),this.dismiss=a.findOne("[data-toggle=dismiss]",this.root),this.choose=a.findOne("#supi__choose"),this.banner=null!==(e=a.findOne("#supi__overlay"))&&void 0!==e?e:a.findOne("#supi__banner"),this.overlay=!!a.findOne("#supi__overlay"),this.body=document.body,this.switch=a.findOne("#supi__switchTo"),this.save=a.findOne("[data-toggle=save]",this.root),this.writeLog=this.body.classList.contains("develop"),this.config=JSON.parse(this.root.getAttribute("data-supi-config")),this.log("Loaded config %o",this.config),this.ttlReduced=null!==(i=null===(o=null===(t=this.config)||void 0===t?void 0:t.cookieTTL)||void 0===o?void 0:o.reduced)&&void 0!==i?i:this.ttlReduced,this.ttlAll=null!==(u=null===(r=null===(l=this.config)||void 0===l?void 0:l.cookieTTL)||void 0===r?void 0:r.all)&&void 0!==u?u:this.ttlAll;var g=s.cookie.get(this.cookieNameAllowed);Array.isArray(g)&&g.length&&(this.allowed=g),null===(h=null===(d=null===(c=this.config)||void 0===c?void 0:c.elements)||void 0===d?void 0:d.essential)||void 0===h||h.names.split(",").forEach((function(e){-1===v.allowed.indexOf(e)&&v.allowed.push(e)}));var m=s.cookie.get(this.cookieNameStatus);m==n.Status.All?(this.allowAll=!0,this.injectJavaScripts(),this.updateCookieTTL()):m==n.Status.Selected?(this.injectJavaScripts(),this.updateCookieTTL()):s.cookie.get(this.cookieNameStatus)||(s.cookie.remove(this.cookieNameStatus),a.findOne('[data-hide-overlay="1"]')?this.log('Hides the Banner-Overlay due to the given Setting "hideOverlayOnButtonCe"',"",""):this.toggleBanner()),this.log("Checking for yt cookie"),this.allowYoutube="y"===s.cookie.get(this.cookieNameYoutube)||this.allowAll||m==n.Status.Selected&&(null===(f=this.config)||void 0===f?void 0:f.essentialIncludesYoutube),this.log('Youtube cookie is "%o" resulting in %o',s.cookie.get(this.cookieNameYoutube),this.allowYoutube),this.enableYoutubeVideos(),this.allowMaps="y"===s.cookie.get(this.cookieNameGoogleMaps)||this.allowAll||m==n.Status.Selected&&(null===(p=this.config)||void 0===p?void 0:p.essentialIncludesMaps),this.log('Maps cookie is "%o" resulting in %o',s.cookie.get(this.cookieNameGoogleMaps),this.allowMaps),this.enableMaps(),this.addClickHandler(),this.setDetailDefaults()}return e.prototype.updateCookieTTL=function(){s.cookie.setLifetime(this.allowAll?this.ttlAll:this.ttlReduced)},e.prototype.addClickHandler=function(){var e=this;a.findAll("[data-toggle=allow]",this.root).forEach((function(t){e.log("Allow all on click on %o",t),t.addEventListener("click",(function(t){e.log("Allow all was clicked, processing"),e.allowAll=!0,e.allowMaps=!0,e.allowYoutube=!0,e.collectAllowed(n.Mode.All),e.removeScripts(),!0===e.injectJavaScripts()&&(e.toggleBanner(),s.cookie.set(e.cookieNameStatus,n.Status.All),s.cookie.set(e.cookieNameYoutube,"y"),s.cookie.set(e.cookieNameGoogleMaps,"y")),e.setDetailDefaults(),e.enableMaps(),e.enableYoutubeVideos(),e.removeNotAllowedCookies(),t.preventDefault()}))})),this.dismiss&&this.dismiss.addEventListener("click",(function(t){var o,i;t.preventDefault(),e.allowAll=!1,e.collectAllowed(n.Mode.Essential)&&e.removeScripts(),(null===(o=e.config)||void 0===o?void 0:o.essentialIncludesYoutube)?(e.allowYoutube=!0,s.cookie.set(e.cookieNameYoutube,"y"),e.enableYoutubeVideos()):(e.allowYoutube=!1,s.cookie.set(e.cookieNameYoutube,"n")),(null===(i=e.config)||void 0===i?void 0:i.essentialIncludesMaps)?(e.allowMaps=!0,s.cookie.set(e.cookieNameGoogleMaps,"y"),e.enableMaps()):(e.allowMaps=!1,s.cookie.set(e.cookieNameGoogleMaps,"n")),!0===e.removeScripts()&&(e.toggleBanner(),s.cookie.set(e.cookieNameStatus,n.Status.Selected)),e.setDetailDefaults(),e.removeNotAllowedCookies()})),this.save&&this.save.addEventListener("click",(function(t){t.preventDefault(),e.allowAll=!1,e.collectAllowed(n.Mode.Selected),e.removeScripts(),e.injectJavaScripts()&&(e.toggleBanner(),s.cookie.set(e.cookieNameStatus,n.Status.Selected)),e.removeNotAllowedCookies()})),this.choose&&(this.log("Add main choose toggle to %o",this.choose),this.choose.addEventListener("click",(function(t){t.preventDefault(),e.toggleBanner()}))),Array.from(document.getElementsByTagName("a")).filter((function(e){return"#supi-choose"==e.getAttribute("href")})).forEach((function(t){e.log("Add choose toggle to %o",t),t.addEventListener("click",(function(t){t.preventDefault(),e.toggleBanner()}))})),a.findAll("[data-toggle=switch]").filter((function(e){return a.findOne(e.dataset.switchFrom)&&a.findOne(e.dataset.switchTo)})).forEach((function(t){t.addEventListener("click",(function(o){a.findOne(t.dataset.switchFrom).classList.add("tx-supi__pane-hidden"),a.findOne(t.dataset.switchTo).classList.remove("tx-supi__pane-hidden"),"disable"===t.dataset.inputs&&e.allowed.length<1&&a.findAll("input[type=checkbox]").forEach((function(e){e.checked=e.disabled||!!e.dataset.required})),o.preventDefault()}))})),a.findAll("[data-toggle=visibility]").filter((function(e){return!!a.findOne(e.dataset.target)})).forEach((function(e){e.addEventListener("click",(function(t){e.classList.toggle("tx-supi__pane-active"),a.findOne(e.dataset.target).classList.toggle("tx-supi__pane-hidden"),t.preventDefault()}))})),a.findAll("input[data-supi-block]").filter((function(e){return!e.disabled})).forEach((function(e){e.addEventListener("click",(function(t){if(e.dataset.supiParent)a.findAll("[data-supi-block="+e.dataset.supiBlock+"]").forEach((function(t){t.dataset.supiParent||(t.checked=e.checked)}));else{var o=a.findOne("[data-supi-parent="+e.dataset.supiBlock+"]"),i=a.findAll("[data-supi-block="+e.dataset.supiBlock+"]").filter((function(e){return!!e.dataset.supiItem}));o&&i.length&&(o.checked=i.reduce((function(e,t){return e&&t.checked}),!0))}t.stopPropagation()}))})),a.findAll(".tx-supi__youtube").forEach((function(t){var o;e.log("Add listener to child of %o",t),t.querySelector("[data-toggle=youtube]").addEventListener("click",(function(){e.log("Enabling all youtube elements"),s.cookie.set(e.cookieNameYoutube,"y"),e.toggleYoutubeVideos(t)})),null===(o=t.querySelector("[data-toggle=youtube-once]"))||void 0===o||o.addEventListener("click",(function(){e.log("Enabling one youtube element: %o",t),e.toggleYoutubeVideos(t,!0)}))})),a.findAll(".tx_supi__map").forEach((function(t){var o=t.querySelector("[data-toggle=map]");e.log("Add listener to toggle %o for map %o",o,t),o.addEventListener("click",(function(){e.allowMaps=!0,s.cookie.set(e.cookieNameGoogleMaps,"y"),e.enableMaps()}))}))},e.prototype.injectJavaScripts=function(){var e=this;return a.findAll("script").filter((function(e){return"application/supi"==e.type})).filter((function(t){var o=e.allowAll||!!t.dataset.supiRequired;return!o&&t.dataset.supiCookies&&(o=t.dataset.supiCookies.split(",").reduce((function(t,o){return t||e.allowed.indexOf(o)>-1}),!1)),o})).forEach((function(e){var t=document.createElement("script");t.type="text/javascript",t.className="supi-scripts",t.dataset.supiCookies=e.dataset.supiCookies,t.innerHTML=e.innerHTML,e.parentNode.replaceChild(t,e)})),!0},e.prototype.toggleBanner=function(){!0===this.overlay&&this.body.classList.toggle("tx-supi__overlay"),this.banner.classList.toggle("hide");var e=a.findOne("[data-supi-service=googleMaps]",this.root);e&&(e.checked=this.allowMaps);var t=a.findOne("[data-supi-service=youtube]",this.root);t&&(t.checked=this.allowYoutube);var o=a.findOne("[data-supi-parent=media]",this.root);o&&(o.checked=this.allowYoutube&&this.allowMaps)},e.prototype.removeScripts=function(){return a.findAll(".supi-scripts").forEach((function(e){var t=document.createElement("script");t.type="application/supi",t.dataset.supiCookies=e.dataset.supiCookies,t.innerHTML=e.innerHTML,e.parentNode.replaceChild(t,e)})),!0},e.prototype.collectAllowed=function(e){var t=this;void 0===e&&(e=n.Mode.Essential);var o=this.allowed.sort().join();switch(this.allowed=[],e){case n.Mode.All:Object.keys(this.config.elements).forEach((function(e){var o,i;null===(i=null===(o=t.config.elements[e])||void 0===o?void 0:o.names)||void 0===i||i.split(",").forEach((function(e){t.allowed.push(e)}))}));break;case n.Mode.Essential:Object.keys(this.config.elements||{}).filter((function(e){var o,i;return!!(null===(i=null===(o=t.config)||void 0===o?void 0:o.elements[e])||void 0===i?void 0:i.required)})).forEach((function(e){var o,i;null===(i=null===(o=t.config.elements[e])||void 0===o?void 0:o.names)||void 0===i||i.split(",").forEach((function(e){t.allowed.push(e)}))}));break;case n.Mode.Selected:s.cookie.set(this.cookieNameGoogleMaps,"n"),this.allowMaps=!1,s.cookie.set(this.cookieNameYoutube,"n"),this.allowYoutube=!1,a.findAll("input[type=checkbox]",this.root).filter((function(e){return e.checked||(parseInt(e.dataset.supiRequired)||0)>0})).forEach((function(e){if(e.dataset.supiService)switch(e.dataset.supiService){case"googleMaps":s.cookie.set(t.cookieNameGoogleMaps,"y"),t.allowMaps=!0,t.enableMaps();break;case"youtube":s.cookie.set(t.cookieNameYoutube,"y"),t.allowYoutube=!0,t.enableYoutubeVideos()}else e.value.split(",").map((function(e){return e.trim()})).forEach((function(e){-1===t.allowed.indexOf(e)&&t.allowed.push(e)}))}))}return this.allowed.sort().join()===o},e.prototype.removeNotAllowedCookies=function(){var e=this;this.log("Comparing currently set cookies %o with allowed %o, allow all is %o",s.cookie.getCookieNames(),this.allowed,this.allowAll),s.cookie.getCookieNames().forEach((function(t){e.allowAll||-1!==e.allowed.indexOf(t)||(e.log("Removing cookie "+t),s.cookie.purgeCookie(t))})),s.cookie.set(this.cookieNameAllowed,this.allowed)},e.prototype.setDetailDefaults=function(){var e=this;a.findAll("input[data-supi-parent]").forEach((function(t){var o=a.findAll("input[data-supi-block="+t.dataset.supiParent+"][data-supi-item]");o.length?(t.checked=!0,o.forEach((function(t){t.checked=t.disabled||e.allowAll||t.value.split(",").reduce((function(t,o){return t&&e.allowed.indexOf(o)>-1}),!0)})),t.checked=o.reduce((function(e,t){return e&&t.checked}),!0),e.log("Set parent %o to %o",t,t.checked)):(e.log("Check if all of parent values %s",t.value,e.allowed),t.checked=t.disabled||e.allowAll||t.value.split(",").reduce((function(t,o){return e.log("Checking value %s with prev of %o",o,t),t&&(o=o.replace(/\s+/g,""),e.log("Prev still true, checking if value %s is in %o",o,e.allowed),""!==o&&-1===e.allowed.indexOf(o)&&(e.log("Value %s is not in %o, setting to false",o,e.allowed),t=!1)),t}),!0))}))},e.prototype.log=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];this.writeLog&&console.log.apply(console,l(e))},e.prototype.enableYoutubeVideos=function(){var e=this;if(this.allowYoutube){this.log("Enabling all videos, non autostart"),a.findAll(".tx-supi__youtube").forEach((function(t){e.log("Enabling %o",t),e.addVideo(t,"")}));var t=new CustomEvent("onYouTubeAllowed",{detail:1});window.dispatchEvent(t)}},e.prototype.toggleYoutubeVideos=function(e,t){void 0===t&&(t=!1),this.log("Enabling youtube"),this.allowYoutube=!0,this.log("Start video for %o",e),this.addVideo(e,"&autoplay=1"),t?this.allowYoutube=!1:(s.cookie.set(this.cookieNameYoutube,"y"),this.log("Enabling other videos"),this.enableYoutubeVideos())},e.prototype.addVideo=function(e,t){if(this.allowYoutube){var o=e.querySelector(".tx-supi__youtube-preview-image").getBoundingClientRect(),i="https://www.youtube-nocookie.com/embed/"+e.dataset.youtubeId+"?rel=0&modestbranding=1"+t,l=document.createElement("iframe");l.src=i,l.frameBorder="0",l.style.border="0",l.width=o.width+"",l.height=o.height+"",e.parentNode.replaceChild(l,e)}else this.log("Youtube not enabled")},e.prototype.enableMaps=function(){this.allowMaps&&a.findAll(".tx_supi__map").forEach((function(e){var t=e.querySelector("[data-toggle=map]").dataset.callback;e.classList.add("active"),window[t]()}))},e}(),u=function(){window.supi=new r,window.removeEventListener("load",u)};window.addEventListener("load",u)},905:function(e,t){var o,i,l;t.__esModule=!0,t.Mode=t.Status=t.Position=void 0,(l=t.Position||(t.Position={}))[l.CenterCenter=0]="CenterCenter",l[l.BottomLeft=1]="BottomLeft",(i=t.Status||(t.Status={}))[i.None=0]="None",i[i.All=1]="All",i[i.Selected=2]="Selected",(o=t.Mode||(t.Mode={}))[o.All=0]="All",o[o.Essential=1]="Essential",o[o.Selected=2]="Selected"}},t={};!function o(i){if(t[i])return t[i].exports;var l=t[i]={exports:{}};return e[i].call(l.exports,l,l.exports,o),l.exports}(429)}();
//# sourceMappingURL=Supi.js.map