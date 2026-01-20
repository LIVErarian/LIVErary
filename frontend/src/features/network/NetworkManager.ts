import type {
  ConnectCallback,
  PlayerJoinCallback,
  PlayerMoveCallback,
} from './network.types';
import { SocketManager } from './SocketManager';

import type {
  MoveRequest,
  MoveResponse,
  PlayerState,
} from '@/types/socket.types';

export class NetworkManager {
  private _socket: SocketManager;

  constructor() {
    this._socket = new SocketManager();
  }

  /**
   * 서버와 웹소켓 연결을 시도하고, 게임에 필요한 이벤트를 구독합니다.
   * @param onConnect 연결이 성공했을 때 실행될 콜백
   * @param onPlayerJoin 새로운 플레이어가 입장했을 때 실행될 콜백
   * @param onPlayerMove 다른 플레이어가 이동했을 때 실행될 콜백
   */
  public connect(
    onConnect: ConnectCallback,
    onPlayerJoin: PlayerJoinCallback,
    onPlayerMove: PlayerMoveCallback,
  ) {
    const SERVER_URL = 'ws://localhost:8080/ws';

    this._socket.connect(SERVER_URL, () => {
      // 입장 이벤트
      this._socket.subscribe<PlayerState>('/topic/join', (data) => {
        onPlayerJoin(data);
      });

      // 이동 이벤트
      this._socket.subscribe<MoveResponse>('/topic/move', (data) => {
        onPlayerMove(data);
      });

      // 연결 완료 알림
      onConnect();
    });
  }

  /**
   * 내 캐릭터의 이동 정보를 서버로 전송합니다.
   * @param payload 전송할 이동 데이터(x, y, direction, isMoving)
   */
  public sendMove(payload: MoveRequest) {
    this._socket.publish<MoveRequest>('/app/move', payload);
  }

  /**
   * 서버에 들어갈 때 내 캐릭터의 정보를 전송합니다.
   * @param myInfo 내 캐릭터 정보
   */
  public sendJoin(myInfo: PlayerState) {
    this._socket.publish('/app/join', myInfo);
  }

  // Getter
  public get isConnected(): boolean {
    return this._socket.isConnected;
  }

  /**
   * 소켓 연결을 종료합니다.
   */
  public disconnect() {
    this._socket.disconnect();
  }
}
