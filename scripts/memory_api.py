#!/usr/bin/env python3
"""ZES OS Memory Hub API — query and manage cross-agent memory.

Serves the dashboard /api/memory contract:
  facts / entities / relations / stats  -> holographic store (~/.hermes/profiles/hermes_zes/memory_store.db)
  memories (CRUD)           -> shared hub (~/.zes/memory_hub.sqlite)

Usage:
  python3 memory_api.py stats
  python3 memory_api.py facts <limit> <offset> <query> <sort>
  python3 memory_api.py memories <limit> <offset> <query>
  python3 memory_api.py entities
  python3 memory_api.py relations <limit>
  python3 memory_api.py insert_relation <subject> <predicate> <object>
  python3 memory_api.py insert <type> <scope> <priority> <content> <tags> <source>
  python3 memory_api.py update <id> <content> <tags>
  python3 memory_api.py delete <id>
  python3 memory_api.py search <query>
  python3 memory_api.py vector_search <query> [limit]
  python3 memory_api.py embed_all [force]
"""

import os, re, sys, json, sqlite3, time
os.environ.setdefault("HERMES_HOME", os.path.expanduser("~/.hermes/profiles/hermes_zes"))
sys.path.insert(0, os.path.expanduser('~/hermes-agent'))
from plugins.memory.zes_memory.store import MemoryStore

HOME = os.path.expanduser('~')
HUB_DB = os.path.join(HOME, '.zes', 'memory_hub.sqlite')
HOLO_DB = os.path.join(HOME, '.hermes', 'profiles', 'hermes_zes', 'memory_store.db')

store = MemoryStore(HUB_DB)

PREDICATES = [
    "uses", "used by", "replaces", "replaced by", "depends on", "built with",
    "powered by", "runs on", "migrated from", "part of", "deployed on",
    "built on", "managed by", "connects to", "syncs with", "shares memory with",
    "hosted at", "listens on", "serves", "monitors", "upgraded to",
    "switched to", "moved to", "backed by", "route through", "routes through",
    "integrated with", "forwards to", "provides", "supports", "connected to",
    "is built with", "is powered by", "is part of", "managed via",
]


def ensure_schema():
    """Create the relation-triple table (OpenHuman Option B) if missing."""
    conn = _holo_conn()
    try:
        conn.execute("""CREATE TABLE IF NOT EXISTS relations (
            relation_id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT NOT NULL,
            predicate TEXT NOT NULL,
            object TEXT NOT NULL,
            subject_type TEXT NOT NULL DEFAULT 'entity',
            object_type TEXT NOT NULL DEFAULT 'entity',
            fact_id INTEGER,
            source TEXT NOT NULL DEFAULT 'codex',
            created_at INTEGER NOT NULL DEFAULT 0
        )""")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_relations_fact ON relations(fact_id)")
        conn.commit()
    finally:
        conn.close()


def _entity_names():
    conn = _holo_conn()
    names = []
    try:
        for r in conn.execute("SELECT name, aliases FROM entities"):
            names.append(r['name'])
            for a in (r['aliases'] or '').split(','):
                a = a.strip()
                if a and a not in names:
                    names.append(a)
    finally:
        conn.close()
    return names


def _extract_triples(content, fact_id=None):
    """Extract subject-predicate-object triples from fact content (Option B)."""
    names = _entity_names()
    seen, triples = set(), []
    text = content or ""
    if names:
        ents = "|".join(re.escape(n) for n in sorted(names, key=len, reverse=True))
        preds = "|".join(re.escape(p) for p in sorted(PREDICATES, key=len, reverse=True))
        pat = re.compile(rf"\b({ents})\b(?:\s+is\b)?\s+({preds})\s+({ents})\b", re.IGNORECASE)
        for m in pat.finditer(text):
            subj, pred, obj = m.group(1), m.group(2).lower(), m.group(3)
            if subj.lower() == obj.lower():
                continue
            key = (subj.lower(), pred, obj.lower())
            if key in seen:
                continue
            seen.add(key)
            triples.append({
                'subject': subj, 'predicate': pred, 'object': obj,
                'subject_type': 'entity', 'object_type': 'entity',
                'fact_id': fact_id, 'source': 'extracted',
            })
        # Co-occurrence fallback: entities mentioned in the same fact are related.
        low = text.lower()
        mentioned = [n for n in names if re.search(rf"\b{re.escape(n.lower())}\b", low)]
        if len(mentioned) >= 2:
            pairs = 0
            for i in range(len(mentioned)):
                for j in range(i + 1, len(mentioned)):
                    if pairs >= 3:
                        break
                    a, b = mentioned[i], mentioned[j]
                    key = (a.lower(), 'related_to', b.lower())
                    if key in seen:
                        continue
                    seen.add(key)
                    triples.append({
                        'subject': a, 'predicate': 'related_to', 'object': b,
                        'subject_type': 'entity', 'object_type': 'entity',
                        'fact_id': fact_id, 'source': 'cooccurrence',
                    })
                    pairs += 1
    return triples


