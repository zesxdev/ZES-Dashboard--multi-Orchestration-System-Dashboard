const http = require("http");
const fs = require("fs");
const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PORT = parseInt(process.env.PORT || "5300", 10);
const HERMES_WEB = path.resolve(process.env.HERMES_WEB_DIST || require("os").homedir() + "/hermes-agent/hermes_cli/web_dist");
const GROQ_KEY = process.env.GROQ_API_KEY || "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const HERMES_URL = process.env.HERMES_URL || "http://localhost:9119";
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || "oc/deepseek-v4-flash-free";
const OC_GRPC_HOST = process.env.OC_GRPC_HOST || "127.0.0.1";
const OC_GRPC_PORT = parseInt(process.env.OC_GRPC_PORT || "50051", 10);

let ocClient = null;
function initOCClient() {
  try {
    const p = path.resolve(__dirname, "openclaude.proto");
    if (!fs.existsSync(p)) { console.log("OC proto not found, OC disabled"); return; }
    const pd = protoLoader.loadSync(p, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
    ocClient = new (grpc.loadPackageDefinition(pd)).openclaude.v1.AgentService(`${OC_GRPC_HOST}:${OC_GRPC_PORT}`, grpc.credentials.createInsecure());
    console.log(`OC gRPC client ready: ${OC_GRPC_HOST}:${OC_GRPC_PORT}`);
  } catch (e) { console.log(`OC gRPC init: ${e.message}`); }
}

let HERMES_TOKEN = "";
async function fetchHermesToken() {
  try {
    const r = await fetch(HERMES_URL + "/"); const html = await r.text();
    const m = html.match(/__HERMES_SESSION_TOKEN__="([^"]+)"/);
    if (m) { HERMES_TOKEN = m[1]; console.log(`Hermes token: extracted (${HERMES_TOKEN.slice(0,8)}...)`); }
  } catch (e) { console.log(`Hermes token: ${e.message}`); }
}

const MIME = { ".html":"text/html",".css":"text/css",".js":"text/javascript",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".ico":"image/x-icon",".woff2":"font/woff2",".woff":"font/woff",".ttf":"font/ttf" };
const CORS = { "Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,OPTIONS,DELETE","Access-Control-Allow-Headers":"Content-Type,Authorization,X-Hermes-Session-Token" };
function json(res, code, data) { const b = Buffer.from(JSON.stringify(data)); res.writeHead(code, {...CORS,"Content-Type":"application/json","Content-Length":b.length}); res.end(b); }
function collect(req) { return new Promise(ok => { let d=""; req.on("data",c=>d+=c); req.on("end",()=>ok(d)); }); }
function stripQuery(u) { const i = u.indexOf("?"); return i>=0 ? u.slice(0,i) : u; }

function serveStatic(req, res, urlPath) {
  let fp = urlPath==="/"||urlPath==="" ? path.join(HERMES_WEB,"index.html") : urlPath==="/chat"||urlPath==="/chat.html" ? path.join(HERMES_WEB,"chat.html") : path.join(HERMES_WEB,urlPath);
  const rp = path.resolve(fp);
  if (!rp.startsWith(path.resolve(HERMES_WEB))) return json(res,403,{error:"Forbidden"});
  fs.readFile(rp, (err, data) => {
    if (err) { if (urlPath!=="/" && !urlPath.startsWith("api/") && !urlPath.includes(".")) return fs.readFile(path.join(HERMES_WEB,"index.html"),(e2,d2) => { if(e2) return json(res,404,{error:"Not found"}); res.writeHead(200,{"Content-Type":"text/html"}); res.end(d2); }); return json(res,404,{error:"Not found"}); }
    const ext = path.extname(rp).toLowerCase();
    res.writeHead(200,{"Content-Type":MIME[ext]||"application/octet-stream","Cache-Control":"no-cache"}); res.end(data);
  });
}

