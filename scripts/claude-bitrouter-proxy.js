#!/usr/bin/env node
/**
 * ZES Claude Proxy v3 — Anthropic Messages API <-> OpenAI Chat Completions
 *
 * Claude Code (:5905) -> BitRouter (:4356) -> opencode-zen deepseek-v4-flash-free
 *
 * v3 converts Anthropic tool_calls/tool_result messages into OpenAI
 * `tool` role messages and echoes DeepSeek `reasoning_content` back on tool
 * round-trips. Fixes DeepSeek 400: "An assistant message with 'tool_calls'
 * must be followed by tool messages responding to each 'tool_call_id'"
 * (BitRouter's Anthropic adapter dropped this ordering/echo).
 */
import http from "http";

const PORT = 5905;
const RHOST = "127.0.0.1";
const RPORT = 4356;
const DEFAULT_KEY = "noop-bitrouter-key";
const TIMEOUT = 120000;
const MODEL = process.env.ZES_CLAUDE_MODEL || "deepseek/deepseek-v4-flash-free";

// reasoning_content cache: tool_call_id -> reasoning text (DeepSeek thinking mode)
const reasoningCache = new Map();

const FINISH_MAP = {
  stop: "end_turn",
  length: "max_tokens",
  tool_calls: "tool_use",
  function_call: "tool_use",
  content_filter: "end_turn",
};

function anthropicToOpenAI(body) {
  let systemText = "";
  if (typeof body.system === "string") systemText = body.system;
  else if (Array.isArray(body.system)) {
    systemText = body.system
      .filter((b) => b && b.type === "text")
      .map((b) => b.text || "")
      .join("\n");
  }

  const messages = [];
  for (const msg of body.messages || []) {
    if (!msg) continue;
    if (msg.role === "user") {
      const textParts = [];
      const toolParts = [];
      const blocks = Array.isArray(msg.content)
        ? msg.content
        : [{ type: "text", text: msg.content }];
      for (const b of blocks) {
        if (!b) continue;
        if (b.type === "tool_result") {
          let content = "";
          if (typeof b.content === "string") content = b.content;
          else if (Array.isArray(b.content))
            content = b.content.map((c) => c && (c.text ?? c.content ?? "")).join("\n");
          else if (b.content != null) content = String(b.content);
          toolParts.push({ tool_call_id: b.tool_use_id, content });
        } else if (b.type === "text" && b.text) {
          textParts.push(b.text);
        }
      }
      // OpenAI/DeepSeek require tool messages immediately after the
      // assistant tool_calls message, so emit tool results before any text.
      for (const t of toolParts) {
        messages.push({ role: "tool", tool_call_id: t.tool_call_id, content: t.content });
      }
      if (textParts.length) messages.push({ role: "user", content: textParts.join("\n") });
    } else if (msg.role === "assistant") {
      const blocks = Array.isArray(msg.content)
        ? msg.content
        : msg.content
          ? [{ type: "text", text: msg.content }]
          : [];
      let text = "";
      const toolCalls = [];
      for (const b of blocks) {
        if (!b) continue;
        if (b.type === "text") text += b.text || "";
        else if (b.type === "tool_use") {
          const args =
            typeof b.input === "string" ? b.input : JSON.stringify(b.input ?? {});
          toolCalls.push({
            id: b.id,
            type: "function",
            function: { name: b.name || "", arguments: args },
          });
        }
        // "thinking" blocks dropped — DeepSeek uses reasoning_content instead
      }
      const out = { role: "assistant", content: text || "" };
      if (toolCalls.length) {
        out.tool_calls = toolCalls;
        out.reasoning_content = reasoningCache.get(toolCalls[0].id) ?? "";
      }
      messages.push(out);
    }
  }

  const tools = (body.tools || [])
    .filter((t) => t && t.name)
    .map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description || "",
        parameters: t.input_schema || { type: "object", properties: {} },
      },
    }));

  let toolChoice;
  const tc = body.tool_choice;
  if (tc) {
    // DeepSeek thinking mode rejects tool_choice "required" — any -> auto
    if (tc.type === "any") toolChoice = "auto";
    else if (tc.type === "tool") toolChoice = "auto";
    else if (tc.type === "none") toolChoice = "none";
    else toolChoice = "auto";
  }

  const out = {
    model: MODEL,
    messages,
    max_tokens: body.max_tokens || 4096,
    stream: !!body.stream,
  };
  if (tools.length) out.tools = tools;
  if (toolChoice) out.tool_choice = toolChoice;
  if (body.temperature !== undefined) out.temperature = body.temperature;
  if (body.top_p !== undefined) out.top_p = body.top_p;
  if (systemText) out.messages.unshift({ role: "system", content: systemText });
  return out;
}