def cmd_seed_relations():
    """Bootstrap Option B: add known entities, link facts by mention, extract triples."""
    ensure_schema()
    known = {
        'BitRouter': 'tool', '9Router': 'tool', 'Hermes': 'agent', 'Codex CLI': 'agent',
        'OpenHuman': 'project', 'ZES Dashboard': 'project', 'Telegram': 'platform',
        'Shizuku': 'tool', 'Tor': 'network', 'Vercel': 'platform', 'Hermes Agent': 'agent',
    }
    conn = _holo_conn()
    try:
        existing = {r['name'].lower(): r['entity_id'] for r in conn.execute("SELECT entity_id, name FROM entities")}
        for name, etype in known.items():
            if name.lower() not in existing:
                cur = conn.execute("INSERT INTO entities (name, entity_type) VALUES (?, ?)", (name, etype))
                existing[name.lower()] = cur.lastrowid
        # Link facts to entities whose name appears in the content
        facts = conn.execute("SELECT fact_id, content FROM facts").fetchall()
        linked = 0
        for f in facts:
            for name, eid in existing.items():
                hit = conn.execute(
                    "SELECT 1 FROM fact_entities WHERE fact_id = ? AND entity_id = ?",
                    (f['fact_id'], eid),
                ).fetchone()
                if not hit and name in f['content'].lower():
                    conn.execute(
                        "INSERT OR IGNORE INTO fact_entities (fact_id, entity_id) VALUES (?, ?)",
                        (f['fact_id'], eid),
                    )
                    linked += 1
        conn.commit()
        facts2 = conn.execute("SELECT fact_id, content FROM facts").fetchall()
        total = 0
        for f in facts2:
            total += _insert_relations(_extract_triples(f['content'], f['fact_id']))
        print(json.dumps({'status': 'ok', 'entities': len(existing), 'fact_links_added': linked, 'triples_added': total}))
    finally:
        conn.close()


def _insert_relations(triples):
    if not triples:
        return 0
    conn = _holo_conn()
    n = 0
    try:
        now = int(time.time())
        for t in triples:
            dup = conn.execute(
                """SELECT relation_id FROM relations
                   WHERE lower(subject) = ? AND lower(predicate) = ? AND lower(object) = ?""",
                (t['subject'].lower(), t['predicate'], t['object'].lower()),
            ).fetchone()
            if dup:
                continue
            conn.execute(
                """INSERT INTO relations
                   (subject, predicate, object, subject_type, object_type, fact_id, source, created_at)
                   VALUES (?,?,?,?,?,?,?,?)""",
                (t['subject'], t['predicate'], t['object'], t['subject_type'],
                 t['object_type'], t['fact_id'], t['source'], now),
            )
            n += 1
        conn.commit()
    finally:
        conn.close()
    return n


def _holo_conn():
    conn = sqlite3.connect(HOLO_DB)
    conn.row_factory = sqlite3.Row
    return conn


