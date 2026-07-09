var AIML=(()=>{var N=class{constructor(e,a){this.apiUrl=e.replace(/\/$/,""),this.apiKey=a,this._abortController=null}async captureLead(e,a,t){if(!(await fetch(`${this.apiUrl}/v1/leads`,{method:"POST",headers:{"Content-Type":"application/json","X-Api-Key":this.apiKey},body:JSON.stringify({websiteId:e,email:a,question:t,visitorId:null})})).ok)throw new Error("lead capture failed")}abort(){this._abortController&&(this._abortController.abort(),this._abortController=null)}async send(e,a,t,o,i,r={}){this.abort(),this._abortController=new AbortController;let{signal:m}=this._abortController,u=r.timeoutMs??3e4,n=!1,p,h=()=>{p&&(clearTimeout(p),p=null)};if(typeof AbortSignal<"u"&&AbortSignal.timeout)try{AbortSignal.timeout(u).addEventListener("abort",()=>{n=!0,this._abortController&&!this._abortController.signal.aborted&&this._abortController.abort()})}catch{}else p=setTimeout(()=>{n=!0,this.abort()},u);let S=JSON.stringify({message:e,conversationId:t,visitorId:o,history:a.slice(-6),...r.mode?{mode:r.mode}:{},...r.approveActionId?{approveActionId:r.approveActionId,approveAllow:!!r.approveAllow}:{}}),w;try{w=await fetch(`${this.apiUrl}/v1/chat`,{method:"POST",headers:{"Content-Type":"application/json","X-Api-Key":this.apiKey},body:S,signal:m})}catch(y){if(y.name==="AbortError"){n&&i.onError("network");return}i.onError("network");return}finally{h()}if(w.status===401){i.onError("auth");return}if(w.status===402){i.onError("quota");return}if(w.status===429){let y=w.headers.get("Retry-After")||"60";i.onError("rateLimit",y);return}if(w.status===404){i.onError("noContent");return}if(!w.ok){i.onError("server");return}let A=w.body.getReader(),B=new TextDecoder,z="";try{for(;;){let{done:y,value:l}=await A.read();if(y)break;z+=B.decode(l,{stream:!0});let c=z.split(`
`);z=c.pop();for(let E of c){if(!E.startsWith("data: "))continue;let b=E.slice(6).trim();if(b==="[DONE]"){i.onDone();return}try{let s=JSON.parse(b);s.conversationId&&i.onConversation?.(s.conversationId),s.token!==void 0&&i.onToken(s.token),s.citations&&i.onCitations(s.citations),s.noAnswer&&i.onNoAnswer?.(),s.agent!==void 0&&i.onAgent?.(s.agent),s.handoff&&i.onHandoff?.(s.handoff),s.tool&&i.onTool?.(s.tool),s.confirm&&i.onConfirm?.(s.confirm),s.confirm_result&&i.onConfirmResult?.(s.confirm_result),s.escalate&&i.onEscalate?.()}catch{}}}}catch(y){y.name!=="AbortError"&&i.onError("stream");return}i.onDone()}};var U=`:host {
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
  max-height: calc(100dvh - 120px);
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

/* Mobile: sheet-style chat window so it doesn't feel like a tiny popup.
   Use dvh so the window shrinks when the virtual keyboard opens. */
@media (max-width: 480px) {
  .aiml-window {
    width: calc(100vw - 24px);
    height: calc(100dvh - 100px);
    max-height: calc(100dvh - 100px);
    bottom: calc(var(--aiml-offset-y) + 64px);
    right: 12px;
    left: 12px;
    border-radius: calc(var(--aiml-radius) + 4px);
  }
  .aiml-window.aiml-left { right: 12px; left: 12px; }
  .aiml-window.aiml-maximized {
    width: calc(100vw - 24px);
    height: calc(100dvh - 100px);
    bottom: calc(var(--aiml-offset-y) + 64px);
  }
  .aiml-trigger {
    width: 48px;
    height: 48px;
  }
}

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

/* Header \u2014 minimal default blends into any site; solid variant keeps the branded look. */
.aiml-header {
  padding: 13px 16px;
  background: var(--aiml-bg);
  color: var(--aiml-text);
  border-bottom: 1px solid var(--aiml-border);
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  position: relative;
}
.aiml-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--aiml-surface);
  border: 1px solid var(--aiml-border);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.aiml-header-info { flex: 1; min-width: 0; }
.aiml-header-title { font-weight: 600; font-size: 14px; }
.aiml-header-subtitle { font-size: 11px; color: var(--aiml-text-muted); }
.aiml-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  background: var(--aiml-surface);
  color: var(--aiml-text-muted);
  border: 1px solid var(--aiml-border);
  border-radius: 4px;
  padding: 2px 6px;
  text-transform: uppercase;
  flex-shrink: 0;
}
.aiml-close-btn, .aiml-hbtn {
  background: none; border: none; color: var(--aiml-text-muted);
  cursor: pointer; padding: 4px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.aiml-close-btn:hover, .aiml-hbtn:hover { background: rgba(0,0,0,0.06); color: var(--aiml-text); }
.aiml-close-btn:focus-visible, .aiml-hbtn:focus-visible { outline: 2px solid var(--aiml-primary); outline-offset: 1px; }

/* Solid header variant (legacy branded look). */
.aiml-header-solid .aiml-header {
  background: var(--aiml-primary);
  color: #fff;
  border-bottom-color: transparent;
}
.aiml-header-solid .aiml-avatar { background: rgba(255,255,255,0.25); border-color: transparent; }
.aiml-header-solid .aiml-header-subtitle { color: rgba(255,255,255,0.85); }
.aiml-header-solid .aiml-label { background: rgba(255,255,255,0.2); color: #fff; border-color: transparent; }
.aiml-header-solid .aiml-close-btn,
.aiml-header-solid .aiml-hbtn { color: rgba(255,255,255,0.85); }
.aiml-header-solid .aiml-close-btn:hover,
.aiml-header-solid .aiml-hbtn:hover { background: rgba(255,255,255,0.15); color: #fff; }
.aiml-header-solid .aiml-close-btn:focus-visible,
.aiml-header-solid .aiml-hbtn:focus-visible { outline-color: rgba(255,255,255,0.6); }

/* Header chrome (agent mode + maximize) */
.aiml-header-dot-wrap { position: relative; width: 12px; height: 12px; flex-shrink: 0; display: inline-flex; }
/* Minimal header: agent accent dot needs a subtle ring to read on white/cream. */
.aiml-header-dot { position: absolute; inset: 1px; border-radius: 50%; transition: background 0.3s; box-shadow: 0 0 0 2px rgba(0,0,0,0.08); }
.aiml-header-solid .aiml-header-dot { box-shadow: 0 0 0 2px rgba(255,255,255,0.85); }
.aiml-header-ping { box-shadow: none; animation: aiml-ping 1.6s cubic-bezier(0,0,0.2,1) infinite; opacity: 0.45; }
@keyframes aiml-ping { 0% { transform: scale(1); opacity: 0.45; } 75%, 100% { transform: scale(2.4); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .aiml-header-ping { animation: none; opacity: 0; } }
.aiml-header-now { font-weight: 600; color: var(--aiml-text); }
.aiml-header-solid .aiml-header-now { color: #fff; }
.aiml-menu {
  position: absolute; top: 100%; right: 12px; margin-top: 4px; z-index: 30;
  min-width: 190px; padding: 4px;
  background: var(--aiml-bg); color: var(--aiml-text);
  border: 1px solid var(--aiml-border); border-radius: 10px;
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
  height: min(760px, calc(100dvh - 32px));
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
  position: relative;
}
@keyframes aiml-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.aiml-msg-user { align-self: flex-end; align-items: flex-end; }
.aiml-msg-bubble {
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  max-width: 100%;
  min-width: 0;
  position: relative;
}
/* Speech tails \u2014 default chat-like style. A small pseudo-element sits at the bubble's bottom corner
   and curves back INTO the bubble, so it reads as a tapered tail flick rather than a protruding
   half-circle. Kept additive (bubble-coloured) so it works on any host-page background. */
.aiml-msg-bubble::before {
  content: '';
  position: absolute;
  bottom: 0;
  width: 10px;
  height: 12px;
  pointer-events: none;
}
.aiml-msg-user .aiml-msg-bubble {
  background: var(--aiml-primary);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.aiml-msg-user .aiml-msg-bubble::before {
  right: -5px;
  background: var(--aiml-primary);
  /* Curve toward the bubble (bottom-left), leaving a soft tip on the outer side. */
  border-bottom-left-radius: 12px;
}
.aiml-msg-bot .aiml-msg-bubble {
  background: var(--aiml-surface);
  color: var(--aiml-text);
  border: 1px solid var(--aiml-border);
  border-bottom-left-radius: 4px;
}
.aiml-msg-bot .aiml-msg-bubble::before {
  left: -5px;
  background: var(--aiml-surface);
  /* Curve toward the bubble (bottom-right), leaving a soft tip on the outer side. */
  border-bottom-right-radius: 12px;
  border-bottom: 1px solid var(--aiml-border);
  border-left: 1px solid var(--aiml-border);
}

/* Flat bubble variant (legacy sharp-corner style). */
.aiml-bubbles-flat .aiml-msg-bubble { border-radius: 16px; }
.aiml-bubbles-flat .aiml-msg-bubble::before { display: none; }
.aiml-bubbles-flat .aiml-msg-user .aiml-msg-bubble { border-bottom-right-radius: 4px; }
.aiml-bubbles-flat .aiml-msg-bot .aiml-msg-bubble { border-bottom-left-radius: 4px; }

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
/* Non-web source (uploaded file, pasted text, MCP resource): attribution only, nothing to click. */
.aiml-citation-static { color: var(--aiml-text); opacity: 0.75; cursor: default; }
.aiml-citation-static:hover { text-decoration: none; }

/* Typing indicator \u2014 contextual label + single pulsing orb. */
.aiml-typing { display: flex; gap: 8px; padding: 8px 14px; align-items: center; }
.aiml-typing-orb {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--aiml-primary);
  animation: aiml-pulse-orb 1.4s ease-in-out infinite;
  flex-shrink: 0;
}
.aiml-typing-label {
  font-size: 13px;
  color: var(--aiml-text-muted);
  line-height: 1.4;
}
@keyframes aiml-pulse-orb {
  0%, 100% { transform: scale(0.85); opacity: 0.55; }
  50% { transform: scale(1.1); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .aiml-typing-orb { animation: none; opacity: 0.7; }
}

/* Streaming caret cursor \u2014 blinks at the end of the in-flight answer. */
.aiml-caret {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  background: var(--aiml-primary);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: aiml-caret-blink 1s step-end infinite;
}
@keyframes aiml-caret-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .aiml-caret { animation: none; opacity: 0.6; } }

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
`;function j(g){if(!g)return"";let e=V(g);e=e.replace(/```(\w*)\n([\s\S]*?)```/g,(m,u,n)=>`<pre><code>${n.trimEnd()}</code></pre>`),e=e.replace(/`([^`]+)`/g,"<code>$1</code>"),e=e.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"),e=e.replace(/(^|[\s(])__(?!\s)(.+?)__(?=$|[\s.,;:!?)])/gm,"$1<strong>$2</strong>"),e=e.replace(/\*([^*\n]+)\*/g,"<em>$1</em>"),e=e.replace(/(^|[\s(])_(?!\s)([^_\n]+)_(?=$|[\s.,;:!?)])/gm,"$1<em>$2</em>"),e=e.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');let a=e.split(`
`),t=[],o=!1,i=!1;for(let m=0;m<a.length;m++){let u=a[m],n=u.match(/^(#{1,3}) (.+)/);if(n){r();let S=Math.min(n[1].length+2,6);t.push(`<h${S}>${n[2]}</h${S}>`);continue}let p=u.match(/^[-*] (.+)/);if(p){o||(t.push("<ul>"),o=!0),t.push(`<li>${p[1]}</li>`);continue}let h=u.match(/^\d+\. (.+)/);if(h){i||(t.push("<ol>"),i=!0),t.push(`<li>${h[1]}</li>`);continue}r(),u.trim()===""?t.push(""):t.push(`<p>${u}</p>`)}r();function r(){o&&(t.push("</ul>"),o=!1),i&&(t.push("</ol>"),i=!1)}return t.join(`
`).replace(/<\/p>\n<p>/g,"<br>").replace(/\n{2,}/g,`
`)}function G(g){return g&&g.replace(/[ \t]*(?<![A-Za-z0-9])\[\d{1,2}\](?:[ \t]*\[\d{1,2}\])*/g,"").replace(/[ \t]*(?<![A-Za-z0-9])\[\d{0,2}$/g,"")}function V(g){return g.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}var v={chat:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',close:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',send:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',bot:"\u{1F916}",minus:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',maximize:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',restore:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',menu:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>',sparkles:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15z"/></svg>'},R=g=>`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${g}</svg>`,X={alert:R('<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),clock:R('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),info:R('<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>')},_=g=>`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${g}</svg>`,x={msg:_('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),spark:_('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/>'),code:_('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),arrow:_('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'),shield:_('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),lock:_('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),check:_('<polyline points="20 6 9 17 4 12"/>'),x:_('<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'),loader:_('<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.9" y1="4.9" x2="7.8" y2="7.8"/><line x1="16.2" y1="16.2" x2="19.1" y2="19.1"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.9" y1="19.1" x2="7.8" y2="16.2"/><line x1="16.2" y1="7.8" x2="19.1" y2="4.9"/>'),user:_('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>')},J={Support:{accent:"#4F46E5",icon:"msg"},Sales:{accent:"#7C3AED",icon:"spark"},Technical:{accent:"#0F766E",icon:"code"}},Q={accent:"#78716C",icon:"spark"},H=g=>J[g]||Q,O=class{constructor(e){this.config=e,this.host=null,this.shadow=null,this.isOpen=!1,this._streaming=!1,this._streamingEl=null,this._streamBuffer="",this._currentBotMsg=null,this._lastAgent=null,this._confirmCards={},this._toolGroup=null,this._toolRows={},this._typingLabelEl=null,this._caretEl=null,this._renderTimer=null}mount(){this.host=document.createElement("div"),this.host.setAttribute("id","aiml-widget-host"),this.host.setAttribute("data-theme",this.config.theme||"auto"),document.body.appendChild(this.host),this.shadow=this.host.attachShadow({mode:"open"});let e=document.createElement("style");e.textContent=U,this.shadow.appendChild(e);let a={none:"0px",md:"12px",xl:"20px"},t=[];this.config.primaryColor&&t.push(`--aiml-primary: ${this.config.primaryColor};`),this.config.radius in a&&t.push(`--aiml-radius: ${a[this.config.radius]};`),t.push(`--aiml-offset-x: ${this.config.offsetX??24}px;`),t.push(`--aiml-offset-y: ${this.config.offsetY??24}px;`),this.config.zIndex&&t.push(`--aiml-z: ${this.config.zIndex};`),e.textContent+=`:host { ${t.join(" ")} }`;let o=["aiml-widget-host"];this.config.headerStyle==="solid"&&o.push("aiml-header-solid"),this.config.bubbleStyle==="flat"&&o.push("aiml-bubbles-flat"),this.host.className=o.join(" "),this.shadow.appendChild(this._buildTrigger()),this.config.launcherLabel&&this.shadow.appendChild(this._buildLauncherLabel()),this.shadow.appendChild(this._buildWindow()),this._bindEvents(),this._focusTrap()}_buildTrigger(){let e=document.createElement("button"),a=this.config.launcherSize==="sm"?" aiml-sz-sm":this.config.launcherSize==="lg"?" aiml-sz-lg":"";e.className=`aiml-trigger${this.config.position==="left"?" aiml-left":""}${a}`,e.setAttribute("aria-label","Open AI chat assistant"),e.setAttribute("aria-expanded","false"),e.setAttribute("aria-controls","aiml-chat-window");let t=this.config.launcherIconUrl?`<img class="aiml-trigger-img" src="${L(this.config.launcherIconUrl)}" alt="" />`:v.chat;return e.innerHTML=`
      <span class="aiml-icon-open" aria-hidden="true">${t}</span>
      <span class="aiml-icon-close" aria-hidden="true">${v.close}</span>`,e}_buildLauncherLabel(){let e="aiml_label_dismissed",a=!1;try{a=sessionStorage.getItem(e)==="1"}catch{}let t=document.createElement("div");return a||(t.className=`aiml-launcher-label${this.config.position==="left"?" aiml-left":""}`,t.innerHTML=`<span>${f(this.config.launcherLabel)}</span><button class="aiml-label-dismiss" aria-label="Dismiss">${v.close}</button>`,t.querySelector("span").addEventListener("click",()=>this.open()),t.querySelector(".aiml-label-dismiss").addEventListener("click",o=>{o.stopPropagation(),t.remove();try{sessionStorage.setItem(e,"1")}catch{}}),this._labelEl=t),t}_buildWindow(){let e=document.createElement("div");e.className=`aiml-window aiml-hidden${this.config.position==="left"?" aiml-left":""}`,e.setAttribute("id","aiml-chat-window"),e.setAttribute("role","dialog"),e.setAttribute("aria-label","AI Chat Assistant"),e.setAttribute("aria-modal","false");let a=this.config.avatarUrl?`<img class="aiml-avatar-img" src="${L(this.config.avatarUrl)}" alt="" />`:v.bot,t=!!this.config.agentMode,o=H("Support").accent,i=this.config.title||(t?"AI agent team":"AI Assistant"),r=t?'Now: <span class="aiml-header-now">Support</span>':f(this.config.subtitle||"Ask me anything");return e.innerHTML=`
      <div class="aiml-header">
        ${t?`<span class="aiml-header-dot-wrap" aria-hidden="true"><span class="aiml-header-dot" style="background:${o}"></span><span class="aiml-header-dot aiml-header-ping" style="background:${o}"></span></span>`:`<div class="aiml-avatar" aria-hidden="true">${a}</div>`}
        <div class="aiml-header-info">
          <div class="aiml-header-title">${L(i)}</div>
          <div class="aiml-header-subtitle">${r}</div>
        </div>
        ${this.config.showAiBadge!==!1?'<span class="aiml-label" title="You are interacting with an AI">AI</span>':""}
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
          placeholder="${L(this.config.placeholder||(t?"Message the team\u2026":"Ask a question\u2026"))}"
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
      </div>`,e}_bindEvents(){let e=this.shadow,a=e.querySelector(".aiml-trigger"),t=e.querySelector(".aiml-close-btn"),o=e.querySelector(".aiml-input"),i=e.querySelector(".aiml-send-btn");a.addEventListener("click",()=>this.toggle()),t.addEventListener("click",()=>this.close());let r=e.querySelector(".aiml-max-btn");r.addEventListener("click",()=>{let p=e.querySelector(".aiml-window").classList.toggle("aiml-maximized");r.innerHTML=p?v.restore:v.maximize,r.title=p?"Exit full screen":"Full screen",r.setAttribute("aria-label",r.title)});let m=e.querySelector(".aiml-menu-btn");if(m){let n=e.querySelector(".aiml-menu"),p=h=>{n.classList.toggle("aiml-hidden",!h),m.setAttribute("aria-expanded",String(h))};m.addEventListener("click",h=>{h.stopPropagation(),p(n.classList.contains("aiml-hidden"))}),e.addEventListener("click",h=>{!n.contains(h.target)&&h.target!==m&&p(!1)}),n.querySelector(".aiml-menu-human").addEventListener("click",()=>{p(!1),this.onTalkToHuman&&this.onTalkToHuman()}),n.querySelector(".aiml-menu-clear").addEventListener("click",()=>{p(!1),this.clearConversation()})}o.addEventListener("input",()=>{i.disabled=!o.value.trim(),o.style.height="auto",o.style.height=Math.min(o.scrollHeight,120)+"px"}),o.addEventListener("keydown",n=>{n.key==="Enter"&&!n.shiftKey&&(n.preventDefault(),i.disabled||this._emitSend(o.value.trim()))}),i.addEventListener("click",()=>{i.disabled||this._emitSend(o.value.trim())}),e.addEventListener("keydown",n=>{n.key==="Escape"&&this.isOpen&&this.close()}),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{this.config.theme==="auto"&&this.host.setAttribute("data-theme","auto")})}_focusTrap(){let e=this.shadow;e.addEventListener("keydown",a=>{if(a.key!=="Tab"||!this.isOpen)return;let t=[...e.querySelectorAll('button:not([disabled]), textarea, a[href], [tabindex]:not([tabindex="-1"])')].filter(m=>!m.closest(".aiml-window.aiml-hidden"));if(!t.length)return;let o=t[0],i=t[t.length-1],r=e.activeElement;a.shiftKey&&r===o?(a.preventDefault(),i.focus()):!a.shiftKey&&r===i&&(a.preventDefault(),o.focus())})}_emitSend(e){if(!e||this._streaming)return;let a=new CustomEvent("aiml:send",{detail:{text:e},bubbles:!0});this.host.dispatchEvent(a)}open(){if(this.isOpen)return;this.isOpen=!0,this._labelEl&&(this._labelEl.remove(),this._labelEl=null);let e=this.shadow.querySelector(".aiml-window"),a=this.shadow.querySelector(".aiml-trigger");e.classList.remove("aiml-hidden"),a.setAttribute("aria-expanded","true"),a.setAttribute("aria-label","Close AI chat assistant"),setTimeout(()=>{document.hasFocus()&&this.shadow.querySelector(".aiml-input")?.focus()},100),this.config.onOpen&&this.config.onOpen()}close(){if(!this.isOpen)return;this.isOpen=!1;let e=this.shadow.querySelector(".aiml-window"),a=this.shadow.querySelector(".aiml-trigger");e.classList.add("aiml-hidden"),a.setAttribute("aria-expanded","false"),a.setAttribute("aria-label","Open AI chat assistant"),a.focus(),this.config.onClose&&this.config.onClose()}toggle(){this.isOpen?this.close():this.open()}appendUserMessage(e){let a=this.shadow.querySelector(".aiml-messages"),t=document.createElement("div");return t.className="aiml-msg aiml-msg-user",t.setAttribute("role","article"),t.setAttribute("aria-label","You"),t.innerHTML=`<div class="aiml-msg-bubble">${f(e)}</div>`,a.appendChild(t),this._stampTime(t,!0),this._scrollToBottom(),t}_stampTime(e,a){let t=a?"aiml-time-user":"aiml-time-bot",o=e.previousElementSibling;o&&o.classList.contains("aiml-msg-time")&&o.classList.contains(t)&&o.remove();let i=document.createElement("div");i.className=`aiml-msg-time ${t}`,i.textContent=new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}),e.insertAdjacentElement("afterend",i)}startBotMessage(){let e=this.shadow.querySelector(".aiml-messages");this._streaming=!0,this._streamBuffer="",this._toolGroup=null,this._toolRows={};let a=document.createElement("div");a.className="aiml-msg aiml-msg-bot aiml-typing-indicator",a.setAttribute("aria-label",this._typingLabel()),a.innerHTML=`<div class="aiml-msg-bubble"><div class="aiml-typing"><span class="aiml-typing-orb" aria-hidden="true"></span><span class="aiml-typing-label">${f(this._typingLabel())}</span></div></div>`,e.appendChild(a),this._scrollToBottom(),this._streamingEl=null,this._typingEl=a,this._typingLabelEl=a.querySelector(".aiml-typing-label");let t=this.shadow.querySelector(".aiml-input"),o=this.shadow.querySelector(".aiml-send-btn");return t.disabled=!0,o.disabled=!0,{typing:a}}_typingLabel(){if(this._toolGroup&&!this._toolGroup.classList.contains("aiml-tools-done")){let e=Object.values(this._toolRows);if(e.length){let a=e.filter(t=>!t.querySelector(".aiml-done")).map(t=>t.querySelector(".aiml-tool-label")?.textContent?.replace(/…$/,"")).filter(Boolean);if(a.length)return`${a[0]}\u2026`}return this.config.agentMode?`${this._lastAgent||"Agent"} is using tools\u2026`:"Searching your docs\u2026"}return this.config.agentMode&&this._lastAgent?`${this._lastAgent} is typing\u2026`:"AI is typing\u2026"}_updateTypingLabel(){if(!this._typingLabelEl)return;let e=this._typingLabel();this._typingLabelEl.textContent=e,this._typingEl&&this._typingEl.setAttribute("aria-label",e)}appendToken(e){if(this._streaming){if(this._streamBuffer+=e,this._typingEl){this._typingEl.remove(),this._typingEl=null;let a=this.shadow.querySelector(".aiml-messages"),t=document.createElement("div");t.className="aiml-msg aiml-msg-bot",t.setAttribute("role","article"),t.setAttribute("aria-label","AI Assistant"),t.innerHTML='<div class="aiml-msg-bubble"><span class="aiml-stream-content" aria-hidden="true"></span><span class="aiml-caret" aria-hidden="true"></span></div>',a.appendChild(t),this._streamingEl=t.querySelector(".aiml-msg-bubble"),this._currentBotMsg=t,this._caretEl=t.querySelector(".aiml-caret")}this._shouldRenderNow(e)?this._flushStreamRender():this._scheduleStreamRender()}}_shouldRenderNow(e){let a=this._streamBuffer.slice(-30);return/\n/.test(e)||/[.!?](\s+|$)/.test(a)||/```\s*$/.test(a)||/\]\s*\([^)]*\)\s*$/.test(a)||/^[-*]\s+/.test(e)}_scheduleStreamRender(){this._renderTimer||(this._renderTimer=setTimeout(()=>{this._renderTimer=null,this._flushStreamRender()},80))}_flushStreamRender(){if(this._renderTimer&&(clearTimeout(this._renderTimer),this._renderTimer=null),!this._streamingEl)return;let e=this._streamingEl.querySelector(".aiml-stream-content");e&&(e.innerHTML=j(G(this._streamBuffer)),this._caretEl&&this._caretEl.parentElement!==this._streamingEl&&this._streamingEl.appendChild(this._caretEl),this._scrollToBottom())}finishBotMessage(e){this._streaming=!1;let a=!!this._streamingEl;this._renderTimer&&(clearTimeout(this._renderTimer),this._renderTimer=null),this._typingEl&&(this._typingEl.remove(),this._typingEl=null);let t=(e||[]).map(r=>({url:r.sourceUrl||r.SourceUrl||"",title:r.title||r.Title||"",via:r.via||r.Via||""})).filter(r=>r.url);if(this._streamingEl&&t.length){let r=document.createElement("div");r.className="aiml-citations",r.innerHTML='<div class="aiml-citations-title">Sources</div>'+t.map(m=>{let u=/^https?:\/\//i.test(m.url),n=m.title||(u?m.url:"Source"),p=m.via?`<span class="aiml-via">via ${f(m.via)}</span>`:"";return u?`<a class="aiml-citation-link" href="${L(m.url)}" target="_blank" rel="noopener noreferrer" title="${L(n)}">${f(n)}${p}</a>`:`<span class="aiml-citation-link aiml-citation-static" title="${L(n)}">${f(n)}${p}</span>`}).join(""),this._streamingEl.appendChild(r)}if(this._caretEl&&(this._caretEl.remove(),this._caretEl=null),this._currentBotMsg){let r=this._currentBotMsg.querySelector(".aiml-stream-content");r&&r.removeAttribute("aria-hidden")}this._streamingEl=null,this._typingLabelEl=null,a&&this._currentBotMsg&&this._stampTime(this._currentBotMsg,!1),this._scrollToBottom();let o=this.shadow.querySelector(".aiml-input");o.disabled=!1,o.value="",o.style.height="",o.focus();let i=this.shadow.querySelector(".aiml-send-btn");i.disabled=!0}clearConversation(){this._renderTimer&&(clearTimeout(this._renderTimer),this._renderTimer=null);let e=this.shadow.querySelector(".aiml-messages");e&&(e.innerHTML=""),this._streaming=!1,this._streamingEl=null,this._streamBuffer="",this._currentBotMsg=null,this._caretEl=null,this._typingLabelEl=null,this._toolGroup=null,this._toolRows={},this._confirmCards={},this.onClear?this.onClear():this.config.greeting&&this.showGreeting(this.config.greeting)}setAgent(e){if(!e||!this.config.showAgentName)return;this._lastAgent=e;let a=H(e);this.shadow.querySelectorAll(".aiml-header-dot").forEach(r=>{r.style.background=a.accent});let t=this.shadow.querySelector(".aiml-header-now");t&&(t.textContent=e);let o=this._currentBotMsg;if(!o)return;let i=o.querySelector(".aiml-agent-pill");i||(i=document.createElement("span"),i.className="aiml-agent-pill",o.insertBefore(i,o.firstChild)),i.style.setProperty("--ac",a.accent),i.innerHTML=`<span class="aiml-agent-ico">${x[a.icon]}</span>${f(e)}`,this._scrollToBottom()}showHandoff(e){let a=e&&e.to;if(!a)return;this._lastAgent=a,this._toolGroup=null;let t=H(a).accent;this.shadow.querySelectorAll(".aiml-header-dot").forEach(m=>{m.style.background=t});let o=this.shadow.querySelector(".aiml-header-now");o&&(o.textContent=a);let i=this.shadow.querySelector(".aiml-messages"),r=document.createElement("div");r.className="aiml-handoff",r.setAttribute("role","separator"),r.style.setProperty("--ac",t),r.innerHTML=`<div class="aiml-handoff-row"><span class="aiml-handoff-line"></span><span class="aiml-handoff-pill">${x.arrow} Handed off to <b>${f(a)}</b></span><span class="aiml-handoff-line"></span></div>`+(e.reason?`<span class="aiml-handoff-reason">${f(e.reason)}</span>`:""),i.appendChild(r),this._scrollToBottom()}showTool(e){if(!e||!e.id)return;this._updateTypingLabel();let a=this.shadow.querySelector(".aiml-messages");this._toolGroup||(this._toolGroup=document.createElement("div"),this._toolGroup.className="aiml-tools",this._toolGroup.setAttribute("role","status"),this._toolRows={},a.appendChild(this._toolGroup));let t=this._toolGroup,o=this._toolRows[e.id];o||(o=document.createElement("div"),o.className="aiml-tool-row",t.appendChild(o),this._toolRows[e.id]=o);let i=!e.done,r=e.done&&e.ok===!1,m=i?`<span class="aiml-tool-ico aiml-spin">${x.loader}</span>`:r?`<span class="aiml-tool-ico aiml-err aiml-done">${x.x}</span>`:`<span class="aiml-tool-ico aiml-ok aiml-done">${x.check}</span>`,u=e.server?`<span class="aiml-server-tag">${f(e.server)}</span>`:"";o.innerHTML=`${m}<span class="aiml-tool-label">${f(e.label||e.name||"Working")}${i?"\u2026":""}</span>${u}`;let n=Object.values(this._toolRows);if(n.length&&n.every(p=>p.querySelector(".aiml-done"))){t.classList.add("aiml-tools-done");let p=n.length,h=n.some(S=>S.querySelector(".aiml-err"));t.innerHTML=`<span class="aiml-tool-ico ${h?"aiml-err":"aiml-ok"}">${h?x.x:x.check}</span><span class="aiml-tool-summary">Used ${p} tool${p>1?"s":""}</span>`,this._toolGroup=null}this._scrollToBottom()}showConfirmCard(e,a){if(!e||!e.id)return;this._toolGroup=null;let t=H(this._lastAgent).accent,o=this.shadow.querySelector(".aiml-messages"),i=document.createElement("div");i.className="aiml-confirm",i.setAttribute("role","group"),i.style.setProperty("--ac",t);let r=e.server?`<span class="aiml-server-tag">${f(e.server)}</span>`:"";i.innerHTML=`<div class="aiml-confirm-head"><span class="aiml-confirm-shield">${x.shield}</span>Approval needed${r?`<span class="aiml-confirm-srv">${r}</span>`:""}</div><div class="aiml-confirm-title">${f(e.title||e.action||"Perform this action?")}</div>`+(e.summary?`<div class="aiml-confirm-summary">${f(e.summary)}</div>`:"")+`<div class="aiml-confirm-actions"><button class="aiml-confirm-approve" type="button">${x.check} Allow</button><button class="aiml-confirm-deny" type="button">Not now</button></div><div class="aiml-confirm-foot">${x.lock} Read-only by default \u2014 you approve every change.</div><div class="aiml-confirm-status aiml-hidden" role="status"></div>`;let m=u=>{i.querySelector(".aiml-confirm-actions").classList.add("aiml-hidden"),i.querySelector(".aiml-confirm-foot").classList.add("aiml-hidden");let n=i.querySelector(".aiml-confirm-status");n.classList.remove("aiml-hidden"),n.textContent=u?"Approving\u2026":"Dismissed.",a(u)};i.querySelector(".aiml-confirm-approve").addEventListener("click",()=>m(!0)),i.querySelector(".aiml-confirm-deny").addEventListener("click",()=>m(!1)),this._confirmCards[e.id]=i,o.appendChild(i),this._scrollToBottom()}showConfirmResult(e){let a=e&&this._confirmCards[e.id];if(!a)return;let t=a.querySelector(".aiml-confirm-status");t.classList.remove("aiml-hidden"),t.innerHTML=e.executed?`<span class="aiml-ok">${x.check}</span> Allowed`:"Dismissed",a.classList.add(e.executed?"aiml-confirm-ok":"aiml-confirm-resolved"),delete this._confirmCards[e.id],this._scrollToBottom()}showEscalate(e){let a=this.shadow.querySelector(".aiml-messages");if(a.querySelector(".aiml-escalate"))return;let t=document.createElement("div");t.className="aiml-escalate",t.innerHTML=`<span class="aiml-escalate-ico">${x.user}</span><span class="aiml-escalate-text">Need a person? A teammate can take it from here.</span><button class="aiml-escalate-btn" type="button">Talk to a human</button>`,t.querySelector(".aiml-escalate-btn").addEventListener("click",()=>{t.remove(),e()}),a.appendChild(t),this._scrollToBottom()}showStatus(e,a){let t=this.shadow.querySelector(".aiml-messages"),o=t.querySelector(".aiml-status");o&&o.remove();let i=document.createElement("div");i.className=`aiml-status aiml-status-${e}`,i.setAttribute("role","alert");let r={network:"alert",rate:"clock",quota:"info"}[e];if(r?(i.classList.add("aiml-status-kind"),i.innerHTML=`<span class="aiml-status-ico">${X[r]}</span><span>${f(a)}</span>`):i.textContent=a,t.appendChild(i),this._scrollToBottom(),e==="error"||e==="warn"||r){this._streaming=!1,this._typingEl&&(this._typingEl.remove(),this._typingEl=null);let m=this.shadow.querySelector(".aiml-input");m.disabled=!1;let u=this.shadow.querySelector(".aiml-send-btn");u.disabled=!m.value.trim()}}showAgentWelcome(){let e=this.shadow.querySelector(".aiml-messages"),a=e.querySelector(".aiml-empty");a&&a.remove();let t=document.createElement("div");t.className="aiml-empty",t.innerHTML=`<span class="aiml-empty-ico" aria-hidden="true">${v.sparkles}</span><p class="aiml-empty-title">A team of agents, ready to help</p><p class="aiml-empty-sub">Support, Sales &amp; Technical agents that use live tools \u2014 and ask before acting.</p>`,e.appendChild(t)}showGreeting(e){if(!e)return;let a=this.shadow.querySelector(".aiml-messages"),t=document.createElement("div");t.className="aiml-msg aiml-msg-bot",t.setAttribute("role","article"),t.setAttribute("aria-label","AI Assistant"),t.innerHTML=`<div class="aiml-msg-bubble">${j(e)}</div>`,a.appendChild(t)}showSuggestedChips(e,a){let t=this.shadow.querySelector(".aiml-messages"),o=t.querySelector(".aiml-welcome");o&&o.remove();let i=Array.isArray(e)?e.slice(0,4):[];if(!i.length)return;let r=document.createElement("div");r.className="aiml-welcome",r.innerHTML=`${a?`<p class="aiml-welcome-sub">${f(a)}</p>`:""}<div class="aiml-suggested" role="list">${i.map(m=>`<button class="aiml-suggested-btn" type="button" role="listitem">${f(m)}</button>`).join("")}</div>`,r.querySelectorAll(".aiml-suggested-btn").forEach(m=>{m.addEventListener("click",()=>{r.remove(),this._emitSend(m.textContent)})}),t.appendChild(r),this._scrollToBottom()}showNoAnswerHelp(e,a,t){this.showSuggestedChips(a,"You could ask about:"),t&&this.showLeadCaptureForm(e,t)}hideWelcomeState(){this.shadow.querySelector(".aiml-messages").querySelectorAll(".aiml-welcome, .aiml-empty").forEach(a=>a.remove())}showLeadCaptureForm(e,a,t){let o=this.shadow.querySelector(".aiml-messages"),i=t==="human",r=document.createElement("div");r.className="aiml-lead-form",r.setAttribute("role","form"),r.innerHTML=`
      ${i?'<p class="aiml-lead-title">Connect with a human</p>':""}
      <p class="aiml-lead-text">${i?"Leave your email and a teammate will pick up this thread.":"I couldn't find an answer. Leave your email and we'll get back to you."}</p>
      <div class="aiml-lead-row">
        <input class="aiml-lead-email" type="email" placeholder="you@email.com" aria-label="Your email address" />
        <button class="aiml-lead-submit" type="button">${i?"Send":"Notify me"}</button>
      </div>
      <p class="aiml-lead-error aiml-hidden" role="alert">Please enter a valid email.</p>
      <p class="aiml-lead-success aiml-hidden" role="status">${i?"Thanks \u2014 a teammate will email you shortly.":"Thanks! We'll be in touch."}</p>`;let m=r.querySelector(".aiml-lead-email"),u=r.querySelector(".aiml-lead-submit"),n=r.querySelector(".aiml-lead-error"),p=r.querySelector(".aiml-lead-success");u.addEventListener("click",async()=>{let h=m.value.trim();if(!h||!h.includes("@")){n.classList.remove("aiml-hidden");return}n.classList.add("aiml-hidden"),u.disabled=!0;try{await a(h,e),m.classList.add("aiml-hidden"),u.classList.add("aiml-hidden"),p.classList.remove("aiml-hidden")}catch{u.disabled=!1,n.textContent="Failed to submit. Please try again.",n.classList.remove("aiml-hidden")}}),o.appendChild(r),this._scrollToBottom(),setTimeout(()=>m.focus(),50)}_scrollToBottom(){let e=this.shadow.querySelector(".aiml-messages");e&&(e.scrollTop=e.scrollHeight)}};function f(g){return String(g).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function L(g){return String(g||"").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}(function(){"use strict";if(window.__aimlWidgetLoaded)return;window.__aimlWidgetLoaded=!0;let g="Hi! \u{1F44B} I'm this site's AI assistant. Ask me anything \u2014 I'll answer from this site's own content and show you the sources.",e=document.currentScript||document.querySelector("script[data-api-key]");if(!e){console.warn("[AIML] No script tag found with data-api-key attribute.");return}let a=e.getAttribute("data-api-key"),t=e.getAttribute("data-website-id"),o=e.getAttribute("data-api-url")||"https://api.aiml.chat",i=l=>e.getAttribute("data-"+l),r=i("suggested-questions"),m=r?r.split("|").map(l=>l.trim()).filter(Boolean):null;if(!a){console.warn("[AIML] Missing data-api-key on script tag.");return}let u=l=>l&&/^(#[0-9a-fA-F]{3,8}|(rgb|hsl)a?\([\d\s.,%\/]+\))$/.test(l.trim())?l.trim():null,n=l=>l&&/^https:\/\/[^\s"'<>]+$/i.test(l.trim())?l.trim():null,p=(l,c,E,b)=>{let s=parseInt(l,10);return Number.isFinite(s)?Math.min(b,Math.max(E,s)):c},h=(l,c)=>c.includes(l)?l:null,S=`aiml_session_${t||"default"}`;function w(){try{let l=sessionStorage.getItem(S);return l?JSON.parse(l):{conversationId:null,history:[],visitorId:B()}}catch{return{conversationId:null,history:[],visitorId:B()}}}function A(l){try{sessionStorage.setItem(S,JSON.stringify(l))}catch{}}function B(){return"v-"+Math.random().toString(36).slice(2)+Date.now().toString(36)}async function z(){try{let l=new AbortController,c=setTimeout(()=>l.abort(),1500),E=await fetch(`${o}/v1/widgets/${encodeURIComponent(a)}/config`,{headers:{"X-Api-Key":a},signal:l.signal});if(clearTimeout(c),E.ok)return await E.json()}catch{}return{}}async function y(){let l=await z(),c=w(),E=m??l.suggestedQuestions??[],b={position:h(i("position"),["left","right"])||l.position||"right",theme:h(i("theme"),["light","dark","auto"])||l.theme||"auto",primaryColor:u(i("primary-color"))||u(l.primaryColor)||null,title:i("title")||l.title||null,subtitle:i("subtitle")||l.subtitle||null,placeholder:l.placeholder||null,greeting:i("greeting")||l.greeting||null,showBranding:l.showBranding!==!1,suggestedQuestions:E,avatarUrl:n(i("avatar"))||n(l.avatarUrl)||null,launcherIconUrl:n(i("launcher-icon"))||n(l.launcherIconUrl)||null,launcherSize:h(i("launcher-size"),["sm","md","lg"])||l.launcherSize||"md",launcherLabel:i("launcher-label")??l.launcherLabel??null,radius:h(i("radius"),["none","md","xl"])||l.radius||"md",offsetX:p(i("offset-x")??l.offsetX,24,0,400),offsetY:p(i("offset-y")??l.offsetY,24,0,400),zIndex:p(i("z-index")??l.zIndex,2147483647,1,2147483647),autoOpenDelaySec:p(i("auto-open")??l.autoOpenDelaySec,0,0,600),hideOnMobile:(i("hide-mobile")??String(l.hideOnMobile??!1))==="true",agentMode:i("mode")==="agent"||l.assistantMode==="agent",showAgentName:(i("show-agent-name")??String(l.showAgentName??!0))!=="false",headerStyle:h(i("header-style"),["minimal","solid"])||l.headerStyle||"minimal",bubbleStyle:h(i("bubble-style"),["tail","flat"])||l.bubbleStyle||"tail",showAiBadge:(i("show-ai-badge")??String(l.showAiBadge??!0))!=="false"};if(b.hideOnMobile&&window.matchMedia("(max-width: 640px)").matches)return;let s=new O(b),$=new N(o,a);s.mount();let D=()=>{b.agentMode&&!b.greeting?s.showAgentWelcome():s.showGreeting(b.greeting||g),s.showSuggestedChips(b.suggestedQuestions,"Try asking:")};D(),s.onTalkToHuman=t?()=>s.showLeadCaptureForm("",(q,k)=>$.captureLead(t,q,k),"human"):null,s.onClear=()=>{c.conversationId=null,c.history=[],A(c),D()},b.autoOpenDelaySec>0&&!c.autoOpened&&setTimeout(()=>{s.isOpen||s.open(),c.autoOpened=!0,A(c)},b.autoOpenDelaySec*1e3),s.host.addEventListener("aiml:send",async q=>{let k=q.detail.text;s.hideWelcomeState(),s.appendUserMessage(k),s.startBotMessage();let C="",I=!1,T=d=>{I||(I=!0,s.finishBotMessage(d),C&&(c.history.push({role:"user",content:k}),c.history.push({role:"assistant",content:C}),A(c)))};await $.send(k,c.history,c.conversationId,c.visitorId,{onConversation(d){d&&c.conversationId!==d&&(c.conversationId=d,A(c))},onToken(d){C+=d,s.appendToken(d)},onCitations(d){T(d)},onAgent(d){s.setAgent(d)},onHandoff(d){s.showHandoff(d)},onTool(d){s.showTool(d)},onConfirm(d){s.showConfirmCard(d,M=>P(d.id,M))},onConfirmResult(d){s.showConfirmResult(d)},onEscalate(){t&&s.showEscalate(()=>s.showLeadCaptureForm(k,(d,M)=>$.captureLead(t,d,M),"human"))},onNoAnswer(){T([]),s.showNoAnswerHelp(k,b.suggestedQuestions,t?(d,M)=>$.captureLead(t,d,M):null)},onDone(){T([])},onError(d,M){if(d==="noContent"&&t){s.showLeadCaptureForm(k,async(W,K)=>{await $.captureLead(t,W,K)});return}if(d==="network"){s.showStatus("network","Couldn't connect. Check your internet and try again.");return}if(d==="rateLimit"){s.showStatus("rate","You've asked a lot! Try again in a moment.");return}if(d==="quota"){s.showStatus("quota","This site's monthly limit has been reached.");return}let F={auth:"Authentication failed. Please check your API key.",noContent:"No answer found. Please contact us directly.",stream:"Stream interrupted. Please try again.",server:"Server error. Please try again later."};s.showStatus("error",F[d]||"Something went wrong. Please try again.")}},{mode:b.agentMode?"agent":void 0})});async function P(q,k){s.startBotMessage();let C="",I=!1,T=()=>{I||(I=!0,s.finishBotMessage([]),C&&(c.history.push({role:"assistant",content:C}),A(c)))};await $.send("",c.history,c.conversationId,c.visitorId,{onToken(d){C+=d,s.appendToken(d)},onCitations(){T()},onConfirmResult(d){s.showConfirmResult(d)},onDone(){T()},onError(){s.showStatus("error","Could not complete that action. Please try again.")}},{mode:"agent",approveActionId:q,approveAllow:k})}window.AIML={open:()=>s.open(),close:()=>s.close(),toggle:()=>s.toggle(),clearHistory:()=>{c.history=[],c.conversationId=null,A(c)}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",y):y()})();})();
