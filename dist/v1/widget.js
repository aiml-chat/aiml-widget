var AIML=(()=>{var B=class{constructor(e,a){this.apiUrl=e.replace(/\/$/,""),this.apiKey=a,this._abortController=null}async captureLead(e,a,t){if(!(await fetch(`${this.apiUrl}/v1/leads`,{method:"POST",headers:{"Content-Type":"application/json","X-Api-Key":this.apiKey},body:JSON.stringify({websiteId:e,email:a,question:t,visitorId:null})})).ok)throw new Error("lead capture failed")}abort(){this._abortController&&(this._abortController.abort(),this._abortController=null)}async send(e,a,t,s,i,r={}){this.abort(),this._abortController=new AbortController;let{signal:l}=this._abortController,p=JSON.stringify({message:e,conversationId:t,visitorId:s,history:a.slice(-6),...r.mode?{mode:r.mode}:{},...r.approveActionId?{approveActionId:r.approveActionId,approveAllow:!!r.approveAllow}:{}}),n;try{n=await fetch(`${this.apiUrl}/v1/chat`,{method:"POST",headers:{"Content-Type":"application/json","X-Api-Key":this.apiKey},body:p,signal:l})}catch(S){if(S.name==="AbortError")return;i.onError("network");return}if(n.status===401){i.onError("auth");return}if(n.status===402){i.onError("quota");return}if(n.status===429){let S=n.headers.get("Retry-After")||"60";i.onError("rateLimit",S);return}if(n.status===404){i.onError("noContent");return}if(!n.ok){i.onError("server");return}let u=n.body.getReader(),h=new TextDecoder,y="";try{for(;;){let{done:S,value:_}=await u.read();if(S)break;y+=h.decode(_,{stream:!0});let T=y.split(`
`);y=T.pop();for(let I of T){if(!I.startsWith("data: "))continue;let M=I.slice(6).trim();if(M==="[DONE]"){i.onDone();return}try{let o=JSON.parse(M);o.conversationId&&i.onConversation?.(o.conversationId),o.token!==void 0&&i.onToken(o.token),o.citations&&i.onCitations(o.citations),o.noAnswer&&i.onNoAnswer?.(),o.agent!==void 0&&i.onAgent?.(o.agent),o.handoff&&i.onHandoff?.(o.handoff),o.tool&&i.onTool?.(o.tool),o.confirm&&i.onConfirm?.(o.confirm),o.confirm_result&&i.onConfirmResult?.(o.confirm_result),o.escalate&&i.onEscalate?.()}catch{}}}}catch(S){S.name!=="AbortError"&&i.onError("stream")}}};var R=`:host {
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

/* Header chrome (agent mode + maximize) \u2014 mirrors the design's WidgetWindow header */
.aiml-header { position: relative; }
.aiml-hbtn {
  background: none; border: none; color: rgba(255,255,255,0.8);
  cursor: pointer; padding: 4px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.aiml-hbtn:hover { background: rgba(255,255,255,0.15); color: #fff; }
.aiml-hbtn:focus-visible { outline: 2px solid rgba(255,255,255,0.6); }
.aiml-header-dot-wrap { position: relative; width: 12px; height: 12px; flex-shrink: 0; display: inline-flex; }
/* The header is tinted with --aiml-primary, so the agent accent needs a white ring to read. */
.aiml-header-dot { position: absolute; inset: 1px; border-radius: 50%; transition: background 0.3s; box-shadow: 0 0 0 2px rgba(255,255,255,0.85); }
.aiml-header-ping { box-shadow: none; }
.aiml-header-ping { animation: aiml-ping 1.6s cubic-bezier(0,0,0.2,1) infinite; opacity: 0.45; }
@keyframes aiml-ping { 0% { transform: scale(1); opacity: 0.45; } 75%, 100% { transform: scale(2.4); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .aiml-header-ping { animation: none; opacity: 0; } }
.aiml-header-now { font-weight: 600; }
.aiml-menu {
  position: absolute; top: 100%; right: 12px; margin-top: 4px; z-index: 30;
  min-width: 190px; padding: 4px;
  background: var(--aiml-bg, #fff); color: var(--aiml-text, #1C1917);
  border: 1px solid rgba(0,0,0,0.1); border-radius: 10px;
  box-shadow: 0 8px 24px rgba(28,25,23,0.18);
}
.aiml-menu-item {
  width: 100%; display: flex; align-items: center; gap: 8px;
  background: none; border: none; cursor: pointer; text-align: left;
  font: inherit; font-size: 13px; color: inherit;
  padding: 8px 10px; border-radius: 7px;
}
.aiml-menu-item:hover { background: rgba(0,0,0,0.06); }
.aiml-window.aiml-maximized {
  width: min(560px, calc(100vw - 32px));
  height: min(760px, calc(100vh - 32px));
}

/* Messages */
.aiml-messages {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
}
.aiml-messages::-webkit-scrollbar { width: 4px; }
.aiml-messages::-webkit-scrollbar-thumb { background: var(--aiml-border); border-radius: 2px; }

/* Column so the agent pill sits ABOVE the bubble (design) and, critically, so long content (code
   blocks, unbroken strings) can never force the bubble past the window \u2014 width is the cross axis,
   max-width wins, and <pre> scrolls internally instead of the whole messages area. */
.aiml-msg {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 88%;
  min-width: 0;
  animation: aiml-fade-in 0.2s ease;
}
@keyframes aiml-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.aiml-msg-user { align-self: flex-end; align-items: flex-end; }
.aiml-msg-bubble {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  max-width: 100%;
  min-width: 0;
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

/* Error-bubble variants (design's ErrorBubble): left-aligned bubble with icon + its own tone */
.aiml-status-kind {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  text-align: left;
  align-self: flex-start;
  max-width: 85%;
  margin: 0;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.45;
}
.aiml-status-ico { display: inline-flex; flex-shrink: 0; margin-top: 1px; }
.aiml-status-network { background: #fef2f2; color: #b91c1c; border: 1px solid rgba(220,38,38,0.2); }
.aiml-status-rate { background: #fffbeb; color: #b45309; border: 1px solid rgba(217,119,6,0.2); }
.aiml-status-quota { background: var(--aiml-surface); color: var(--aiml-text-muted); border: 1px solid var(--aiml-border); }
@media (prefers-color-scheme: dark) {
  :host([data-theme="auto"]) .aiml-status-network { background: #3a201e; color: #fca5a5; }
  :host([data-theme="auto"]) .aiml-status-rate { background: #3a2e1a; color: #fbbf77; }
}
:host([data-theme="dark"]) .aiml-status-network { background: #3a201e; color: #fca5a5; }
:host([data-theme="dark"]) .aiml-status-rate { background: #3a2e1a; color: #fbbf77; }

/* Lead capture form */
.aiml-lead-form { padding: 12px; background: #f8fafc; border-radius: 12px; margin: 4px 0; }
.aiml-lead-title { font-size: 13px; font-weight: 600; color: var(--aiml-text); margin: 0 0 2px; }
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
.aiml-err { color: #DC2626; display: inline-flex; }

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

/* Agent-mode empty state (sparkles roundel + team intro) */
.aiml-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 28px 16px 4px;
}
.aiml-empty-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px; height: 48px;
  border-radius: 50%;
  margin-bottom: 12px;
  color: var(--aiml-primary);
  background: color-mix(in srgb, var(--aiml-primary) 10%, transparent);
}
.aiml-empty-title { font-size: 15px; font-weight: 600; color: var(--aiml-text); margin: 0 0 4px; }
.aiml-empty-sub { font-size: 12px; color: var(--aiml-text-muted); margin: 0; line-height: 1.5; }

/* Timestamps at message-group ends */
.aiml-msg-time { font-size: 10px; color: var(--aiml-text-muted); margin: -6px 4px 0; }
.aiml-time-user { align-self: flex-end; }
.aiml-time-bot { align-self: flex-start; }
`;function j(g){if(!g)return"";let e=K(g);e=e.replace(/```(\w*)\n([\s\S]*?)```/g,(l,p,n)=>`<pre><code>${n.trimEnd()}</code></pre>`),e=e.replace(/`([^`]+)`/g,"<code>$1</code>"),e=e.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"),e=e.replace(/(^|[\s(])__(?!\s)(.+?)__(?=$|[\s.,;:!?)])/gm,"$1<strong>$2</strong>"),e=e.replace(/\*([^*\n]+)\*/g,"<em>$1</em>"),e=e.replace(/(^|[\s(])_(?!\s)([^_\n]+)_(?=$|[\s.,;:!?)])/gm,"$1<em>$2</em>"),e=e.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');let a=e.split(`
`),t=[],s=!1,i=!1;for(let l=0;l<a.length;l++){let p=a[l],n=p.match(/^(#{1,3}) (.+)/);if(n){r();let y=Math.min(n[1].length+2,6);t.push(`<h${y}>${n[2]}</h${y}>`);continue}let u=p.match(/^[-*] (.+)/);if(u){s||(t.push("<ul>"),s=!0),t.push(`<li>${u[1]}</li>`);continue}let h=p.match(/^\d+\. (.+)/);if(h){i||(t.push("<ol>"),i=!0),t.push(`<li>${h[1]}</li>`);continue}r(),p.trim()===""?t.push(""):t.push(`<p>${p}</p>`)}r();function r(){s&&(t.push("</ul>"),s=!1),i&&(t.push("</ol>"),i=!1)}return t.join(`
`).replace(/<\/p>\n<p>/g,"<br>").replace(/\n{2,}/g,`
`)}function K(g){return g.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}var v={chat:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',close:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',send:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',bot:"\u{1F916}",minus:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',maximize:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',restore:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',menu:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>',sparkles:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15z"/></svg>'},D=g=>`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${g}</svg>`,V={alert:D('<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),clock:D('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),info:D('<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>')},k=g=>`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${g}</svg>`,x={msg:k('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),spark:k('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/>'),code:k('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),arrow:k('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'),shield:k('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),lock:k('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),check:k('<polyline points="20 6 9 17 4 12"/>'),x:k('<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'),loader:k('<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.9" y1="4.9" x2="7.8" y2="7.8"/><line x1="16.2" y1="16.2" x2="19.1" y2="19.1"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.9" y1="19.1" x2="7.8" y2="16.2"/><line x1="16.2" y1="7.8" x2="19.1" y2="4.9"/>'),user:k('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>')},X={Support:{accent:"#4F46E5",icon:"msg"},Sales:{accent:"#7C3AED",icon:"spark"},Technical:{accent:"#0F766E",icon:"code"}},J={accent:"#78716C",icon:"spark"},N=g=>X[g]||J,H=class{constructor(e){this.config=e,this.host=null,this.shadow=null,this.isOpen=!1,this._streaming=!1,this._streamingEl=null,this._streamBuffer="",this._currentBotMsg=null,this._lastAgent=null,this._confirmCards={},this._toolGroup=null,this._toolRows={}}mount(){this.host=document.createElement("div"),this.host.setAttribute("id","aiml-widget-host"),this.host.setAttribute("data-theme",this.config.theme||"auto"),document.body.appendChild(this.host),this.shadow=this.host.attachShadow({mode:"open"});let e=document.createElement("style");e.textContent=R,this.shadow.appendChild(e);let a={none:"0px",md:"12px",xl:"20px"},t=[];this.config.primaryColor&&t.push(`--aiml-primary: ${this.config.primaryColor};`),this.config.radius in a&&t.push(`--aiml-radius: ${a[this.config.radius]};`),t.push(`--aiml-offset-x: ${this.config.offsetX??24}px;`),t.push(`--aiml-offset-y: ${this.config.offsetY??24}px;`),this.config.zIndex&&t.push(`--aiml-z: ${this.config.zIndex};`),e.textContent+=`:host { ${t.join(" ")} }`,this.shadow.appendChild(this._buildTrigger()),this.config.launcherLabel&&this.shadow.appendChild(this._buildLauncherLabel()),this.shadow.appendChild(this._buildWindow()),this._bindEvents(),this._focusTrap()}_buildTrigger(){let e=document.createElement("button"),a=this.config.launcherSize==="sm"?" aiml-sz-sm":this.config.launcherSize==="lg"?" aiml-sz-lg":"";e.className=`aiml-trigger${this.config.position==="left"?" aiml-left":""}${a}`,e.setAttribute("aria-label","Open AI chat assistant"),e.setAttribute("aria-expanded","false"),e.setAttribute("aria-controls","aiml-chat-window");let t=this.config.launcherIconUrl?`<img class="aiml-trigger-img" src="${$(this.config.launcherIconUrl)}" alt="" />`:v.chat;return e.innerHTML=`
      <span class="aiml-icon-open" aria-hidden="true">${t}</span>
      <span class="aiml-icon-close" aria-hidden="true">${v.close}</span>`,e}_buildLauncherLabel(){let e="aiml_label_dismissed",a=!1;try{a=sessionStorage.getItem(e)==="1"}catch{}let t=document.createElement("div");return a||(t.className=`aiml-launcher-label${this.config.position==="left"?" aiml-left":""}`,t.innerHTML=`<span>${f(this.config.launcherLabel)}</span><button class="aiml-label-dismiss" aria-label="Dismiss">${v.close}</button>`,t.querySelector("span").addEventListener("click",()=>this.open()),t.querySelector(".aiml-label-dismiss").addEventListener("click",s=>{s.stopPropagation(),t.remove();try{sessionStorage.setItem(e,"1")}catch{}}),this._labelEl=t),t}_buildWindow(){let e=document.createElement("div");e.className=`aiml-window aiml-hidden${this.config.position==="left"?" aiml-left":""}`,e.setAttribute("id","aiml-chat-window"),e.setAttribute("role","dialog"),e.setAttribute("aria-label","AI Chat Assistant"),e.setAttribute("aria-modal","false");let a=this.config.avatarUrl?`<img class="aiml-avatar-img" src="${$(this.config.avatarUrl)}" alt="" />`:v.bot,t=!!this.config.agentMode,s=N("Support").accent,i=this.config.title||(t?"AI agent team":"AI Assistant"),r=t?'Now: <span class="aiml-header-now" style="color:#fff">Support</span>':f(this.config.subtitle||"Ask me anything");return e.innerHTML=`
      <div class="aiml-header">
        ${t?`<span class="aiml-header-dot-wrap" aria-hidden="true"><span class="aiml-header-dot" style="background:${s}"></span><span class="aiml-header-dot aiml-header-ping" style="background:${s}"></span></span>`:`<div class="aiml-avatar" aria-hidden="true">${a}</div>`}
        <div class="aiml-header-info">
          <div class="aiml-header-title">${$(i)}</div>
          <div class="aiml-header-subtitle">${r}</div>
        </div>
        <span class="aiml-label" title="You are interacting with an AI">AI</span>
        ${t?`<button class="aiml-hbtn aiml-menu-btn" aria-label="More options" aria-haspopup="true" aria-expanded="false" title="More">${v.menu}</button>`:""}
        <button class="aiml-hbtn aiml-max-btn" aria-label="Full screen" title="Full screen">${v.maximize}</button>
        <button class="aiml-hbtn aiml-close-btn" aria-label="Minimize chat" title="Minimize">${v.minus}</button>
        <div class="aiml-menu aiml-hidden" role="menu">
          <button class="aiml-menu-item aiml-menu-human" role="menuitem">${x.user} Talk to a human</button>
          <button class="aiml-menu-item aiml-menu-clear" role="menuitem">${x.loader} Clear conversation</button>
        </div>
      </div>
      <div class="aiml-messages" role="log" aria-live="polite" aria-label="Chat messages"></div>
      <div class="aiml-input-area">
        <textarea
          class="aiml-input"
          placeholder="${$(this.config.placeholder||(t?"Message the team\u2026":"Ask a question\u2026"))}"
          rows="1"
          aria-label="Chat message input"
          aria-multiline="true"
        ></textarea>
        <button class="aiml-send-btn" aria-label="Send message" disabled>
          ${v.send}
        </button>
      </div>
      <div class="aiml-footer${this.config.showBranding===!1?" aiml-no-brand":""}">
        <a class="aiml-badge" href="https://aiml.chat/playground?ref=widget&site=${encodeURIComponent((location.hostname||"").replace(/^www\./,""))}" target="_blank" rel="noopener noreferrer" tabindex="${this.config.showBranding===!1?"-1":"0"}">
          Powered by aiml.chat
        </a>
      </div>`,e}_bindEvents(){let e=this.shadow,a=e.querySelector(".aiml-trigger"),t=e.querySelector(".aiml-close-btn"),s=e.querySelector(".aiml-input"),i=e.querySelector(".aiml-send-btn");a.addEventListener("click",()=>this.toggle()),t.addEventListener("click",()=>this.close());let r=e.querySelector(".aiml-max-btn");r.addEventListener("click",()=>{let u=e.querySelector(".aiml-window").classList.toggle("aiml-maximized");r.innerHTML=u?v.restore:v.maximize,r.title=u?"Exit full screen":"Full screen",r.setAttribute("aria-label",r.title)});let l=e.querySelector(".aiml-menu-btn");if(l){let n=e.querySelector(".aiml-menu"),u=h=>{n.classList.toggle("aiml-hidden",!h),l.setAttribute("aria-expanded",String(h))};l.addEventListener("click",h=>{h.stopPropagation(),u(n.classList.contains("aiml-hidden"))}),e.addEventListener("click",h=>{!n.contains(h.target)&&h.target!==l&&u(!1)}),n.querySelector(".aiml-menu-human").addEventListener("click",()=>{u(!1),this.onTalkToHuman&&this.onTalkToHuman()}),n.querySelector(".aiml-menu-clear").addEventListener("click",()=>{u(!1),this.clearConversation()})}s.addEventListener("input",()=>{i.disabled=!s.value.trim(),s.style.height="auto",s.style.height=Math.min(s.scrollHeight,120)+"px"}),s.addEventListener("keydown",n=>{n.key==="Enter"&&!n.shiftKey&&(n.preventDefault(),i.disabled||this._emitSend(s.value.trim()))}),i.addEventListener("click",()=>{i.disabled||this._emitSend(s.value.trim())}),e.addEventListener("keydown",n=>{n.key==="Escape"&&this.isOpen&&this.close()}),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{this.config.theme==="auto"&&this.host.setAttribute("data-theme","auto")})}_focusTrap(){let e=this.shadow;e.addEventListener("keydown",a=>{if(a.key!=="Tab"||!this.isOpen)return;let t=[...e.querySelectorAll('button:not([disabled]), textarea, a[href], [tabindex]:not([tabindex="-1"])')].filter(r=>!r.closest(".aiml-window.aiml-hidden"));if(!t.length)return;let s=t[0],i=t[t.length-1];a.shiftKey&&document.activeElement===s?(a.preventDefault(),i.focus()):!a.shiftKey&&document.activeElement===i&&(a.preventDefault(),s.focus())})}_emitSend(e){if(!e||this._streaming)return;let a=new CustomEvent("aiml:send",{detail:{text:e},bubbles:!0});this.host.dispatchEvent(a)}open(){if(this.isOpen)return;this.isOpen=!0,this._labelEl&&(this._labelEl.remove(),this._labelEl=null);let e=this.shadow.querySelector(".aiml-window"),a=this.shadow.querySelector(".aiml-trigger");e.classList.remove("aiml-hidden"),a.setAttribute("aria-expanded","true"),a.setAttribute("aria-label","Close AI chat assistant"),setTimeout(()=>{document.hasFocus()&&this.shadow.querySelector(".aiml-input")?.focus()},100),this.config.onOpen&&this.config.onOpen()}close(){if(!this.isOpen)return;this.isOpen=!1;let e=this.shadow.querySelector(".aiml-window"),a=this.shadow.querySelector(".aiml-trigger");e.classList.add("aiml-hidden"),a.setAttribute("aria-expanded","false"),a.setAttribute("aria-label","Open AI chat assistant"),a.focus(),this.config.onClose&&this.config.onClose()}toggle(){this.isOpen?this.close():this.open()}appendUserMessage(e){let a=this.shadow.querySelector(".aiml-messages"),t=document.createElement("div");return t.className="aiml-msg aiml-msg-user",t.setAttribute("role","article"),t.setAttribute("aria-label","You"),t.innerHTML=`<div class="aiml-msg-bubble">${f(e)}</div>`,a.appendChild(t),this._stampTime(t,!0),this._scrollToBottom(),t}_stampTime(e,a){let t=a?"aiml-time-user":"aiml-time-bot",s=e.previousElementSibling;s&&s.classList.contains("aiml-msg-time")&&s.classList.contains(t)&&s.remove();let i=document.createElement("div");i.className=`aiml-msg-time ${t}`,i.textContent=new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}),e.insertAdjacentElement("afterend",i)}startBotMessage(){let e=this.shadow.querySelector(".aiml-messages");this._streaming=!0,this._streamBuffer="",this._toolGroup=null,this._toolRows={};let a=document.createElement("div");a.className="aiml-msg aiml-msg-bot aiml-typing-indicator",a.setAttribute("aria-label","AI is typing"),a.innerHTML='<div class="aiml-msg-bubble"><div class="aiml-typing"><span></span><span></span><span></span></div></div>',e.appendChild(a),this._scrollToBottom(),this._streamingEl=null,this._typingEl=a;let t=this.shadow.querySelector(".aiml-input"),s=this.shadow.querySelector(".aiml-send-btn");return t.disabled=!0,s.disabled=!0,{typing:a}}appendToken(e){if(this._streaming){if(this._streamBuffer+=e,this._typingEl){this._typingEl.remove(),this._typingEl=null;let a=this.shadow.querySelector(".aiml-messages"),t=document.createElement("div");t.className="aiml-msg aiml-msg-bot",t.setAttribute("role","article"),t.setAttribute("aria-label","AI Assistant"),t.innerHTML='<div class="aiml-msg-bubble"></div>',a.appendChild(t),this._streamingEl=t.querySelector(".aiml-msg-bubble"),this._currentBotMsg=t}this._streamingEl&&(this._streamingEl.innerHTML=j(this._streamBuffer),this._scrollToBottom())}}finishBotMessage(e){this._streaming=!1;let a=!!this._streamingEl;this._typingEl&&(this._typingEl.remove(),this._typingEl=null);let t=(e||[]).map(r=>({url:r.sourceUrl||r.SourceUrl||"",title:r.title||r.Title||"",via:r.via||r.Via||""})).filter(r=>r.url);if(this._streamingEl&&t.length){let r=document.createElement("div");r.className="aiml-citations",r.innerHTML='<div class="aiml-citations-title">Sources</div>'+t.map(l=>`<a class="aiml-citation-link" href="${$(l.url)}" target="_blank" rel="noopener noreferrer" title="${$(l.title||l.url)}">${f(l.title||l.url)}`+(l.via?`<span class="aiml-via">via ${f(l.via)}</span>`:"")+"</a>").join(""),this._streamingEl.appendChild(r)}this._streamingEl=null,a&&this._currentBotMsg&&this._stampTime(this._currentBotMsg,!1),this._scrollToBottom();let s=this.shadow.querySelector(".aiml-input");s.disabled=!1,s.value="",s.style.height="",s.focus();let i=this.shadow.querySelector(".aiml-send-btn");i.disabled=!0}clearConversation(){let e=this.shadow.querySelector(".aiml-messages");e&&(e.innerHTML=""),this._streaming=!1,this._streamingEl=null,this._streamBuffer="",this._currentBotMsg=null,this._toolGroup=null,this._toolRows={},this._confirmCards={},this.onClear?this.onClear():this.config.greeting&&this.showGreeting(this.config.greeting)}setAgent(e){if(!e||!this.config.showAgentName)return;this._lastAgent=e;let a=N(e);this.shadow.querySelectorAll(".aiml-header-dot").forEach(r=>{r.style.background=a.accent});let t=this.shadow.querySelector(".aiml-header-now");t&&(t.textContent=e);let s=this._currentBotMsg;if(!s)return;let i=s.querySelector(".aiml-agent-pill");i||(i=document.createElement("span"),i.className="aiml-agent-pill",s.insertBefore(i,s.firstChild)),i.style.setProperty("--ac",a.accent),i.innerHTML=`<span class="aiml-agent-ico">${x[a.icon]}</span>${f(e)}`,this._scrollToBottom()}showHandoff(e){let a=e&&e.to;if(!a)return;this._lastAgent=a,this._toolGroup=null;let t=N(a).accent;this.shadow.querySelectorAll(".aiml-header-dot").forEach(l=>{l.style.background=t});let s=this.shadow.querySelector(".aiml-header-now");s&&(s.textContent=a);let i=this.shadow.querySelector(".aiml-messages"),r=document.createElement("div");r.className="aiml-handoff",r.setAttribute("role","separator"),r.style.setProperty("--ac",t),r.innerHTML=`<div class="aiml-handoff-row"><span class="aiml-handoff-line"></span><span class="aiml-handoff-pill">${x.arrow} Handed off to <b>${f(a)}</b></span><span class="aiml-handoff-line"></span></div>`+(e.reason?`<span class="aiml-handoff-reason">${f(e.reason)}</span>`:""),i.appendChild(r),this._scrollToBottom()}showTool(e){if(!e||!e.id)return;let a=this.shadow.querySelector(".aiml-messages");this._toolGroup||(this._toolGroup=document.createElement("div"),this._toolGroup.className="aiml-tools",this._toolGroup.setAttribute("role","status"),this._toolRows={},a.appendChild(this._toolGroup));let t=this._toolGroup,s=this._toolRows[e.id];s||(s=document.createElement("div"),s.className="aiml-tool-row",t.appendChild(s),this._toolRows[e.id]=s);let i=!e.done,r=e.done&&e.ok===!1,l=i?`<span class="aiml-tool-ico aiml-spin">${x.loader}</span>`:r?`<span class="aiml-tool-ico aiml-err aiml-done">${x.x}</span>`:`<span class="aiml-tool-ico aiml-ok aiml-done">${x.check}</span>`,p=e.server?`<span class="aiml-server-tag">${f(e.server)}</span>`:"";s.innerHTML=`${l}<span class="aiml-tool-label">${f(e.label||e.name||"Working")}${i?"\u2026":""}</span>${p}`;let n=Object.values(this._toolRows);if(n.length&&n.every(u=>u.querySelector(".aiml-done"))){t.classList.add("aiml-tools-done");let u=n.length,h=n.some(y=>y.querySelector(".aiml-err"));t.innerHTML=`<span class="aiml-tool-ico ${h?"aiml-err":"aiml-ok"}">${h?x.x:x.check}</span><span class="aiml-tool-summary">Used ${u} tool${u>1?"s":""}</span>`,this._toolGroup=null}this._scrollToBottom()}showConfirmCard(e,a){if(!e||!e.id)return;this._toolGroup=null;let t=N(this._lastAgent).accent,s=this.shadow.querySelector(".aiml-messages"),i=document.createElement("div");i.className="aiml-confirm",i.setAttribute("role","group"),i.style.setProperty("--ac",t);let r=e.server?`<span class="aiml-server-tag">${f(e.server)}</span>`:"";i.innerHTML=`<div class="aiml-confirm-head"><span class="aiml-confirm-shield">${x.shield}</span>Approval needed${r?`<span class="aiml-confirm-srv">${r}</span>`:""}</div><div class="aiml-confirm-title">${f(e.title||e.action||"Perform this action?")}</div>`+(e.summary?`<div class="aiml-confirm-summary">${f(e.summary)}</div>`:"")+`<div class="aiml-confirm-actions"><button class="aiml-confirm-approve" type="button">${x.check} Allow</button><button class="aiml-confirm-deny" type="button">Not now</button></div><div class="aiml-confirm-foot">${x.lock} Read-only by default \u2014 you approve every change.</div><div class="aiml-confirm-status aiml-hidden" role="status"></div>`;let l=p=>{i.querySelector(".aiml-confirm-actions").classList.add("aiml-hidden"),i.querySelector(".aiml-confirm-foot").classList.add("aiml-hidden");let n=i.querySelector(".aiml-confirm-status");n.classList.remove("aiml-hidden"),n.textContent=p?"Approving\u2026":"Dismissed.",a(p)};i.querySelector(".aiml-confirm-approve").addEventListener("click",()=>l(!0)),i.querySelector(".aiml-confirm-deny").addEventListener("click",()=>l(!1)),this._confirmCards[e.id]=i,s.appendChild(i),this._scrollToBottom()}showConfirmResult(e){let a=e&&this._confirmCards[e.id];if(!a)return;let t=a.querySelector(".aiml-confirm-status");t.classList.remove("aiml-hidden"),t.innerHTML=e.executed?`<span class="aiml-ok">${x.check}</span> Allowed`:"Dismissed",a.classList.add(e.executed?"aiml-confirm-ok":"aiml-confirm-resolved"),delete this._confirmCards[e.id],this._scrollToBottom()}showEscalate(e){let a=this.shadow.querySelector(".aiml-messages");if(a.querySelector(".aiml-escalate"))return;let t=document.createElement("div");t.className="aiml-escalate",t.innerHTML=`<span class="aiml-escalate-ico">${x.user}</span><span class="aiml-escalate-text">Need a person? A teammate can take it from here.</span><button class="aiml-escalate-btn" type="button">Talk to a human</button>`,t.querySelector(".aiml-escalate-btn").addEventListener("click",()=>{t.remove(),e()}),a.appendChild(t),this._scrollToBottom()}showStatus(e,a){let t=this.shadow.querySelector(".aiml-messages"),s=t.querySelector(".aiml-status");s&&s.remove();let i=document.createElement("div");i.className=`aiml-status aiml-status-${e}`,i.setAttribute("role","alert");let r={network:"alert",rate:"clock",quota:"info"}[e];if(r?(i.classList.add("aiml-status-kind"),i.innerHTML=`<span class="aiml-status-ico">${V[r]}</span><span>${f(a)}</span>`):i.textContent=a,t.appendChild(i),this._scrollToBottom(),e==="error"||e==="warn"||r){this._streaming=!1,this._typingEl&&(this._typingEl.remove(),this._typingEl=null);let l=this.shadow.querySelector(".aiml-input");l.disabled=!1;let p=this.shadow.querySelector(".aiml-send-btn");p.disabled=!l.value.trim()}}showAgentWelcome(){let e=this.shadow.querySelector(".aiml-messages"),a=e.querySelector(".aiml-empty");a&&a.remove();let t=document.createElement("div");t.className="aiml-empty",t.innerHTML=`<span class="aiml-empty-ico" aria-hidden="true">${v.sparkles}</span><p class="aiml-empty-title">A team of agents, ready to help</p><p class="aiml-empty-sub">Support, Sales &amp; Technical agents that use live tools \u2014 and ask before acting.</p>`,e.appendChild(t)}showGreeting(e){if(!e)return;let a=this.shadow.querySelector(".aiml-messages"),t=document.createElement("div");t.className="aiml-msg aiml-msg-bot",t.setAttribute("role","article"),t.setAttribute("aria-label","AI Assistant"),t.innerHTML=`<div class="aiml-msg-bubble">${j(e)}</div>`,a.appendChild(t)}showSuggestedChips(e,a){let t=this.shadow.querySelector(".aiml-messages"),s=t.querySelector(".aiml-welcome");s&&s.remove();let i=Array.isArray(e)?e.slice(0,4):[];if(!i.length)return;let r=document.createElement("div");r.className="aiml-welcome",r.innerHTML=`${a?`<p class="aiml-welcome-sub">${f(a)}</p>`:""}<div class="aiml-suggested" role="list">${i.map(l=>`<button class="aiml-suggested-btn" type="button" role="listitem">${f(l)}</button>`).join("")}</div>`,r.querySelectorAll(".aiml-suggested-btn").forEach(l=>{l.addEventListener("click",()=>{r.remove(),this._emitSend(l.textContent)})}),t.appendChild(r),this._scrollToBottom()}showNoAnswerHelp(e,a,t){this.showSuggestedChips(a,"You could ask about:"),t&&this.showLeadCaptureForm(e,t)}hideWelcomeState(){this.shadow.querySelector(".aiml-messages").querySelectorAll(".aiml-welcome, .aiml-empty").forEach(a=>a.remove())}showLeadCaptureForm(e,a,t){let s=this.shadow.querySelector(".aiml-messages"),i=t==="human",r=document.createElement("div");r.className="aiml-lead-form",r.setAttribute("role","form"),r.innerHTML=`
      ${i?'<p class="aiml-lead-title">Connect with a human</p>':""}
      <p class="aiml-lead-text">${i?"Leave your email and a teammate will pick up this thread.":"I couldn't find an answer. Leave your email and we'll get back to you."}</p>
      <div class="aiml-lead-row">
        <input class="aiml-lead-email" type="email" placeholder="you@email.com" aria-label="Your email address" />
        <button class="aiml-lead-submit" type="button">${i?"Send":"Notify me"}</button>
      </div>
      <p class="aiml-lead-error aiml-hidden" role="alert">Please enter a valid email.</p>
      <p class="aiml-lead-success aiml-hidden" role="status">${i?"Thanks \u2014 a teammate will email you shortly.":"Thanks! We'll be in touch."}</p>`;let l=r.querySelector(".aiml-lead-email"),p=r.querySelector(".aiml-lead-submit"),n=r.querySelector(".aiml-lead-error"),u=r.querySelector(".aiml-lead-success");p.addEventListener("click",async()=>{let h=l.value.trim();if(!h||!h.includes("@")){n.classList.remove("aiml-hidden");return}n.classList.add("aiml-hidden"),p.disabled=!0;try{await a(h,e),l.classList.add("aiml-hidden"),p.classList.add("aiml-hidden"),u.classList.remove("aiml-hidden")}catch{p.disabled=!1,n.textContent="Failed to submit. Please try again.",n.classList.remove("aiml-hidden")}}),s.appendChild(r),this._scrollToBottom(),setTimeout(()=>l.focus(),50)}_scrollToBottom(){let e=this.shadow.querySelector(".aiml-messages");e&&(e.scrollTop=e.scrollHeight)}};function f(g){return String(g).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function $(g){return String(g||"").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}(function(){"use strict";if(window.__aimlWidgetLoaded)return;window.__aimlWidgetLoaded=!0;let g="Hi! \u{1F44B} I'm this site's AI assistant. Ask me anything \u2014 I'll answer from this site's own content and show you the sources.",e=document.currentScript||document.querySelector("script[data-api-key]");if(!e){console.warn("[AIML] No script tag found with data-api-key attribute.");return}let a=e.getAttribute("data-api-key"),t=e.getAttribute("data-website-id"),s=e.getAttribute("data-api-url")||"https://api.aiml.chat",i=o=>e.getAttribute("data-"+o),r=i("suggested-questions"),l=r?r.split("|").map(o=>o.trim()).filter(Boolean):null;if(!a){console.warn("[AIML] Missing data-api-key on script tag.");return}let p=o=>o&&/^(#[0-9a-fA-F]{3,8}|(rgb|hsl)a?\([\d\s.,%\/]+\))$/.test(o.trim())?o.trim():null,n=o=>o&&/^https:\/\/[^\s"'<>]+$/i.test(o.trim())?o.trim():null,u=(o,c,O,b)=>{let m=parseInt(o,10);return Number.isFinite(m)?Math.min(b,Math.max(O,m)):c},h=(o,c)=>c.includes(o)?o:null,y=`aiml_session_${t||"default"}`;function S(){try{let o=sessionStorage.getItem(y);return o?JSON.parse(o):{conversationId:null,history:[],visitorId:T()}}catch{return{conversationId:null,history:[],visitorId:T()}}}function _(o){try{sessionStorage.setItem(y,JSON.stringify(o))}catch{}}function T(){return"v-"+Math.random().toString(36).slice(2)+Date.now().toString(36)}async function I(){try{let o=await fetch(`${s}/v1/widgets/${encodeURIComponent(a)}/config`,{headers:{"X-Api-Key":a}});if(o.ok)return await o.json()}catch{}return{}}async function M(){let o=await I(),c=S(),O=l??o.suggestedQuestions??[],b={position:h(i("position"),["left","right"])||o.position||"right",theme:h(i("theme"),["light","dark","auto"])||o.theme||"auto",primaryColor:p(i("primary-color"))||p(o.primaryColor)||null,title:i("title")||o.title||null,subtitle:i("subtitle")||o.subtitle||null,placeholder:o.placeholder||null,greeting:i("greeting")||o.greeting||null,showBranding:o.showBranding!==!1,suggestedQuestions:O,avatarUrl:n(i("avatar"))||n(o.avatarUrl)||null,launcherIconUrl:n(i("launcher-icon"))||n(o.launcherIconUrl)||null,launcherSize:h(i("launcher-size"),["sm","md","lg"])||o.launcherSize||"md",launcherLabel:i("launcher-label")??o.launcherLabel??null,radius:h(i("radius"),["none","md","xl"])||o.radius||"md",offsetX:u(i("offset-x")??o.offsetX,24,0,400),offsetY:u(i("offset-y")??o.offsetY,24,0,400),zIndex:u(i("z-index")??o.zIndex,2147483647,1,2147483647),autoOpenDelaySec:u(i("auto-open")??o.autoOpenDelaySec,0,0,600),hideOnMobile:(i("hide-mobile")??String(o.hideOnMobile??!1))==="true",agentMode:i("mode")==="agent"||o.assistantMode==="agent",showAgentName:(i("show-agent-name")??String(o.showAgentName??!0))!=="false"};if(b.hideOnMobile&&window.matchMedia("(max-width: 640px)").matches)return;let m=new H(b),C=new B(s,a);m.mount();let U=()=>{b.agentMode&&!b.greeting?m.showAgentWelcome():m.showGreeting(b.greeting||g),m.showSuggestedChips(b.suggestedQuestions,"Try asking:")};U(),m.onTalkToHuman=t?()=>m.showLeadCaptureForm("",(z,w)=>C.captureLead(t,z,w),"human"):null,m.onClear=()=>{c.conversationId=null,c.history=[],_(c),U()},b.autoOpenDelaySec>0&&!c.autoOpened&&setTimeout(()=>{m.isOpen||m.open(),c.autoOpened=!0,_(c)},b.autoOpenDelaySec*1e3),m.host.addEventListener("aiml:send",async z=>{let w=z.detail.text;m.hideWelcomeState(),c.history.push({role:"user",content:w}),_(c),m.appendUserMessage(w),m.startBotMessage();let A="",q=!1,E=d=>{q||(q=!0,m.finishBotMessage(d),A&&(c.history.push({role:"assistant",content:A}),_(c)))};await C.send(w,c.history.slice(0,-1),c.conversationId,c.visitorId,{onConversation(d){d&&c.conversationId!==d&&(c.conversationId=d,_(c))},onToken(d){A+=d,m.appendToken(d)},onCitations(d){E(d)},onAgent(d){m.setAgent(d)},onHandoff(d){m.showHandoff(d)},onTool(d){m.showTool(d)},onConfirm(d){m.showConfirmCard(d,L=>G(d.id,L))},onConfirmResult(d){m.showConfirmResult(d)},onEscalate(){t&&m.showEscalate(()=>m.showLeadCaptureForm(w,(d,L)=>C.captureLead(t,d,L),"human"))},onNoAnswer(){E([]),m.showNoAnswerHelp(w,b.suggestedQuestions,t?(d,L)=>C.captureLead(t,d,L):null)},onDone(){E([])},onError(d,L){if(d==="noContent"&&t){m.showLeadCaptureForm(w,async(F,W)=>{await C.captureLead(t,F,W)});return}if(d==="network"){m.showStatus("network","Couldn't connect. Check your internet and try again.");return}if(d==="rateLimit"){m.showStatus("rate","You've asked a lot! Try again in a moment.");return}if(d==="quota"){m.showStatus("quota","This site's monthly limit has been reached.");return}let P={auth:"Authentication failed. Please check your API key.",noContent:"No answer found. Please contact us directly.",stream:"Stream interrupted. Please try again.",server:"Server error. Please try again later."};m.showStatus("error",P[d]||"Something went wrong. Please try again.")}},{mode:b.agentMode?"agent":void 0})});async function G(z,w){m.startBotMessage();let A="",q=!1,E=()=>{q||(q=!0,m.finishBotMessage([]),A&&(c.history.push({role:"assistant",content:A}),_(c)))};await C.send("",c.history,c.conversationId,c.visitorId,{onToken(d){A+=d,m.appendToken(d)},onCitations(){E()},onConfirmResult(d){m.showConfirmResult(d)},onDone(){E()},onError(){m.showStatus("error","Could not complete that action. Please try again.")}},{mode:"agent",approveActionId:z,approveAllow:w})}window.AIML={open:()=>m.open(),close:()=>m.close(),toggle:()=>m.toggle(),clearHistory:()=>{c.history=[],c.conversationId=null,_(c)}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",M):M()})();})();