def cmd_stats():
    store.initialize()
    all_mem = store.list_by_scope('global', limit=1000) + store.list_by_scope('personal', limit=1000)
    conn = _holo_conn()
    try:
        ensure_schema()
        facts_total = conn.execute("SELECT COUNT(*) FROM facts").fetchone()[0]
        facts_hrr = conn.execute("SELECT COUNT(*) FROM facts WHERE hrr_vector IS NOT NULL").fetchone()[0]
        entities_total = conn.execute("SELECT COUNT(*) FROM entities").fetchone()[0]
        links = conn.execute("SELECT COUNT(*) FROM fact_entities").fetchone()[0]
        banks = conn.execute("SELECT COUNT(*) FROM memory_banks").fetchone()[0]
        relations_total = conn.execute("SELECT COUNT(*) FROM relations").fetchone()[0]

        trust_distribution = {}
        for row in conn.execute("SELECT trust_score FROM facts").fetchall():
            bucket = int(row['trust_score'] * 4) / 4  # 0, 0.25, 0.5, 0.75, 1
            trust_distribution[f"{bucket:.2f}"] = trust_distribution.get(f"{bucket:.2f}", 0) + 1

        category_distribution = {}
        for row in conn.execute("SELECT category, COUNT(*) c FROM facts GROUP BY category").fetchall():
            category_distribution[row['category']] = row['c']
    finally:
        conn.close()

    print(json.dumps({
        'facts': facts_total,
        'facts_with_hrr': facts_hrr,
        'entities': entities_total,
        'fact_entity_links': links,
        'relations': relations_total,
        'memories': len(all_mem),
        'memory_banks': banks,
        'trust_distribution': trust_distribution,
        'category_distribution': category_distribution,
        'db_size': os.path.getsize(HOLO_DB) if os.path.exists(HOLO_DB) else 0,
    }))


def cmd_facts(limit=50, offset=0, query='', sort='trust_desc'):
    conn = _holo_conn()
    try:
        order = {
            'trust_desc': 'trust_score DESC',
            'trust_asc': 'trust_score ASC',
            'newest': 'created_at DESC',
            'oldest': 'created_at ASC',
        }.get(sort, 'trust_score DESC')

        if query:
            safe = query.replace('"', '""')
            try:
                rows = conn.execute(
                    f"""SELECT f.fact_id, f.content, f.category, f.tags, f.trust_score,
                               f.retrieval_count, f.helpful_count, f.created_at, f.hrr_vector
                        FROM facts_fts fts JOIN facts f ON fts.rowid = f.fact_id
                        WHERE facts_fts MATCH ?
                        ORDER BY fts.rank, f.trust_score DESC
                        LIMIT ? OFFSET ?""",
                    (safe, int(limit), int(offset)),
                ).fetchall()
            except sqlite3.OperationalError:
                like = f"%{query}%"
                rows = conn.execute(
                    f"""SELECT fact_id, content, category, tags, trust_score,
                               retrieval_count, helpful_count, created_at, hrr_vector
                        FROM facts WHERE content LIKE ? OR tags LIKE ?
                        ORDER BY {order} LIMIT ? OFFSET ?""",
                    (like, like, int(limit), int(offset)),
                ).fetchall()
        else:
            rows = conn.execute(
                f"""SELECT fact_id, content, category, tags, trust_score,
                           retrieval_count, helpful_count, created_at, hrr_vector
                    FROM facts ORDER BY {order} LIMIT ? OFFSET ?""",
                (int(limit), int(offset)),
            ).fetchall()

        results = []
        for r in rows:
            ents = conn.execute(
                """SELECT e.name, e.entity_type FROM entities e
                   JOIN fact_entities fe ON fe.entity_id = e.entity_id
                   WHERE fe.fact_id = ? ORDER BY e.name""",
                (r['fact_id'],),
            ).fetchall()
            results.append({
                'fact_id': r['fact_id'],
                'content': r['content'],
                'category': r['category'],
                'tags': (r['tags'] or '').split(',') if r['tags'] else [],
                'trust_score': r['trust_score'],
                'retrieval_count': r['retrieval_count'],
                'helpful_count': r['helpful_count'],
                'created_at': r['created_at'],
                'has_hrr': r['hrr_vector'] is not None,
                'entities': [{'name': e['name'], 'entity_type': e['entity_type']} for e in ents],
            })
        print(json.dumps({'facts': results}))
    finally:
        conn.close()


