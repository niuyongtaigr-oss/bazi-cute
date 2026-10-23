#!/usr/bin/env node
/**
 * 灵魂方程 · 最小 LLM 代理
 *
 * 作用：把浏览器的聊天请求转发到任意 OpenAI 兼容接口，Key 只留在服务端。
 * 零依赖，只用 Node 内置模块。
 *
 * 用法：
 *   # DeepSeek
 *   LLM_KEY=sk-xxx node server.js
 *
 *   # 换供应商（任何 OpenAI 兼容接口）
 *   LLM_KEY=sk-xxx LLM_UPSTREAM=https://api.moonshot.cn/v1/chat/completions LLM_MODEL=moonshot-v1-8k node server.js
 *
 *   # 本地 Ollama（不需要 key）
 *   LLM_UPSTREAM=http://127.0.0.1:11434/v1/chat/completions LLM_MODEL=qwen2.5 node server.js
 *
 * 然后把 /live/ 页面里的「接口地址」填成：
 *   http://127.0.0.1:8787/v1/chat/completions
 * API Key 留空。
 */

const http = require("http");
const https = require("https");
const { URL } = require("url");

const PORT = process.env.PORT || 8787;
const UPSTREAM = process.env.LLM_UPSTREAM || "https://api.deepseek.com/chat/completions";
const KEY = process.env.LLM_KEY || "";
const DEFAULT_MODEL = process.env.LLM_MODEL || "";
const MAX_BODY = 1024 * 1024; // 1MB 上限，防止被当开放代理打爆

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error("body too large")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  cors(res);

  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      ok: true,
      upstream: UPSTREAM,
      hasKey: Boolean(KEY),
      model: DEFAULT_MODEL || "(未设置，用请求里的)"
    }));
    return;
  }

  if (req.method !== "POST" || !req.url.startsWith("/v1/chat/completions")) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not found" }));
    return;
  }

  let payload;
  try {
    payload = JSON.parse((await readBody(req)).toString("utf8") || "{}");
  } catch (e) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "invalid json" }));
    return;
  }

  if (DEFAULT_MODEL) payload.model = payload.model || DEFAULT_MODEL;

  const body = Buffer.from(JSON.stringify(payload));
  const target = new URL(UPSTREAM);
  const client = target.protocol === "https:" ? https : http;

  const headers = {
    "Content-Type": "application/json",
    "Content-Length": body.length,
    "Accept": payload.stream ? "text/event-stream" : "application/json"
  };
  if (KEY) headers["Authorization"] = "Bearer " + KEY;

  const upstreamReq = client.request(
    {
      hostname: target.hostname,
      port: target.port || (target.protocol === "https:" ? 443 : 80),
      path: target.pathname + target.search,
      method: "POST",
      headers
    },
    (up) => {
      const ct = up.headers["content-type"] || "application/json";
      res.writeHead(up.statusCode || 502, { "Content-Type": ct, "Cache-Control": "no-cache" });
      up.pipe(res);
    }
  );

  upstreamReq.on("error", (err) => {
    if (!res.headersSent) res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "upstream error", message: err.message }));
  });

  upstreamReq.end(body);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("spirit proxy listening on http://127.0.0.1:" + PORT);
  console.log("  upstream : " + UPSTREAM);
  console.log("  key      : " + (KEY ? "已配置（不会发送到浏览器）" : "未配置"));
  console.log("  model    : " + (DEFAULT_MODEL || "(用请求里的)"));
  console.log("");
  console.log("  在 /live/ 页面把接口地址填成：");
  console.log("  http://127.0.0.1:" + PORT + "/v1/chat/completions");
});
