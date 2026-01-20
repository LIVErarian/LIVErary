import { WebSocketServer } from 'ws'; // ⭕ 이렇게 바꿉니다

const wss = new WebSocketServer({ port: 8080, path: '/ws' });

console.log(
  '🎭 가짜(Mock) STOMP 서버가 ws://localhost:8080/ws 에서 실행 중입니다!',
);

wss.on('connection', (ws) => {
  console.log('✅ 클라이언트(프론트)가 접속했습니다!');

  ws.on('message', (message) => {
    const msgString = message.toString();
    console.log('📩 [받은 메시지]:\n', msgString);

    // STOMP 연결 요청 처리
    if (msgString.startsWith('CONNECT') || msgString.startsWith('STOMP')) {
      const response = 'CONNECTED\nversion:1.2\nheart-beat:0,0\n\n\0';
      ws.send(response);
      console.log('📤 [보낸 응답]: CONNECTED (연결 성공)');
    }
  });
});