def cmd_memories(limit=50, offset=0, query=''):
    store.initialize()
    mems = store.search(query, limit=int(limit)) if query else store.list_by_scope('global', limit=int(limit))
    results = []
    for m in mems:
        results.append({
            'id': m.get('hash'),
            'type': m.get('type', 'fact'),
            'scope': m.get('scope', 'global'),
            'priority': m.get('priority', 'medium'),
            'content': m.get('content', ''),
            'tags': m.get('tags', '').split(',') if m.get('tags') else [],
            'source': m.get('source', 'hermes'),
            'created_at': m.get('created_at', 0),
        })
    print(json.dumps({'memories': results}))


def cmd_company_facts(company_id, limit=20):
    """List hub memories tagged company:<id> — company-scoped shared knowledge."""
    conn = sqlite3.connect(HUB_DB)
    conn.row_factory = sqlite3.Row
    try:
        like = f"%company:{company_id}%"
        rows = conn.execute(
            """SELECT id, type, scope, priority, content, tags, source,
                      created_at, updated_at, usage_count
               FROM memories
               WHERE tags LIKE ?
               ORDER BY updated_at DESC
               LIMIT ?""",
            (like, int(limit)),
        ).fetchall()
        out = [{k: r[k] for k in r.keys()} for r in rows]
        for m in out:
            m["tags"] = (m.get("tags") or "").split(",")
        print(json.dumps({"facts": out, "total": len(out)}))
    finally:
        conn.close()


def cmd_entities():
    conn = _holo_conn()
    try:
        rows = conn.execute(
            """SELECT e.entity_id, e.name, e.entity_type, COUNT(fe.fact_id) AS fact_count
               FROM entities e LEFT JOIN fact_entities fe ON fe.entity_id = e.entity_id
               GROUP BY e.entity_id ORDER BY fact_count DESC, e.name"""
        ).fetchall()
        results = []
        for r in rows:
            facts = conn.execute(
                """SELECT f.fact_id, f.content, f.trust_score FROM facts f
                   JOIN fact_entities fe ON fe.fact_id = f.fact_id
                   WHERE fe.entity_id = ? ORDER BY f.trust_score DESC LIMIT 20""",
                (r['entity_id'],),
            ).fetchall()
            results.append({
                'entity_id': r['entity_id'],
                'name': r['name'],
                'entity_type': r['entity_type'],
                'fact_count': r['fact_count'],
                'facts': [dict(f) for f in facts],
            })
        print(json.dumps({'entities': results}))
    finally:
        conn.close()


def cmd_relations(limit=200):
    ensure_schema()
    conn = _holo_conn()
    try:
        rows = conn.execute(
            """SELECT relation_id, subject, predicate, object, subject_type, object_type,
                      fact_id, source, created_at
               FROM relations ORDER BY relation_id DESC LIMIT ?""",
            (int(limit),),
        ).fetchall()
        print(json.dumps({'relations': [dict(r) for r in rows]}))
    finally:
        conn.close()


def cmd_insert_relation(subject, predicate, object_):
    ensure_schema()
    if not subject or not predicate or not object_:
        print(json.dumps({'status': 'error', 'error': 'subject, predicate, object required'}))
        return
    n = _insert_relations([{
        'subject': subject, 'predicate': predicate.lower(), 'object': object_,
        'subject_type': 'entity', 'object_type': 'entity',
        'fact_id': None, 'source': 'manual',
    }])
    print(json.dumps({'status': 'ok', 'inserted': n}))


def cmd_insert(mtype='fact', scope='global', priority='medium', content='', tags='', source='dashboard'):
    store.initialize()
    is_new, h = store.insert({
        'type': mtype,
        'scope': scope,
        'priority': priority,
        'content': content,
        'tags': tags,
        'source': source,
    })
    # Mirror into holographic store so new facts also gain entities/HRR.
    try:
        ensure_schema()
        from plugins.memory.holographic.store import MemoryStore
        holo = MemoryStore()
        holo.add_fact(content, category=mtype, tags=tags)
        holo.close()
        # Option B: extract relation triples at insert time
        triples = _extract_triples(content)
        n = _insert_relations(triples)
        if n:
            os.environ.setdefault("DEBUG_MEMORY_API", "")
            if os.environ.get("DEBUG_MEMORY_API"):
                print(f"[memory_api] extracted {n} triple(s)", file=sys.stderr)
    except Exception:
        pass
    print(json.dumps({'status': 'ok', 'id': h, 'is_new': is_new}))


