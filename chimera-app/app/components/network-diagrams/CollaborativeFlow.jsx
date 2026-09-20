// client-src/CollaborativeFlow.jsx
//
// Collaborative network-diagram (工程表) editor built on React Flow + Yjs.
// - Durable data (nodes, edges) is stored in a shared Y.Doc and synced via
//   the y-websocket WebsocketProvider, authenticated with an Auth0 access token.
// - Ephemeral data (other users' cursors) is synced via Yjs Awareness.
//
// Install (client):
//   npm install @xyflow/react yjs y-websocket @auth0/auth0-react
//
// Usage: wrap your app in <Auth0Provider> (see App.jsx below) and render
//   <CollaborativeFlow roomId="diagram:123" />

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
const COLLAB_SERVER_URL = import.meta.env.VITE_COLLAB_WS_URL || 'ws://localhost:1234';

// Fetches a short-lived collab token from the Remix app. The browser never
// sees a raw Auth0 token — the session cookie authenticates this request,
// and Remix mints a token scoped to this room. See:
//   app/routes/api.collab-token.ts
async function fetchCollabToken(roomId) {
  const res = await fetch(`/api/collab-token?room=${encodeURIComponent(roomId)}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch collab token');
  const { token } = await res.json();
  return token;
}

// Fields we persist per node/edge (see React Flow's Durable/Ephemeral guidance).
// dragging/resizing/selected/measured are intentionally left out of the shared doc.
function toDurableNode(node) {
  const { id, type, data, position, width, height } = node;
  return { id, type, data, position, width, height };
}
function toDurableEdge(edge) {
  const { id, type, data, source, target, sourceHandle, targetHandle } = edge;
  return { id, type, data, source, target, sourceHandle, targetHandle };
}

const randomColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;

export default function CollaborativeFlow({ roomId, user }) {
  // `user` is passed down from the Remix route's loader data (loginInfo.auth0User),
  // since the browser has no direct Auth0 hook/session in this app.
  const [ready, setReady] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [cursors, setCursors] = useState({});

  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const yNodesRef = useRef(null);
  const yEdgesRef = useRef(null);
  const applyingRemoteRef = useRef(false);

  useEffect(() => {
    let disposed = false;

    async function connect() {
      const token = await fetchCollabToken(roomId);

      const ydoc = new Y.Doc();
      const yNodesMap = ydoc.getMap('nodes'); // id -> node
      const yEdgesMap = ydoc.getMap('edges'); // id -> edge

      const provider = new WebsocketProvider(
        COLLAB_SERVER_URL,
        roomId,
        ydoc,
        { params: { token } }
      );

      ydocRef.current = ydoc;
      providerRef.current = provider;
      yNodesRef.current = yNodesMap;
      yEdgesRef.current = yEdgesMap;

      // Awareness: share this user's identity + cursor color, and later their
      // live cursor position (ephemeral, never written to the Y.Doc).
      provider.awareness.setLocalStateField('user', {
        name: user?.name || 'Anonymous',
        color: randomColor(),
      });

      const syncLocalStateFromYjs = () => {
        applyingRemoteRef.current = true;
        setNodes(Array.from(yNodesMap.values()));
        setEdges(Array.from(yEdgesMap.values()));
        applyingRemoteRef.current = false;
      };

      yNodesMap.observe(syncLocalStateFromYjs);
      yEdgesMap.observe(syncLocalStateFromYjs);

      provider.awareness.on('change', () => {
        const states = provider.awareness.getStates();
        const next = {};
        states.forEach((state, clientId) => {
          if (clientId === provider.awareness.clientID) return;
          if (state.cursor && state.user) {
            next[clientId] = { ...state.cursor, ...state.user };
          }
        });
        setCursors(next);
      });

      provider.on('sync', (isSynced) => {
        if (isSynced && !disposed) setReady(true);
      });
    }

    connect();

    return () => {
      disposed = true;
      providerRef.current?.destroy();
      ydocRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // Local React Flow change handlers -> write durable fields into the Y.Doc.
  // Yjs's own observers (above) will reconcile this back into React state,
  // so we don't need to setNodes/setEdges directly here.
  const onNodesChange = useCallback((changes) => {
    if (applyingRemoteRef.current) return;
    setNodes((prevNodes) => {
      const next = applyNodeChanges(changes, prevNodes);
      const yNodes = yNodesRef.current;
      if (yNodes) {
        ydocRef.current.transact(() => {
          for (const change of changes) {
            if (change.type === 'remove') {
              yNodes.delete(change.id);
            } else {
              const updated = next.find((n) => n.id === change.id);
              if (updated) yNodes.set(updated.id, toDurableNode(updated));
            }
          }
        });
      }
      return next;
    });
  }, []);

  const onEdgesChange = useCallback((changes) => {
    if (applyingRemoteRef.current) return;
    setEdges((prevEdges) => {
      const next = applyEdgeChanges(changes, prevEdges);
      const yEdges = yEdgesRef.current;
      if (yEdges) {
        ydocRef.current.transact(() => {
          for (const change of changes) {
            if (change.type === 'remove') {
              yEdges.delete(change.id);
            } else {
              const updated = next.find((e) => e.id === change.id);
              if (updated) yEdges.set(updated.id, toDurableEdge(updated));
            }
          }
        });
      }
      return next;
    });
  }, []);

  const onConnect = useCallback((connection) => {
    setEdges((prevEdges) => {
      const next = addEdge(connection, prevEdges);
      const newEdge = next[next.length - 1];
      yEdgesRef.current?.set(newEdge.id, toDurableEdge(newEdge));
      return next;
    });
  }, []);

  // Broadcast this user's live cursor position as ephemeral awareness state.
  const onPaneMouseMove = useCallback((event) => {
    const provider = providerRef.current;
    if (!provider) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    provider.awareness.setLocalStateField('cursor', {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  }, []);

  const cursorOverlays = useMemo(
    () =>
      Object.entries(cursors).map(([clientId, c]) => (
        <div
          key={clientId}
          style={{
            position: 'absolute',
            left: c.x,
            top: c.y,
            pointerEvents: 'none',
            zIndex: 1000,
            transform: 'translate(-2px, -2px)',
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color }} />
          <div style={{ fontSize: 11, color: c.color, whiteSpace: 'nowrap' }}>{c.name}</div>
        </div>
      )),
    [cursors]
  );

  if (!ready) {
    return <div>接続中...</div>;
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }} onMouseMove={onPaneMouseMove}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
      {cursorOverlays}
    </div>
  );
}
