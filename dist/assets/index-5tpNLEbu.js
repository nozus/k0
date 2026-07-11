import{createClient as e}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var t=e(`https://xmjpoozbrbcrviwbzkul.supabase.co`,`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtanBvb3picmJjcnZpd2J6a3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzc3MzEsImV4cCI6MjA5NTgxMzczMX0.58c4OiAG5AfutdckkEKdZaGvI3ltoFRTW6vP_QtvYq8`,{global:{fetch:(e,t)=>{let n=new AbortController,r=setTimeout(()=>n.abort(),5e3);return fetch(e,{...t,signal:n.signal}).then(e=>(clearTimeout(r),e)).catch(e=>{throw clearTimeout(r),e.name===`AbortError`?Error(`Supabase request timed out after 5 seconds`):e})}}}),n={},r=null;function i(e,t){n[e]=t}function a(e){window.location.hash=e}function o(){return window.location.hash.slice(1)||`/`}async function s(){let e=o();r&&typeof r==`function`&&(r(),r=null);let t=n[e];if(!t){for(let[r,i]of Object.entries(n))if(r.includes(`:`)){let n=r.split(`/`).filter(Boolean),a=e.split(`/`).filter(Boolean);if(n.length===a.length){let e={},r=!0;for(let t=0;t<n.length;t++)if(n[t].startsWith(`:`))e[n[t].slice(1)]=a[t];else if(n[t]!==a[t]){r=!1;break}if(r){t=t=>i(t,e);break}}}}if(t||=n[`/`]||n[`/auth`],t){let e=document.getElementById(`app`);try{let n=await t(e);n&&typeof n==`function`&&(r=n)}catch(t){console.error(`Route error:`,t),e.innerHTML=`
        <div style="padding: 2rem; color: white; background: #111; min-height: 100vh; font-family: monospace;">
          <h2>Error Loading Page</h2>
          <p style="color: #ff5555">${t.message}</p>
          <pre style="margin-top: 1rem; color: #888;">${t.stack}</pre>
        </div>
      `}}}function c(){window.addEventListener(`hashchange`,s),s()}async function l(){let{data:{user:e}}=await t.auth.getUser();return e}async function u(){let e=await l();if(!e)return null;let{data:n,error:r}=await t.from(`profiles`).select(`*`).eq(`id`,e.id).single();return r?(console.error(`Error fetching profile:`,r),null):n}async function d({username:e,password:n,displayName:r}){let i=`${e}@k0app.com`,{data:a,error:o}=await t.auth.signUp({email:i,password:n,options:{data:{username:e,display_name:r}}});if(o)throw o;if(a?.user){let{error:n}=await t.from(`profiles`).insert({id:a.user.id,username:e,display_name:r||e});n&&console.error(`Error creating profile:`,n)}return a}async function f({username:e,password:n}){let r=`${e}@k0app.com`,{data:i,error:a}=await t.auth.signInWithPassword({email:r,password:n});if(a)throw a;return i}async function p(){let{error:e}=await t.auth.signOut();if(e)throw e}async function m(e,n){let{data:r,error:i}=await t.from(`profiles`).update(n).eq(`id`,e).select().single();if(i)throw i;return r}async function h(e){e.innerHTML=`
    <div class="auth-container">
      <div class="auth-inner">
        <!-- Left: Branding -->
        <div class="auth-branding">
          <h1 class="auth-logo">k0.</h1>
          <p class="auth-tagline">leave your mark.</p>
        </div>

        <!-- Right: Auth Options -->
        <div class="auth-form-section" id="auth-form-section">
          <!-- Step 1: Choice buttons -->
          <div class="auth-choice" id="auth-choice">
            <button class="auth-choice-btn" id="btn-create">create account.</button>
            <button class="auth-choice-btn" id="btn-login">i have an account.</button>
          </div>

          <!-- Step 2: Create Account Form (hidden initially) -->
          <form class="auth-form auth-form--hidden" id="signup-form">
            <button type="button" class="auth-back-btn" id="back-create">← create account.</button>
            <input
              type="text"
              class="input-control"
              id="signup-username"
              placeholder="username."
              required
              pattern="[a-zA-Z0-9_]+"
              maxlength="20"
              autocomplete="username"
            />
            <div class="password-wrapper">
              <input
                type="password"
                class="input-control"
                id="signup-password"
                placeholder="password."
                required
                minlength="6"
                autocomplete="new-password"
              />
              <button type="button" class="show-pass-btn" data-target="signup-password">show.</button>
            </div>
            <div class="auth-error" id="signup-error"></div>
            <button type="submit" class="submit-btn" id="signup-btn">go.</button>
          </form>

          <!-- Step 3: Login Form (hidden initially) -->
          <form class="auth-form auth-form--hidden" id="login-form">
            <button type="button" class="auth-back-btn" id="back-login">← i have an account.</button>
            <input
              type="text"
              class="input-control"
              id="login-username"
              placeholder="username."
              required
              autocomplete="username"
            />
            <div class="password-wrapper">
              <input
                type="password"
                class="input-control"
                id="login-password"
                placeholder="password."
                required
                autocomplete="current-password"
              />
              <button type="button" class="show-pass-btn" data-target="login-password">show.</button>
            </div>
            <div class="auth-error" id="login-error"></div>
            <button type="submit" class="submit-btn" id="login-btn">go.</button>
          </form>
        </div>
      </div>
    </div>
  `;let t=document.getElementById(`auth-choice`),n=document.getElementById(`signup-form`),r=document.getElementById(`login-form`);document.getElementById(`btn-create`).addEventListener(`click`,()=>{t.classList.add(`auth-choice--hidden`),n.classList.remove(`auth-form--hidden`)}),document.getElementById(`btn-login`).addEventListener(`click`,()=>{t.classList.add(`auth-choice--hidden`),r.classList.remove(`auth-form--hidden`)}),document.getElementById(`back-create`).addEventListener(`click`,()=>{n.classList.add(`auth-form--hidden`),t.classList.remove(`auth-choice--hidden`),document.getElementById(`signup-error`).textContent=``,document.getElementById(`signup-error`).classList.remove(`visible`)}),document.getElementById(`back-login`).addEventListener(`click`,()=>{r.classList.add(`auth-form--hidden`),t.classList.remove(`auth-choice--hidden`),document.getElementById(`login-error`).textContent=``,document.getElementById(`login-error`).classList.remove(`visible`)}),document.querySelectorAll(`.show-pass-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-target`),n=document.getElementById(t);n.type===`password`?(n.type=`text`,e.textContent=`hide.`):(n.type=`password`,e.textContent=`show.`)})}),n.addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`signup-error`),n=document.getElementById(`signup-btn`);t.textContent=``,t.classList.remove(`visible`),n.disabled=!0,n.innerHTML=`<span class="spinner"></span>`;try{let e=document.getElementById(`signup-username`).value.trim();await d({username:e,password:document.getElementById(`signup-password`).value,displayName:e}),a(`/paint`)}catch(e){t.textContent=e.message,t.classList.add(`visible`)}finally{n.disabled=!1,n.innerHTML=`go.`}}),r.addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`login-error`),n=document.getElementById(`login-btn`);t.textContent=``,t.classList.remove(`visible`),n.disabled=!0,n.innerHTML=`<span class="spinner"></span>`;try{await f({username:document.getElementById(`login-username`).value.trim(),password:document.getElementById(`login-password`).value}),a(`/paint`)}catch(e){t.textContent=e.message,t.classList.add(`visible`)}finally{n.disabled=!1,n.innerHTML=`go.`}})}var g={paintbrush:{},pencil:{},marker:{},spray:{},crayon:{},glitter:{},eraser:{},rainbow:{},neon:{}};function _(e,t,n){return{x:e.x,y:e.y}}function v(e,t,n=.5){return{x:e,y:t,pressure:n,phase:Math.random()*Math.PI*2,timestamp:performance.now()}}var y=class{constructor(e){this.renderCallback=e,this.running=!1,this.startTime=0,this._frameId=null}start(){this.running||(this.running=!0,this.startTime=performance.now()/1e3)}stop(){this.running=!1,this._frameId&&=(cancelAnimationFrame(this._frameId),null)}requestRender(){this.running&&(this._frameId||=requestAnimationFrame(()=>{if(this._frameId=null,!this.running)return;let e=performance.now()/1e3-this.startTime;this.renderCallback(e)}))}};function b(e){return{r:parseInt(e.slice(1,3),16),g:parseInt(e.slice(3,5),16),b:parseInt(e.slice(5,7),16)}}function x(e,t,n){t/=100,n/=100;let r=t*Math.min(n,1-n),i=t=>{let i=(t+e/30)%12,a=n-r*Math.max(Math.min(i-3,9-i,1),-1);return Math.round(255*a).toString(16).padStart(2,`0`)};return`#${i(0)}${i(8)}${i(4)}`}function S(e){let t=e;return()=>(t=(t*16807+0)%2147483647,(t-1)/2147483646)}function C(e,{viewBox:t=`0 0 24 24`,strokeWidth:n=`2`}={}){return`<svg width="18" height="18" viewBox="${t}" fill="none" stroke="currentColor" stroke-width="${n}" stroke-linecap="round" stroke-linejoin="round">${e}</svg>`}var w={paintbrush:C(`<path d="M18.37 2.63a2.12 2.12 0 0 1 3 3L14 13l-4 1 1-4z"/><path d="M9 14.5A3.5 3.5 0 0 0 5.5 18c-1.2 0-2.7.5-3.5 1 .6-2 2-3.5 4-4a3.5 3.5 0 0 0 3-0.5z"/>`),pencil:C(`<path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>`),marker:C(`<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/>`),spray:C(`<rect x="9" y="9" width="6" height="13" rx="2"/><path d="M12 9V5"/><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="3" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="5" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="20" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="21" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="13" r="1" fill="currentColor" stroke="none"/><path d="M10 5h4"/>`),crayon:C(`<path d="M20 17V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12"/><path d="m4 17 4 4 4-4 4 4 4-4"/>`,{strokeWidth:`1.8`}),glitter:C(`<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/><circle cx="19" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="5" cy="19" r="1" fill="currentColor" stroke="none"/>`,{strokeWidth:`1.5`}),eraser:C(`<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>`),rainbow:C(`<path d="M2 18a10 10 0 0 1 20 0"/><path d="M5 18a7 7 0 0 1 14 0"/><path d="M8 18a4 4 0 0 1 8 0"/>`,{strokeWidth:`1.8`}),neon:C(`<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a6 6 0 0 0-6 6c0 2.22 1.21 4.16 3 5.19V15a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1.81c1.79-1.03 3-2.97 3-5.19a6 6 0 0 0-6-6z"/><line x1="4" y1="4" x2="5" y2="5"/><line x1="20" y1="4" x2="19" y2="5"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>`,{strokeWidth:`1.8`})},T={name:`paintbrush`,icon:w.paintbrush,label:`Paintbrush`,cursor:`crosshair`,wiggle:g.paintbrush,renderStroke(e,t,n,r,i,a){if(t.length<2)return;let{r:o,g:s,b:c}=b(n);for(let n=1;n<t.length;n++){let l=_(t[n-1],a,this.wiggle),u=_(t[n],a,this.wiggle),d=Math.hypot(u.x-l.x,u.y-l.y),f=Math.max(1,Math.floor(d/3));for(let a=0;a<=f;a++){let d=a/f,p=l.x+(u.x-l.x)*d,m=l.y+(u.y-l.y)*d,h=r*(t[n-1].pressure+(t[n].pressure-t[n-1].pressure)*d)*.5,g=e.createRadialGradient(p,m,0,p,m,h);g.addColorStop(0,`rgba(${o},${s},${c},${i*.6})`),g.addColorStop(.5,`rgba(${o},${s},${c},${i*.3})`),g.addColorStop(1,`rgba(${o},${s},${c},0)`),e.fillStyle=g,e.beginPath(),e.arc(p,m,h,0,Math.PI*2),e.fill()}}},renderPreview(e,t,n,r,i){let{r:a,g:o,b:s}=b(i),c=e.createRadialGradient(t,n,0,t,n,r*.5);c.addColorStop(0,`rgba(${a},${o},${s},0.4)`),c.addColorStop(1,`rgba(${a},${o},${s},0)`),e.fillStyle=c,e.beginPath(),e.arc(t,n,r*.5,0,Math.PI*2),e.fill()}},E=[T,{name:`pencil`,icon:w.pencil,label:`Pencil`,cursor:`crosshair`,wiggle:g.pencil,renderStroke(e,t,n,r,i,a){if(t.length<2)return;let{r:o,g:s,b:c}=b(n);e.strokeStyle=`rgba(${o},${s},${c},${i*.85})`,e.lineWidth=Math.max(1,r*.15),e.lineCap=`round`,e.lineJoin=`round`,e.beginPath();let l=_(t[0],a,this.wiggle);e.moveTo(l.x,l.y);for(let n=1;n<t.length;n++){let r=_(t[n],a,this.wiggle);e.lineTo(r.x,r.y)}e.stroke();let u=S(Math.floor(t[0].phase*1e4));for(let n=0;n<t.length;n+=2){let l=_(t[n],a,this.wiggle),d=Math.floor(r*.3);for(let t=0;t<d;t++){let t=l.x+(u()-.5)*r*.4,n=l.y+(u()-.5)*r*.4;e.fillStyle=`rgba(${o},${s},${c},${u()*i*.3})`,e.fillRect(t,n,1,1)}}},renderPreview(e,t,n,r,i){e.strokeStyle=i,e.lineWidth=Math.max(1,r*.15),e.beginPath(),e.arc(t,n,r*.1,0,Math.PI*2),e.stroke()}},{name:`marker`,icon:w.marker,label:`Marker`,cursor:`crosshair`,wiggle:g.marker,renderStroke(e,t,n,r,i,a){if(t.length<2)return;let{r:o,g:s,b:c}=b(n);for(let n=1;n<t.length;n++){let l=_(t[n-1],a,this.wiggle),u=_(t[n],a,this.wiggle),d=Math.atan2(u.y-l.y,u.x-l.x),f=r*.8,p=r*.25,m=Math.hypot(u.x-l.x,u.y-l.y),h=Math.max(1,Math.floor(m/2));for(let t=0;t<=h;t++){let n=t/h,r=l.x+(u.x-l.x)*n,a=l.y+(u.y-l.y)*n;e.save(),e.translate(r,a),e.rotate(d+.4),e.fillStyle=`rgba(${o},${s},${c},${i*.35})`,e.fillRect(-f/2,-p/2,f,p),e.restore()}}},renderPreview(e,t,n,r,i){let{r:a,g:o,b:s}=b(i);e.save(),e.translate(t,n),e.rotate(.4),e.fillStyle=`rgba(${a},${o},${s},0.35)`,e.fillRect(-r*.4,-r*.125,r*.8,r*.25),e.restore()}},{name:`spray`,icon:w.spray,label:`Spray Can`,cursor:`crosshair`,wiggle:g.spray,renderStroke(e,t,n,r,i,a){let{r:o,g:s,b:c}=b(n),l=r*.6;for(let n=0;n<t.length;n++){let u=_(t[n],a,this.wiggle),d=S(Math.floor(t[n].phase*1e5)+n),f=Math.floor(r*1.5);for(let r=0;r<f;r++){let f=d()*Math.PI*2,p=d()*l,m=u.x+Math.cos(f)*p,h=u.y+Math.sin(f)*p,g=Math.sin(a*2+t[n].phase+r)*1.5,_=m+Math.cos(f)*g,v=h+Math.sin(f)*g,y=i*(1-p/l)*.6,b=1+d()*1.5;e.fillStyle=`rgba(${o},${s},${c},${y})`,e.fillRect(_,v,b,b)}}},renderPreview(e,t,n,r,i){let{r:a,g:o,b:s}=b(i);e.strokeStyle=`rgba(${a},${o},${s},0.3)`,e.lineWidth=1,e.setLineDash([3,3]),e.beginPath(),e.arc(t,n,r*.6,0,Math.PI*2),e.stroke(),e.setLineDash([])}},{name:`crayon`,icon:w.crayon,label:`Crayon`,cursor:`crosshair`,wiggle:g.crayon,renderStroke(e,t,n,r,i,a){if(t.length<2)return;let{r:o,g:s,b:c}=b(n);for(let n=1;n<t.length;n++){let l=_(t[n-1],a,this.wiggle),u=_(t[n],a,this.wiggle),d=Math.hypot(u.x-l.x,u.y-l.y),f=Math.max(1,Math.floor(d/1.5)),p=S(Math.floor(t[n].phase*1e5)+n);for(let t=0;t<=f;t++){let n=t/f,a=l.x+(u.x-l.x)*n,d=l.y+(u.y-l.y)*n,m=4+Math.floor(r*.2);for(let t=0;t<m;t++){let t=a+(p()-.5)*r*.6,n=d+(p()-.5)*r*.6,l=i*(.3+p()*.4);p()>.7||(e.fillStyle=`rgba(${o},${s},${c},${l})`,e.fillRect(t,n,2+p()*3,1+p()*2))}}}},renderPreview(e,t,n,r,i){let{r:a,g:o,b:s}=b(i);e.fillStyle=`rgba(${a},${o},${s},0.4)`,e.fillRect(t-r*.3,n-r*.3,r*.6,r*.6)}},{name:`glitter`,icon:w.glitter,label:`Glitter Pen`,cursor:`crosshair`,wiggle:g.glitter,renderStroke(e,t,n,r,i,a){if(t.length<2)return;let{r:o,g:s,b:c}=b(n);e.strokeStyle=`rgba(${o},${s},${c},${i*.5})`,e.lineWidth=Math.max(1,r*.1),e.lineCap=`round`,e.beginPath();let l=_(t[0],a,this.wiggle);e.moveTo(l.x,l.y);for(let n=1;n<t.length;n++){let r=_(t[n],a,this.wiggle);e.lineTo(r.x,r.y)}e.stroke();for(let n=0;n<t.length;n+=1){let o=_(t[n],a,this.wiggle),s=S(Math.floor(t[n].phase*1e5)+n),c=3+Math.floor(r*.15);for(let l=0;l<c;l++){let c=o.x+(s()-.5)*r*.8,u=o.y+(s()-.5)*r*.8,d=Math.sin(a*8+t[n].phase*3+l*1.7),f=i*Math.max(0,d*.6+.3),p=b(x((t[n].phase*180/Math.PI+a*50+l*30)%360,80,60)),m=1.5+s()*2.5;e.fillStyle=`rgba(${p.r},${p.g},${p.b},${f})`,e.beginPath(),e.moveTo(c,u-m),e.lineTo(c+m*.3,u),e.lineTo(c,u+m),e.lineTo(c-m*.3,u),e.closePath(),e.fill(),e.beginPath(),e.moveTo(c-m,u),e.lineTo(c,u+m*.3),e.lineTo(c+m,u),e.lineTo(c,u-m*.3),e.closePath(),e.fill()}}},renderPreview(e,t,n,r,i){e.fillStyle=i;let a=r*.3;e.beginPath(),e.moveTo(t,n-a),e.lineTo(t+a*.3,n),e.lineTo(t,n+a),e.lineTo(t-a*.3,n),e.closePath(),e.fill()}},{name:`eraser`,icon:w.eraser,label:`Eraser`,cursor:`crosshair`,wiggle:g.eraser,isEraser:!0,renderStroke(e,t,n,r,i,a){if(!(t.length<2)){e.globalCompositeOperation=`destination-out`;for(let n=1;n<t.length;n++){let i=_(t[n-1],a,this.wiggle),o=_(t[n],a,this.wiggle),s=Math.hypot(o.x-i.x,o.y-i.y),c=Math.max(1,Math.floor(s/3));for(let t=0;t<=c;t++){let n=t/c,a=i.x+(o.x-i.x)*n,s=i.y+(o.y-i.y)*n,l=e.createRadialGradient(a,s,0,a,s,r*.5);l.addColorStop(0,`rgba(255,255,255,1)`),l.addColorStop(.7,`rgba(255,255,255,0.5)`),l.addColorStop(1,`rgba(255,255,255,0)`),e.fillStyle=l,e.beginPath(),e.arc(a,s,r*.5,0,Math.PI*2),e.fill()}}e.globalCompositeOperation=`source-over`}},renderPreview(e,t,n,r,i){e.strokeStyle=`rgba(180,180,180,0.6)`,e.lineWidth=2,e.setLineDash([4,4]),e.beginPath(),e.arc(t,n,r*.5,0,Math.PI*2),e.stroke(),e.setLineDash([])}},{name:`rainbow`,icon:w.rainbow,label:`Rainbow`,cursor:`crosshair`,wiggle:g.rainbow,renderStroke(e,t,n,r,i,a){if(!(t.length<2)){e.lineWidth=r*.4,e.lineCap=`round`,e.lineJoin=`round`;for(let n=1;n<t.length;n++){let r=_(t[n-1],a,this.wiggle),o=_(t[n],a,this.wiggle),{r:s,g:c,b:l}=b(x((n/t.length*360+a*60)%360,85,55));e.strokeStyle=`rgba(${s},${c},${l},${i*.7})`,e.beginPath(),e.moveTo(r.x,r.y),e.lineTo(o.x,o.y),e.stroke()}}},renderPreview(e,t,n,r,i){let a=[0,30,60,120,200,270,320],o=r*.4;a.forEach((r,i)=>{let s=i/a.length*Math.PI*2,c=t+Math.cos(s)*o*.5,l=n+Math.sin(s)*o*.5;e.fillStyle=x(r,85,55),e.beginPath(),e.arc(c,l,3,0,Math.PI*2),e.fill()})}},{name:`neon`,icon:w.neon,label:`Neon`,cursor:`crosshair`,wiggle:g.neon,renderStroke(e,t,n,r,i,a){if(t.length<2)return;let{r:o,g:s,b:c}=b(n),l=.7+Math.sin(a*3)*.3;e.save(),e.shadowColor=n,e.shadowBlur=r*.8*l,e.strokeStyle=`rgba(${o},${s},${c},${i*.3*l})`,e.lineWidth=r*.5,e.lineCap=`round`,e.lineJoin=`round`,e.beginPath();let u=_(t[0],a,this.wiggle);e.moveTo(u.x,u.y);for(let n=1;n<t.length;n++){let r=_(t[n],a,this.wiggle);e.lineTo(r.x,r.y)}e.stroke(),e.restore(),e.save(),e.shadowColor=`rgba(255,255,255,0.8)`,e.shadowBlur=4*l,e.strokeStyle=`rgba(${Math.min(255,o+80)},${Math.min(255,s+80)},${Math.min(255,c+80)},${i*.9})`,e.lineWidth=Math.max(1,r*.12),e.lineCap=`round`,e.lineJoin=`round`,e.beginPath();let d=_(t[0],a,this.wiggle);e.moveTo(d.x,d.y);for(let n=1;n<t.length;n++){let r=_(t[n],a,this.wiggle);e.lineTo(r.x,r.y)}e.stroke(),e.restore()},renderPreview(e,t,n,r,i){e.save(),e.shadowColor=i,e.shadowBlur=r*.5,e.fillStyle=i,e.beginPath(),e.arc(t,n,r*.12,0,Math.PI*2),e.fill(),e.restore()}}];function D(e){return E.find(t=>t.name===e)||T}var O=class{constructor(e){this.canvas=e,this.ctx=e.getContext(`2d`),this.offscreenCanvas=document.createElement(`canvas`),this.offscreenCtx=this.offscreenCanvas.getContext(`2d`),this.myStrokes=[],this.otherStrokes=[],this.currentStroke=null,this.undoneStrokes=[],this.userId=null,this._loadUser(),this.currentTool=D(`paintbrush`),this.currentColor=`#FF6B6B`,this.brushSize=24,this.opacity=1,this.settings={showGrid:!0,bgColor:`#1a1a2e`,cursorPreview:!0},this.isDrawing=!1,this.lastX=0,this.lastY=0,this.cursorX=-100,this.cursorY=-100,this.showCursor=!1,this.zoom=1,this.panX=0,this.panY=0,this.isPanning=!1,this.panStartX=0,this.panStartY=0,this.panStartPanX=0,this.panStartPanY=0,this.spaceDown=!1,this._resize(),this._resizeHandler=()=>{this._resize(),this.requestRender()},window.addEventListener(`resize`,this._resizeHandler),this._setupPointerEvents(),this._setupZoomEvents(),this.animator=new y(e=>this._render(e)),this.animator.start(),this.requestRender(),this.onStrokeEnd=null,this.onToolChange=null,this._loadAllStrokes()}get strokes(){return[...this.otherStrokes,...this.myStrokes]}requestRender(){this.animator.requestRender()}async _loadUser(){try{let e=await l();this.userId=e?.id||null}catch(e){console.error(`Failed to load user:`,e)}}async _loadAllStrokes(){try{let{data:e,error:n}=await t.from(`drawings`).select(`id, user_id, stroke_data`).order(`created_at`,{ascending:!0});if(n){console.error(`Failed to load drawings:`,n);return}if(!e||e.length===0)return;if(!this.userId)try{let e=await l();this.userId=e?.id||null}catch{}for(let t of e){let e=t.stroke_data;e._dbId=t.id,e._userId=t.user_id,t.user_id===this.userId?this.myStrokes.push(e):this.otherStrokes.push(e)}this.requestRender()}catch(e){console.error(`Error loading strokes:`,e)}}async _saveStroke(e){if(this.userId)try{let{data:n,error:r}=await t.from(`drawings`).insert({user_id:this.userId,stroke_data:{tool:e.tool,color:e.color,size:e.size,opacity:e.opacity,points:e.points}}).select(`id`).single();if(r){console.error(`Failed to save stroke:`,r);return}e._dbId=n.id,e._userId=this.userId}catch(e){console.error(`Error saving stroke:`,e)}}async _deleteStrokeFromDb(e){if(e._dbId)try{await t.from(`drawings`).delete().eq(`id`,e._dbId)}catch(e){console.error(`Error deleting stroke:`,e)}}async deleteMyStrokes(){if(this.userId){try{await t.from(`drawings`).delete().eq(`user_id`,this.userId)}catch(e){console.error(`Error deleting all strokes:`,e)}this.myStrokes=[],this.undoneStrokes=[],this.currentStroke=null,this.requestRender()}}_resize(){let e=window.devicePixelRatio||1,t=window.innerWidth,n=window.innerHeight;this.canvas.width=t*e,this.canvas.height=n*e,this.canvas.style.width=`${t}px`,this.canvas.style.height=`${n}px`,this.offscreenCanvas.width=t*e,this.offscreenCanvas.height=n*e,this.ctx.scale(e,e),this.offscreenCtx.scale(e,e),this.width=t,this.height=n}screenToWorld(e,t){return{x:(e-this.panX)/this.zoom,y:(t-this.panY)/this.zoom}}worldToScreen(e,t){return{x:e*this.zoom+this.panX,y:t*this.zoom+this.panY}}_setupZoomEvents(){this.canvas.addEventListener(`wheel`,e=>{e.preventDefault();let t=this.canvas.getBoundingClientRect(),n=e.clientX-t.left,r=e.clientY-t.top,i=e.deltaY<0?1.1:.9,a=Math.max(.1,Math.min(10,this.zoom*i)),o=this.screenToWorld(n,r);this.zoom=a;let s=this.worldToScreen(o.x,o.y);this.panX+=n-s.x,this.panY+=r-s.y,this.requestRender()},{passive:!1}),this._spaceDownHandler=e=>{e.code===`Space`&&!e.repeat&&(e.preventDefault(),this.spaceDown=!0,this.canvas.style.cursor=`grab`)},this._spaceUpHandler=e=>{e.code===`Space`&&(this.spaceDown=!1,this.isPanning||(this.canvas.style.cursor=`crosshair`))},document.addEventListener(`keydown`,this._spaceDownHandler),document.addEventListener(`keyup`,this._spaceUpHandler)}_setupPointerEvents(){let e=this.canvas;e.addEventListener(`pointerdown`,e=>this._onPointerDown(e)),e.addEventListener(`pointermove`,e=>this._onPointerMove(e)),e.addEventListener(`pointerup`,e=>this._onPointerUp(e)),e.addEventListener(`pointerleave`,e=>this._onPointerLeave(e)),e.addEventListener(`pointerenter`,()=>{this.showCursor=!0}),e.addEventListener(`touchstart`,e=>e.preventDefault(),{passive:!1}),e.addEventListener(`touchmove`,e=>e.preventDefault(),{passive:!1}),e.addEventListener(`contextmenu`,e=>e.preventDefault())}_getPointerPos(e){let t=this.canvas.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top,pressure:e.pressure||.5}}_onPointerDown(e){if(e.target!==this.canvas)return;let{x:t,y:n,pressure:r}=this._getPointerPos(e);if(e.button===1||this.spaceDown&&e.button===0){this.isPanning=!0,this.panStartX=t,this.panStartY=n,this.panStartPanX=this.panX,this.panStartPanY=this.panY,this.canvas.style.cursor=`grabbing`,this.canvas.setPointerCapture(e.pointerId);return}this.isDrawing=!0;let i=this.screenToWorld(t,n);this.lastX=i.x,this.lastY=i.y;let a=v(i.x,i.y,r);this.currentStroke={tool:this.currentTool.name,color:this.currentColor,size:this.brushSize,opacity:this.opacity,points:[a]},this.undoneStrokes=[],this.canvas.setPointerCapture(e.pointerId),this.requestRender()}_onPointerMove(e){let{x:t,y:n,pressure:r}=this._getPointerPos(e);if(this.cursorX=t,this.cursorY=n,this.showCursor=!0,this.isPanning){this.panX=this.panStartPanX+(t-this.panStartX),this.panY=this.panStartPanY+(n-this.panStartY),this.requestRender();return}if(!this.isDrawing||!this.currentStroke){this.requestRender();return}let i=this.screenToWorld(t,n),a=i.x-this.lastX,o=i.y-this.lastY;if(Math.hypot(a,o)<2/this.zoom)return;let s=v(i.x,i.y,r);this.currentStroke.points.push(s),this.lastX=i.x,this.lastY=i.y,this.requestRender()}_onPointerUp(e){if(this.isPanning){this.isPanning=!1,this.canvas.style.cursor=this.spaceDown?`grab`:`crosshair`;return}this.isDrawing&&(this.isDrawing=!1,this.currentStroke&&this.currentStroke.points.length>1&&(this.myStrokes.push(this.currentStroke),this._saveStroke(this.currentStroke),this.onStrokeEnd&&this.onStrokeEnd(this.strokes.length)),this.currentStroke=null,this.requestRender())}_onPointerLeave(e){this.showCursor=!1,this.isPanning&&(this.isPanning=!1,this.canvas.style.cursor=`crosshair`),this.isDrawing&&this._onPointerUp(e),this.requestRender()}setTool(e){this.currentTool=D(e),this.onToolChange&&this.onToolChange(this.currentTool),this.requestRender()}setColor(e){this.currentColor=e}setBrushSize(e){this.brushSize=Math.max(2,Math.min(120,e)),this.requestRender()}setOpacity(e){this.opacity=Math.max(.05,Math.min(1,e))}undo(){if(this.myStrokes.length===0)return;let e=this.myStrokes.pop();this.undoneStrokes.push(e),this._deleteStrokeFromDb(e),this.requestRender()}redo(){if(this.undoneStrokes.length===0)return;let e=this.undoneStrokes.pop();this.myStrokes.push(e),this._saveStroke(e),this.requestRender()}canUndo(){return this.myStrokes.length>0}canRedo(){return this.undoneStrokes.length>0}clear(){this.deleteMyStrokes()}resetView(){this.zoom=1,this.panX=0,this.panY=0,this.requestRender()}_render(e){let t=this.ctx,n=this.offscreenCtx,r=this.width,i=this.height;t.clearRect(0,0,r,i),this._drawBackground(t,r,i),n.clearRect(0,0,r,i),n.save(),n.translate(this.panX,this.panY),n.scale(this.zoom,this.zoom);let a=this.strokes;for(let t of a)D(t.tool).renderStroke(n,t.points,t.color,t.size,t.opacity,e);this.currentStroke&&this.currentStroke.points.length>1&&D(this.currentStroke.tool).renderStroke(n,this.currentStroke.points,this.currentStroke.color,this.currentStroke.size,this.currentStroke.opacity,e),n.restore(),t.drawImage(this.offscreenCanvas,0,0,r,i),this.showCursor&&!this.isDrawing&&this.settings.cursorPreview&&this.currentTool.renderPreview(t,this.cursorX,this.cursorY,this.brushSize*this.zoom,this.currentColor),Math.abs(this.zoom-1)>.01&&(t.fillStyle=`rgba(255,255,255,0.15)`,t.font=`600 11px Inter, sans-serif`,t.textAlign=`left`,t.fillText(`${Math.round(this.zoom*100)}%`,16,i-16))}_drawBackground(e,t,n){if(e.fillStyle=this.settings.bgColor,e.fillRect(0,0,t,n),!this.settings.showGrid)return;let r=30*this.zoom;if(r<8)return;let i=this.panX%r,a=this.panY%r;e.fillStyle=`rgba(255,255,255,0.03)`;for(let o=i;o<t;o+=r)for(let t=a;t<n;t+=r)e.beginPath(),e.arc(o,t,Math.min(1.5,.8*this.zoom),0,Math.PI*2),e.fill()}pickColor(e,t){let n=window.devicePixelRatio||1,r=this.offscreenCtx.getImageData(e*n,t*n,1,1).data;return r[3]===0?this.settings.bgColor:`#`+r[0].toString(16).padStart(2,`0`)+r[1].toString(16).padStart(2,`0`)+r[2].toString(16).padStart(2,`0`)}destroy(){this.animator.stop(),window.removeEventListener(`resize`,this._resizeHandler),document.removeEventListener(`keydown`,this._spaceDownHandler),document.removeEventListener(`keyup`,this._spaceUpHandler)}},k=`#FF6B6B.#FF8E53.#FEC89A.#FFD93D.#6BCB77.#4D96FF.#9B5DE5.#F15BB5.#FFB5B5.#FFDAB9.#FFF3B0.#B5EAD7.#B5D5FF.#D5B5FF.#FFB5E8.#C4FAF8.#E63946.#F77F00.#2EC4B6.#118AB2.#073B4C.#7209B7.#F72585.#4CC9F0.#FFFFFF.#E0E0E0.#A0A0A0.#606060.#303030.#1A1A1A.#000000.#2D2D44`.split(`.`),A=class{constructor(e,t){this.container=e,this.onChange=t,this.currentColor=`#FF6B6B`,this.recentColors=[],this.isOpen=!1,this._build()}_build(){this.el=document.createElement(`div`),this.el.className=`color-picker`,this.el.innerHTML=`
      <button class="color-picker__trigger" id="color-trigger">
        <span class="color-picker__swatch" id="color-swatch"></span>
      </button>
      <div class="color-picker__popup color-picker__popup--hidden" id="color-popup">
        <div class="color-picker__section">
          <div class="color-picker__grid" id="color-grid"></div>
        </div>
        <div class="color-picker__section" id="recent-section" style="display:none">
          <span class="color-picker__label">recent.</span>
          <div class="color-picker__recent" id="recent-grid"></div>
        </div>
        <div class="color-picker__section">
          <label class="color-picker__custom-label">
            custom.
            <input type="color" class="color-picker__native" id="color-native" value="${this.currentColor}" />
          </label>
        </div>
      </div>
    `,this.container.appendChild(this.el);let e=this.el.querySelector(`#color-grid`);k.forEach(t=>{let n=document.createElement(`button`);n.className=`color-picker__cell`,n.style.background=t,n.title=t,n.setAttribute(`data-color`,t),n.addEventListener(`click`,()=>this.selectColor(t)),e.appendChild(n)}),this.swatch=this.el.querySelector(`#color-swatch`),this._updateSwatch(),this.el.querySelector(`#color-trigger`).addEventListener(`click`,e=>{e.stopPropagation(),this.toggle()}),this.el.querySelector(`#color-native`).addEventListener(`input`,e=>{this.selectColor(e.target.value)}),this._outsideHandler=e=>{this.isOpen&&!this.el.contains(e.target)&&this.close()},document.addEventListener(`pointerdown`,this._outsideHandler)}selectColor(e){this.currentColor=e,this._updateSwatch(),this._addRecent(e),this.onChange(e);let t=this.el.querySelector(`#color-native`);t&&(t.value=e),this.el.querySelectorAll(`.color-picker__cell`).forEach(t=>{t.classList.toggle(`active`,t.getAttribute(`data-color`)===e)})}_updateSwatch(){this.swatch.style.background=this.currentColor}_addRecent(e){k.includes(e)||(this.recentColors=this.recentColors.filter(t=>t!==e),this.recentColors.unshift(e),this.recentColors.length>8&&this.recentColors.pop(),this._renderRecent())}_renderRecent(){let e=this.el.querySelector(`#recent-section`),t=this.el.querySelector(`#recent-grid`);if(this.recentColors.length===0){e.style.display=`none`;return}e.style.display=``,t.innerHTML=``,this.recentColors.forEach(e=>{let n=document.createElement(`button`);n.className=`color-picker__cell color-picker__cell--recent`,n.style.background=e,n.title=e,n.addEventListener(`click`,()=>this.selectColor(e)),t.appendChild(n)})}toggle(){this.isOpen?this.close():this.open()}open(){this.isOpen=!0,this.el.querySelector(`#color-popup`).classList.remove(`color-picker__popup--hidden`)}close(){this.isOpen=!1,this.el.querySelector(`#color-popup`).classList.add(`color-picker__popup--hidden`)}setColor(e){this.currentColor=e,this._updateSwatch();let t=this.el.querySelector(`#color-native`);t&&(t.value=e)}destroy(){document.removeEventListener(`pointerdown`,this._outsideHandler),this.el.remove()}};function j(e,t,n){let r=document.createElement(`div`);return r.className=`modal-overlay`,r.id=e,r.innerHTML=`
    <div class="modal">
      <div class="modal__header">
        <h2 class="modal__title">${t}</h2>
        <button class="modal__close" id="${e}-close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="modal__body">${n}</div>
    </div>
  `,r.addEventListener(`pointerdown`,t=>{t.target===r&&M(e)}),r.querySelector(`#${e}-close`).addEventListener(`click`,()=>M(e)),r.addEventListener(`pointerdown`,e=>e.stopPropagation()),document.body.appendChild(r),r}function M(e){let t=document.getElementById(e);t&&t.remove()}async function N(){let e=await l(),t=await u(),n=t?.username||e?.user_metadata?.username||`unknown`,r=t?.display_name||n,i=t?.bio||``,a=t?.created_at?new Date(t.created_at).toLocaleDateString(`en-US`,{month:`long`,year:`numeric`}):``,o=j(`profile-modal`,`profile.`,`
    <div class="profile-card">
      <div class="profile-card__info">
        <span class="profile-card__username">@${n}</span>
        <span class="profile-card__display">${r}</span>
        ${a?`<span class="profile-card__joined">joined ${a}</span>`:``}
      </div>
    </div>
    <div class="modal__field">
      <label class="modal__label" for="profile-display-name">display name.</label>
      <input type="text" class="modal__input" id="profile-display-name" value="${r}" maxlength="30" placeholder="your display name." />
    </div>
    <div class="modal__field">
      <label class="modal__label" for="profile-bio">bio.</label>
      <textarea class="modal__textarea" id="profile-bio" maxlength="160" rows="3" placeholder="tell the world about yourself.">${i}</textarea>
      <span class="modal__char-count" id="bio-char-count">${i.length}/160</span>
    </div>
    <div class="modal__actions">
      <button class="modal__btn modal__btn--primary" id="profile-save">save.</button>
      <span class="modal__status" id="profile-status"></span>
    </div>
  `),s=o.querySelector(`#profile-bio`),c=o.querySelector(`#bio-char-count`);s.addEventListener(`input`,()=>{c.textContent=`${s.value.length}/160`}),o.querySelector(`#profile-save`).addEventListener(`click`,async()=>{let t=o.querySelector(`#profile-status`),r=o.querySelector(`#profile-save`),i=o.querySelector(`#profile-display-name`).value.trim(),a=s.value.trim();r.disabled=!0,r.textContent=`saving...`,t.textContent=``;try{await m(e.id,{display_name:i||n,bio:a}),t.textContent=`saved!`,t.style.color=`#6BCB77`,r.textContent=`save.`,r.disabled=!1}catch(e){t.textContent=e.message||`failed to save.`,t.style.color=`#FF6B6B`,r.textContent=`save.`,r.disabled=!1}})}function P(e){let t=j(`settings-modal`,`settings.`,`
    <div class="settings-group">
      <span class="settings-group__title">canvas.</span>
      <div class="settings-row">
        <label class="settings-row__label" for="setting-grid">show grid.</label>
        <label class="settings-toggle">
          <input type="checkbox" id="setting-grid" ${e.settings.showGrid?`checked`:``} />
          <span class="settings-toggle__slider"></span>
        </label>
      </div>
      <div class="settings-row">
        <label class="settings-row__label" for="setting-cursor">cursor preview.</label>
        <label class="settings-toggle">
          <input type="checkbox" id="setting-cursor" ${e.settings.cursorPreview?`checked`:``} />
          <span class="settings-toggle__slider"></span>
        </label>
      </div>
      <div class="settings-row">
        <label class="settings-row__label" for="setting-bg">background color.</label>
        <input type="color" class="settings-color" id="setting-bg" value="${e.settings.bgColor}" />
      </div>
    </div>
    <div class="settings-group">
      <span class="settings-group__title">view.</span>
      <div class="settings-row">
        <label class="settings-row__label">zoom level.</label>
        <span class="settings-row__value" id="setting-zoom-val">${Math.round(e.zoom*100)}%</span>
      </div>
      <div class="settings-row">
        <button class="modal__btn modal__btn--secondary" id="setting-reset-view">reset view.</button>
      </div>
    </div>
    <div class="settings-group">
      <span class="settings-group__title">data.</span>
      <div class="settings-row">
        <button class="modal__btn modal__btn--secondary" id="setting-export">export as png.</button>
      </div>
      <div class="settings-row">
        <label class="settings-row__label">strokes.</label>
        <span class="settings-row__value">${e.strokes.length}</span>
      </div>
    </div>
    <div class="settings-group">
      <span class="settings-group__title">shortcuts.</span>
      <div class="settings-shortcut"><kbd>1</kbd>–<kbd>9</kbd> select tool</div>
      <div class="settings-shortcut"><kbd>ctrl</kbd>+<kbd>z</kbd> undo</div>
      <div class="settings-shortcut"><kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>z</kbd> redo</div>
      <div class="settings-shortcut"><kbd>[</kbd> <kbd>]</kbd> brush size</div>
      <div class="settings-shortcut"><kbd>scroll</kbd> zoom</div>
      <div class="settings-shortcut"><kbd>space</kbd>+<kbd>drag</kbd> pan</div>
      <div class="settings-shortcut"><kbd>middle click</kbd> pan</div>
    </div>
  `);t.querySelector(`#setting-grid`).addEventListener(`change`,t=>{e.settings.showGrid=t.target.checked,e.requestRender()}),t.querySelector(`#setting-cursor`).addEventListener(`change`,t=>{e.settings.cursorPreview=t.target.checked,e.requestRender()}),t.querySelector(`#setting-bg`).addEventListener(`input`,t=>{e.settings.bgColor=t.target.value,e.requestRender()}),t.querySelector(`#setting-reset-view`).addEventListener(`click`,()=>{e.resetView(),t.querySelector(`#setting-zoom-val`).textContent=`100%`}),t.querySelector(`#setting-export`).addEventListener(`click`,()=>{let t=document.createElement(`a`);t.download=`k0-canvas-${Date.now()}.png`,t.href=e.canvas.toDataURL(`image/png`),t.click()})}function F(e){let t=j(`confirm-delete-modal`,``,`
    <div class="confirm-delete">
      <div class="confirm-delete__icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <p class="confirm-delete__text">delete all your drawings?<br><span class="confirm-delete__subtext">this can't be undone.</span></p>
      <div class="confirm-delete__actions">
        <button class="modal__btn modal__btn--danger-fill" id="confirm-delete-yes">delete.</button>
        <button class="modal__btn modal__btn--secondary" id="confirm-delete-no">cancel.</button>
      </div>
    </div>
  `),n=t.querySelector(`.modal__header`);n&&(n.style.display=`none`),t.querySelector(`#confirm-delete-yes`).addEventListener(`click`,()=>{M(`confirm-delete-modal`),e&&e()}),t.querySelector(`#confirm-delete-no`).addEventListener(`click`,()=>{M(`confirm-delete-modal`)})}var I=class{constructor(e,t){this.container=e,this.engine=t,this.activeTool=t.currentTool.name,this._build(),this._setupKeyboard()}_build(){this.el=document.createElement(`div`),this.el.className=`toolbar`,this.el.id=`paint-toolbar`,this.el.addEventListener(`pointerdown`,e=>e.stopPropagation()),this.el.innerHTML=`
      <div class="toolbar__brand" style="position: relative;">
        <button class="toolbar__logo-btn" id="logo-trigger">
          <span class="toolbar__logo">k0.</span>
        </button>
        <div class="toolbar__menu toolbar__menu--hidden" id="logo-menu">
          <button class="toolbar__menu-item" id="menu-profile">profile.</button>
          <button class="toolbar__menu-item" id="menu-settings">settings.</button>
          <div class="toolbar__menu-divider"></div>
          <button class="toolbar__menu-item toolbar__menu-item--danger" id="menu-signout">sign out.</button>
        </div>
      </div>
      <div class="toolbar__divider"></div>
      <div class="toolbar__tools" id="toolbar-tools"></div>
      <div class="toolbar__divider"></div>
      <div class="toolbar__colors" id="toolbar-colors"></div>
      <div class="toolbar__divider"></div>
      <div class="toolbar__sliders">
        <div class="toolbar__slider-group">
          <label class="toolbar__slider-label" for="brush-size">size.</label>
          <input type="range" class="toolbar__slider" id="brush-size" 
            min="2" max="120" value="${this.engine.brushSize}" />
          <span class="toolbar__slider-value" id="brush-size-val">${this.engine.brushSize}</span>
        </div>
        <div class="toolbar__slider-group">
          <label class="toolbar__slider-label" for="brush-opacity">opacity.</label>
          <input type="range" class="toolbar__slider" id="brush-opacity" 
            min="5" max="100" value="${Math.round(this.engine.opacity*100)}" />
          <span class="toolbar__slider-value" id="brush-opacity-val">${Math.round(this.engine.opacity*100)}%</span>
        </div>
      </div>
      <div class="toolbar__divider"></div>
      <div class="toolbar__actions">
        <button class="toolbar__btn toolbar__btn--action" id="btn-undo" title="undo (ctrl+z)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
        </button>
        <button class="toolbar__btn toolbar__btn--action" id="btn-redo" title="redo (ctrl+shift+z)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"></path></svg>
        </button>
        <button class="toolbar__btn toolbar__btn--action toolbar__btn--danger" id="btn-clear" title="delete your drawings">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `,this.container.appendChild(this.el);let e=this.el.querySelector(`#toolbar-tools`);E.forEach((t,n)=>{let r=document.createElement(`button`);r.className=`toolbar__btn toolbar__btn--tool`,r.id=`tool-${t.name}`,r.title=`${t.label} (${n+1})`,r.innerHTML=`<span class="toolbar__tool-icon">${t.icon}</span>`,t.name===this.activeTool&&r.classList.add(`active`),r.addEventListener(`click`,()=>this.selectTool(t.name)),e.appendChild(r)});let t=this.el.querySelector(`#toolbar-colors`);this.colorPicker=new A(t,e=>{this.engine.setColor(e)});let n=this.el.querySelector(`#brush-size`),r=this.el.querySelector(`#brush-size-val`);n.addEventListener(`input`,e=>{let t=parseInt(e.target.value);this.engine.setBrushSize(t),r.textContent=t});let i=this.el.querySelector(`#brush-opacity`),a=this.el.querySelector(`#brush-opacity-val`);i.addEventListener(`input`,e=>{let t=parseInt(e.target.value);this.engine.setOpacity(t/100),a.textContent=`${t}%`}),this.el.querySelector(`#btn-undo`).addEventListener(`click`,()=>this.engine.undo()),this.el.querySelector(`#btn-redo`).addEventListener(`click`,()=>this.engine.redo()),this.el.querySelector(`#btn-clear`).addEventListener(`click`,()=>{this.engine.myStrokes.length!==0&&F(()=>{this.engine.clear()})});let o=this.el.querySelector(`#logo-menu`);this.el.querySelector(`#logo-trigger`).addEventListener(`click`,e=>{e.stopPropagation(),o.classList.toggle(`toolbar__menu--hidden`)}),this._menuOutsideHandler=e=>{!o.classList.contains(`toolbar__menu--hidden`)&&!this.el.querySelector(`.toolbar__brand`).contains(e.target)&&o.classList.add(`toolbar__menu--hidden`)},document.addEventListener(`pointerdown`,this._menuOutsideHandler),this.el.querySelector(`#menu-profile`).addEventListener(`click`,()=>{o.classList.add(`toolbar__menu--hidden`),this.onProfile&&this.onProfile()}),this.el.querySelector(`#menu-settings`).addEventListener(`click`,()=>{o.classList.add(`toolbar__menu--hidden`),this.onSettings&&this.onSettings()}),this.signOutBtn=this.el.querySelector(`#menu-signout`),this._startToolWiggle()}selectTool(e){this.activeTool=e,this.engine.setTool(e),this.el.querySelectorAll(`.toolbar__btn--tool`).forEach(t=>{t.classList.toggle(`active`,t.id===`tool-${e}`)})}_startToolWiggle(){this.el.querySelectorAll(`.toolbar__tool-icon`).forEach((e,t)=>{e.style.animationDelay=`${t*.12}s`})}_setupKeyboard(){this._keyHandler=e=>{if(e.key>=`1`&&e.key<=`9`&&!e.ctrlKey&&!e.metaKey){let t=parseInt(e.key)-1;t<E.length&&this.selectTool(E[t].name)}if((e.ctrlKey||e.metaKey)&&e.key===`z`&&!e.shiftKey&&(e.preventDefault(),this.engine.undo()),(e.ctrlKey||e.metaKey)&&(e.key===`Z`||e.key===`y`)&&(e.preventDefault(),this.engine.redo()),e.key===`[`){let e=Math.max(2,this.engine.brushSize-4);this.engine.setBrushSize(e),this.el.querySelector(`#brush-size`).value=e,this.el.querySelector(`#brush-size-val`).textContent=e}if(e.key===`]`){let e=Math.min(120,this.engine.brushSize+4);this.engine.setBrushSize(e),this.el.querySelector(`#brush-size`).value=e,this.el.querySelector(`#brush-size-val`).textContent=e}},document.addEventListener(`keydown`,this._keyHandler)}onSignOut(e){this.signOutBtn.addEventListener(`click`,()=>{this.el.querySelector(`#logo-menu`).classList.add(`toolbar__menu--hidden`),e()})}onProfileClick(e){this.onProfile=e}onSettingsClick(e){this.onSettings=e}destroy(){document.removeEventListener(`keydown`,this._keyHandler),document.removeEventListener(`pointerdown`,this._menuOutsideHandler),this.colorPicker.destroy(),this.el.remove()}};async function L(e){e.innerHTML=`
    <div class="paint-page" id="paint-page">
      <canvas class="paint-canvas" id="paint-canvas"></canvas>
      <div class="paint-toolbar-container" id="paint-toolbar-container"></div>
      <div class="paint-watermark">k0.</div>
    </div>
  `;let t=document.getElementById(`paint-canvas`),n=document.getElementById(`paint-toolbar-container`),r=new O(t),i=new I(n,r);return i.onProfileClick(()=>N()),i.onSettingsClick(()=>P(r)),i.onSignOut(async()=>{try{await p(),a(`/auth`)}catch(e){console.error(`Sign out error:`,e)}}),()=>{r.destroy(),i.destroy()}}i(`/auth`,h),i(`/paint`,L),i(`/`,async e=>{let{data:{session:n}}=await t.auth.getSession();a(n?`/paint`:`/auth`)}),c();