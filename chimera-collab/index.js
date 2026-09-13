// server/index.js
//
// Minimal real-time collaboration server for the network-diagram (工程表) tool.
// - Uses y-websocket's setupWSConnection to handle Yjs document sync + awareness.
// - Verifies an Auth0-issued access token before allowing a client to join a room.
// - Each "room" (document name) should correspond to one diagram, e.g. `diagram:123`.
//
// Env vars required:
//   AUTH0_DOMAIN        e.g. "your-tenant.us.auth0.com"
//   AUTH0_AUDIENCE       API identifier configured in Auth0 (the "aud" claim)
//   PORT                 defaults to 1234
//
// Install:
//   npm install ws y-websocket yjs jsonwebtoken jwks-rsa dotenv

const http = require("http");
const { WebSocketServer } = require("ws");
const { setupWSConnection } = require("y-websocket/bin/utils");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const { URL } = require("url");

const PORT = process.env.PORT || 1234;
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_MANAGEMENT_API_IDENTIFIER;

if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE) {
  console.error("Missing AUTH0_DOMAIN or AUTH0_AUDIENCE env vars.");
  process.exit(1);
}

const jwks = jwksClient({
  jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
});

function getSigningKey(kid) {
  return new Promise((resolve, reject) => {
    jwks.getSigningKey(kid, (err, key) => {
      if (err) return reject(err);
      resolve(key.getPublicKey());
    });
  });
}

// Verifies the token and returns the decoded payload (throws on failure).
async function verifyAuth0Token(token) {
  const decodedHeader = jwt.decode(token, { complete: true });
  if (!decodedHeader || !decodedHeader.header || !decodedHeader.header.kid) {
    throw new Error("Invalid token header");
  }
  const publicKey = await getSigningKey(decodedHeader.header.kid);
  return jwt.verify(token, publicKey, {
    audience: AUTH0_AUDIENCE,
    issuer: `https://${AUTH0_DOMAIN}/`,
    algorithms: ["RS256"],
  });
}

// Optional: authorize whether this user may access this specific document/room.
// Wire this up to your Laravel app (e.g. an internal API call or a shared DB check)
// to confirm the user has access to the given diagram id.
async function authorizeRoom(userPayload, roomName) {
  // TODO: replace with a real check against Laravel, e.g.:
  //   const res = await fetch(`${process.env.LARAVEL_API_URL}/api/diagrams/${roomId}/can-access`, {
  //     headers: { Authorization: `Bearer <service-token>` },
  //     method: 'POST',
  //     body: JSON.stringify({ sub: userPayload.sub }),
  //   });
  //   return res.ok;
  return true;
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
    const roomName = pathname.replace(/^\//, ""); // e.g. "diagram:123"

    if (!token) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    const payload = await verifyAuth0Token(token);
    const allowed = await authorizeRoom(payload, roomName);
    if (!allowed) {
      socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      // Attach the authenticated user info so we can use it for awareness /
      // audit logging inside the connection handler if needed.
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
  // setupWSConnection reads the room name from the URL by default; pass it
  // explicitly via `docName` since we've already parsed it above.
  setupWSConnection(ws, request, { docName: roomName, gc: true });
  console.log(`User ${ws.userId} joined room "${roomName}"`);
});

server.listen(PORT, () => {
  console.log(`y-websocket collaboration server listening on :${PORT}`);
});
