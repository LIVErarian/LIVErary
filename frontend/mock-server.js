// mock-server.js
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080, path: '/ws' });
const players = new Map();

console.log('🎩 [Smart Mock Server] 가동 중... (구독 ID 지원)');

wss.on('connection', (ws) => {
  console.log('✅ 소켓 연결됨');

  // 클라이언트의 구독 정보 저장소 (Topic -> Subscription ID)
  // 예: { '/topic/join': 'sub-0', '/topic/move': 'sub-1' }
  ws.subscriptions = {};

  ws.on('message', (message) => {
    const msgString = message.toString();
    const lines = msgString.split('\n');
    const command = lines[0];

    // 1. SUBSCRIBE 처리 (여기가 핵심! ⭐)
    if (command === 'SUBSCRIBE') {
      let destination = '';
      let id = '';

      // 헤더 파싱
      lines.forEach((line) => {
        if (line.startsWith('destination:')) destination = line.split(':')[1];
        if (line.startsWith('id:')) id = line.split(':')[1];
      });

      if (destination && id) {
        ws.subscriptions[destination] = id;
        console.log(
          `📌 [구독] ${ws.id || 'Anonymous'} -> ${destination} (ID: ${id})`,
        );
      }
    }

    // 2. CONNECT 처리
    if (command === 'CONNECT' || command === 'STOMP') {
      ws.send('CONNECTED\nversion:1.2\nheart-beat:0,0\n\n\0');
    }

    // 3. SEND 처리
    if (command === 'SEND') {
      const parts = msgString.split('\n\n');
      if (parts.length >= 2) {
        const bodyString = parts[1].replace(/\0/g, '');

        try {
          const body = JSON.parse(bodyString);

          // JOIN
          if (msgString.includes('destination:/app/join')) {
            ws.id = body.id; // 클라이언트 ID 신뢰
            players.set(ws.id, body);

            // 기존 유저들에게 알림
            broadcastToAll('/topic/join', body);

            // 나에게 기존 유저 리스트 전송
            players.forEach((playerInfo, id) => {
              if (id !== ws.id) {
                sendToClient(ws, '/topic/join', playerInfo);
              }
            });
            console.log(`👋 [입장] ${ws.id} (현재 ${players.size}명)`);
          }

          // MOVE
          if (msgString.includes('destination:/app/move')) {
            if (players.has(ws.id)) {
              const updated = { ...players.get(ws.id), ...body };
              players.set(ws.id, updated);

              const payload = { ...body, id: ws.id };
              broadcastToAll('/topic/move', payload);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  });

  ws.on('close', () => {
    if (ws.id) {
      const leftUserId = ws.id; // 나가는 사람 ID 저장
      players.delete(leftUserId);

      const leavePayload = { id: leftUserId };
      broadcastToAll('/topic/leave', leavePayload);

      console.log(`❌ [퇴장] ${leftUserId}. 남은 인원: ${players.size}`);
    }
  });
});

// [수정된 전송 함수] 구독 ID를 찾아서 헤더에 붙여줌!
function sendToClient(ws, destination, body) {
  const subId = ws.subscriptions[destination]; // 이 유저가 해당 토픽을 구독할 때 썼던 ID

  // 만약 구독 안 한 토픽이면 안 보냄 (안전장치)
  if (!subId) return;

  const msg = `MESSAGE
destination:${destination}
content-type:application/json
subscription:${subId}

${JSON.stringify(body)}\0`;
  ws.send(msg);
}

function broadcastToAll(destination, body) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      sendToClient(client, destination, body);
    }
  });
}
