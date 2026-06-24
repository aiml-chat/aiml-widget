var AIML=(()=>{var I=class{constructor(e,a){this.apiUrl=e.replace(/\/$/,""),this.apiKey=a,this._abortController=null}async captureLead(e,a,t){if(!(await fetch(`${this.apiUrl}/v1/leads`,{method:"POST",headers:{"Content-Type":"application/json","X-Api-Key":this.apiKey},body:JSON.stringify({websiteId:e,email:a,question:t,visitorId:null})})).ok)throw new Error("lead capture failed")}abort(){this._abortController&&(this._abortController.abort(),this._abortController=null)}async send(e,a,t,s,i,o={}){this.abort(),this._abortController=new AbortController;let{signal:l}=this._abortController,p=JSON.stringify({message:e,conversationId:t,visitorId:s,history:a.slice(-6),...o.mode?{mode:o.mode}:{},...o.approveActionId?{approveActionId:o.approveActionId,approveAllow:!!o.approveAllow}:{}}),m;try{m=await fetch(`${this.apiUrl}/v1/chat`,{method:"POST",headers:{"Content-Type":"application/json","X-Api-Key":this.apiKey},body:p,signal:l})}catch(y){if(y.name==="AbortError")return;i.onError("network");return}if(m.status===401){i.onError("auth");return}if(m.status===402){i.onError("quota");return}if(m.status===429){let y=m.headers.get("Retry-After")||"60";i.onError("rateLimit",y);return}if(m.status===404){i.onError("noContent");return}if(!m.ok){i.onError("server");return}let b=m.body.getReader(),x=new TextDecoder,v="";try{for(;;){let{done:y,value:_}=await b.read();if(y)break;v+=x.decode(_,{stream:!0});let L=v.split(`
`);v=L.pop();for(let q of L){if(!q.startsWith("data: "))continue;let M=q.slice(6).trim();if(M==="[DONE]"){i.onDone();return}try{let r=JSON.parse(M);r.token!==void 0&&i.onToken(r.token),r.citations&&i.onCitations(r.citations),r.noAnswer&&i.onNoAnswer?.(),r.agent!==void 0&&i.onAgent?.(r.agent),r.handoff&&i.onHandoff?.(r.handoff),r.tool&&i.onTool?.(r.tool),r.confirm&&i.onConfirm?.(r.confirm),r.confirm_result&&i.onConfirmResult?.(r.confirm_result),r.escalate&&i.onEscalate?.()}catch{}}}}catch(y){y.name!=="AbortError"&&i.onError("stream")}}};var P=`:host {
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


/* \u2500\u2500 Agent mode (Phase 10 D1) \u2014 mirrors widget_agent.jsx \u2500\u2500 */
@keyframes aiml-spin { to { transform: rotate(360deg); } }
.aiml-spin { display: inline-flex; animation: aiml-spin 0.8s linear infinite; }
.aiml-ok { color: #16A34A; display: inline-flex; }

/* Agent attribution pill (accent via --ac) */
.aiml-agent-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  align-self: flex-start;
  margin: 0 0 4px 2px;
  padding: 1px 8px 1px 5px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--ac, var(--aiml-primary));
  background: color-mix(in srgb, var(--ac, var(--aiml-primary)) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--ac, var(--aiml-primary)) 28%, transparent);
  border-radius: 999px;
}
.aiml-agent-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px; height: 14px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--ac, var(--aiml-primary)) 18%, transparent);
}

/* Handoff divider */
.aiml-handoff { display: flex; flex-direction: column; align-items: center; gap: 3px; margin: 8px 4px; }
.aiml-handoff-row { display: flex; align-items: center; gap: 8px; width: 100%; }
.aiml-handoff-line { flex: 1; height: 1px; background: var(--aiml-border); }
.aiml-handoff-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  padding: 3px 10px;
  font-size: 10px;
  font-weight: 500;
  border-radius: 999px;
  color: var(--aiml-text-muted);
  background: color-mix(in srgb, var(--ac, var(--aiml-primary)) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--ac, var(--aiml-primary)) 18%, transparent);
}
.aiml-handoff-pill svg { color: var(--ac, var(--aiml-primary)); }
.aiml-handoff-pill b { color: var(--ac, var(--aiml-primary)); font-weight: 700; }
.aiml-handoff-reason { font-size: 10px; font-style: italic; color: var(--aiml-text-muted); }

/* Server provenance tag */
.aiml-server-tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-radius: 4px;
  color: var(--aiml-text-muted);
  background: color-mix(in srgb, var(--aiml-text) 6%, transparent);
}

/* Tool activity group */
.aiml-tools {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-self: stretch;
  margin: 4px 0;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--aiml-surface);
  border: 1px solid var(--aiml-border);
}
.aiml-tools-done { flex-direction: row; align-items: center; gap: 6px; }
.aiml-tool-row { display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: var(--aiml-text); }
.aiml-tool-ico { display: inline-flex; flex-shrink: 0; color: var(--aiml-text-muted); }
.aiml-tool-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.aiml-tool-summary { font-size: 11.5px; font-weight: 500; color: var(--aiml-text-muted); }

/* Write-confirm approval card */
.aiml-confirm {
  align-self: stretch;
  margin: 6px 0;
  padding: 12px 14px;
  background: var(--aiml-bg);
  border: 1.5px solid color-mix(in srgb, var(--ac, var(--aiml-primary)) 45%, transparent);
  border-radius: 12px;
  box-shadow: 0 2px 10px color-mix(in srgb, var(--ac, var(--aiml-primary)) 12%, transparent);
}
.aiml-confirm-head {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ac, var(--aiml-primary));
  margin-bottom: 5px;
}
.aiml-confirm-shield { display: inline-flex; }
.aiml-confirm-srv { margin-left: auto; }
.aiml-confirm-title { font-size: 13px; font-weight: 600; color: var(--aiml-text); line-height: 1.35; }
.aiml-confirm-summary { font-size: 11.5px; color: var(--aiml-text-muted); margin-top: 3px; line-height: 1.45; }
.aiml-confirm-actions { display: flex; gap: 8px; margin-top: 10px; }
.aiml-confirm-approve, .aiml-confirm-deny {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 32px;
  padding: 0 14px;
  font-family: var(--aiml-font);
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: filter .15s, background .15s, color .15s;
}
.aiml-confirm-approve {
  background: var(--ac, var(--aiml-primary));
  color: #fff;
  border: none;
  box-shadow: 0 1px 2px color-mix(in srgb, var(--ac, var(--aiml-primary)) 40%, transparent);
}
.aiml-confirm-approve:hover { filter: brightness(1.07); }
.aiml-confirm-deny {
  background: transparent;
  color: var(--aiml-text-muted);
  border: 1px solid color-mix(in srgb, var(--ac, var(--aiml-primary)) 28%, transparent);
}
.aiml-confirm-deny:hover { color: var(--aiml-text); }
.aiml-confirm-foot {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--aiml-text-muted);
  margin-top: 8px;
}
.aiml-confirm-status { font-size: 12px; font-weight: 600; color: var(--aiml-text-muted); margin-top: 8px; display: flex; align-items: center; gap: 5px; }
.aiml-confirm-ok { border-color: color-mix(in srgb, #16A34A 40%, transparent); }
.aiml-confirm-ok .aiml-confirm-status { color: #15803D; }
.aiml-confirm-resolved { opacity: 0.85; }

/* Escalation row \u2192 talk to a human */
.aiml-escalate {
  display: flex;
  align-items: center;
  gap: 9px;
  align-self: stretch;
  margin: 6px 0;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--aiml-surface);
  border: 1px dashed var(--aiml-border);
}
.aiml-escalate-ico { display: inline-flex; color: var(--aiml-text-muted); flex-shrink: 0; }
.aiml-escalate-text { flex: 1; font-size: 11.5px; color: var(--aiml-text); }
.aiml-escalate-btn {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  height: 28px;
  padding: 0 11px;
  font-family: var(--aiml-font);
  font-size: 11px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  color: var(--aiml-primary);
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--aiml-primary) 30%, transparent);
  transition: background .15s;
}
.aiml-escalate-btn:hover { background: color-mix(in srgb, var(--aiml-primary) 8%, transparent); }

/* Source provenance on citations */
.aiml-via { margin-left: 6px; font-size: 9px; font-style: italic; opacity: 0.7; }
`;function H(u){if(!u)return"";let e=F(u);e=e.replace(/```(\w*)\n([\s\S]*?)```/g,(l,p,m)=>`<pre><code>${m.trimEnd()}</code></pre>`),e=e.replace(/`([^`]+)`/g,"<code>$1</code>"),e=e.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"),e=e.replace(/__(.+?)__/g,"<strong>$1</strong>"),e=e.replace(/\*([^*\n]+)\*/g,"<em>$1</em>"),e=e.replace(/_([^_\n]+)_/g,"<em>$1</em>"),e=e.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');let a=e.split(`
`),t=[],s=!1,i=!1;for(let l=0;l<a.length;l++){let p=a[l],m=p.match(/^(#{1,3}) (.+)/);if(m){o();let v=Math.min(m[1].length+2,6);t.push(`<h${v}>${m[2]}</h${v}>`);continue}let b=p.match(/^[-*] (.+)/);if(b){s||(t.push("<ul>"),s=!0),t.push(`<li>${b[1]}</li>`);continue}let x=p.match(/^\d+\. (.+)/);if(x){i||(t.push("<ol>"),i=!0),t.push(`<li>${x[1]}</li>`);continue}o(),p.trim()===""?t.push(""):t.push(`<p>${p}</p>`)}o();function o(){s&&(t.push("</ul>"),s=!1),i&&(t.push("</ol>"),i=!1)}return t.join(`
`).replace(/<\/p>\n<p>/g,"<br>").replace(/\n{2,}/g,`
`)}function F(u){return u.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}var $={chat:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',close:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',send:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',bot:"\u{1F916}"},w=u=>`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${u}</svg>`,f={msg:w('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),spark:w('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/>'),code:w('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),arrow:w('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'),shield:w('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),lock:w('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),check:w('<polyline points="20 6 9 17 4 12"/>'),loader:w('<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.9" y1="4.9" x2="7.8" y2="7.8"/><line x1="16.2" y1="16.2" x2="19.1" y2="19.1"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.9" y1="19.1" x2="7.8" y2="16.2"/><line x1="16.2" y1="7.8" x2="19.1" y2="4.9"/>'),user:w('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>')},K={Support:{accent:"#4F46E5",icon:"msg"},Sales:{accent:"#7C3AED",icon:"spark"},Technical:{accent:"#0F766E",icon:"code"}},W={accent:"#78716C",icon:"spark"},D=u=>K[u]||W,B=class{constructor(e){this.config=e,this.host=null,this.shadow=null,this.isOpen=!1,this._streaming=!1,this._streamingEl=null,this._streamBuffer="",this._currentBotMsg=null,this._lastAgent=null,this._confirmCards={},this._toolGroup=null,this._toolRows={}}mount(){this.host=document.createElement("div"),this.host.setAttribute("id","aiml-widget-host"),this.host.setAttribute("data-theme",this.config.theme||"auto"),document.body.appendChild(this.host),this.shadow=this.host.attachShadow({mode:"open"});let e=document.createElement("style");e.textContent=P,this.shadow.appendChild(e);let a={none:"0px",md:"12px",xl:"20px"},t=[];this.config.primaryColor&&t.push(`--aiml-primary: ${this.config.primaryColor};`),this.config.radius in a&&t.push(`--aiml-radius: ${a[this.config.radius]};`),t.push(`--aiml-offset-x: ${this.config.offsetX??24}px;`),t.push(`--aiml-offset-y: ${this.config.offsetY??24}px;`),this.config.zIndex&&t.push(`--aiml-z: ${this.config.zIndex};`),e.textContent+=`:host { ${t.join(" ")} }`,this.shadow.appendChild(this._buildTrigger()),this.config.launcherLabel&&this.shadow.appendChild(this._buildLauncherLabel()),this.shadow.appendChild(this._buildWindow()),this._bindEvents(),this._focusTrap()}_buildTrigger(){let e=document.createElement("button"),a=this.config.launcherSize==="sm"?" aiml-sz-sm":this.config.launcherSize==="lg"?" aiml-sz-lg":"";e.className=`aiml-trigger${this.config.position==="left"?" aiml-left":""}${a}`,e.setAttribute("aria-label","Open AI chat assistant"),e.setAttribute("aria-expanded","false"),e.setAttribute("aria-controls","aiml-chat-window");let t=this.config.launcherIconUrl?`<img class="aiml-trigger-img" src="${E(this.config.launcherIconUrl)}" alt="" />`:$.chat;return e.innerHTML=`
      <span class="aiml-icon-open" aria-hidden="true">${t}</span>
      <span class="aiml-icon-close" aria-hidden="true">${$.close}</span>`,e}_buildLauncherLabel(){let e="aiml_label_dismissed",a=!1;try{a=sessionStorage.getItem(e)==="1"}catch{}let t=document.createElement("div");return a||(t.className=`aiml-launcher-label${this.config.position==="left"?" aiml-left":""}`,t.innerHTML=`<span>${h(this.config.launcherLabel)}</span><button class="aiml-label-dismiss" aria-label="Dismiss">${$.close}</button>`,t.querySelector("span").addEventListener("click",()=>this.open()),t.querySelector(".aiml-label-dismiss").addEventListener("click",s=>{s.stopPropagation(),t.remove();try{sessionStorage.setItem(e,"1")}catch{}}),this._labelEl=t),t}_buildWindow(){let e=document.createElement("div");e.className=`aiml-window aiml-hidden${this.config.position==="left"?" aiml-left":""}`,e.setAttribute("id","aiml-chat-window"),e.setAttribute("role","dialog"),e.setAttribute("aria-label","AI Chat Assistant"),e.setAttribute("aria-modal","false");let a=this.config.avatarUrl?`<img class="aiml-avatar-img" src="${E(this.config.avatarUrl)}" alt="" />`:$.bot;return e.innerHTML=`
      <div class="aiml-header">
        <div class="aiml-avatar" aria-hidden="true">${a}</div>
        <div class="aiml-header-info">
          <div class="aiml-header-title">${E(this.config.title||"AI Assistant")}</div>
          <div class="aiml-header-subtitle">${E(this.config.subtitle||"Ask me anything")}</div>
        </div>
        <span class="aiml-label" title="Powered by AI">AI</span>
        <button class="aiml-close-btn" aria-label="Close chat">
          ${$.close}
        </button>
      </div>
      <div class="aiml-messages" role="log" aria-live="polite" aria-label="Chat messages"></div>
      <div class="aiml-input-area">
        <textarea
          class="aiml-input"
          placeholder="${E(this.config.placeholder||"Ask a question\u2026")}"
          rows="1"
          aria-label="Chat message input"
          aria-multiline="true"
        ></textarea>
        <button class="aiml-send-btn" aria-label="Send message" disabled>
          ${$.send}
        </button>
      </div>
      <div class="aiml-footer${this.config.showBranding===!1?" aiml-no-brand":""}">
        <a class="aiml-badge" href="https://aiml.chat?ref=widget" target="_blank" rel="noopener noreferrer" tabindex="${this.config.showBranding===!1?"-1":"0"}">
          Powered by aiml.chat
        </a>
      </div>`,e}_bindEvents(){let e=this.shadow,a=e.querySelector(".aiml-trigger"),t=e.querySelector(".aiml-close-btn"),s=e.querySelector(".aiml-input"),i=e.querySelector(".aiml-send-btn");a.addEventListener("click",()=>this.toggle()),t.addEventListener("click",()=>this.close()),s.addEventListener("input",()=>{i.disabled=!s.value.trim(),s.style.height="auto",s.style.height=Math.min(s.scrollHeight,120)+"px"}),s.addEventListener("keydown",l=>{l.key==="Enter"&&!l.shiftKey&&(l.preventDefault(),i.disabled||this._emitSend(s.value.trim()))}),i.addEventListener("click",()=>{i.disabled||this._emitSend(s.value.trim())}),e.addEventListener("keydown",l=>{l.key==="Escape"&&this.isOpen&&this.close()}),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{this.config.theme==="auto"&&this.host.setAttribute("data-theme","auto")})}_focusTrap(){let e=this.shadow;e.addEventListener("keydown",a=>{if(a.key!=="Tab"||!this.isOpen)return;let t=[...e.querySelectorAll('button:not([disabled]), textarea, a[href], [tabindex]:not([tabindex="-1"])')].filter(o=>!o.closest(".aiml-window.aiml-hidden"));if(!t.length)return;let s=t[0],i=t[t.length-1];a.shiftKey&&document.activeElement===s?(a.preventDefault(),i.focus()):!a.shiftKey&&document.activeElement===i&&(a.preventDefault(),s.focus())})}_emitSend(e){if(!e||this._streaming)return;let a=new CustomEvent("aiml:send",{detail:{text:e},bubbles:!0});this.host.dispatchEvent(a)}open(){if(this.isOpen)return;this.isOpen=!0,this._labelEl&&(this._labelEl.remove(),this._labelEl=null);let e=this.shadow.querySelector(".aiml-window"),a=this.shadow.querySelector(".aiml-trigger");e.classList.remove("aiml-hidden"),a.setAttribute("aria-expanded","true"),a.setAttribute("aria-label","Close AI chat assistant"),setTimeout(()=>this.shadow.querySelector(".aiml-input")?.focus(),100),this.config.onOpen&&this.config.onOpen()}close(){if(!this.isOpen)return;this.isOpen=!1;let e=this.shadow.querySelector(".aiml-window"),a=this.shadow.querySelector(".aiml-trigger");e.classList.add("aiml-hidden"),a.setAttribute("aria-expanded","false"),a.setAttribute("aria-label","Open AI chat assistant"),a.focus(),this.config.onClose&&this.config.onClose()}toggle(){this.isOpen?this.close():this.open()}appendUserMessage(e){let a=this.shadow.querySelector(".aiml-messages"),t=document.createElement("div");return t.className="aiml-msg aiml-msg-user",t.setAttribute("role","article"),t.setAttribute("aria-label","You"),t.innerHTML=`<div class="aiml-msg-bubble">${h(e)}</div>`,a.appendChild(t),this._scrollToBottom(),t}startBotMessage(){let e=this.shadow.querySelector(".aiml-messages");this._streaming=!0,this._streamBuffer="",this._toolGroup=null,this._toolRows={};let a=document.createElement("div");a.className="aiml-msg aiml-msg-bot aiml-typing-indicator",a.setAttribute("aria-label","AI is typing"),a.innerHTML='<div class="aiml-msg-bubble"><div class="aiml-typing"><span></span><span></span><span></span></div></div>',e.appendChild(a),this._scrollToBottom(),this._streamingEl=null,this._typingEl=a;let t=this.shadow.querySelector(".aiml-input"),s=this.shadow.querySelector(".aiml-send-btn");return t.disabled=!0,s.disabled=!0,{typing:a}}appendToken(e){if(this._streaming){if(this._streamBuffer+=e,this._typingEl){this._typingEl.remove(),this._typingEl=null;let a=this.shadow.querySelector(".aiml-messages"),t=document.createElement("div");t.className="aiml-msg aiml-msg-bot",t.setAttribute("role","article"),t.setAttribute("aria-label","AI Assistant"),t.innerHTML='<div class="aiml-msg-bubble"></div>',a.appendChild(t),this._streamingEl=t.querySelector(".aiml-msg-bubble"),this._currentBotMsg=t}this._streamingEl&&(this._streamingEl.innerHTML=H(this._streamBuffer),this._scrollToBottom())}}finishBotMessage(e){this._streaming=!1,this._typingEl&&(this._typingEl.remove(),this._typingEl=null);let a=(e||[]).map(i=>({url:i.sourceUrl||i.SourceUrl||"",title:i.title||i.Title||"",via:i.via||i.Via||""})).filter(i=>i.url);if(this._streamingEl&&a.length){let i=document.createElement("div");i.className="aiml-citations",i.innerHTML='<div class="aiml-citations-title">Sources</div>'+a.map(o=>`<a class="aiml-citation-link" href="${E(o.url)}" target="_blank" rel="noopener noreferrer" title="${E(o.title||o.url)}">${h(o.title||o.url)}`+(o.via?`<span class="aiml-via">via ${h(o.via)}</span>`:"")+"</a>").join(""),this._streamingEl.appendChild(i)}this._streamingEl=null,this._scrollToBottom();let t=this.shadow.querySelector(".aiml-input");t.disabled=!1,t.value="",t.style.height="",t.focus();let s=this.shadow.querySelector(".aiml-send-btn");s.disabled=!0}setAgent(e){if(!e||!this.config.showAgentName)return;this._lastAgent=e;let a=this._currentBotMsg;if(!a)return;let t=D(e),s=a.querySelector(".aiml-agent-pill");s||(s=document.createElement("span"),s.className="aiml-agent-pill",a.insertBefore(s,a.firstChild)),s.style.setProperty("--ac",t.accent),s.innerHTML=`<span class="aiml-agent-ico">${f[t.icon]}</span>${h(e)}`,this._scrollToBottom()}showHandoff(e){let a=e&&e.to;if(!a)return;this._lastAgent=a,this._toolGroup=null;let t=D(a).accent,s=this.shadow.querySelector(".aiml-messages"),i=document.createElement("div");i.className="aiml-handoff",i.setAttribute("role","separator"),i.style.setProperty("--ac",t),i.innerHTML=`<div class="aiml-handoff-row"><span class="aiml-handoff-line"></span><span class="aiml-handoff-pill">${f.arrow} Handed off to <b>${h(a)}</b></span><span class="aiml-handoff-line"></span></div>`+(e.reason?`<span class="aiml-handoff-reason">${h(e.reason)}</span>`:""),s.appendChild(i),this._scrollToBottom()}showTool(e){if(!e||!e.id)return;let a=this.shadow.querySelector(".aiml-messages");this._toolGroup||(this._toolGroup=document.createElement("div"),this._toolGroup.className="aiml-tools",this._toolGroup.setAttribute("role","status"),this._toolRows={},a.appendChild(this._toolGroup));let t=this._toolGroup,s=this._toolRows[e.id];s||(s=document.createElement("div"),s.className="aiml-tool-row",t.appendChild(s),this._toolRows[e.id]=s);let i=!e.done,o=i?`<span class="aiml-tool-ico aiml-spin">${f.loader}</span>`:`<span class="aiml-tool-ico aiml-ok">${f.check}</span>`,l=e.server?`<span class="aiml-server-tag">${h(e.server)}</span>`:"";s.innerHTML=`${o}<span class="aiml-tool-label">${h(e.label||e.name||"Working")}${i?"\u2026":""}</span>${l}`;let p=Object.values(this._toolRows);if(p.length&&p.every(m=>m.querySelector(".aiml-ok"))){t.classList.add("aiml-tools-done");let m=p.length;t.innerHTML=`<span class="aiml-tool-ico aiml-ok">${f.check}</span><span class="aiml-tool-summary">Used ${m} tool${m>1?"s":""}</span>`,this._toolGroup=null}this._scrollToBottom()}showConfirmCard(e,a){if(!e||!e.id)return;this._toolGroup=null;let t=D(this._lastAgent).accent,s=this.shadow.querySelector(".aiml-messages"),i=document.createElement("div");i.className="aiml-confirm",i.setAttribute("role","group"),i.style.setProperty("--ac",t);let o=e.server?`<span class="aiml-server-tag">${h(e.server)}</span>`:"";i.innerHTML=`<div class="aiml-confirm-head"><span class="aiml-confirm-shield">${f.shield}</span>Approval needed${o?`<span class="aiml-confirm-srv">${o}</span>`:""}</div><div class="aiml-confirm-title">${h(e.title||e.action||"Perform this action?")}</div>`+(e.summary?`<div class="aiml-confirm-summary">${h(e.summary)}</div>`:"")+`<div class="aiml-confirm-actions"><button class="aiml-confirm-approve" type="button">${f.check} Allow</button><button class="aiml-confirm-deny" type="button">Not now</button></div><div class="aiml-confirm-foot">${f.lock} Read-only by default \u2014 you approve every change.</div><div class="aiml-confirm-status aiml-hidden" role="status"></div>`;let l=p=>{i.querySelector(".aiml-confirm-actions").classList.add("aiml-hidden"),i.querySelector(".aiml-confirm-foot").classList.add("aiml-hidden");let m=i.querySelector(".aiml-confirm-status");m.classList.remove("aiml-hidden"),m.textContent=p?"Approving\u2026":"Dismissed.",a(p)};i.querySelector(".aiml-confirm-approve").addEventListener("click",()=>l(!0)),i.querySelector(".aiml-confirm-deny").addEventListener("click",()=>l(!1)),this._confirmCards[e.id]=i,s.appendChild(i),this._scrollToBottom()}showConfirmResult(e){let a=e&&this._confirmCards[e.id];if(!a)return;let t=a.querySelector(".aiml-confirm-status");t.classList.remove("aiml-hidden"),t.innerHTML=e.executed?`<span class="aiml-ok">${f.check}</span> Allowed`:"Dismissed",a.classList.add(e.executed?"aiml-confirm-ok":"aiml-confirm-resolved"),delete this._confirmCards[e.id],this._scrollToBottom()}showEscalate(e){let a=this.shadow.querySelector(".aiml-messages");if(a.querySelector(".aiml-escalate"))return;let t=document.createElement("div");t.className="aiml-escalate",t.innerHTML=`<span class="aiml-escalate-ico">${f.user}</span><span class="aiml-escalate-text">Need a person? A teammate can take it from here.</span><button class="aiml-escalate-btn" type="button">Talk to a human</button>`,t.querySelector(".aiml-escalate-btn").addEventListener("click",()=>{t.remove(),e()}),a.appendChild(t),this._scrollToBottom()}showStatus(e,a){let t=this.shadow.querySelector(".aiml-messages"),s=t.querySelector(".aiml-status");s&&s.remove();let i=document.createElement("div");if(i.className=`aiml-status aiml-status-${e}`,i.setAttribute("role","alert"),i.textContent=a,t.appendChild(i),this._scrollToBottom(),e==="error"||e==="warn"){this._streaming=!1,this._typingEl&&(this._typingEl.remove(),this._typingEl=null);let o=this.shadow.querySelector(".aiml-input");o.disabled=!1;let l=this.shadow.querySelector(".aiml-send-btn");l.disabled=!o.value.trim()}}showGreeting(e){if(!e)return;let a=this.shadow.querySelector(".aiml-messages"),t=document.createElement("div");t.className="aiml-msg aiml-msg-bot",t.setAttribute("role","article"),t.setAttribute("aria-label","AI Assistant"),t.innerHTML=`<div class="aiml-msg-bubble">${H(e)}</div>`,a.appendChild(t)}showSuggestedChips(e,a){let t=this.shadow.querySelector(".aiml-messages"),s=t.querySelector(".aiml-welcome");s&&s.remove();let i=Array.isArray(e)?e.slice(0,4):[];if(!i.length)return;let o=document.createElement("div");o.className="aiml-welcome",o.innerHTML=`${a?`<p class="aiml-welcome-sub">${h(a)}</p>`:""}<div class="aiml-suggested" role="list">${i.map(l=>`<button class="aiml-suggested-btn" type="button" role="listitem">${h(l)}</button>`).join("")}</div>`,o.querySelectorAll(".aiml-suggested-btn").forEach(l=>{l.addEventListener("click",()=>{o.remove(),this._emitSend(l.textContent)})}),t.appendChild(o),this._scrollToBottom()}showNoAnswerHelp(e,a,t){this.showSuggestedChips(a,"You could ask about:"),t&&this.showLeadCaptureForm(e,t)}hideWelcomeState(){let a=this.shadow.querySelector(".aiml-messages").querySelector(".aiml-welcome");a&&a.remove()}showLeadCaptureForm(e,a){let t=this.shadow.querySelector(".aiml-messages"),s=document.createElement("div");s.className="aiml-lead-form",s.setAttribute("role","form"),s.innerHTML=`
      <p class="aiml-lead-text">I couldn't find an answer. Leave your email and we'll get back to you.</p>
      <div class="aiml-lead-row">
        <input class="aiml-lead-email" type="email" placeholder="your@email.com" aria-label="Your email address" />
        <button class="aiml-lead-submit" type="button">Notify me</button>
      </div>
      <p class="aiml-lead-error aiml-hidden" role="alert">Please enter a valid email.</p>
      <p class="aiml-lead-success aiml-hidden" role="status">Thanks! We'll be in touch.</p>`;let i=s.querySelector(".aiml-lead-email"),o=s.querySelector(".aiml-lead-submit"),l=s.querySelector(".aiml-lead-error"),p=s.querySelector(".aiml-lead-success");o.addEventListener("click",async()=>{let m=i.value.trim();if(!m||!m.includes("@")){l.classList.remove("aiml-hidden");return}l.classList.add("aiml-hidden"),o.disabled=!0;try{await a(m,e),i.classList.add("aiml-hidden"),o.classList.add("aiml-hidden"),p.classList.remove("aiml-hidden")}catch{o.disabled=!1,l.textContent="Failed to submit. Please try again.",l.classList.remove("aiml-hidden")}}),t.appendChild(s),this._scrollToBottom(),setTimeout(()=>i.focus(),50)}_scrollToBottom(){let e=this.shadow.querySelector(".aiml-messages");e&&(e.scrollTop=e.scrollHeight)}};function h(u){return String(u).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function E(u){return String(u||"").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}(function(){"use strict";if(window.__aimlWidgetLoaded)return;window.__aimlWidgetLoaded=!0;let u="Hi! \u{1F44B} I'm this site's AI assistant. Ask me anything \u2014 I'll answer from this site's own content and show you the sources.",e=document.currentScript||document.querySelector("script[data-api-key]");if(!e){console.warn("[AIML] No script tag found with data-api-key attribute.");return}let a=e.getAttribute("data-api-key"),t=e.getAttribute("data-website-id"),s=e.getAttribute("data-api-url")||"https://api.aiml.chat",i=r=>e.getAttribute("data-"+r),o=i("suggested-questions"),l=o?o.split("|").map(r=>r.trim()).filter(Boolean):null;if(!a){console.warn("[AIML] Missing data-api-key on script tag.");return}let p=r=>r&&/^(#[0-9a-fA-F]{3,8}|(rgb|hsl)a?\([\d\s.,%\/]+\))$/.test(r.trim())?r.trim():null,m=r=>r&&/^https:\/\/[^\s"'<>]+$/i.test(r.trim())?r.trim():null,b=(r,c,N,g)=>{let n=parseInt(r,10);return Number.isFinite(n)?Math.min(g,Math.max(N,n)):c},x=(r,c)=>c.includes(r)?r:null,v=`aiml_session_${t||"default"}`;function y(){try{let r=sessionStorage.getItem(v);return r?JSON.parse(r):{conversationId:null,history:[],visitorId:L()}}catch{return{conversationId:null,history:[],visitorId:L()}}}function _(r){try{sessionStorage.setItem(v,JSON.stringify(r))}catch{}}function L(){return"v-"+Math.random().toString(36).slice(2)+Date.now().toString(36)}async function q(){try{let r=await fetch(`${s}/v1/widgets/${encodeURIComponent(a)}/config`,{headers:{"X-Api-Key":a}});if(r.ok)return await r.json()}catch{}return{}}async function M(){let r=await q(),c=y(),N=l??r.suggestedQuestions??[],g={position:x(i("position"),["left","right"])||r.position||"right",theme:x(i("theme"),["light","dark","auto"])||r.theme||"auto",primaryColor:p(i("primary-color"))||p(r.primaryColor)||null,title:i("title")||r.title||"AI Assistant",subtitle:i("subtitle")||r.subtitle||"Ask me anything",placeholder:r.placeholder||"Ask a question\u2026",greeting:i("greeting")||r.greeting||null,showBranding:r.showBranding!==!1,suggestedQuestions:N,avatarUrl:m(i("avatar"))||m(r.avatarUrl)||null,launcherIconUrl:m(i("launcher-icon"))||m(r.launcherIconUrl)||null,launcherSize:x(i("launcher-size"),["sm","md","lg"])||r.launcherSize||"md",launcherLabel:i("launcher-label")??r.launcherLabel??null,radius:x(i("radius"),["none","md","xl"])||r.radius||"md",offsetX:b(i("offset-x")??r.offsetX,24,0,400),offsetY:b(i("offset-y")??r.offsetY,24,0,400),zIndex:b(i("z-index")??r.zIndex,2147483647,1,2147483647),autoOpenDelaySec:b(i("auto-open")??r.autoOpenDelaySec,0,0,600),hideOnMobile:(i("hide-mobile")??String(r.hideOnMobile??!1))==="true",agentMode:i("mode")==="agent"||r.mode==="agent",showAgentName:(i("show-agent-name")??String(r.showAgentName??!0))!=="false"};if(g.hideOnMobile&&window.matchMedia("(max-width: 640px)").matches)return;let n=new B(g),T=new I(s,a);n.mount(),n.showGreeting(g.greeting||u),n.showSuggestedChips(g.suggestedQuestions,"Try asking:"),g.autoOpenDelaySec>0&&!c.autoOpened&&setTimeout(()=>{n.isOpen||n.open(),c.autoOpened=!0,_(c)},g.autoOpenDelaySec*1e3),n.host.addEventListener("aiml:send",async O=>{let k=O.detail.text;n.hideWelcomeState(),c.history.push({role:"user",content:k}),_(c),n.appendUserMessage(k),n.startBotMessage();let A="",z=!1,C=d=>{z||(z=!0,n.finishBotMessage(d),A&&(c.history.push({role:"assistant",content:A}),_(c)))};await T.send(k,c.history.slice(0,-1),c.conversationId,c.visitorId,{onToken(d){A+=d,n.appendToken(d)},onCitations(d){C(d)},onAgent(d){n.setAgent(d)},onHandoff(d){n.showHandoff(d)},onTool(d){n.showTool(d)},onConfirm(d){n.showConfirmCard(d,S=>U(d.id,S))},onConfirmResult(d){n.showConfirmResult(d)},onEscalate(){t&&n.showEscalate(()=>n.showLeadCaptureForm(k,(d,S)=>T.captureLead(t,d,S)))},onNoAnswer(){C([]),n.showNoAnswerHelp(k,g.suggestedQuestions,t?(d,S)=>T.captureLead(t,d,S):null)},onDone(){C([])},onError(d,S){if(d==="noContent"&&t){n.showLeadCaptureForm(k,async(R,G)=>{await T.captureLead(t,R,G)});return}let j={auth:"Authentication failed. Please check your API key.",quota:"Monthly message quota reached. Please upgrade your plan.",rateLimit:`Too many requests. Please wait ${S||60} seconds.`,noContent:"No answer found. Please contact us directly.",network:"Connection error. Please check your network and try again.",stream:"Stream interrupted. Please try again.",server:"Server error. Please try again later."};n.showStatus("error",j[d]||"Something went wrong. Please try again.")}},{mode:g.agentMode?"agent":void 0})});async function U(O,k){n.startBotMessage();let A="",z=!1,C=()=>{z||(z=!0,n.finishBotMessage([]),A&&(c.history.push({role:"assistant",content:A}),_(c)))};await T.send("",c.history,c.conversationId,c.visitorId,{onToken(d){A+=d,n.appendToken(d)},onCitations(){C()},onConfirmResult(d){n.showConfirmResult(d)},onDone(){C()},onError(){n.showStatus("error","Could not complete that action. Please try again.")}},{mode:"agent",approveActionId:O,approveAllow:k})}window.AIML={open:()=>n.open(),close:()=>n.close(),toggle:()=>n.toggle(),clearHistory:()=>{c.history=[],c.conversationId=null,_(c)}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",M):M()})();})();