function openaiToAnthropic(data) {
  const choice = (data.choices && data.choices[0]) || {};
  const m = choice.message || {};
  const content = [];
  if (m.content) content.push({ type: "text", text: m.content });
  for (const t of m.tool_calls || []) {
    let input = {};
    try { input = JSON.parse(t.function?.arguments || "{}"); } catch { input = {}; }
    content.push({ type: "tool_use", id: t.id, name: t.function?.name || "", input });
    if (m.reasoning_content) reasoningCache.set(t.id, m.reasoning_content);
  }
  const usage = data.usage || {};
  return {
    id: data.id || "msg_" + Math.random().toString(36).slice(2),
    type: "message",
    role: "assistant",
    model: MODEL,
    content,
    stop_reason: FINISH_MAP[choice.finish_reason] || "end_turn",
    stop_sequence: null,
    usage: {
      input_tokens: usage.prompt_tokens ?? 0,
      output_tokens: usage.completion_tokens ?? 0,
    },
  };
}

/**
 * Transforms an OpenAI chat-completions SSE stream into Anthropic SSE events.
 * Returns { write(chunk), end() }.
 */
function makeAnthropicStreamer(res) {
  const messageId = "msg_" + Math.random().toString(36).slice(2);
  const blocks = new Map(); // index -> {type, id?, name?, jsonText}
  let sentStart = false;
  let nextIndex = 0;
  let reasoningText = "";
  let firstToolId = null;
  let finishReason = "end_turn";
  let outputTokens = 0;

  function emit(obj) {
    res.write("event: " + obj.type + "\ndata: " + JSON.stringify(obj) + "\n\n");
  }
  function ensureStart() {
    if (sentStart) return;
    sentStart = true;
    emit({
      type: "message_start",
      message: {
        id: messageId, type: "message", role: "assistant", model: MODEL,
        content: [], stop_reason: null, stop_sequence: null,
        usage: { input_tokens: 0, output_tokens: 0 },
      },
    });
  }

  function processChunk(data) {
    const choice = (data.choices && data.choices[0]) || {};
    const delta = choice.delta || {};
    if (choice.finish_reason) finishReason = FINISH_MAP[choice.finish_reason] || "end_turn";
    if (data.usage) {
      outputTokens = data.usage.completion_tokens ?? outputTokens;
    }
    // reasoning_content accumulates ahead of tool_calls
    if (delta.reasoning_content) reasoningText += delta.reasoning_content;

    if (delta.content) {
      ensureStart();
      let b = blocks.get(0);
      if (!b) {
        b = { type: "text", text: "" };
        blocks.set(0, b);
        nextIndex = 1;
        emit({ type: "content_block_start", index: 0, content_block: { type: "text", text: "" } });
      }
      b.text += delta.content;
      emit({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: delta.content } });
    }

    for (const tc of delta.tool_calls || []) {
      ensureStart();
      const idx = tc.index ?? 0;
      let b = blocks.get(idx);
      if (!b) {
        b = { type: "tool_use", id: tc.id || "", name: tc.function?.name || "", jsonText: "" };
        blocks.set(idx, b);
        if (idx >= nextIndex) nextIndex = idx + 1;
        emit({
          type: "content_block_start", index: idx,
          content_block: { type: "tool_use", id: b.id, name: b.name, input: {} },
        });
      } else {
        if (tc.id && !b.id) { b.id = tc.id; }
        if (tc.function?.name && !b.name) { b.name = tc.function.name; }
      }
      const frag = tc.function?.arguments;
      if (frag) {
        b.jsonText += frag;
        emit({ type: "content_block_delta", index: idx, delta: { type: "input_json_delta", partial_json: frag } });
      }
    }
  }

  function endStream() {
    // store reasoning for the tool-call round-trip echo
    if (firstToolId === null) {
      // find first tool block id
      for (const [, b] of blocks) {
        if (b.type === "tool_use" && b.id) { firstToolId = b.id; break; }
      }
    }
    if (firstToolId && reasoningText) reasoningCache.set(firstToolId, reasoningText);

    for (const [idx, b] of blocks) {
      emit({ type: "content_block_stop", index: idx });
      void b;
    }
    emit({
      type: "message_delta",
      delta: { stop_reason: finishReason, stop_sequence: null },
      usage: { output_tokens: outputTokens },
    });
    emit({ type: "message_stop" });
    try { res.end(); } catch { /* already closed */ }
  }

  return { processChunk, endStream };
}

function estimateTokens(str) {
  return Math.max(1, Math.ceil(str.length / 4));
}

function sendJSON(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
}

