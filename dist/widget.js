var AIML=(()=>{var _=class{constructor(e,i){this.apiUrl=e.replace(/\/$/,""),this.apiKey=i,this._abortController=null}async captureLead(e,i,t){if(!(await fetch(`${this.apiUrl}/v1/leads`,{method:"POST",headers:{"Content-Type":"application/json","X-Api-Key":this.apiKey},body:JSON.stringify({websiteId:e,email:i,question:t,visitorId:null})})).ok)throw new Error("lead capture failed")}abort(){this._abortController&&(this._abortController.abort(),this._abortController=null)}async send(e,i,t,r,a){this.abort(),this._abortController=new AbortController;let{signal:d}=this._abortController,s=JSON.stringify({message:e,conversationId:t,visitorId:r,history:i.slice(-6)}),o;try{o=await fetch(`${this.apiUrl}/v1/chat`,{method:"POST",headers:{"Content-Type":"application/json","X-Api-Key":this.apiKey},body:s,signal:d})}catch(u){if(u.name==="AbortError")return;a.onError("network");return}if(o.status===401){a.onError("auth");return}if(o.status===402){a.onError("quota");return}if(o.status===429){let u=o.headers.get("Retry-After")||"60";a.onError("rateLimit",u);return}if(o.status===404){a.onError("noContent");return}if(!o.ok){a.onError("server");return}let m=o.body.getReader(),g=new TextDecoder,h="";try{for(;;){let{done:u,value:p}=await m.read();if(u)break;h+=g.decode(p,{stream:!0});let c=h.split(`
`);h=c.pop();for(let y of c){if(!y.startsWith("data: "))continue;let n=y.slice(6).trim();if(n==="[DONE]"){a.onDone();return}try{let f=JSON.parse(n);f.token!==void 0&&a.onToken(f.token),f.citations&&a.onCitations(f.citations)}catch{}}}}catch(u){u.name!=="AbortError"&&a.onError("stream")}}};var C=`:host {
  --aiml-primary: #2563eb;
  --aiml-primary-dark: #1d4ed8;
  --aiml-bg: #ffffff;
  --aiml-surface: #f8fafc;
  --aiml-border: #e2e8f0;
  --aiml-text: #0f172a;
  --aiml-text-muted: #64748b;
  --aiml-radius: 12px;
  --aiml-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08);
  --aiml-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --aiml-z: 2147483647;
  all: initial;
  font-family: var(--aiml-font);
  font-size: 14px;
  line-height: 1.5;
  color: var(--aiml-text);
}

*, *::before, *::after { box-sizing: border-box; }

/* Trigger button */
.aiml-trigger {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--aiml-primary);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(37,99,235,0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: var(--aiml-z);
  color: #fff;
  outline: none;
}
.aiml-trigger:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(37,99,235,0.5); }
.aiml-trigger:focus-visible { outline: 3px solid var(--aiml-primary); outline-offset: 3px; }
.aiml-trigger[aria-expanded="true"] .aiml-icon-open { display: none; }
.aiml-trigger[aria-expanded="false"] .aiml-icon-close { display: none; }

/* Chat window */
.aiml-window {
  position: fixed;
  bottom: 96px;
  right: 24px;
  width: 380px;
  max-width: calc(100vw - 48px);
  height: 560px;
  max-height: calc(100vh - 120px);
  background: var(--aiml-bg);
  border: 1px solid var(--aiml-border);
  border-radius: var(--aiml-radius);
  box-shadow: var(--aiml-shadow);
  display: flex;
  flex-direction: column;
  z-index: var(--aiml-z);
  overflow: hidden;
  transform-origin: bottom right;
  transition: opacity 0.2s, transform 0.2s;
}
.aiml-window.aiml-hidden {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
  pointer-events: none;
}
.aiml-window.aiml-left { right: auto; left: 24px; transform-origin: bottom left; }
.aiml-trigger.aiml-left { right: auto; left: 24px; }

/* Header */
.aiml-header {
  padding: 14px 16px;
  background: var(--aiml-primary);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.aiml-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.aiml-header-info { flex: 1; min-width: 0; }
.aiml-header-title { font-weight: 600; font-size: 14px; }
.aiml-header-subtitle { font-size: 11px; opacity: 0.85; }
.aiml-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  padding: 2px 6px;
  text-transform: uppercase;
  flex-shrink: 0;
}
.aiml-close-btn {
  background: none; border: none; color: rgba(255,255,255,0.8);
  cursor: pointer; padding: 4px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.aiml-close-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
.aiml-close-btn:focus-visible { outline: 2px solid rgba(255,255,255,0.6); }

/* Messages */
.aiml-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
}
.aiml-messages::-webkit-scrollbar { width: 4px; }
.aiml-messages::-webkit-scrollbar-thumb { background: var(--aiml-border); border-radius: 2px; }

.aiml-msg {
  display: flex;
  gap: 8px;
  max-width: 88%;
  animation: aiml-fade-in 0.2s ease;
}
@keyframes aiml-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.aiml-msg-user { align-self: flex-end; flex-direction: row-reverse; }
.aiml-msg-bubble {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}
.aiml-msg-user .aiml-msg-bubble {
  background: var(--aiml-primary);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.aiml-msg-bot .aiml-msg-bubble {
  background: var(--aiml-surface);
  color: var(--aiml-text);
  border: 1px solid var(--aiml-border);
  border-bottom-left-radius: 4px;
}

/* Markdown in bot bubbles */
.aiml-msg-bubble code {
  background: rgba(0,0,0,0.07);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 12px;
  font-family: 'Menlo', 'Consolas', monospace;
}
.aiml-msg-bubble pre {
  background: rgba(0,0,0,0.07);
  border-radius: 8px;
  padding: 10px 12px;
  overflow-x: auto;
  margin: 6px 0;
}
.aiml-msg-bubble pre code { background: none; padding: 0; }
.aiml-msg-bubble strong { font-weight: 600; }
.aiml-msg-bubble em { font-style: italic; }
.aiml-msg-bubble a { color: var(--aiml-primary); text-decoration: underline; }
.aiml-msg-user .aiml-msg-bubble a { color: rgba(255,255,255,0.9); }
.aiml-msg-bubble ul, .aiml-msg-bubble ol { padding-left: 18px; margin: 4px 0; }
.aiml-msg-bubble li { margin: 2px 0; }
.aiml-msg-bubble p { margin: 4px 0; }
.aiml-msg-bubble p:first-child { margin-top: 0; }
.aiml-msg-bubble p:last-child { margin-bottom: 0; }

/* Citations */
.aiml-citations {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--aiml-border);
  font-size: 12px;
  color: var(--aiml-text-muted);
}
.aiml-citations-title { font-weight: 600; margin-bottom: 4px; }
.aiml-citation-link {
  display: block;
  color: var(--aiml-primary);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 1px 0;
}
.aiml-citation-link:hover { text-decoration: underline; }

/* Typing indicator */
.aiml-typing { display: flex; gap: 4px; padding: 10px 14px; align-items: center; }
.aiml-typing span {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--aiml-text-muted);
  animation: aiml-bounce 1.2s ease infinite;
}
.aiml-typing span:nth-child(2) { animation-delay: 0.2s; }
.aiml-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes aiml-bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }

/* Input area */
.aiml-input-area {
  padding: 12px;
  border-top: 1px solid var(--aiml-border);
  display: flex;
  gap: 8px;
  align-items: flex-end;
  flex-shrink: 0;
  background: var(--aiml-bg);
}
.aiml-input {
  flex: 1;
  border: 1px solid var(--aiml-border);
  border-radius: 20px;
  padding: 9px 14px;
  font-size: 14px;
  font-family: var(--aiml-font);
  color: var(--aiml-text);
  background: var(--aiml-surface);
  resize: none;
  max-height: 120px;
  min-height: 38px;
  outline: none;
  transition: border-color 0.15s;
  line-height: 1.4;
}
.aiml-input::placeholder { color: var(--aiml-text-muted); }
.aiml-input:focus { border-color: var(--aiml-primary); background: var(--aiml-bg); }
.aiml-send-btn {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: var(--aiml-primary);
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  flex-shrink: 0;
  transition: background 0.15s, transform 0.15s;
}
.aiml-send-btn:hover { background: var(--aiml-primary-dark); }
.aiml-send-btn:focus-visible { outline: 3px solid var(--aiml-primary); outline-offset: 2px; }
.aiml-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* Footer / branding */
.aiml-footer {
  padding: 6px 12px;
  text-align: center;
  border-top: 1px solid var(--aiml-border);
  flex-shrink: 0;
}
.aiml-badge {
  font-size: 11px;
  color: var(--aiml-text-muted);
  text-decoration: none;
}
.aiml-badge:hover { color: var(--aiml-primary); }
.aiml-footer.aiml-no-brand { display: none; }

/* Error / status messages */
.aiml-status {
  text-align: center;
  padding: 8px 12px;
  font-size: 12px;
  border-radius: 8px;
  margin: 0 8px;
}
.aiml-status-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.aiml-status-info { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
.aiml-status-warn { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }

/* Lead capture form */
.aiml-lead-form { padding: 12px; background: #f8fafc; border-radius: 12px; margin: 4px 0; }
.aiml-lead-text { font-size: 13px; color: var(--aiml-text-muted); margin-bottom: 8px; }
.aiml-lead-row { display: flex; gap: 8px; }
.aiml-lead-email {
  flex: 1; padding: 8px 10px; border: 1px solid var(--aiml-border);
  border-radius: 8px; font-size: 13px; background: var(--aiml-bg); color: var(--aiml-text);
  outline: none;
}
.aiml-lead-email:focus { border-color: var(--aiml-primary); }
.aiml-lead-submit {
  padding: 8px 14px; background: var(--aiml-primary); color: #fff;
  border: none; border-radius: 8px; font-size: 13px; cursor: pointer; white-space: nowrap;
}
.aiml-lead-submit:hover { opacity: 0.9; }
.aiml-lead-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.aiml-lead-error { font-size: 12px; color: #dc2626; margin-top: 4px; }
.aiml-lead-success { font-size: 13px; color: #16a34a; margin-top: 4px; font-weight: 500; }
.aiml-hidden { display: none !important; }

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :host([data-theme="auto"]), :host([data-theme="dark"]) {
    --aiml-bg: #1e293b;
    --aiml-surface: #0f172a;
    --aiml-border: #334155;
    --aiml-text: #f1f5f9;
    --aiml-text-muted: #94a3b8;
    --aiml-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3);
  }
}
:host([data-theme="dark"]) {
  --aiml-bg: #1e293b;
  --aiml-surface: #0f172a;
  --aiml-border: #334155;
  --aiml-text: #f1f5f9;
  --aiml-text-muted: #94a3b8;
}
`;function A(l){if(!l)return"";let e=B(l);e=e.replace(/```(\w*)\n([\s\S]*?)```/g,(s,o,m)=>`<pre><code>${m.trimEnd()}</code></pre>`),e=e.replace(/`([^`]+)`/g,"<code>$1</code>"),e=e.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"),e=e.replace(/__(.+?)__/g,"<strong>$1</strong>"),e=e.replace(/\*([^*\n]+)\*/g,"<em>$1</em>"),e=e.replace(/_([^_\n]+)_/g,"<em>$1</em>"),e=e.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');let i=e.split(`
`),t=[],r=!1,a=!1;for(let s=0;s<i.length;s++){let o=i[s],m=o.match(/^(#{1,3}) (.+)/);if(m){d();let u=Math.min(m[1].length+2,6);t.push(`<h${u}>${m[2]}</h${u}>`);continue}let g=o.match(/^[-*] (.+)/);if(g){r||(t.push("<ul>"),r=!0),t.push(`<li>${g[1]}</li>`);continue}let h=o.match(/^\d+\. (.+)/);if(h){a||(t.push("<ol>"),a=!0),t.push(`<li>${h[1]}</li>`);continue}d(),o.trim()===""?t.push(""):t.push(`<p>${o}</p>`)}d();function d(){r&&(t.push("</ul>"),r=!1),a&&(t.push("</ol>"),a=!1)}return t.join(`
`).replace(/<\/p>\n<p>/g,"<br>").replace(/\n{2,}/g,`
`)}function B(l){return l.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}var v={chat:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',close:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',send:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',bot:"\u{1F916}"},E=class{constructor(e){this.config=e,this.host=null,this.shadow=null,this.isOpen=!1,this._streaming=!1,this._streamingEl=null,this._streamBuffer=""}mount(){this.host=document.createElement("div"),this.host.setAttribute("id","aiml-widget-host"),this.host.setAttribute("data-theme",this.config.theme||"auto"),document.body.appendChild(this.host),this.shadow=this.host.attachShadow({mode:"open"});let e=document.createElement("style");e.textContent=C,this.shadow.appendChild(e),this.config.primaryColor&&(e.textContent+=`:host { --aiml-primary: ${this.config.primaryColor}; }`),this.shadow.appendChild(this._buildTrigger()),this.shadow.appendChild(this._buildWindow()),this._bindEvents(),this._focusTrap()}_buildTrigger(){let e=document.createElement("button");return e.className=`aiml-trigger${this.config.position==="left"?" aiml-left":""}`,e.setAttribute("aria-label","Open AI chat assistant"),e.setAttribute("aria-expanded","false"),e.setAttribute("aria-controls","aiml-chat-window"),e.innerHTML=`
      <span class="aiml-icon-open" aria-hidden="true">${v.chat}</span>
      <span class="aiml-icon-close" aria-hidden="true">${v.close}</span>`,e}_buildWindow(){let e=document.createElement("div");return e.className=`aiml-window aiml-hidden${this.config.position==="left"?" aiml-left":""}`,e.setAttribute("id","aiml-chat-window"),e.setAttribute("role","dialog"),e.setAttribute("aria-label","AI Chat Assistant"),e.setAttribute("aria-modal","false"),e.innerHTML=`
      <div class="aiml-header">
        <div class="aiml-avatar" aria-hidden="true">${v.bot}</div>
        <div class="aiml-header-info">
          <div class="aiml-header-title">${w(this.config.title||"AI Assistant")}</div>
          <div class="aiml-header-subtitle">${w(this.config.subtitle||"Ask me anything")}</div>
        </div>
        <span class="aiml-label" title="Powered by AI">AI</span>
        <button class="aiml-close-btn" aria-label="Close chat">
          ${v.close}
        </button>
      </div>
      <div class="aiml-messages" role="log" aria-live="polite" aria-label="Chat messages"></div>
      <div class="aiml-input-area">
        <textarea
          class="aiml-input"
          placeholder="${w(this.config.placeholder||"Ask a question\u2026")}"
          rows="1"
          aria-label="Chat message input"
          aria-multiline="true"
        ></textarea>
        <button class="aiml-send-btn" aria-label="Send message" disabled>
          ${v.send}
        </button>
      </div>
      <div class="aiml-footer${this.config.showBranding===!1?" aiml-no-brand":""}">
        <a class="aiml-badge" href="https://aiml.chat" target="_blank" rel="noopener noreferrer" tabindex="${this.config.showBranding===!1?"-1":"0"}">
          Powered by aiml.chat
        </a>
      </div>`,e}_bindEvents(){let e=this.shadow,i=e.querySelector(".aiml-trigger"),t=e.querySelector(".aiml-close-btn"),r=e.querySelector(".aiml-input"),a=e.querySelector(".aiml-send-btn");i.addEventListener("click",()=>this.toggle()),t.addEventListener("click",()=>this.close()),r.addEventListener("input",()=>{a.disabled=!r.value.trim(),r.style.height="auto",r.style.height=Math.min(r.scrollHeight,120)+"px"}),r.addEventListener("keydown",s=>{s.key==="Enter"&&!s.shiftKey&&(s.preventDefault(),a.disabled||this._emitSend(r.value.trim()))}),a.addEventListener("click",()=>{a.disabled||this._emitSend(r.value.trim())}),e.addEventListener("keydown",s=>{s.key==="Escape"&&this.isOpen&&this.close()}),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{this.config.theme==="auto"&&this.host.setAttribute("data-theme","auto")})}_focusTrap(){let e=this.shadow;e.addEventListener("keydown",i=>{if(i.key!=="Tab"||!this.isOpen)return;let t=[...e.querySelectorAll('button:not([disabled]), textarea, a[href], [tabindex]:not([tabindex="-1"])')].filter(d=>!d.closest(".aiml-window.aiml-hidden"));if(!t.length)return;let r=t[0],a=t[t.length-1];i.shiftKey&&document.activeElement===r?(i.preventDefault(),a.focus()):!i.shiftKey&&document.activeElement===a&&(i.preventDefault(),r.focus())})}_emitSend(e){if(!e||this._streaming)return;let i=new CustomEvent("aiml:send",{detail:{text:e},bubbles:!0});this.host.dispatchEvent(i)}open(){if(this.isOpen)return;this.isOpen=!0;let e=this.shadow.querySelector(".aiml-window"),i=this.shadow.querySelector(".aiml-trigger");e.classList.remove("aiml-hidden"),i.setAttribute("aria-expanded","true"),i.setAttribute("aria-label","Close AI chat assistant"),setTimeout(()=>this.shadow.querySelector(".aiml-input")?.focus(),100),this.config.onOpen&&this.config.onOpen()}close(){if(!this.isOpen)return;this.isOpen=!1;let e=this.shadow.querySelector(".aiml-window"),i=this.shadow.querySelector(".aiml-trigger");e.classList.add("aiml-hidden"),i.setAttribute("aria-expanded","false"),i.setAttribute("aria-label","Open AI chat assistant"),i.focus(),this.config.onClose&&this.config.onClose()}toggle(){this.isOpen?this.close():this.open()}appendUserMessage(e){let i=this.shadow.querySelector(".aiml-messages"),t=document.createElement("div");return t.className="aiml-msg aiml-msg-user",t.setAttribute("role","article"),t.setAttribute("aria-label","You"),t.innerHTML=`<div class="aiml-msg-bubble">${L(e)}</div>`,i.appendChild(t),this._scrollToBottom(),t}startBotMessage(){let e=this.shadow.querySelector(".aiml-messages");this._streaming=!0,this._streamBuffer="";let i=document.createElement("div");i.className="aiml-msg aiml-msg-bot aiml-typing-indicator",i.setAttribute("aria-label","AI is typing"),i.innerHTML='<div class="aiml-msg-bubble"><div class="aiml-typing"><span></span><span></span><span></span></div></div>',e.appendChild(i),this._scrollToBottom(),this._streamingEl=null,this._typingEl=i;let t=this.shadow.querySelector(".aiml-input"),r=this.shadow.querySelector(".aiml-send-btn");return t.disabled=!0,r.disabled=!0,{typing:i}}appendToken(e){if(this._streaming){if(this._streamBuffer+=e,this._typingEl){this._typingEl.remove(),this._typingEl=null;let i=this.shadow.querySelector(".aiml-messages"),t=document.createElement("div");t.className="aiml-msg aiml-msg-bot",t.setAttribute("role","article"),t.setAttribute("aria-label","AI Assistant"),t.innerHTML='<div class="aiml-msg-bubble"></div>',i.appendChild(t),this._streamingEl=t.querySelector(".aiml-msg-bubble")}this._streamingEl&&(this._streamingEl.innerHTML=A(this._streamBuffer),this._scrollToBottom())}}finishBotMessage(e){if(this._streaming=!1,this._typingEl&&(this._typingEl.remove(),this._typingEl=null),this._streamingEl&&e?.length){let r=document.createElement("div");r.className="aiml-citations",r.innerHTML='<div class="aiml-citations-title">Sources</div>'+e.map(a=>`<a class="aiml-citation-link" href="${w(a.sourceUrl)}" target="_blank" rel="noopener noreferrer" title="${w(a.title||a.sourceUrl)}">${L(a.title||a.sourceUrl)}</a>`).join(""),this._streamingEl.appendChild(r)}this._streamingEl=null,this._scrollToBottom();let i=this.shadow.querySelector(".aiml-input");i.disabled=!1,i.value="",i.style.height="",i.focus();let t=this.shadow.querySelector(".aiml-send-btn");t.disabled=!0}showStatus(e,i){let t=this.shadow.querySelector(".aiml-messages"),r=t.querySelector(".aiml-status");r&&r.remove();let a=document.createElement("div");if(a.className=`aiml-status aiml-status-${e}`,a.setAttribute("role","alert"),a.textContent=i,t.appendChild(a),this._scrollToBottom(),e==="error"||e==="warn"){this._streaming=!1,this._typingEl&&(this._typingEl.remove(),this._typingEl=null);let d=this.shadow.querySelector(".aiml-input");d.disabled=!1;let s=this.shadow.querySelector(".aiml-send-btn");s.disabled=!d.value.trim()}}showGreeting(e){if(!e)return;let i=this.shadow.querySelector(".aiml-messages"),t=document.createElement("div");t.className="aiml-msg aiml-msg-bot",t.setAttribute("role","article"),t.setAttribute("aria-label","AI Assistant"),t.innerHTML=`<div class="aiml-msg-bubble">${A(e)}</div>`,i.appendChild(t)}showLeadCaptureForm(e,i){let t=this.shadow.querySelector(".aiml-messages"),r=document.createElement("div");r.className="aiml-lead-form",r.setAttribute("role","form"),r.innerHTML=`
      <p class="aiml-lead-text">I couldn't find an answer. Leave your email and we'll get back to you.</p>
      <div class="aiml-lead-row">
        <input class="aiml-lead-email" type="email" placeholder="your@email.com" aria-label="Your email address" />
        <button class="aiml-lead-submit" type="button">Notify me</button>
      </div>
      <p class="aiml-lead-error aiml-hidden" role="alert">Please enter a valid email.</p>
      <p class="aiml-lead-success aiml-hidden" role="status">Thanks! We'll be in touch.</p>`;let a=r.querySelector(".aiml-lead-email"),d=r.querySelector(".aiml-lead-submit"),s=r.querySelector(".aiml-lead-error"),o=r.querySelector(".aiml-lead-success");d.addEventListener("click",async()=>{let m=a.value.trim();if(!m||!m.includes("@")){s.classList.remove("aiml-hidden");return}s.classList.add("aiml-hidden"),d.disabled=!0;try{await i(m,e),a.classList.add("aiml-hidden"),d.classList.add("aiml-hidden"),o.classList.remove("aiml-hidden")}catch{d.disabled=!1,s.textContent="Failed to submit. Please try again.",s.classList.remove("aiml-hidden")}}),t.appendChild(r),this._scrollToBottom(),setTimeout(()=>a.focus(),50)}_scrollToBottom(){let e=this.shadow.querySelector(".aiml-messages");e&&(e.scrollTop=e.scrollHeight)}};function L(l){return String(l).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function w(l){return String(l||"").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}(function(){"use strict";if(window.__aimlWidgetLoaded)return;window.__aimlWidgetLoaded=!0;let l=document.currentScript||document.querySelector("script[data-api-key]");if(!l){console.warn("[AIML] No script tag found with data-api-key attribute.");return}let e=l.getAttribute("data-api-key"),i=l.getAttribute("data-website-id"),t=l.getAttribute("data-api-url")||"https://api.aiml.chat",r=l.getAttribute("data-position")||"right",a=l.getAttribute("data-theme")||"auto",d=l.getAttribute("data-primary-color")||null;if(!e){console.warn("[AIML] Missing data-api-key on script tag.");return}let s=`aiml_session_${i||"default"}`;function o(){try{let p=sessionStorage.getItem(s);return p?JSON.parse(p):{conversationId:null,history:[],visitorId:g()}}catch{return{conversationId:null,history:[],visitorId:g()}}}function m(p){try{sessionStorage.setItem(s,JSON.stringify(p))}catch{}}function g(){return"v-"+Math.random().toString(36).slice(2)+Date.now().toString(36)}async function h(){try{let p=await fetch(`${t}/v1/widgets/${encodeURIComponent(e)}/config`,{headers:{"X-Api-Key":e}});if(p.ok)return await p.json()}catch{}return{}}async function u(){let p=await h(),c=o(),y={position:r,theme:a,primaryColor:d,title:p.title||"AI Assistant",subtitle:p.subtitle||"Ask me anything",placeholder:p.placeholder||"Ask a question\u2026",greeting:p.greeting||null,showBranding:p.showBranding!==!1},n=new E(y),f=new _(t,e);if(n.mount(),y.greeting&&c.history.length===0){let S=n.open.bind(n),b=!1;n.open=function(){S(),b||(b=!0,n.showGreeting(y.greeting))}}n.host.addEventListener("aiml:send",async S=>{let b=S.detail.text;c.history.push({role:"user",content:b}),m(c),n.appendUserMessage(b),n.startBotMessage();let k="";await f.send(b,c.history.slice(0,-1),c.conversationId,c.visitorId,{onToken(x){k+=x,n.appendToken(x)},onCitations(x){n.finishBotMessage(x),c.history.push({role:"assistant",content:k}),m(c)},onDone(){k&&(n.finishBotMessage([]),c.history.push({role:"assistant",content:k}),m(c))},onError(x,q){if(x==="noContent"&&i){n.showLeadCaptureForm(b,async(T,M)=>{await f.captureLead(i,T,M)});return}let $={auth:"Authentication failed. Please check your API key.",quota:"Monthly message quota reached. Please upgrade your plan.",rateLimit:`Too many requests. Please wait ${q||60} seconds.`,noContent:"No answer found. Please contact us directly.",network:"Connection error. Please check your network and try again.",stream:"Stream interrupted. Please try again.",server:"Server error. Please try again later."};n.showStatus("error",$[x]||"Something went wrong. Please try again.")}})}),window.AIML={open:()=>n.open(),close:()=>n.close(),toggle:()=>n.toggle(),clearHistory:()=>{c.history=[],c.conversationId=null,m(c)}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",u):u()})();})();
