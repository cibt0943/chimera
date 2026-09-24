// persistence.js
//
// y-websocket persistence provider backed by Supabase (Postgres).
// Stores the whole Yjs document as a base64-encoded snapshot in the
// `network_diagrams.yjs_state` column (see migrations/*_create_network_diagrams.sql).
// The room name is expected to be "diagram:<uuid>", where <uuid> is the
// primary key of an existing row in `network_diagrams` (created by the
// Remix app before the user opens the collaborative editor).
//
// Wired into index.js via y-websocket's setPersistence().

const { createClient } = require("@supabase/supabase-js");
const Y = require("yjs");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY env vars.");
  process.exit(1);
}

// Secret key bypasses RLS — this must only ever run server-side
// (never ship this key to the browser).
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

const TABLE = "network_diagrams";
const DEBOUNCE_MS = 2000;
const saveTimers = new Map(); // docName -> Timeout

// "diagram:1234abcd-..." -> "1234abcd-..."
function diagramIdFromRoom(docName) {
  return docName.replace(/^diagram:/, "");
}

async function loadState(docName) {
  const diagramId = diagramIdFromRoom(docName);
  const { data, error } = await supabase
    .from(TABLE)
    .select("yjs_state")
    .eq("id", diagramId)
    .maybeSingle();

  if (error) {
    console.error(`[persistence] Failed to load "${docName}":`, error.message);
    return null;
  }
  if (!data?.yjs_state) return null;
  return Buffer.from(data.yjs_state, "base64");
}

async function saveState(docName, ydoc) {
  const diagramId = diagramIdFromRoom(docName);
  const update = Y.encodeStateAsUpdate(ydoc);
  const yjs_state = Buffer.from(update).toString("base64");

  // Yjsの共有Mapから素のJSONも取り出しておく。列一覧・検索など、
  // WebSocket接続やYjsのデコードなしに中身を参照したい場面で使う。
  // クライアント側 (CollaborativeFlow.jsx) の ydoc.getMap('nodes') /
  // ydoc.getMap('edges') と同じキー名を参照している。
  const nodes = Array.from(ydoc.getMap("nodes").values());
  const edges = Array.from(ydoc.getMap("edges").values());

  // update のみ行う。行自体はRemix側が事前に(タイトル入力などのタイミングで)
  // 作成しておく想定なので、ここでは新規作成(insert)はしない。
  const { error } = await supabase
    .from(TABLE)
    .update({ yjs_state, nodes, edges, updated_at: new Date().toISOString() })
    .eq("id", diagramId);

  if (error) {
    console.error(`[persistence] Failed to save "${docName}":`, error.message);
  }
}

function scheduleSave(docName, ydoc) {
  clearTimeout(saveTimers.get(docName));
  saveTimers.set(
    docName,
    setTimeout(() => saveState(docName, ydoc), DEBOUNCE_MS),
  );
}

module.exports = {
  // Called once when the first client joins a room: load any existing
  // state from Supabase into the fresh in-memory Y.Doc, then keep saving
  // on every subsequent update (debounced).
  bindState: async (docName, ydoc) => {
    const stored = await loadState(docName);
    if (stored && stored.length > 0) {
      Y.applyUpdate(ydoc, stored);
      console.log(
        `[persistence] Restored "${docName}" from Supabase (${stored.length} bytes)`,
      );
    } else {
      console.log(
        `[persistence] No existing state for "${docName}", starting fresh`,
      );
    }
    ydoc.on("update", () => scheduleSave(docName, ydoc));
  },

  // Called when the last client disconnects from a room: flush any
  // pending save immediately so we don't lose the final few seconds
  // of changes to the debounce window.
  writeState: async (docName, ydoc) => {
    clearTimeout(saveTimers.get(docName));
    saveTimers.delete(docName);
    await saveState(docName, ydoc);
    console.log(`[persistence] Flushed final state for "${docName}"`);
  },
};
