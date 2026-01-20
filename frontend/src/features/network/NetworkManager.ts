import { SocketManager } from './SocketManager';

export class NetworkManager {
  private _socket: SocketManager;

  constructor() {
    this._socket = new SocketManager();
  }

  public connect() {
    const SERVER_URL = 'ws://localhost:8080/ws';

    this._socket.connect(SERVER_URL, () => {
      // 연결 성공하면 할 일
      console.log('NetworkManager: 연결 성공');
    });
  }
}
