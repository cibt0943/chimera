// index.js
//
// Real-time collaboration server for the network-diagram (工程表) tool.
// - Uses y-websocket's setupWSConnection to handle Yjs document sync + awareness.
// - Verifies a short-lived JWT minted by the Remix app (shared-secret HMAC),
//   rather than talking to Auth0 directly. See app/routes/api.collab-token.ts
//   on the Remix side for how this token is issued.
//
// Env vars required:
//   COLLAB_JWT_SECRET   shared secret with the Remix app (same value on both sides)
//   PORT                 defaults to 1234

const http = require("http");
const { WebSocketServer } = require("ws");
const { setupWSConnection, setPersistence } = require("y-websocket/bin/utils");
const jwt = require("jsonwebtoken");
const { URL } = require("url");
const persistence = require("./persistence");

setPersistence(persistence);

const PORT = process.env.PORT || 1234;
const COLLAB_JWT_SECRET = process.env.COLLAB_JWT_SECRET;

if (!COLLAB_JWT_SECRET) {
  console.error("Missing COLLAB_JWT_SECRET env var.");
  process.exit(1);
}

function verifyCollabToken(token) {
  return jwt.verify(token, COLLAB_JWT_SECRET, { algorithms: ["HS256"] });
}

function authorizeRoom(payload, roomName) {
  return payload.room === roomName;
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("y-websocket collaboration server OK");
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", async (request, socket, head) => {
  try {
    const { pathname, searchParams } = new URL(
      request.url,
      `http://${request.headers.host}`,
    );
    const token = searchParams.get("token");
    const roomName = pathname.replace(/^\//, "");

    if (!token) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    const payload = verifyCollabToken(token);

    if (!authorizeRoom(payload, roomName)) {
      socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      ws.userId = payload.sub;
      wss.emit("connection", ws, request, roomName);
    });
  } catch (err) {
    console.error("WS auth failed:", err.message);
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
  }
});

wss.on("connection", (ws, request, roomName) => {
  setupWSConnection(ws, request, { docName: roomName, gc: true });
  console.log(`User ${ws.userId} joined room "${roomName}"`);
});

server.listen(PORT, () => {
  console.log(`y-websocket collaboration server listening on :${PORT}`);
});