function forwardOpenAI(method, path, body, res) {
  const payload = JSON.stringify(body);
  const opts = {
    hostname: RHOST, port: RPORT, path, method,
    timeout: TIMEOUT,
    headers: {
      "content-type": "application/json",
      "content-length": Buffer.byteLength(payload),
      "x-api-key": DEFAULT_KEY,
    },
  };
  const pr = http.request(opts, (pr2) => {
    if (body.stream) {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "X-Accel-Buffering": "no",
      });
      const streamer = makeAnthropicStreamer(res);
      let buf = "";
      pr2.setEncoding("utf8");
      pr2.on("data", (chunk) => {
        buf += chunk;
        let i;
        while ((i = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, i).trim();
          buf = buf.slice(i + 1);
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") { streamer.endStream(); return; }
          try {
            const obj = JSON.parse(payload);
            if (obj.error) { console.error("[proxy] upstream stream error:", obj.error); continue; }
            streamer.processChunk(obj);
          } catch (e) { /* partial/keepalive line */ }
        }
      });
      pr2.on("end", () => {
        if (!res.writableEnded) streamer.endStream();
      });
      pr2.on("error", (e) => {
        console.error("[proxy] stream error:", e.message);
        try { if (!res.writableEnded) streamer.endStream(); } catch {}
      });
    } else {
      let d = "";
      pr2.setEncoding("utf8");
      pr2.on("data", (c) => (d += c));
      pr2.on("end", () => {
        try {
          const data = JSON.parse(d);
          if (data.error) {
            sendJSON(res, 400, data);
          } else {
            sendJSON(res, 200, openaiToAnthropic(data));
          }
        } catch (e) {
          sendJSON(res, 502, { error: { type: "proxy_error", message: "Bad upstream payload: " + d.slice(0, 200) } });
        }
      });
    }
  });
  pr.on("timeout", () => {
    pr.destroy();
    if (!res.headersSent) sendJSON(res, 504, { error: { type: "timeout", message: "Upstream timeout" } });
  });
  pr.on("error", (e) => {
    if (!res.headersSent) sendJSON(res, 502, { error: { type: "proxy_error", message: e.message } });
  });
  pr.write(payload);
  pr.end();
}

http
  .createServer((req, res) => {
    const reqStartedAt = Date.now();
    res.on("finish", () => {
      console.log(`[proxy] ${req.method} ${req.url} -> ${res.statusCode} (${Date.now() - reqStartedAt}ms)`);
    });
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

    const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));
    const path = url.pathname;

    if (path === "/api/hello") {
      sendJSON(res, 200, { status: "ok" });
      return;
    }
    if (req.method === "GET") {
      if (path === "/v1/me" || path === "/me" || path === "/") {
        sendJSON(res, 200, { id: "zes", isAuthenticated: true, orgs: [{ id: "zes-org", name: "ZES OS" }] });
        return;
      }
      if (path === "/v1/organization") {
        sendJSON(res, 200, { id: "zes-org", name: "ZES OS", plan: { id: "zes", name: "ZES OS" } });
        return;
      }
      if (path === "/v1/models") {
        sendJSON(res, 200, { data: [{ id: MODEL, object: "model", owned_by: "zes" }] });
        return;
      }
      sendJSON(res, 200, { id: "zes", isAuthenticated: true });
      return;
    }

    let b = "";
    req.on("data", (c) => {
      b += c;
      if (b.length > 2e7) req.destroy();
    });
    req.on("end", () => {
      if (path === "/v1/messages/count_tokens" || path === "/count_tokens") {
        try {
          const body = JSON.parse(b || "{}");
          const total = (body.messages || []).reduce(
            (acc, m) => acc + estimateTokens(typeof m.content === "string" ? m.content : JSON.stringify(m.content || "")),
            0
          );
          sendJSON(res, 200, { input_tokens: total });
        } catch {
          sendJSON(res, 200, { input_tokens: 1 });
        }
        return;
      }
      let body;
      try {
        body = JSON.parse(b || "{}");
      } catch (e) {
        sendJSON(res, 400, { error: { type: "invalid_request_error", message: "Invalid JSON body" } });
        return;
      }
      try {
        const openAI = anthropicToOpenAI(body);
        forwardOpenAI(req.method, "/v1/chat/completions", openAI, res);
      } catch (e) {
        sendJSON(res, 400, { error: { type: "invalid_request_error", message: "Conversion error: " + e.message } });
      }
    });
  })
  .listen(PORT, "127.0.0.1", () => {
    console.log("ZES Claude Proxy v3 on :" + PORT + " -> BitRouter :" + RPORT + " (OpenAI compat, model " + MODEL + ")");
    console.log("  Timeout: " + TIMEOUT / 1000 + "s");
  });