async function handleChat(req, res) {
  try {
    const body = JSON.parse(await collect(req));
    if (!body.message) return json(res,400,{error:"Message required"});

    // ── Profile-aware model selection ──
    let profileModel = null, profileProvider = null;
    if (body.profile) {
      try {
        const pHome = require("os").homedir();
        const pPath = path.resolve(pHome, '.hermes/profiles', body.profile, 'config.yaml');
        if (fs.existsSync(pPath)) {
          const raw = fs.readFileSync(pPath, 'utf-8');
          let inModel = false;
          for (const l of raw.split('\n')) {
            const t = l.trim();
            if (t === 'model:') { inModel = true; continue; }
            if (inModel && t.startsWith('default:')) {
              profileModel = t.split(':').slice(1).join(':').trim().replace(/^['"]|['"]$/g, '');
            }
            if (inModel && t.startsWith('provider:')) {
              profileProvider = t.split(':').slice(1).join(':').trim().replace(/^['"]|['"]$/g, '');
            }
            if (inModel && t && !t.startsWith('-') && !l.startsWith(' ') && !l.startsWith('\t') && t !== 'model:') inModel = false;
            if (profileModel && profileProvider) break;
          }
          if (profileModel) console.log(`Profile ${body.profile}: model=${profileModel} provider=${profileProvider}`);
        }
      } catch(e) { console.log('Profile cfg err:', e.message); }
    }

    res.writeHead(200,{...CORS,"Content-Type":"text/event-stream","Cache-Control":"no-cache","Connection":"keep-alive"});
    let apiUrl = "http://localhost:20128/v1/chat/completions";
    let apiKey = "sk-5aca86dcf572ec2c-i1sljt-f3f84e11";
    try { await fetch("http://localhost:20128/v1/models",{signal:AbortSignal.timeout(2000)}); } catch { if(GROQ_KEY) { apiUrl=GROQ_URL; apiKey=GROQ_KEY; } }
    let model = body.model || profileModel || DEFAULT_MODEL;
    if (apiUrl === GROQ_URL) model = model.replace(/^groq\//, '');
    // Map profile provider to 9Router provider prefix when not explicitly overridden
    if (apiUrl !== GROQ_URL && !body.model && profileProvider && !model.includes('/')) {
      const prefixMap = { 'opencode': 'oc/', 'opencode-zen': 'oc/', 'openrouter': 'openrouter/', 'groq': 'groq/' };
      const match = Object.entries(prefixMap).find(([k]) => profileProvider === k || profileProvider.startsWith(k));
      if (match) model = match[1] + model;
    }
    try {
      const r = await fetch(apiUrl,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`},body:JSON.stringify({model,messages:[{role:"user",content:body.message}],stream:true,max_tokens:4096}),signal:AbortSignal.timeout(60000)});
      if (!r.ok) { const et=await r.text(); res.write("data: "+JSON.stringify({type:"error",message:`API ${r.status}: ${et.slice(0,200)}`})+"\n\n"); return res.end(); }
      const reader=r.body.getReader(); const dec=new TextDecoder(); let buf="",full="";
      while(true) {
        const {done,value}=await reader.read(); if(done) break;
        buf+=dec.decode(value,{stream:true}); const lines=buf.split("\n"); buf=lines.pop()||"";
        for (const l of lines) {
          const t=l.trim();
          if (!t||t==="data: [DONE]"||!t.startsWith("data: ")) continue;
          try { const c=JSON.parse(t.slice(6)).choices?.[0]?.delta?.content||""; if(c) { full+=c; res.write("data: "+JSON.stringify({type:"text",text:c})+"\n\n"); } } catch {}
        }
      }
      res.write("data: "+JSON.stringify({type:"done",full_text:full})+"\n\n"); res.end();
    } catch(e) { res.write("data: "+JSON.stringify({type:"error",message:e.message})+"\n\n"); res.end(); }
  } catch(e) { try { res.write("data: "+JSON.stringify({type:"error",message:e.message})+"\n\n"); res.end(); } catch {} }
}

async function proxyHermes(req, res, hp) {
  try {
    const opts = { method: req.method, headers: {"Content-Type":"application/json"} };
    if (HERMES_TOKEN) opts.headers["X-Hermes-Session-Token"]=HERMES_TOKEN;
    else { const ct=req.headers["x-hermes-session-token"]; if(ct) opts.headers["X-Hermes-Session-Token"]=ct; }
    if (["POST","PUT","DELETE"].includes(req.method)) { const b=await collect(req); if(b) opts.body=b; }
    const r=await fetch(HERMES_URL+hp,opts); const txt=await r.text();
    try { json(res, r.status, JSON.parse(txt)); } catch { json(res, r.status, {raw:txt.slice(0,500)}); }
  } catch(e) { json(res, 502, {error:`Hermes unreachable: ${e.message}`}); }
}

async function handleOChat(req, res) {
  try {
    const body = JSON.parse(await collect(req));
    if (!body.message) return json(res,400,{error:"Message required"});

    // ── Profile-aware model selection (same as handleChat) ──
    let profileModel = null, profileProvider = null;
    if (body.profile) {
      try {
        const pHome = require("os").homedir();
        const pPath = path.resolve(pHome, '.hermes/profiles', body.profile, 'config.yaml');
        if (fs.existsSync(pPath)) {
          const raw = fs.readFileSync(pPath, 'utf-8');
          let inModel = false;
          for (const l of raw.split('\n')) {
            const t = l.trim();
            if (t === 'model:') { inModel = true; continue; }
            if (inModel && t.startsWith('default:')) {
              profileModel = t.split(':').slice(1).join(':').trim().replace(/^['"]|['"]$/g, '');
            }
            if (inModel && t.startsWith('provider:')) {
              profileProvider = t.split(':').slice(1).join(':').trim().replace(/^['"]|['"]$/g, '');
            }
            if (inModel && t && !t.startsWith('-') && !l.startsWith(' ') && !l.startsWith('\t') && t !== 'model:') inModel = false;
            if (profileModel && profileProvider) break;
          }
        }
      } catch(e) {}
    }

    res.writeHead(200,{...CORS,"Content-Type":"text/event-stream","Cache-Control":"no-cache","Connection":"keep-alive"});
    if (ocClient) {
      let gotData = false, finished = false;
      const tmr = setTimeout(() => { finished = true; }, 8000);
      const call = ocClient.Chat();
      call.on("data", (msg) => {
        try {
          if (msg.text_chunk) { gotData = true; finished = true; clearTimeout(tmr); res.write("data: "+JSON.stringify({type:"text",text:msg.text_chunk.text,backend:"openclaude"})+"\n\n"); }
          else if (msg.done) {
            if (msg.done.full_text && (msg.done.full_text.includes("too large") || msg.done.full_text.includes("error"))) { clearTimeout(tmr); }
            else { gotData = true; finished = true; clearTimeout(tmr); res.write("data: "+JSON.stringify({type:"done",full_text:msg.done.full_text,backend:"openclaude"})+"\n\n"); res.end(); }
          }
          else if (msg.error) { clearTimeout(tmr); }
        } catch(e) {}
      });
      call.on("error", () => { clearTimeout(tmr); finished = true; });
      call.on("end", () => { clearTimeout(tmr); finished = true; });
      call.write({ request: { message: body.message, working_directory: body.working_directory || process.cwd(), model: body.model || undefined, session_id: body.session_id || Date.now().toString(36)+Math.random().toString(36).slice(2,6) } });
      await new Promise(r => { let w=0; const ci=setInterval(()=>{w+=100;if(finished||w>8000){clearInterval(ci);r();}},100); setTimeout(()=>{clearInterval(ci);r();},8500); });
      clearTimeout(tmr);
      if (gotData) { req.on("close",()=>{try{call.end()}catch{}}); return; }
      try { call.end(); } catch {}
    }
    res.write("data: "+JSON.stringify({type:"backend",backend:"groq"})+"\n\n");
    let apiUrl2 = "http://localhost:20128/v1/chat/completions";
    let apiKey2 = "sk-5aca86dcf572ec2c-i1sljt-f3f84e11";
    try { await fetch("http://localhost:20128/v1/models",{signal:AbortSignal.timeout(2000)}); } catch { if(GROQ_KEY) { apiUrl2=GROQ_URL; apiKey2=GROQ_KEY; } }
    let model2 = body.model || profileModel || DEFAULT_MODEL;
    if (apiUrl2 === GROQ_URL) model2 = model2.replace(/^groq\//, '');
    if (apiUrl2 !== GROQ_URL && !body.model && profileProvider && !model2.includes('/')) {
      const prefixMap = { 'opencode': 'oc/', 'opencode-zen': 'oc/', 'openrouter': 'openrouter/', 'groq': 'groq/' };
      const match = Object.entries(prefixMap).find(([k]) => profileProvider === k || profileProvider.startsWith(k));
      if (match) model2 = match[1] + model2;
    }
    try {
      const r = await fetch(apiUrl2,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey2}`},body:JSON.stringify({model:model2,messages:[{role:"user",content:body.message}],stream:true,max_tokens:4096}),signal:AbortSignal.timeout(60000)});
      if (!r.ok) { const et=await r.text(); res.write("data: "+JSON.stringify({type:"error",message:`API ${r.status}: ${et.slice(0,200)}`})+"\n\n"); return res.end(); }
      const reader=r.body.getReader(); const dec=new TextDecoder(); let buf="",full="";
      while(true) {
        const {done,value}=await reader.read(); if(done) break;
        buf+=dec.decode(value,{stream:true}); const lines=buf.split("\n"); buf=lines.pop()||"";
        for (const l of lines) {
          const t=l.trim();
          if(!t||t==="data: [DONE]"||!t.startsWith("data: ")) continue;
          try { const c=JSON.parse(t.slice(6)).choices?.[0]?.delta?.content||""; if(c) { full+=c; res.write("data: "+JSON.stringify({type:"text",text:c,backend:"groq"})+"\n\n"); } } catch {}
        }
      }
      res.write("data: "+JSON.stringify({type:"done",full_text:full,backend:"groq"})+"\n\n"); res.end();
    } catch(e) { res.write("data: "+JSON.stringify({type:"error",message:e.message})+"\n\n"); res.end(); }
  } catch(e) { try { res.write("data: "+JSON.stringify({type:"error",message:e.message})+"\n\n"); res.end(); } catch {} }
}

function handleOCHealth(req, res) {
  if (!ocClient) return json(res,503,{status:"offline"});
  const d=new Date(); d.setSeconds(d.getSeconds()+2);
  ocClient.waitForReady(d, err => err ? json(res,503,{status:"offline",error:err.message}) : json(res,200,{status:"online"}));
}

async function start() {
  await fetchHermesToken();
  if (!HERMES_TOKEN) setTimeout(()=>{fetchHermesToken()},3000);
  initOCClient();
  http.createServer((req, res) => {
    if (req.method==="OPTIONS") { res.writeHead(204,CORS); return res.end(); }
    const p = stripQuery(req.url);
    if (p==="/api/chat" && req.method==="POST") return handleChat(req,res);
    if (p==="/api/oc-chat" && req.method==="POST") return handleOChat(req,res);
    if (p==="/api/oc-health") return handleOCHealth(req,res);
    if (p==="/api/health") return json(res,200,{status:"ok",model:DEFAULT_MODEL,groq:!!GROQ_KEY,oc_grpc:!!ocClient});
    if (p==="/api/models") return fetch("http://localhost:20128/v1/models",{signal:AbortSignal.timeout(2000)}).then(r=>r.json()).then(d=>json(res,200,d)).catch(()=>json(res,200,{object:"list",data:[{id:"groq/llama-3.3-70b-versatile",object:"model"}]}));
    if (p==="/api/config") return json(res,200,{hermes_token:HERMES_TOKEN,hermes_url:HERMES_URL,groq:!!GROQ_KEY,model:DEFAULT_MODEL,oc_grpc:!!ocClient});
    if (p.startsWith("/api/hermes/")) return proxyHermes(req,res,"/"+p.slice(12));
    if (p==="/chat") return serveStatic(req,res,"chat.html");
    serveStatic(req,res,p);
  }).listen(PORT,"127.0.0.1",()=>{
    console.log(`Bridge :${PORT}`);
    console.log(`  Groq: ${GROQ_KEY?"yes":"no"}`);
    console.log(`  OC gRPC: ${ocClient?"ready":"disabled"}`);
  });
}
start();
