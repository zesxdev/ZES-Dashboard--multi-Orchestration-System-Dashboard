#!/usr/bin/env python3
"""ZES OS Memory Hub API — query and manage cross-agent memory.

Usage:
  python3 memory_api.py stats
  python3 memory_api.py facts <limit> <offset> <query> <sort>
  python3 memory_api.py memories <limit> <offset> <query>
  python3 memory_api.py insert <type> <scope> <priority> <content> <tags> <source>
  python3 memory_api.py update <id> <content> <tags>
  python3 memory_api.py delete <id>
  python3 memory_api.py search <query>
"""

import os, sys, json, time
os.environ.setdefault("HERMES_HOME", os.path.expanduser("~/.hermes/profiles/hermes_zes"))
sys.path.insert(0, os.path.expanduser('~/hermes-agent'))
from plugins.memory.zes_memory.store import MemoryStore

HOME = os.path.expanduser('~')
DB_PATH = os.path.join(HOME, '.zes', 'memory_hub.sqlite')

store = MemoryStore(DB_PATH)

def cmd_stats():
    store.initialize()
    all_mem = store.list_by_scope('global', limit=1000) + store.list_by_scope('personal', limit=1000)
    total = len(all_mem)
    types = {}
    scopes = {}
    priorities = {}
    tags = {}
    for m in all_mem:
        t = m.get('type', 'unknown')
        types[t] = types.get(t, 0) + 1
        s = m.get('scope', 'unknown')
        scopes[s] = scopes.get(s, 0) + 1
        p = m.get('priority', 'medium')
        priorities[p] = priorities.get(p, 0) + 1
        for tag in m.get('tags', '').split(','):
            tag = tag.strip()
            if tag:
                tags[tag] = tags.get(tag, 0) + 1
    top_tags = sorted(tags.items(), key=lambda x: -x[1])[:10]
    print(json.dumps({
        'total': total,
        'types': types,
        'scopes': scopes,
        'priorities': priorities,
        'top_tags': top_tags,
        'db_size': os.path.getsize(DB_PATH) if os.path.exists(DB_PATH) else 0,
    }))

def cmd_facts(limit=50, offset=0, query='', sort='trust_desc'):
    store.initialize()
    memories = store.search(query, limit=int(limit)) if query else store.list_by_scope('global', limit=int(limit))
    results = []
    for m in memories:
        results.append({
            'id': m.get('id'),
            'type': m.get('type', 'fact'),
            'scope': m.get('scope', 'global'),
            'priority': m.get('priority', 'medium'),
            'content': m.get('content', ''),
            'tags': m.get('tags', '').split(',') if m.get('tags') else [],
            'source': m.get('source', 'hermes'),
            'created_at': m.get('created_at', 0),
            'updated_at': m.get('updated_at', 0),
            'usage_count': m.get('usage_count', 0),
        })
    print(json.dumps(results))

def cmd_insert(mtype='fact', scope='global', priority='medium', content='', tags='', source='dashboard'):
    store.initialize()
    m = store.insert({
        'type': mtype,
        'scope': scope,
        'priority': priority,
        'content': content,
        'tags': tags,
        'source': source,
    })
    print(json.dumps({'status': 'ok', 'id': m.get('id') if isinstance(m, dict) else m}))

def cmd_update(mid, content=None, tags=None):
    store.initialize()
    updates = {}
    if content: updates['content'] = content
    if tags: updates['tags'] = tags
    store.update(int(mid), updates)
    print(json.dumps({'status': 'ok'}))

def cmd_delete(mid):
    store.initialize()
    store.delete(int(mid))
    print(json.dumps({'status': 'ok'}))

def cmd_search(query):
    store.initialize()
    results = store.search(query, limit=50)
    items = []
    for m in results:
        items.append({
            'id': m.get('id'),
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
        elif cmd == 'memories': cmd_facts(*sys.argv[2:5])
        elif cmd == 'insert': cmd_insert(*sys.argv[2:8])
        elif cmd == 'update': cmd_update(*sys.argv[2:5])
        elif cmd == 'delete': cmd_delete(*sys.argv[2])
        elif cmd == 'search': cmd_search(*sys.argv[2:3])
        else: print(json.dumps({'error': f'unknown command: {cmd}'}))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
