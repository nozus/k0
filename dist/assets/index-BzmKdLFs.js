import{createClient as e}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var t=e(`https://xmjpoopbrbcrviwbzkul.supabase.co`,`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtanBvb3picmJjcnZpd2J6a3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzc3MzEsImV4cCI6MjA5NTgxMzczMX0.58c4OiAG5AfutdckkEKdZaGvI3ltoFRTW6vP_QtvYq8`),n={},r=null;function i(e,t){n[e]=t}function a(e){window.location.hash=e}function o(){return window.location.hash.slice(1)||`/`}async function s(){let e=o();r&&typeof r==`function`&&(r(),r=null);let t=n[e];if(!t){for(let[r,i]of Object.entries(n))if(r.includes(`:`)){let n=r.split(`/`).filter(Boolean),a=e.split(`/`).filter(Boolean);if(n.length===a.length){let e={},r=!0;for(let t=0;t<n.length;t++)if(n[t].startsWith(`:`))e[n[t].slice(1)]=a[t];else if(n[t]!==a[t]){r=!1;break}if(r){t=t=>i(t,e);break}}}}if(t||=n[`/`]||n[`/auth`],t){let e=document.getElementById(`app`);try{let n=await t(e);n&&typeof n==`function`&&(r=n)}catch(t){console.error(`Route error:`,t),e.innerHTML=`
        <div style="padding: 2rem; color: white; background: #111; min-height: 100vh; font-family: monospace;">
          <h2>Error Loading Page</h2>
          <p style="color: #ff5555">${t.message}</p>
          <pre style="margin-top: 1rem; color: #888;">${t.stack}</pre>
        </div>
      `}}}function c(){window.addEventListener(`hashchange`,s),s()}async function l(){let{data:{user:e}}=await t.auth.getUser();return e}async function u(){let e=await l();if(!e)return null;let{data:n,error:r}=await t.from(`profiles`).select(`*`).eq(`id`,e.id).single();return r?(console.error(`Error fetching profile:`,r),null):n}async function d({username:e,password:n,displayName:r,avatarFile:i}){let a=null;if(i){let e=i.name.split(`.`).pop(),n=`${`${Math.random()}.${e}`}`,{error:r}=await t.storage.from(`avatars`).upload(n,i);if(r)throw Error(`Avatar upload failed: ${r.message}`);let{data:o}=t.storage.from(`avatars`).getPublicUrl(n);a=o.publicUrl}let o=`${e}@k0.local`,{data:s,error:c}=await t.auth.signUp({email:o,password:n,options:{data:{username:e,display_name:r,avatar_url:a}}});if(c)throw c;return s}async function f({username:e,password:n}){let r=`${e}@k0.local`,{data:i,error:a}=await t.auth.signInWithPassword({email:r,password:n});if(a)throw a;return i}async function p(e){let{data:n,error:r}=await t.from(`profiles`).select(`*`).eq(`id`,e).single();return r?(console.error(`Error fetching profile:`,r),null):n}function m(e){if(!e)return``;let t={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`};return e.replace(/[&<>"']/g,e=>t[e])}function h(e){return e?e.split(/\s+/).slice(0,2).map(e=>e[0]).join(``).toUpperCase():`?`}function g(e){let t=0;for(let n=0;n<e.length;n++)t=e.charCodeAt(n)+((t<<5)-t);let n=Math.abs(t)%360;return`linear-gradient(135deg, hsl(${n},70%,55%), hsl(${(n+45)%360},80%,50%))`}function _(e){let t=new Date(e);return`${String(t.getMonth()+1).padStart(2,`0`)}/${String(t.getFullYear()).slice(-2)}`}function v(e){return e.split(``).join(` `)}function y(e,t=`normal`){let{id:n,username:r=`unknown`,display_name:i,avatar_url:a,bio:o,karma_score:s,created_at:c}=e,l=t===`large`?` kard-large`:t===`mini`?` kard-mini`:``,u=a?`<img class="kard-chip-img" src="${m(a)}" alt="${m(r)}" />`:`<div class="kard-chip-initials" style="background:${g(r)}">${h(i||r)}</div>`,d=s??0,f=c?_(c):`--/--`;return`
    <div class="kard${l}" data-user-id="${m(n)}">
      <div class="kard-shimmer"></div>

      <div class="kard-top">
        <div class="kard-chip">${u}</div>
        <div class="kard-logo">k0</div>
      </div>

      <div class="kard-number">
        <span class="kard-at">@</span>${v(m(r))}
      </div>

      <div class="kard-bottom">
        <div class="kard-name">${m(i||r)}</div>
        <div class="kard-stats">
          <span class="kard-karma" title="Karma score">✦ ${d}</span>
          <span class="kard-join" title="Member since">SINCE ${f}</span>
        </div>
      </div>
    </div>
  `}function b(e){e&&e.querySelectorAll(`.kard`).forEach(e=>{e.addEventListener(`mousemove`,t=>{let n=e.getBoundingClientRect(),r=n.left+n.width/2,i=n.top+n.height/2,a=(t.clientX-r)/(n.width/2),o=(t.clientY-i)/(n.height/2),s=a*10,c=-o*10;e.style.transition=`transform 0.05s ease`,e.style.transform=`perspective(600px) rotateX(${c}deg) rotateY(${s}deg)`}),e.addEventListener(`mouseleave`,()=>{e.style.transition=`transform 0.4s ease`,e.style.transform=`perspective(600px) rotateX(0deg) rotateY(0deg)`})})}async function x(e){e.innerHTML=`
    <div class="auth-container">
      <div class="auth-background"></div>

      <div class="auth-content">
        <div class="auth-card glass">
          <div class="auth-brand">
            <h1 class="auth-logo gradient-text">k0</h1>
            <p class="auth-tagline">speak your mind</p>
          </div>

          <div class="auth-tabs">
            <button class="auth-tab auth-tab--active" data-tab="login" id="login-tab">login</button>
            <button class="auth-tab" data-tab="signup" id="signup-tab">create kard</button>
          </div>

          <!-- Login Form -->
          <form class="auth-form" id="login-form">
            <div class="form-group">
              <label for="login-username">username</label>
              <input type="text" id="login-username" placeholder="@handle" required autocomplete="username" />
            </div>
            <div class="form-group">
              <label for="login-password">password</label>
              <div class="password-input-wrapper">
                <input type="password" id="login-password" placeholder="••••••••" required autocomplete="current-password" />
                <button type="button" class="password-toggle" data-target="login-password">👁️</button>
              </div>
            </div>
            <div class="form-error" id="login-error"></div>
            <button type="submit" class="btn-primary auth-submit" id="login-btn">
              <span>enter k0</span>
            </button>
          </form>

          <!-- Signup Form -->
          <form class="auth-form auth-form--hidden" id="signup-form">
            <div class="form-row">
              <div class="form-group">
                <label for="signup-username">username</label>
                <input type="text" id="signup-username" placeholder="@handle" required pattern="[a-zA-Z0-9_]+" maxlength="20" />
              </div>
              <div class="form-group">
                <label for="signup-displayname">display name</label>
                <input type="text" id="signup-displayname" placeholder="your name" required maxlength="30" />
              </div>
            </div>
            <div class="form-group">
              <label for="signup-password">password</label>
              <div class="password-input-wrapper">
                <input type="password" id="signup-password" placeholder="min 6 characters" required minlength="6" autocomplete="new-password" />
                <button type="button" class="password-toggle" data-target="signup-password">👁️</button>
              </div>
            </div>
            <div class="form-group">
              <label for="signup-avatar">profile photo</label>
              <div class="avatar-upload" id="avatar-upload-area">
                <input type="file" id="signup-avatar" accept="image/*" hidden />
                <div class="avatar-upload-placeholder" id="avatar-placeholder">
                  <span class="avatar-upload-icon">📷</span>
                  <span class="avatar-upload-text">click to upload</span>
                </div>
                <img class="avatar-upload-preview" id="avatar-preview" src="" alt="preview" style="display:none" />
              </div>
            </div>
            <div class="form-error" id="signup-error"></div>
            <button type="submit" class="btn-primary auth-submit" id="signup-btn">
              <span>create my kard</span>
            </button>
          </form>
        </div>

        <!-- Live Kard Preview (signup only) -->
        <div class="auth-preview" id="kard-preview-area" style="display:none">
          <h3 class="auth-preview-title">your kard preview</h3>
          <div id="kard-preview-container">
            ${y({username:`username`,display_name:`your name`,avatar_url:null,karma_score:0,created_at:new Date().toISOString()},`normal`)}
          </div>
        </div>
      </div>
    </div>
  `;let t=document.getElementById(`login-tab`),n=document.getElementById(`signup-tab`),r=document.getElementById(`login-form`),i=document.getElementById(`signup-form`),o=document.getElementById(`kard-preview-area`);t.addEventListener(`click`,()=>{t.classList.add(`auth-tab--active`),n.classList.remove(`auth-tab--active`),r.classList.remove(`auth-form--hidden`),i.classList.add(`auth-form--hidden`),o.style.display=`none`}),n.addEventListener(`click`,()=>{n.classList.add(`auth-tab--active`),t.classList.remove(`auth-tab--active`),i.classList.remove(`auth-form--hidden`),r.classList.add(`auth-form--hidden`),o.style.display=`block`}),document.querySelectorAll(`.password-toggle`).forEach(e=>{e.addEventListener(`click`,t=>{let n=t.currentTarget.getAttribute(`data-target`),r=document.getElementById(n);r.type===`password`?(r.type=`text`,e.textContent=`🙈`):(r.type=`password`,e.textContent=`👁️`)})});let s=document.getElementById(`avatar-upload-area`),c=document.getElementById(`signup-avatar`),l=document.getElementById(`avatar-preview`),u=document.getElementById(`avatar-placeholder`),p=null;s.addEventListener(`click`,()=>c.click()),c.addEventListener(`change`,e=>{let t=e.target.files[0];if(t){p=t;let e=new FileReader;e.onload=e=>{l.src=e.target.result,l.style.display=`block`,u.style.display=`none`,_()},e.readAsDataURL(t)}});let m=document.getElementById(`signup-username`),h=document.getElementById(`signup-displayname`),g=document.getElementById(`kard-preview-container`);function _(){g.innerHTML=y({username:m.value||`username`,display_name:h.value||`your name`,avatar_url:l.style.display===`none`?null:l.src,karma_score:0,created_at:new Date().toISOString()},`normal`)}m.addEventListener(`input`,_),h.addEventListener(`input`,_),r.addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`login-error`),n=document.getElementById(`login-btn`);t.textContent=``,n.disabled=!0,n.innerHTML=`<span class="spinner"></span>`;try{await f({username:document.getElementById(`login-username`).value,password:document.getElementById(`login-password`).value}),a(`/feed`)}catch(e){t.textContent=e.message}finally{n.disabled=!1,n.innerHTML=`<span>enter k0</span>`}}),i.addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`signup-error`),n=document.getElementById(`signup-btn`);t.textContent=``,n.disabled=!0,n.innerHTML=`<span class="spinner"></span>`;try{await d({username:document.getElementById(`signup-username`).value,password:document.getElementById(`signup-password`).value,displayName:document.getElementById(`signup-displayname`).value,avatarFile:p}),a(`/feed`)}catch(e){t.textContent=e.message}finally{n.disabled=!1,n.innerHTML=`<span>create my kard</span>`}})}function S(e=`feed`){return`
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-inner">
        <!-- Brand -->
        <div class="sidebar-brand">
          <a href="#/feed" class="sidebar-logo">k0</a>
          <span class="sidebar-tagline">speak your mind</span>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          ${[{id:`feed`,label:`Kontros`,icon:`🔥`,href:`#/feed`,disabled:!1},{id:`profile`,label:`My Kard`,icon:`💳`,href:`#/profile`,disabled:!1},{id:`trending`,label:`Trending`,icon:`📈`,href:`#/trending`,disabled:!0}].map(t=>{let n=t.id===e?` sidebar-link--active`:``,r=t.disabled?` aria-disabled="true" tabindex="-1"`:``,i=t.disabled?` sidebar-link--disabled`:``;return`
        <a
          href="${t.disabled?`javascript:void(0)`:t.href}"
          class="sidebar-link${n}${i}"
          data-page="${t.id}"
          ${r}
        >
          <span class="sidebar-link-icon">${t.icon}</span>
          <span class="sidebar-link-label">${t.label}</span>
        </a>
      `}).join(``)}
        </nav>

        <!-- Logged-in user mini kard -->
        <div class="sidebar-user" id="sidebar-user"></div>
      </div>

      <!-- Mobile overlay backdrop -->
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
    </aside>
  `}async function C(){let e=document.getElementById(`sidebar-user`);if(e)try{let{data:{user:n}}=await t.auth.getUser();if(!n){e.innerHTML=`<a href="#/login" class="sidebar-login-link">Sign In</a>`;return}let{data:r}=await t.from(`profiles`).select(`username, display_name, avatar_url`).eq(`id`,n.id).single();if(!r)return;e.innerHTML=`
      <a href="#/profile" class="sidebar-user-card">
        ${r.avatar_url?`<img class="sidebar-user-avatar" src="${r.avatar_url}" alt="${r.username}" />`:`<div class="sidebar-user-avatar sidebar-user-avatar--initials">${w(r.display_name||r.username)}</div>`}
        <div class="sidebar-user-info">
          <span class="sidebar-user-name">${T(r.display_name||r.username)}</span>
          <span class="sidebar-user-handle">@${T(r.username)}</span>
        </div>
      </a>
    `}catch(e){console.error(`[sidebar] Failed to load current user:`,e)}}function w(e){return e?e.split(/\s+/).slice(0,2).map(e=>e[0]).join(``).toUpperCase():`?`}function T(e){if(!e)return``;let t={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`};return e.replace(/[&<>"']/g,e=>t[e])}function E(){let e=document.getElementById(`sidebar`),t=document.getElementById(`navbar-toggle`),n=document.getElementById(`sidebar-overlay`);if(!e||!t)return;let r=()=>{e.classList.add(`sidebar--open`),t.classList.add(`navbar-toggle--active`),t.setAttribute(`aria-expanded`,`true`)},i=()=>{e.classList.remove(`sidebar--open`),t.classList.remove(`navbar-toggle--active`),t.setAttribute(`aria-expanded`,`false`)};t.addEventListener(`click`,()=>{e.classList.contains(`sidebar--open`)?i():r()}),n&&n.addEventListener(`click`,i),e.addEventListener(`click`,e=>{let t=e.target.closest(`.sidebar-link`);t&&!t.classList.contains(`sidebar-link--disabled`)&&i()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&i()}),C()}function D(){return`
    <nav class="navbar" id="navbar">
      <a href="#/feed" class="navbar-brand">
        <span class="navbar-brand-text">k0</span>
      </a>
      <button
        class="navbar-toggle"
        id="navbar-toggle"
        aria-label="Toggle sidebar menu"
        aria-expanded="false"
      >
        <span class="navbar-toggle-bar"></span>
        <span class="navbar-toggle-bar"></span>
        <span class="navbar-toggle-bar"></span>
      </button>
    </nav>
  `}async function O({filter:e=`newest`,limit:n=20,offset:r=0}={}){let i=t.from(`posts`).select(`
      *,
      profiles:user_id (
        username,
        display_name,
        avatar_url
      )
    `).eq(`is_deleted`,!1).range(r,r+n-1);switch(e){case`controversial`:i=i.order(`rating_count`,{ascending:!1});break;case`trending`:i=i.order(`rating_count`,{ascending:!1}).gte(`created_at`,new Date(Date.now()-1440*60*1e3).toISOString());break;default:i=i.order(`created_at`,{ascending:!1});break}let{data:a,error:o}=await i;return o?(console.error(`Error fetching posts:`,o),[]):a||[]}async function k(e){let{data:{user:n}}=await t.auth.getUser();if(!n)throw Error(`Not authenticated`);let{data:r,error:i}=await t.from(`posts`).insert({user_id:n.id,content:e,rating_sum:0,rating_count:0,is_deleted:!1}).select(`
      *,
      profiles:user_id (
        username,
        display_name,
        avatar_url
      )
    `).single();if(i)throw i;return r}async function A(e,n){let{data:{user:r}}=await t.auth.getUser();if(!r)throw Error(`Not authenticated`);let{data:i}=await t.from(`ratings`).select(`*`).eq(`post_id`,e).eq(`user_id`,r.id).single();if(i)return i.value===n?(await t.from(`ratings`).delete().eq(`id`,i.id),await t.rpc(`update_post_rating`,{p_post_id:e,p_delta:-n,p_count_delta:-1}),{action:`removed`,value:0}):(await t.from(`ratings`).update({value:n}).eq(`id`,i.id),await t.rpc(`update_post_rating`,{p_post_id:e,p_delta:n*2,p_count_delta:0}),{action:`changed`,value:n});{let{error:i}=await t.from(`ratings`).insert({post_id:e,user_id:r.id,value:n});if(i)throw i;return await t.rpc(`update_post_rating`,{p_post_id:e,p_delta:n,p_count_delta:1}),{action:`added`,value:n}}}async function j(e){let{data:n,error:r}=await t.from(`posts`).select(`
      *,
      profiles:user_id (
        username,
        display_name,
        avatar_url
      )
    `).eq(`user_id`,e).eq(`is_deleted`,!1).order(`created_at`,{ascending:!1});return r?(console.error(`Error fetching user posts:`,r),[]):n||[]}var M=5;async function N(e,n,r){let{data:{user:i}}=await t.auth.getUser();if(!i)throw Error(`Not authenticated`);let{data:a}=await t.from(`moderation_votes`).select(`id`).eq(`voter_id`,i.id).eq(`target_type`,e).eq(`target_id`,n).single();if(a)throw Error(`You have already voted on this`);let{error:o}=await t.from(`moderation_votes`).insert({voter_id:i.id,target_type:e,target_id:n,action:r});if(o)throw o;let{count:s}=await t.from(`moderation_votes`).select(`*`,{count:`exact`,head:!0}).eq(`target_type`,e).eq(`target_id`,n).eq(`action`,r);return s>=M?(await P(e,n,r),{executed:!0,count:s}):{executed:!1,count:s}}async function P(e,n,r){e===`post`&&r===`delete`?await t.from(`posts`).update({is_deleted:!0}).eq(`id`,n):e===`user`&&r===`block`&&await t.from(`profiles`).update({is_blocked:!0}).eq(`id`,n)}function F(e){let t=Date.now(),n=new Date(e).getTime(),r=Math.floor((t-n)/1e3);return r<60?`just now`:r<3600?`${Math.floor(r/60)}m`:r<86400?`${Math.floor(r/3600)}h`:r<2592e3?`${Math.floor(r/86400)}d`:r<31536e3?`${Math.floor(r/2592e3)}mo`:`${Math.floor(r/31536e3)}y`}function I(e){return e?e.split(/\s+/).slice(0,2).map(e=>e[0]).join(``).toUpperCase():`?`}function L(e){if(!e)return``;let t={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`};return e.replace(/[&<>"']/g,e=>t[e])}function R(e){let t=0;for(let n=0;n<e.length;n++)t=e.charCodeAt(n)+((t<<5)-t);let n=Math.abs(t)%360;return`linear-gradient(135deg, hsl(${n},70%,55%), hsl(${(n+45)%360},80%,50%))`}function z(e,t=null){let{id:n,user_id:r,content:i,rating_sum:a,rating_count:o,created_at:s,profiles:{username:c,display_name:l,avatar_url:u}}=e,d=document.createElement(`div`);d.classList.add(`speech-bubble-wrapper`),d.dataset.postId=n;let f=document.createElement(`div`);if(f.classList.add(`speech-bubble-avatar`),u){let e=document.createElement(`img`);e.src=u,e.alt=c,e.classList.add(`speech-bubble-avatar-img`),f.appendChild(e)}else{let e=document.createElement(`div`);e.classList.add(`speech-bubble-avatar-initials`),e.textContent=I(l||c),e.style.background=R(c),f.appendChild(e)}let p=document.createElement(`div`);p.classList.add(`speech-bubble`);let m=document.createElement(`div`);m.classList.add(`speech-bubble-swipe-overlay`),p.appendChild(m);let h=document.createElement(`div`);h.classList.add(`bubble-header`),h.innerHTML=`
    <a href="#/profile/${L(c)}" class="bubble-username">@${L(c)}</a>
    <span class="bubble-time">${F(s)}</span>
  `;let g=document.createElement(`div`);g.classList.add(`bubble-content`),g.textContent=i;let _=document.createElement(`div`);_.classList.add(`bubble-actions`),_.innerHTML=`
    <button class="bubble-action-btn bubble-vote-up" data-vote="1" aria-label="Upvote">
      <span class="bubble-vote-arrow">▲</span>
    </button>
    <span class="bubble-rating-count">${a??0}</span>
    <button class="bubble-action-btn bubble-vote-down" data-vote="-1" aria-label="Downvote">
      <span class="bubble-vote-arrow">▼</span>
    </button>
    <div class="bubble-mod-wrapper">
      <button class="bubble-action-btn bubble-mod-btn" aria-label="Moderation options">
        <span>…</span>
      </button>
      <div class="bubble-mod-dropdown bubble-mod-dropdown--hidden">
        <button class="bubble-mod-option" data-action="delete_post">Vote to Delete Post</button>
        <button class="bubble-mod-option" data-action="block_user">Vote to Block User</button>
      </div>
    </div>
  `,p.append(h,g,_),d.append(f,p);let v=_.querySelector(`.bubble-rating-count`),y=_.querySelector(`.bubble-vote-up`),b=_.querySelector(`.bubble-vote-down`),x=0;async function S(e){let t=x===e?0:e;try{t!==0&&await A(n,t),x=t,y.classList.toggle(`bubble-vote--active`,x===1),b.classList.toggle(`bubble-vote--active`,x===-1);let e=t-x;v.textContent=(parseInt(v.textContent,10)||0)+e}catch(e){console.error(`[speech-bubble] Vote failed:`,e)}}y.addEventListener(`click`,()=>S(1)),b.addEventListener(`click`,()=>S(-1));let C=_.querySelector(`.bubble-mod-btn`),w=_.querySelector(`.bubble-mod-dropdown`);C.addEventListener(`click`,e=>{e.stopPropagation(),w.classList.toggle(`bubble-mod-dropdown--hidden`)}),document.addEventListener(`click`,()=>{w.classList.add(`bubble-mod-dropdown--hidden`)}),w.addEventListener(`click`,async e=>{let t=e.target.closest(`.bubble-mod-option`);if(!t)return;e.stopPropagation();let i=t.dataset.action;try{i===`delete_post`?await N(`post`,n,`delete`):i===`block_user`&&await N(`user`,r,`block`),t.textContent=`✓ Voted`,t.disabled=!0}catch(e){console.error(`[speech-bubble] Moderation vote failed:`,e)}w.classList.add(`bubble-mod-dropdown--hidden`)});let T=0,E=0,D=!1;return p.addEventListener(`touchstart`,e=>{T=e.touches[0].clientX,E=T,D=!0,p.style.transition=`none`},{passive:!0}),p.addEventListener(`touchmove`,e=>{if(!D)return;E=e.touches[0].clientX;let t=E-T,n=t*.5;p.style.transform=`translateX(${n}px)`,t>80?m.className=`speech-bubble-swipe-overlay swipe-right`:t<-80?m.className=`speech-bubble-swipe-overlay swipe-left`:m.className=`speech-bubble-swipe-overlay`},{passive:!0}),p.addEventListener(`touchend`,()=>{if(!D)return;D=!1;let e=E-T;p.style.transition=`transform 0.3s ease`,p.style.transform=`translateX(0)`,m.className=`speech-bubble-swipe-overlay`,e>80?S(1):e<-80&&S(-1)}),d}var B=`newest`,V=null;async function H(e){if(!await l()){window.location.hash=`/auth`;return}V=await u(),e.innerHTML=`
    ${D()}
    <div class="feed-layout">
      ${S(`kontros`)}
      <main class="feed-main">
        <div class="feed-header">
          <h1 class="feed-title">
            <span class="gradient-text">Kontros</span>
          </h1>
          <div class="feed-filters">
            <button class="filter-btn filter-btn--active" data-filter="newest" id="filter-newest">🕐 Newest</button>
            <button class="filter-btn" data-filter="controversial" id="filter-controversial">🔥 Kontroversial</button>
            <button class="filter-btn" data-filter="trending" id="filter-trending">📈 Trending</button>
          </div>
        </div>

        <div class="compose-box glass" id="compose-box">
          <div class="compose-avatar">
            ${V?.avatar_url?`<img src="${V.avatar_url}" alt="You" class="compose-avatar-img" />`:`<div class="compose-avatar-initials">${G(V?.display_name||`U`)}</div>`}
          </div>
          <form class="compose-form" id="compose-form">
            <textarea 
              class="compose-input" 
              id="compose-input" 
              placeholder="Drop a kontro... 🔥" 
              maxlength="500"
              rows="1"
            ></textarea>
            <div class="compose-footer">
              <span class="compose-counter" id="compose-counter">0/500</span>
              <button type="submit" class="btn-primary compose-submit" id="compose-submit" disabled>
                Post
              </button>
            </div>
          </form>
        </div>

        <div class="post-list" id="post-list">
          <div class="skeleton-loader" id="skeleton-loader">
            ${[,,,].fill(``).map(()=>`
              <div class="skeleton-bubble">
                <div class="skeleton-avatar skeleton-pulse"></div>
                <div class="skeleton-content">
                  <div class="skeleton-line skeleton-line--short skeleton-pulse"></div>
                  <div class="skeleton-line skeleton-pulse"></div>
                  <div class="skeleton-line skeleton-line--medium skeleton-pulse"></div>
                </div>
              </div>
            `).join(``)}
          </div>
        </div>

        <div class="feed-empty" id="feed-empty" style="display:none">
          <span class="feed-empty-icon">🌊</span>
          <h3>No kontros yet</h3>
          <p>Be the first to drop something kontroversial</p>
        </div>
      </main>
    </div>
  `,E(),U(),await W(),document.querySelectorAll(`.filter-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{document.querySelectorAll(`.filter-btn`).forEach(e=>e.classList.remove(`filter-btn--active`)),e.classList.add(`filter-btn--active`),B=e.dataset.filter,await W()})})}function U(){let e=document.getElementById(`compose-input`),t=document.getElementById(`compose-counter`),n=document.getElementById(`compose-submit`),r=document.getElementById(`compose-form`);e.addEventListener(`input`,()=>{e.style.height=`auto`,e.style.height=e.scrollHeight+`px`;let r=e.value.length;t.textContent=`${r}/500`,n.disabled=r===0||r>500,r>450?t.classList.add(`compose-counter--warn`):t.classList.remove(`compose-counter--warn`)}),r.addEventListener(`submit`,async r=>{r.preventDefault();let i=e.value.trim();if(i){n.disabled=!0,n.innerHTML=`<span class="spinner"></span>`;try{let n=await k(i);e.value=``,e.style.height=`auto`,t.textContent=`0/500`;let r=document.getElementById(`post-list`),a=z(n,(await l()).id);a.classList.add(`animate-slideUp`),r.insertBefore(a,r.firstChild),document.getElementById(`feed-empty`).style.display=`none`}catch(e){console.error(`Error creating post:`,e)}finally{n.disabled=!1,n.innerHTML=`Post`}}})}async function W(){let e=document.getElementById(`post-list`),t=document.getElementById(`skeleton-loader`),n=document.getElementById(`feed-empty`);t&&(t.style.display=`block`);try{let r=await O({filter:B}),i=await l();if(t&&(t.style.display=`none`),r.length===0){e.innerHTML=``,n.style.display=`flex`;return}n.style.display=`none`,e.innerHTML=``,r.forEach((t,n)=>{let r=z(t,i.id);r.style.animationDelay=`${n*.08}s`,r.classList.add(`animate-slideUp`),e.appendChild(r)})}catch(n){console.error(`Error loading posts:`,n),t&&(t.style.display=`none`),e.innerHTML=`
      <div class="feed-error glass">
        <span>⚠️ Failed to load kontros. Try refreshing.</span>
      </div>
    `}}function G(e){return e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2)}var K=`rate-modal`,q=`rate-modal-overlay`;function J(e){if(!e)return``;let t={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`};return e.replace(/[&<>"']/g,e=>t[e])}async function Y(e,t,n){X();let r=J(n),i=e===`post`?`Vote to delete this post by <strong>@${r}</strong>?`:`Vote to block <strong>@${r}</strong>?`,a=e===`post`?`Confirm Delete Vote`:`Confirm Block Vote`,o=document.createElement(`div`);o.id=q,o.classList.add(`rate-modal-overlay`);let s=document.createElement(`div`);s.id=K,s.classList.add(`rate-modal`),s.setAttribute(`role`,`dialog`),s.setAttribute(`aria-modal`,`true`),s.innerHTML=`
    <div class="rate-modal-card">
      <div class="rate-modal-icon">
        ${e===`post`?`🗑️`:`🚫`}
      </div>
      <p class="rate-modal-message">${i}</p>
      <div class="rate-modal-actions">
        <button class="rate-modal-btn rate-modal-btn--confirm" id="rate-modal-confirm">
          ${J(a)}
        </button>
        <button class="rate-modal-btn rate-modal-btn--cancel" id="rate-modal-cancel">
          Cancel
        </button>
      </div>
      <p class="rate-modal-status" id="rate-modal-status"></p>
    </div>
  `,document.body.appendChild(o),document.body.appendChild(s),requestAnimationFrame(()=>{o.classList.add(`rate-modal-overlay--visible`),s.classList.add(`rate-modal--visible`)});let c=document.getElementById(`rate-modal-confirm`),l=document.getElementById(`rate-modal-cancel`),u=document.getElementById(`rate-modal-status`);c.addEventListener(`click`,async()=>{c.disabled=!0,c.textContent=`Submitting…`;try{await N(e,t,e===`post`?`delete`:`block`),u.textContent=`✓ Vote submitted`,u.classList.add(`rate-modal-status--success`),setTimeout(()=>X(),800)}catch(e){console.error(`[rate-modal] Vote failed:`,e),u.textContent=`Failed to submit vote. Try again.`,u.classList.add(`rate-modal-status--error`),c.disabled=!1,c.textContent=a}}),l.addEventListener(`click`,()=>X()),o.addEventListener(`click`,()=>X());let d=e=>{e.key===`Escape`&&(X(),document.removeEventListener(`keydown`,d))};document.addEventListener(`keydown`,d)}function X(){let e=document.getElementById(q),t=document.getElementById(K);if(!e&&!t)return;e&&e.classList.remove(`rate-modal-overlay--visible`),t&&t.classList.remove(`rate-modal--visible`);let n=()=>{e?.remove(),t?.remove()};t?(t.addEventListener(`transitionend`,n,{once:!0}),setTimeout(n,400)):n()}async function Z(e,t={}){let n=await l();if(!n){window.location.hash=`/auth`;return}let r,i=!1;if(t?.id&&t.id!==n.id){if(r=await p(t.id),!r){e.innerHTML=`
        <div class="profile-error">
          <h2>Kard not found</h2>
          <p>This user doesn't exist or has been blocked.</p>
          <a href="#/feed" class="btn-primary">Back to Kontros</a>
        </div>
      `;return}}else r=await u(),i=!0;let a=await j(r.id);if(e.innerHTML=`
    ${D()}
    <div class="feed-layout">
      ${S(`profile`)}
      <main class="feed-main profile-main">
        <div class="profile-header">
          <div class="profile-kard-wrapper" id="profile-kard">
            ${y(r,`large`)}
          </div>
          
          ${r.bio?`<p class="profile-bio">${Q(r.bio)}</p>`:``}

          <div class="profile-stats-row">
            <div class="profile-stat glass">
              <span class="profile-stat-value">${a.length}</span>
              <span class="profile-stat-label">Kontros</span>
            </div>
            <div class="profile-stat glass">
              <span class="profile-stat-value">${r.karma_score||0}</span>
              <span class="profile-stat-label">Karma</span>
            </div>
            <div class="profile-stat glass">
              <span class="profile-stat-value">${$(r.created_at)}</span>
              <span class="profile-stat-label">Joined</span>
            </div>
          </div>

          ${i?`
            <div class="profile-actions">
              <button class="btn-secondary" id="edit-profile-btn">
                ✏️ Edit Kard
              </button>
            </div>
          `:`
            <div class="profile-actions">
              <button class="btn-danger" id="block-user-btn">
                🚫 Vote to Block
              </button>
            </div>
          `}
        </div>

        <div class="profile-posts-header">
          <h2 class="profile-posts-title">
            ${i?`My`:`@${r.username}'s`} Kontros
          </h2>
        </div>

        <div class="post-list" id="profile-post-list">
          ${a.length===0?`
            <div class="feed-empty">
              <span class="feed-empty-icon">🤫</span>
              <h3>No kontros yet</h3>
              <p>${i?`Time to speak your mind`:`This user hasn't posted yet`}</p>
            </div>
          `:``}
        </div>
      </main>
    </div>
  `,E(),a.length>0){let e=document.getElementById(`profile-post-list`);a.forEach((t,r)=>{let i=z(t,n.id);i.style.animationDelay=`${r*.08}s`,i.classList.add(`animate-slideUp`),e.appendChild(i)})}let o=document.getElementById(`profile-kard`);if(o&&b(o),!i){let e=document.getElementById(`block-user-btn`);e&&e.addEventListener(`click`,()=>{Y(`user`,r.id,r.username)})}}function Q(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function $(e){let t=new Date(e);return`${[`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`,`Nov`,`Dec`][t.getMonth()]} ${t.getFullYear()}`}i(`/auth`,x),i(`/feed`,H),i(`/profile`,Z),i(`/profile/:id`,Z),i(`/`,async e=>{let{data:{session:n}}=await t.auth.getSession();a(n?`/feed`:`/auth`)}),c();