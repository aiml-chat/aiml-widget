var AIML=(()=>{var I=class{constructor(e,i){this.apiUrl=e.replace(/\/$/,""),this.apiKey=i,this._abortController=null}async captureLead(e,i,t){if(!(await fetch(`${this.apiUrl}/v1/leads`,{method:"POST",headers:{"Content-Type":"application/json","X-Api-Key":this.apiKey},body:JSON.stringify({websiteId:e,email:i,question:t,visitorId:null})})).ok)throw new Error("lead capture failed")}abort(){this._abortController&&(this._abortController.abort(),this._abortController=null)}async send(e,i,t,s,a,o={}){this.abort(),this._abortController=new AbortController;let{signal:n}=this._abortController,p=JSON.stringify({message:e,conversationId:t,visitorId:s,history:i.slice(-6),...o.mode?{mode:o.mode}:{},...o.approveActionId?{approveActionId:o.approveActionId,approveAllow:!!o.approveAllow}:{}}),m;try{m=await fetch(`${this.apiUrl}/v1/chat`,{method:"POST",headers:{"Content-Type":"application/json","X-Api-Key":this.apiKey},body:p,signal:n})}catch(x){if(x.name==="AbortError")return;a.onError("network");return}if(m.status===401){a.onError("auth");return}if(m.status===402){a.onError("quota");return}if(m.status===429){let x=m.headers.get("Retry-After")||"60";a.onError("rateLimit",x);return}if(m.status===404){a.onError("noContent");return}if(!m.ok){a.onError("server");return}let f=m.body.getReader(),g=new TextDecoder,b="";try{for(;;){let{done:x,value:y}=await f.read();if(x)break;b+=g.decode(y,{stream:!0});let C=b.split(`
`);b=C.pop();for(let q of C){if(!q.startsWith("data: "))continue;let E=q.slice(6).trim();if(E==="[DONE]"){a.onDone();return}try{let r=JSON.parse(E);r.token!==void 0&&a.onToken(r.token),r.citations&&a.onCitations(r.citations),r.noAnswer&&a.onNoAnswer?.(),r.agent!==void 0&&a.onAgent?.(r.agent),r.handoff&&a.onHandoff?.(r.handoff),r.confirm&&a.onConfirm?.(r.confirm),r.confirm_result&&a.onConfirmResult?.(r.confirm_result)}catch{}}}}catch(x){x.name!=="AbortError"&&a.onError("stream")}}};var N=`:host {
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
  --aiml-offset-x: 24px;
  --aiml-offset-y: 24px;
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
  bottom: var(--aiml-offset-y);
  right: var(--aiml-offset-x);
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
  bottom: calc(var(--aiml-offset-y) + 72px);
  right: var(--aiml-offset-x);
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
.aiml-window.aiml-left { right: auto; left: var(--aiml-offset-x); transform-origin: bottom left; }
.aiml-trigger.aiml-left { right: auto; left: var(--aiml-offset-x); }

/* Launcher size presets + custom icon */
.aiml-trigger.aiml-sz-sm { width: 44px; height: 44px; }
.aiml-trigger.aiml-sz-lg { width: 68px; height: 68px; }
.aiml-trigger-img { width: 60%; height: 60%; object-fit: contain; border-radius: 50%; display: block; }

/* Header avatar image (replaces the emoji when an avatar URL is configured) */
.aiml-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block; }

/* Launcher teaser label ("Chat with us \u{1F44B}") */
.aiml-launcher-label {
  position: fixed;
  bottom: calc(var(--aiml-offset-y) + 12px);
  right: calc(var(--aiml-offset-x) + 68px);
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--aiml-bg);
  color: var(--aiml-text);
  border: 1px solid var(--aiml-border);
  border-radius: 999px;
  padding: 8px 10px 8px 14px;
  font-family: var(--aiml-font);
  font-size: 13px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  z-index: var(--aiml-z);
  cursor: pointer;
  white-space: nowrap;
  max-width: 260px;
}
.aiml-launcher-label span { overflow: hidden; text-overflow: ellipsis; }
.aiml-launcher-label.aiml-left { right: auto; left: calc(var(--aiml-offset-x) + 68px); }
.aiml-label-dismiss {
  background: none; border: none; cursor: pointer; padding: 2px;
  color: var(--aiml-text-muted); display: flex; align-items: center;
}
.aiml-label-dismiss svg { width: 12px; height: 12px; }
/* The teaser crowds small screens \u2014 launcher alone is enough there. */
@media (max-width: 640px) { .aiml-launcher-label { display: none; } }

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

/* Welcome / empty state */
.aiml-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 16px 16px;
  flex: 1;
}
.aiml-welcome-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.85;
}
.aiml-welcome-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--aiml-text);
  margin: 0 0 6px;
}
.aiml-welcome-sub {
  font-size: 13px;
  color: var(--aiml-text-muted);
  margin: 0 0 16px;
  line-height: 1.5;
}
.aiml-suggested {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 320px;
}
.aiml-suggested-btn {
  text-align: left;
  padding: 10px 13px;
  background: var(--aiml-bg);
  border: 1px solid var(--aiml-border);
  border-radius: 10px;
  font-size: 13px;
  color: var(--aiml-text);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  font-family: var(--aiml-font);
  line-height: 1.4;
}
.aiml-suggested-btn:hover {
  border-color: var(--aiml-primary);
  background: var(--aiml-surface);
}
.aiml-suggested-btn:focus-visible {
  outline: 2px solid var(--aiml-primary);
  outline-offset: 1px;
}

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

/* \u2500\u2500 Agent mode (Phase 10 D1) \u2500\u2500 */

/* Agent attribution pill above a bot message */
.aiml-agent-pill {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  margin: 0 0 4px 2px;
  padding: 2px 9px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--aiml-primary);
  background: color-mix(in srgb, var(--aiml-primary) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--aiml-primary) 25%, transparent);
  border-radius: 999px;
}

/* Handoff divider */
.aiml-handoff {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 4px;
}
.aiml-handoff-line { flex: 1; height: 1px; background: var(--aiml-border); }
.aiml-handoff-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--aiml-text-muted);
  white-space: nowrap;
}

/* Write-confirm approval card */
.aiml-confirm {
  align-self: stretch;
  margin: 6px 0;
  padding: 12px 14px;
  background: var(--aiml-surface);
  border: 1px solid var(--aiml-border);
  border-left: 3px solid var(--aiml-primary);
  border-radius: 10px;
}
.aiml-confirm-head {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--aiml-primary);
  margin-bottom: 4px;
}
.aiml-confirm-title { font-size: 14px; font-weight: 600; color: var(--aiml-text); }
.aiml-confirm-summary { font-size: 12.5px; color: var(--aiml-text-muted); margin-top: 4px; line-height: 1.45; }
.aiml-confirm-actions { display: flex; gap: 8px; margin-top: 10px; }
.aiml-confirm-approve, .aiml-confirm-deny {
  flex: 1;
  height: 34px;
  font-family: var(--aiml-font);
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid var(--aiml-border);
  transition: filter .15s, background .15s;
}
.aiml-confirm-approve { background: var(--aiml-primary); color: #fff; border-color: transparent; }
.aiml-confirm-approve:hover { filter: brightness(1.06); }
.aiml-confirm-deny { background: var(--aiml-bg); color: var(--aiml-text-muted); }
.aiml-confirm-deny:hover { color: var(--aiml-text); }
.aiml-confirm-status { font-size: 12.5px; font-weight: 600; color: var(--aiml-text-muted); margin-top: 8px; }
.aiml-confirm-resolved { opacity: 0.85; }
`;function O(u){if(!u)return"";let e=R(u);e=e.replace(/```(\w*)\n([\s\S]*?)```/g,(n,p,m)=>`<pre><code>${m.trimEnd()}</code></pre>`),e=e.replace(/`([^`]+)`/g,"<code>$1</code>"),e=e.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"),e=e.replace(/__(.+?)__/g,"<strong>$1</strong>"),e=e.replace(/\*([^*\n]+)\*/g,"<em>$1</em>"),e=e.replace(/_([^_\n]+)_/g,"<em>$1</em>"),e=e.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');let i=e.split(`
`),t=[],s=!1,a=!1;for(let n=0;n<i.length;n++){let p=i[n],m=p.match(/^(#{1,3}) (.+)/);if(m){o();let b=Math.min(m[1].length+2,6);t.push(`<h${b}>${m[2]}</h${b}>`);continue}let f=p.match(/^[-*] (.+)/);if(f){s||(t.push("<ul>"),s=!0),t.push(`<li>${f[1]}</li>`);continue}let g=p.match(/^\d+\. (.+)/);if(g){a||(t.push("<ol>"),a=!0),t.push(`<li>${g[1]}</li>`);continue}o(),p.trim()===""?t.push(""):t.push(`<p>${p}</p>`)}o();function o(){s&&(t.push("</ul>"),s=!1),a&&(t.push("</ol>"),a=!1)}return t.join(`
`).replace(/<\/p>\n<p>/g,"<br>").replace(/\n{2,}/g,`
`)}function R(u){return u.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}var _={chat:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',close:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',send:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',bot:"\u{1F916}"},T=class{constructor(e){this.config=e,this.host=null,this.shadow=null,this.isOpen=!1,this._streaming=!1,this._streamingEl=null,this._streamBuffer="",this._currentBotMsg=null,this._lastAgent=null,this._confirmCards={}}mount(){this.host=document.createElement("div"),this.host.setAttribute("id","aiml-widget-host"),this.host.setAttribute("data-theme",this.config.theme||"auto"),document.body.appendChild(this.host),this.shadow=this.host.attachShadow({mode:"open"});let e=document.createElement("style");e.textContent=N,this.shadow.appendChild(e);let i={none:"0px",md:"12px",xl:"20px"},t=[];this.config.primaryColor&&t.push(`--aiml-primary: ${this.config.primaryColor};`),this.config.radius in i&&t.push(`--aiml-radius: ${i[this.config.radius]};`),t.push(`--aiml-offset-x: ${this.config.offsetX??24}px;`),t.push(`--aiml-offset-y: ${this.config.offsetY??24}px;`),this.config.zIndex&&t.push(`--aiml-z: ${this.config.zIndex};`),e.textContent+=`:host { ${t.join(" ")} }`,this.shadow.appendChild(this._buildTrigger()),this.config.launcherLabel&&this.shadow.appendChild(this._buildLauncherLabel()),this.shadow.appendChild(this._buildWindow()),this._bindEvents(),this._focusTrap()}_buildTrigger(){let e=document.createElement("button"),i=this.config.launcherSize==="sm"?" aiml-sz-sm":this.config.launcherSize==="lg"?" aiml-sz-lg":"";e.className=`aiml-trigger${this.config.position==="left"?" aiml-left":""}${i}`,e.setAttribute("aria-label","Open AI chat assistant"),e.setAttribute("aria-expanded","false"),e.setAttribute("aria-controls","aiml-chat-window");let t=this.config.launcherIconUrl?`<img class="aiml-trigger-img" src="${S(this.config.launcherIconUrl)}" alt="" />`:_.chat;return e.innerHTML=`
      <span class="aiml-icon-open" aria-hidden="true">${t}</span>
      <span class="aiml-icon-close" aria-hidden="true">${_.close}</span>`,e}_buildLauncherLabel(){let e="aiml_label_dismissed",i=!1;try{i=sessionStorage.getItem(e)==="1"}catch{}let t=document.createElement("div");return i||(t.className=`aiml-launcher-label${this.config.position==="left"?" aiml-left":""}`,t.innerHTML=`<span>${v(this.config.launcherLabel)}</span><button class="aiml-label-dismiss" aria-label="Dismiss">${_.close}</button>`,t.querySelector("span").addEventListener("click",()=>this.open()),t.querySelector(".aiml-label-dismiss").addEventListener("click",s=>{s.stopPropagation(),t.remove();try{sessionStorage.setItem(e,"1")}catch{}}),this._labelEl=t),t}_buildWindow(){let e=document.createElement("div");e.className=`aiml-window aiml-hidden${this.config.position==="left"?" aiml-left":""}`,e.setAttribute("id","aiml-chat-window"),e.setAttribute("role","dialog"),e.setAttribute("aria-label","AI Chat Assistant"),e.setAttribute("aria-modal","false");let i=this.config.avatarUrl?`<img class="aiml-avatar-img" src="${S(this.config.avatarUrl)}" alt="" />`:_.bot;return e.innerHTML=`
      <div class="aiml-header">
        <div class="aiml-avatar" aria-hidden="true">${i}</div>
        <div class="aiml-header-info">
          <div class="aiml-header-title">${S(this.config.title||"AI Assistant")}</div>
          <div class="aiml-header-subtitle">${S(this.config.subtitle||"Ask me anything")}</div>
        </div>
        <span class="aiml-label" title="Powered by AI">AI</span>
        <button class="aiml-close-btn" aria-label="Close chat">
          ${_.close}
        </button>
      </div>
      <div class="aiml-messages" role="log" aria-live="polite" aria-label="Chat messages"></div>
      <div class="aiml-input-area">
        <textarea
          class="aiml-input"
          placeholder="${S(this.config.placeholder||"Ask a question\u2026")}"
          rows="1"
          aria-label="Chat message input"
          aria-multiline="true"
        ></textarea>
        <button class="aiml-send-btn" aria-label="Send message" disabled>
          ${_.send}
        </button>
      </div>
      <div class="aiml-footer${this.config.showBranding===!1?" aiml-no-brand":""}">
        <a class="aiml-badge" href="https://aiml.chat?ref=widget" target="_blank" rel="noopener noreferrer" tabindex="${this.config.showBranding===!1?"-1":"0"}">
          Powered by aiml.chat
        </a>
      </div>`,e}_bindEvents(){let e=this.shadow,i=e.querySelector(".aiml-trigger"),t=e.querySelector(".aiml-close-btn"),s=e.querySelector(".aiml-input"),a=e.querySelector(".aiml-send-btn");i.addEventListener("click",()=>this.toggle()),t.addEventListener("click",()=>this.close()),s.addEventListener("input",()=>{a.disabled=!s.value.trim(),s.style.height="auto",s.style.height=Math.min(s.scrollHeight,120)+"px"}),s.addEventListener("keydown",n=>{n.key==="Enter"&&!n.shiftKey&&(n.preventDefault(),a.disabled||this._emitSend(s.value.trim()))}),a.addEventListener("click",()=>{a.disabled||this._emitSend(s.value.trim())}),e.addEventListener("keydown",n=>{n.key==="Escape"&&this.isOpen&&this.close()}),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{this.config.theme==="auto"&&this.host.setAttribute("data-theme","auto")})}_focusTrap(){let e=this.shadow;e.addEventListener("keydown",i=>{if(i.key!=="Tab"||!this.isOpen)return;let t=[...e.querySelectorAll('button:not([disabled]), textarea, a[href], [tabindex]:not([tabindex="-1"])')].filter(o=>!o.closest(".aiml-window.aiml-hidden"));if(!t.length)return;let s=t[0],a=t[t.length-1];i.shiftKey&&document.activeElement===s?(i.preventDefault(),a.focus()):!i.shiftKey&&document.activeElement===a&&(i.preventDefault(),s.focus())})}_emitSend(e){if(!e||this._streaming)return;let i=new CustomEvent("aiml:send",{detail:{text:e},bubbles:!0});this.host.dispatchEvent(i)}open(){if(this.isOpen)return;this.isOpen=!0,this._labelEl&&(this._labelEl.remove(),this._labelEl=null);let e=this.shadow.querySelector(".aiml-window"),i=this.shadow.querySelector(".aiml-trigger");e.classList.remove("aiml-hidden"),i.setAttribute("aria-expanded","true"),i.setAttribute("aria-label","Close AI chat assistant"),setTimeout(()=>this.shadow.querySelector(".aiml-input")?.focus(),100),this.config.onOpen&&this.config.onOpen()}close(){if(!this.isOpen)return;this.isOpen=!1;let e=this.shadow.querySelector(".aiml-window"),i=this.shadow.querySelector(".aiml-trigger");e.classList.add("aiml-hidden"),i.setAttribute("aria-expanded","false"),i.setAttribute("aria-label","Open AI chat assistant"),i.focus(),this.config.onClose&&this.config.onClose()}toggle(){this.isOpen?this.close():this.open()}appendUserMessage(e){let i=this.shadow.querySelector(".aiml-messages"),t=document.createElement("div");return t.className="aiml-msg aiml-msg-user",t.setAttribute("role","article"),t.setAttribute("aria-label","You"),t.innerHTML=`<div class="aiml-msg-bubble">${v(e)}</div>`,i.appendChild(t),this._scrollToBottom(),t}startBotMessage(){let e=this.shadow.querySelector(".aiml-messages");this._streaming=!0,this._streamBuffer="";let i=document.createElement("div");i.className="aiml-msg aiml-msg-bot aiml-typing-indicator",i.setAttribute("aria-label","AI is typing"),i.innerHTML='<div class="aiml-msg-bubble"><div class="aiml-typing"><span></span><span></span><span></span></div></div>',e.appendChild(i),this._scrollToBottom(),this._streamingEl=null,this._typingEl=i;let t=this.shadow.querySelector(".aiml-input"),s=this.shadow.querySelector(".aiml-send-btn");return t.disabled=!0,s.disabled=!0,{typing:i}}appendToken(e){if(this._streaming){if(this._streamBuffer+=e,this._typingEl){this._typingEl.remove(),this._typingEl=null;let i=this.shadow.querySelector(".aiml-messages"),t=document.createElement("div");t.className="aiml-msg aiml-msg-bot",t.setAttribute("role","article"),t.setAttribute("aria-label","AI Assistant"),t.innerHTML='<div class="aiml-msg-bubble"></div>',i.appendChild(t),this._streamingEl=t.querySelector(".aiml-msg-bubble"),this._currentBotMsg=t}this._streamingEl&&(this._streamingEl.innerHTML=O(this._streamBuffer),this._scrollToBottom())}}finishBotMessage(e){this._streaming=!1,this._typingEl&&(this._typingEl.remove(),this._typingEl=null);let i=(e||[]).map(a=>({url:a.sourceUrl||a.SourceUrl||"",title:a.title||a.Title||""})).filter(a=>a.url);if(this._streamingEl&&i.length){let a=document.createElement("div");a.className="aiml-citations",a.innerHTML='<div class="aiml-citations-title">Sources</div>'+i.map(o=>`<a class="aiml-citation-link" href="${S(o.url)}" target="_blank" rel="noopener noreferrer" title="${S(o.title||o.url)}">${v(o.title||o.url)}</a>`).join(""),this._streamingEl.appendChild(a)}this._streamingEl=null,this._scrollToBottom();let t=this.shadow.querySelector(".aiml-input");t.disabled=!1,t.value="",t.style.height="",t.focus();let s=this.shadow.querySelector(".aiml-send-btn");s.disabled=!0}setAgent(e){if(!e||!this.config.showAgentName)return;this._lastAgent=e;let i=this._currentBotMsg;if(!i||i.querySelector(".aiml-agent-pill")){i&&i.querySelector(".aiml-agent-pill")&&(i.querySelector(".aiml-agent-pill").textContent=e);return}let t=document.createElement("div");t.className="aiml-agent-pill",t.textContent=e,i.insertBefore(t,i.firstChild),this._scrollToBottom()}showHandoff(e){let i=e&&e.to;if(!i)return;this._lastAgent=i;let t=this.shadow.querySelector(".aiml-messages"),s=document.createElement("div");s.className="aiml-handoff",s.setAttribute("role","status"),s.innerHTML=`<span class="aiml-handoff-line"></span><span class="aiml-handoff-text">Connected to ${v(i)}</span><span class="aiml-handoff-line"></span>`,t.appendChild(s),this._scrollToBottom()}showConfirmCard(e,i){if(!e||!e.id)return;let t=this.shadow.querySelector(".aiml-messages"),s=document.createElement("div");s.className="aiml-confirm",s.setAttribute("role","group"),s.innerHTML=`<div class="aiml-confirm-head">Approval needed</div><div class="aiml-confirm-title">${v(e.title||e.action||"Perform this action?")}</div>`+(e.summary?`<div class="aiml-confirm-summary">${v(e.summary)}</div>`:"")+`<div class="aiml-confirm-actions"><button class="aiml-confirm-deny" type="button">No, don't</button><button class="aiml-confirm-approve" type="button">Approve</button></div><div class="aiml-confirm-status aiml-hidden" role="status"></div>`;let a=o=>{s.querySelector(".aiml-confirm-actions").classList.add("aiml-hidden");let n=s.querySelector(".aiml-confirm-status");n.classList.remove("aiml-hidden"),n.textContent=o?"Approving\u2026":"Cancelled.",i(o)};s.querySelector(".aiml-confirm-approve").addEventListener("click",()=>a(!0)),s.querySelector(".aiml-confirm-deny").addEventListener("click",()=>a(!1)),this._confirmCards[e.id]=s,t.appendChild(s),this._scrollToBottom()}showConfirmResult(e){let i=e&&this._confirmCards[e.id];if(!i)return;let t=i.querySelector(".aiml-confirm-status");t.classList.remove("aiml-hidden"),t.textContent=e.executed?"\u2713 Done":"Not performed.",i.classList.add("aiml-confirm-resolved"),delete this._confirmCards[e.id]}showStatus(e,i){let t=this.shadow.querySelector(".aiml-messages"),s=t.querySelector(".aiml-status");s&&s.remove();let a=document.createElement("div");if(a.className=`aiml-status aiml-status-${e}`,a.setAttribute("role","alert"),a.textContent=i,t.appendChild(a),this._scrollToBottom(),e==="error"||e==="warn"){this._streaming=!1,this._typingEl&&(this._typingEl.remove(),this._typingEl=null);let o=this.shadow.querySelector(".aiml-input");o.disabled=!1;let n=this.shadow.querySelector(".aiml-send-btn");n.disabled=!o.value.trim()}}showGreeting(e){if(!e)return;let i=this.shadow.querySelector(".aiml-messages"),t=document.createElement("div");t.className="aiml-msg aiml-msg-bot",t.setAttribute("role","article"),t.setAttribute("aria-label","AI Assistant"),t.innerHTML=`<div class="aiml-msg-bubble">${O(e)}</div>`,i.appendChild(t)}showSuggestedChips(e,i){let t=this.shadow.querySelector(".aiml-messages"),s=t.querySelector(".aiml-welcome");s&&s.remove();let a=Array.isArray(e)?e.slice(0,4):[];if(!a.length)return;let o=document.createElement("div");o.className="aiml-welcome",o.innerHTML=`${i?`<p class="aiml-welcome-sub">${v(i)}</p>`:""}<div class="aiml-suggested" role="list">${a.map(n=>`<button class="aiml-suggested-btn" type="button" role="listitem">${v(n)}</button>`).join("")}</div>`,o.querySelectorAll(".aiml-suggested-btn").forEach(n=>{n.addEventListener("click",()=>{o.remove(),this._emitSend(n.textContent)})}),t.appendChild(o),this._scrollToBottom()}showNoAnswerHelp(e,i,t){this.showSuggestedChips(i,"You could ask about:"),t&&this.showLeadCaptureForm(e,t)}hideWelcomeState(){let i=this.shadow.querySelector(".aiml-messages").querySelector(".aiml-welcome");i&&i.remove()}showLeadCaptureForm(e,i){let t=this.shadow.querySelector(".aiml-messages"),s=document.createElement("div");s.className="aiml-lead-form",s.setAttribute("role","form"),s.innerHTML=`
      <p class="aiml-lead-text">I couldn't find an answer. Leave your email and we'll get back to you.</p>
      <div class="aiml-lead-row">
        <input class="aiml-lead-email" type="email" placeholder="your@email.com" aria-label="Your email address" />
        <button class="aiml-lead-submit" type="button">Notify me</button>
      </div>
      <p class="aiml-lead-error aiml-hidden" role="alert">Please enter a valid email.</p>
      <p class="aiml-lead-success aiml-hidden" role="status">Thanks! We'll be in touch.</p>`;let a=s.querySelector(".aiml-lead-email"),o=s.querySelector(".aiml-lead-submit"),n=s.querySelector(".aiml-lead-error"),p=s.querySelector(".aiml-lead-success");o.addEventListener("click",async()=>{let m=a.value.trim();if(!m||!m.includes("@")){n.classList.remove("aiml-hidden");return}n.classList.add("aiml-hidden"),o.disabled=!0;try{await i(m,e),a.classList.add("aiml-hidden"),o.classList.add("aiml-hidden"),p.classList.remove("aiml-hidden")}catch{o.disabled=!1,n.textContent="Failed to submit. Please try again.",n.classList.remove("aiml-hidden")}}),t.appendChild(s),this._scrollToBottom(),setTimeout(()=>a.focus(),50)}_scrollToBottom(){let e=this.shadow.querySelector(".aiml-messages");e&&(e.scrollTop=e.scrollHeight)}};function v(u){return String(u).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function S(u){return String(u||"").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}(function(){"use strict";if(window.__aimlWidgetLoaded)return;window.__aimlWidgetLoaded=!0;let u="Hi! \u{1F44B} I'm this site's AI assistant. Ask me anything \u2014 I'll answer from this site's own content and show you the sources.",e=document.currentScript||document.querySelector("script[data-api-key]");if(!e){console.warn("[AIML] No script tag found with data-api-key attribute.");return}let i=e.getAttribute("data-api-key"),t=e.getAttribute("data-website-id"),s=e.getAttribute("data-api-url")||"https://api.aiml.chat",a=r=>e.getAttribute("data-"+r),o=a("suggested-questions"),n=o?o.split("|").map(r=>r.trim()).filter(Boolean):null;if(!i){console.warn("[AIML] Missing data-api-key on script tag.");return}let p=r=>r&&/^(#[0-9a-fA-F]{3,8}|(rgb|hsl)a?\([\d\s.,%\/]+\))$/.test(r.trim())?r.trim():null,m=r=>r&&/^https:\/\/[^\s"'<>]+$/i.test(r.trim())?r.trim():null,f=(r,c,M,h)=>{let l=parseInt(r,10);return Number.isFinite(l)?Math.min(h,Math.max(M,l)):c},g=(r,c)=>c.includes(r)?r:null,b=`aiml_session_${t||"default"}`;function x(){try{let r=sessionStorage.getItem(b);return r?JSON.parse(r):{conversationId:null,history:[],visitorId:C()}}catch{return{conversationId:null,history:[],visitorId:C()}}}function y(r){try{sessionStorage.setItem(b,JSON.stringify(r))}catch{}}function C(){return"v-"+Math.random().toString(36).slice(2)+Date.now().toString(36)}async function q(){try{let r=await fetch(`${s}/v1/widgets/${encodeURIComponent(i)}/config`,{headers:{"X-Api-Key":i}});if(r.ok)return await r.json()}catch{}return{}}async function E(){let r=await q(),c=x(),M=n??r.suggestedQuestions??[],h={position:g(a("position"),["left","right"])||r.position||"right",theme:g(a("theme"),["light","dark","auto"])||r.theme||"auto",primaryColor:p(a("primary-color"))||p(r.primaryColor)||null,title:a("title")||r.title||"AI Assistant",subtitle:a("subtitle")||r.subtitle||"Ask me anything",placeholder:r.placeholder||"Ask a question\u2026",greeting:a("greeting")||r.greeting||null,showBranding:r.showBranding!==!1,suggestedQuestions:M,avatarUrl:m(a("avatar"))||m(r.avatarUrl)||null,launcherIconUrl:m(a("launcher-icon"))||m(r.launcherIconUrl)||null,launcherSize:g(a("launcher-size"),["sm","md","lg"])||r.launcherSize||"md",launcherLabel:a("launcher-label")??r.launcherLabel??null,radius:g(a("radius"),["none","md","xl"])||r.radius||"md",offsetX:f(a("offset-x")??r.offsetX,24,0,400),offsetY:f(a("offset-y")??r.offsetY,24,0,400),zIndex:f(a("z-index")??r.zIndex,2147483647,1,2147483647),autoOpenDelaySec:f(a("auto-open")??r.autoOpenDelaySec,0,0,600),hideOnMobile:(a("hide-mobile")??String(r.hideOnMobile??!1))==="true",agentMode:a("mode")==="agent"||r.mode==="agent",showAgentName:(a("show-agent-name")??String(r.showAgentName??!0))!=="false"};if(h.hideOnMobile&&window.matchMedia("(max-width: 640px)").matches)return;let l=new T(h),z=new I(s,i);l.mount(),l.showGreeting(h.greeting||u),l.showSuggestedChips(h.suggestedQuestions,"Try asking:"),h.autoOpenDelaySec>0&&!c.autoOpened&&setTimeout(()=>{l.isOpen||l.open(),c.autoOpened=!0,y(c)},h.autoOpenDelaySec*1e3),l.host.addEventListener("aiml:send",async B=>{let w=B.detail.text;l.hideWelcomeState(),c.history.push({role:"user",content:w}),y(c),l.appendUserMessage(w),l.startBotMessage();let k="",L=!1,A=d=>{L||(L=!0,l.finishBotMessage(d),k&&(c.history.push({role:"assistant",content:k}),y(c)))};await z.send(w,c.history.slice(0,-1),c.conversationId,c.visitorId,{onToken(d){k+=d,l.appendToken(d)},onCitations(d){A(d)},onAgent(d){l.setAgent(d)},onHandoff(d){l.showHandoff(d)},onConfirm(d){l.showConfirmCard(d,$=>H(d.id,$))},onConfirmResult(d){l.showConfirmResult(d)},onNoAnswer(){A([]),l.showNoAnswerHelp(w,h.suggestedQuestions,t?(d,$)=>z.captureLead(t,d,$):null)},onDone(){A([])},onError(d,$){if(d==="noContent"&&t){l.showLeadCaptureForm(w,async(D,P)=>{await z.captureLead(t,D,P)});return}let U={auth:"Authentication failed. Please check your API key.",quota:"Monthly message quota reached. Please upgrade your plan.",rateLimit:`Too many requests. Please wait ${$||60} seconds.`,noContent:"No answer found. Please contact us directly.",network:"Connection error. Please check your network and try again.",stream:"Stream interrupted. Please try again.",server:"Server error. Please try again later."};l.showStatus("error",U[d]||"Something went wrong. Please try again.")}},{mode:h.agentMode?"agent":void 0})});async function H(B,w){l.startBotMessage();let k="",L=!1,A=()=>{L||(L=!0,l.finishBotMessage([]),k&&(c.history.push({role:"assistant",content:k}),y(c)))};await z.send("",c.history,c.conversationId,c.visitorId,{onToken(d){k+=d,l.appendToken(d)},onCitations(){A()},onConfirmResult(d){l.showConfirmResult(d)},onDone(){A()},onError(){l.showStatus("error","Could not complete that action. Please try again.")}},{mode:"agent",approveActionId:B,approveAllow:w})}window.AIML={open:()=>l.open(),close:()=>l.close(),toggle:()=>l.toggle(),clearHistory:()=>{c.history=[],c.conversationId=null,y(c)}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",E):E()})();})();
