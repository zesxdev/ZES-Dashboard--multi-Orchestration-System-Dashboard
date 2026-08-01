#!/usr/bin/env python3
"""ZES Memory Hub MCP server (stdio).

Exposes the shared Memory Hub (SQLite + FTS5 + Gemini/local-hash vectors) to
Codex CLI, Claude Code, and any MCP client.

Run:   python3 ~/Zes-System/scripts/zes-memory-mcp.py
Test:  python3 - <<'PY'
  import asyncio, json
  from mcp import ClientSession, StdioServerParameters
  from mcp.client.stdio import stdio_client
  async def main():
    p = StdioServerParameters(command="python3", args=["/data/data/com.termux/files/home/Zes-System/scripts/zes-memory-mcp.py"])
    async with stdio_client(p) as (r, w):
      async with ClientSession(r, w) as s:
        await s.initialize()
        print(await s.list_tools())
        print(await s.call_tool("memory_stats", {}))
  asyncio.run(main())
PY
"""
import json
import os
import sys

os.environ.setdefault("HERMES_HOME", os.path.expanduser("~/.hermes/profiles/hermes_zes"))
sys.path.insert(0, os.path.expanduser("~/hermes-agent"))

from mcp.server.fastmcp import FastMCP  # noqa: E402
from plugins.memory.zes_memory.store import MemoryStore  # noqa: E402

mcp = FastMCP("zes-memory-hub")


def _store() -> MemoryStore:
    s = MemoryStore()
    s.initialize()
    return s


@mcp.resource("memory://stats")
def stats_resource() -> dict:
    s = _store()
    try:
        return s.stats() if hasattr(s, "stats") else {"memories": 0}
    finally:
        s.shutdown()


@mcp.tool()
def memory_search(query: str, limit: int = 10) -> list:
    """Full-text search across shared memories (content, tags, type, scope)."""
    s = _store()
    try:
        return [
            {"id": m.get("hash"), "type": m.get("type"), "content": m.get("content"),
             "tags": m.get("tags", ""), "source": m.get("source"), "updated_at": m.get("updated_at")}
            for m in s.search(query, limit=max(1, min(limit, 50)))
        ]
    finally:
        s.shutdown()


@mcp.tool()
def memory_vector_search(query: str, limit: int = 10) -> list:
    """Semantic (vector) search across shared memories — cosine + FTS5 RRF fusion.
    Use this when keyword search misses synonyms/concepts. Results include score."""
    s = _store()
    try:
        return s.semantic_search(query, limit=max(1, min(limit, 50)))
    finally:
        s.shutdown()


@mcp.tool()
def memory_get(hash: str) -> dict:
    """Fetch a single memory by its content hash."""
    s = _store()
    try:
        m = s.get_by_hash(hash)
        return m or {"error": "not found"}
    finally:
        s.shutdown()


@mcp.tool()
def memory_insert(content: str, type: str = "fact", scope: str = "global",
                  priority: str = "medium", tags: str = "", source: str = "mcp") -> dict:
    """Insert a memory into the shared hub (auto-deduped by content hash, auto-embedded)."""
    if not content.strip():
        return {"error": "content cannot be empty"}
    s = _store()
    try:
        ok, h = s.insert({
            "content": content, "type": type, "scope": scope,
            "priority": priority, "tags": tags, "source": source,
        })
        return {"ok": ok, "hash": h, "is_new": ok}
    finally:
        s.shutdown()


@mcp.tool()
def memory_recent(limit: int = 10) -> list:
    """Most recently updated global memories."""
    s = _store()
    try:
        return [
            {"id": m.get("hash"), "type": m.get("type"), "content": m.get("content"),
             "source": m.get("source"), "updated_at": m.get("updated_at")}
            for m in s.list_by_scope("global", limit=max(1, min(limit, 50)))
        ]
    finally:
        s.shutdown()


@mcp.tool()
def memory_stats() -> dict:
    """Memory hub statistics: counts by type/scope/source, vector coverage."""
    s = _store()
    try:
        conn = s._conn
        memories = conn.execute("SELECT COUNT(*) FROM memories").fetchone()[0]
        vectors = conn.execute("SELECT COUNT(*) FROM memory_vectors").fetchone()[0]
        gemini = conn.execute(
            "SELECT COUNT(*) FROM memory_vectors WHERE model != 'local-hash'").fetchone()[0]
        by_type = dict(conn.execute("SELECT type, COUNT(*) FROM memories GROUP BY type").fetchall())
        by_scope = dict(conn.execute("SELECT scope, COUNT(*) FROM memories GROUP BY scope").fetchall())
        return {
            "memories": memories, "vectors": vectors, "gemini_vectors": gemini,
            "vector_coverage_pct": min(100.0, round(100 * vectors / max(memories, 1), 1)),
            "by_type": by_type, "by_scope": by_scope,
        }
    finally:
        s.shutdown()


@mcp.tool()
def memory_relations(limit: int = 200) -> list:
    """Relation triples (subject — predicate — object) from the memory graph."""
    import subprocess
    api = os.path.expanduser("~/Zes-System/scripts/memory_api.py")
    try:
        out = subprocess.run(["python3", api, "relations", str(limit)],
                             capture_output=True, text=True, timeout=30).stdout
        return json.loads(out) if out.strip() else []
    except Exception as e:
        return [{"error": str(e)}]


@mcp.tool()
def memory_consolidate(days: int = 7) -> dict:
    """Dedup metric telemetry + prune stale low-usage metrics + optimize FTS."""
    s = _store()
    try:
        return s.consolidate(metric_days=max(1, days))
    finally:
        s.shutdown()


if __name__ == "__main__":
    mcp.run()  # stdio transport
