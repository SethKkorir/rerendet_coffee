// websocket-server.js
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001, path: "/ws" });

wss.on('connection', function connection(ws) {
  console.log('Client connected via WebSocket');

  ws.on('message', function message(data) {
    console.log('received: %s', data);
    // Echo it back
    ws.send(`Server received: ${data}`);
  });

  ws.send('Hello from server');
});

console.log('WebSocket server is running on ws://localhost:3001/ws');