def cmd_update(mid, content=None, tags=None):
    store.initialize()
    sets, params = [], []
    if content is not None:
        sets.append('content = ?')
        params.append(content)
    if tags is not None:
        sets.append('tags = ?')
        params.append(tags)
    if not sets:
        print(json.dumps({'status': 'error', 'error': 'nothing to update'}))
        return
    sets.append('updated_at = ?')
    params.append(int(time.time()))
    params.append(mid)
    conn = sqlite3.connect(HUB_DB)
    conn.execute(f"UPDATE memories SET {', '.join(sets)} WHERE hash = ?", params)
    conn.commit()
    conn.close()
    print(json.dumps({'status': 'ok'}))


def cmd_delete(mid):
    store.initialize()
    store.delete(mid)
    # Mirror into holographic store if a fact with the same content exists.
    try:
        conn = _holo_conn()
        row = conn.execute("SELECT content FROM memories WHERE hash = ?", (mid,)).fetchone()
        if row is not None:
            from plugins.memory.holographic.store import MemoryStore
            holo = MemoryStore()
            hit = holo._conn.execute("SELECT fact_id FROM facts WHERE content = ?", (row['content'],)).fetchone()
            if hit is not None:
                holo.remove_fact(hit['fact_id'])
            holo.close()
        conn.close()
    except Exception:
        pass
    print(json.dumps({'status': 'ok'}))


def cmd_vector_search(query, limit='10'):
    store.initialize()
    results = store.semantic_search(query, limit=int(limit))
    items = []
    for m in results:
        items.append({
            'id': m.get('hash'),
            'type': m.get('type', 'fact'),
            'content': m.get('content', ''),
            'tags': m.get('tags', '').split(',') if m.get('tags') else [],
            'source': m.get('source', ''),
            'created_at': m.get('created_at', 0),
            'score': m.get('score', 0.0),
            'vector_model': m.get('vector_model', ''),
        })
    print(json.dumps(items))


def cmd_embed_all(force=''):
    store.initialize()
    res = store.embed_all(force=bool(force and force.lower() in ('1', 'true', 'force')))
    print(json.dumps({'status': 'ok', **res}))


def cmd_search(query):
    store.initialize()
    results = store.search(query, limit=50)
    items = []
    for m in results:
        items.append({
            'id': m.get('hash'),
            'type': m.get('type', 'fact'),
            'content': m.get('content', ''),
            'tags': m.get('tags', '').split(',') if m.get('tags') else [],
            'source': m.get('source', ''),
            'created_at': m.get('created_at', 0),
        })
    print(json.dumps(items))


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'missing command'}))
        sys.exit(1)
    cmd = sys.argv[1]
    try:
        if cmd == 'stats': cmd_stats()
        elif cmd == 'facts': cmd_facts(*sys.argv[2:6])
        elif cmd == 'memories': cmd_memories(*sys.argv[2:5])
        elif cmd == 'company_facts': cmd_company_facts(*sys.argv[2:4])
        elif cmd == 'entities': cmd_entities()
        elif cmd == 'relations': cmd_relations(*sys.argv[2:3])
        elif cmd == 'insert_relation': cmd_insert_relation(*sys.argv[2:5])
        elif cmd == 'seed_relations': cmd_seed_relations()
        elif cmd == 'insert': cmd_insert(*sys.argv[2:8])
        elif cmd == 'update': cmd_update(*sys.argv[2:5])
        elif cmd == 'delete': cmd_delete(sys.argv[2])
        elif cmd == 'search': cmd_search(*sys.argv[2:3])
        elif cmd == 'vector_search': cmd_vector_search(*sys.argv[2:4])
        elif cmd == 'embed_all': cmd_embed_all(*sys.argv[2:3])
        else: print(json.dumps({'error': f'unknown command: {cmd}'}))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
