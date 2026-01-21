// Socket 연결에 필요한 기능 (연결, 보내기, 받기) 관리
import { Client, type IMessage } from '@stomp/stompjs';

import type { ConnectCallback } from './network.types';

export class SocketManager {
  private _stompClient: Client | null = null;

  public connect(url: string, onConnect: ConnectCallback) {
    // 이미 있거나 실행 중이면 return
    if (this._stompClient && this._stompClient.active) return;

    this._stompClient = new Client({
      brokerURL: url,
      reconnectDelay: 5000, // 5초 후 연결 재시도
      heartbeatIncoming: 1000, // 서버 -> 클라이언트 주기
      heartbeatOutgoing: 1000, // 클라이언트 -> 서버 주기
      // 연결 성공시 로직 실행
      onConnect: () => {
        console.log('STOMP connected');
        // NetworkManager에서 할당한 일(callback) 실행
        if (onConnect) onConnect();
      },

      // 에러 발생시 로직 실행
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message']); // error message 전달
        console.error('Detail:', frame.body);
      },
    });

    // stompClient 실행
    this._stompClient.activate();
  }

  /**
   * STOMP 연결을 종료합니다.
   */
  public disconnect() {
    if (this._stompClient) {
      this._stompClient.deactivate();
      console.log('STOMP Disconnected');
    }
  }

  // Getter
  public get isConnected(): boolean {
    return this._stompClient !== null && this._stompClient.active;
  }

  /**
   * 서버의 특정 주소를 구독하여 메시지를 수신합니다.
   * @param destination 구독할 채널 주소 (/topic)
   * @param callback 메시지 수신 시 실행될 콜백 함수
   * @returns
   */
  public subscribe<T>(destination: string, callback: (data: T) => void) {
    if (!this._stompClient || !this._stompClient.active) return;

    this._stompClient.subscribe(destination, (message: IMessage) => {
      try {
        const parsedBody = JSON.parse(message.body) as T;
        callback(parsedBody);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
    });
  }

  /**
   * 서버의 특정 주소로 데이터를 전송합니다.
   * @param destination 전송할 채널 주소 (/app)
   * @param body 보낼 데이터
   * @returns
   */
  public publish<T>(destination: string, body: T) {
    if (!this._stompClient || !this._stompClient.active) return;
    if (!this.isConnected) return;

    this._stompClient!.publish({
      destination,
      body: JSON.stringify(body),
    });
  }
}
