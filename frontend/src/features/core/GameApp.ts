import { Application, Assets, Sprite, Ticker } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import playerMSheetImg from '@/assets/characters/basic_male.png';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocketStore } from '@/store/useSocketStore';
import { throttle } from '@/utils/throttle';
import { MAP_DATA } from '../map/mapAssets';
import { Player } from '../player/Player';

import type { FloorType } from '@/types/map.types';
import type {
  Direction,
  MoveBroadcast,
  MoveRequest,
} from '@/types/socket.types';

import { palette } from '@/styles/theme.css';

export class GameApp {
  private _app: Application;
  private _viewport!: Viewport;
  private _player!: Player;
  private _keys: { [key: string]: boolean } = {};
  private _lookingDirection: Direction = 'DOWN';
  private _otherPlayers: Map<string, Player> = new Map();
  private _myId: string = '';
  private _isPrevMoving: boolean = false;
  private _isDestroyed: boolean = false;
  private _bgSprite: Sprite | null = null;
  private _worldWidth: number = 960;
  private _worldHeight: number = 640;
  private _currentFloorId: string = '';
  private _sendMoveThrottled: (payload: MoveRequest) => void;

  private readonly MOVE_SPEED = 4;
  private readonly DEFAULT_WIDTH = 1440;
  private readonly DEFAULT_HEIGHT = 810;

  constructor() {
    this._app = new Application();

    // 스로틀링
    this._sendMoveThrottled = throttle((payload: MoveRequest) => {
      // 내 방이면 전송 중단
      if (this._currentFloorId === MAP_DATA.myRoom.floorId) return;

      const { isConnected, sendMove } = useSocketStore.getState();
      if (isConnected) {
        sendMove(payload);
      }
    }, 50);
  }

  // Getter
  public get canvas() {
    return this._app.canvas;
  }

  public async init(container: HTMLDivElement) {
    if (this._isDestroyed) return;

    // 로그인한 내 ID
    const user = useAuthStore.getState().user;
    if (user && user.userId) {
      this._myId = user.userId;
    } else {
      // 로그인 안 된 상태면 임시 ID
      this._myId = `guest_${Math.floor(Math.random() * 1000)}`;
    }

    await this._app.init({
      background: palette.background,
      resizeTo: container,
      antialias: false,
      autoDensity: true,
      resolution: window.devicePixelRatio,
    });

    if (this._isDestroyed) {
      this._app.destroy({ removeView: true }, { children: true });
      return;
    }

    container.innerHTML = '';
    container.appendChild(this._app.canvas);

    this.createViewport();

    // 이미 로드된 에셋인지 확인
    if (!Assets.cache.has('playerSheet')) {
      Assets.add({ alias: 'playerSheet', src: playerMSheetImg });
      await Assets.load('playerSheet');
    }

    // 초기 맵 로드
    await this.changeMap('myRoom');

    this.createPlayer(user?.nickname);
    this.addEventHandlers();

    this._app.ticker.add(this.update, this);
  }

  public async changeMap(floor: FloorType) {
    const mapConfig = MAP_DATA[floor];
    if (!mapConfig) return;

    this._worldWidth = mapConfig.width ?? this.DEFAULT_WIDTH;
    this._worldHeight = mapConfig.height ?? this.DEFAULT_HEIGHT;
    this._currentFloorId = mapConfig.floorId;

    // 플레이어 위치 및 방향 초기화
    if (this._player) {
      if (floor === 'myRoom') {
        this._player.x = this._worldWidth / 2;
        this._player.y = this._worldHeight / 2;
      } else if (floor === 'bookConcert') {
        this._player.x = this._worldWidth / 2;
        this._player.y = this._worldHeight;
      } else {
        this._player.x = this._worldWidth * 0.38;
        this._player.y = this._worldHeight * 0.25;
      }
      this._lookingDirection = 'DOWN';
      this._player.setAnimation('DOWN', false);
    }

    const { subscribeMove, unsubscribeMove, isConnected, sendEnter } =
      useSocketStore.getState();

    // 기존 데이터 정리 및 구독 해제
    unsubscribeMove();
    this.clearOtherPlayers();

    // 내 방이 아니고 연결되어 있을 때만 구독
    if (floor !== 'myRoom' && isConnected) {
      // 구독 시작 로그를 실제 로직 호출 직전에 남기기
      console.log(
        `[GameApp] ${floor}(${this._currentFloorId}) 구독 프로세스 시작`,
      );

      // await를 사용하여 순서 보장
      await subscribeMove(this._currentFloorId, (moves) => {
        this.updateOtherPlayers(moves);
      });

      // 플레이어가 존재할 때만 위치 전송
      if (useSocketStore.getState().isConnected && this._player) {
        sendEnter({
          floorId: this._currentFloorId,
          x: this._player.x,
          y: this._player.y,
          direction: this._lookingDirection,
        });
      }
    } else if (floor === 'myRoom') {
      console.log('내 방: 위치 공유 안 함');
    }

    // 맵 변경
    if (this._viewport) {
      this._viewport.resize(
        this._app.screen.width,
        this._app.screen.height,
        this._worldWidth,
        this._worldHeight,
      );
      this._viewport.clamp({ direction: 'all' });
    }

    const texture = await Assets.load(mapConfig.img);
    if (!this._bgSprite) {
      this._bgSprite = new Sprite(texture);
      this._viewport.addChildAt(this._bgSprite, 0);
    } else {
      this._bgSprite.texture = texture;
    }

    this._bgSprite.width = this._worldWidth;
    this._bgSprite.height = this._worldHeight;

    // 중앙 정렬 로직
    const screenWidth = this._viewport.screenWidth;
    const screenHeight = this._viewport.screenHeight;
    if (this._worldWidth < screenWidth || this._worldHeight < screenHeight) {
      this._viewport.moveCenter(this._worldWidth / 2, this._worldHeight / 2);
    } else {
      if (this._player) {
        this._viewport.moveCenter(this._player.x, this._player.y);
        this._viewport.follow(this._player);
      } else {
        this._viewport.moveCenter(this._worldWidth / 2, this._worldHeight / 2);
      }
    }

    // 맵 바뀌면 다른 유저 지우기
    this.clearOtherPlayers();
  }

  private createViewport() {
    this._viewport = new Viewport({
      screenWidth: this._app.screen.width,
      screenHeight: this._app.screen.height,
      worldWidth: this._worldWidth,
      worldHeight: this._worldHeight,
      events: this._app.renderer.events,
    });
    this._viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate()
      .clamp({ direction: 'all' });
    this._app.stage.addChild(this._viewport);
  }

  private addEventHandlers() {
    window.addEventListener('keydown', (e) => (this._keys[e.key] = true));
    window.addEventListener('keyup', (e) => (this._keys[e.key] = false));
  }

  private createPlayer(nickname?: string) {
    const startX = this._worldWidth / 2;
    const startY = this._worldHeight;
    const sheetTexture = Assets.get('playerSheet');

    const displayName = nickname || 'Me';
    this._player = new Player(startX, startY, displayName, sheetTexture);
    this._viewport.addChild(this._player);
    this._viewport.follow(this._player);
  }

  private update(ticker: Ticker) {
    if (!this._player) return;

    let dx = 0;
    let dy = 0;

    // 이동 로직
    if (this._keys['ArrowUp'] || this._keys['w'] || this._keys['W']) {
      dy -= 1;
      this._lookingDirection = 'UP';
    }
    if (this._keys['ArrowDown'] || this._keys['s'] || this._keys['S']) {
      dy += 1;
      this._lookingDirection = 'DOWN';
    }
    if (this._keys['ArrowLeft'] || this._keys['a'] || this._keys['A']) {
      dx -= 1;
      this._lookingDirection = 'LEFT';
    }
    if (this._keys['ArrowRight'] || this._keys['d'] || this._keys['D']) {
      dx += 1;
      this._lookingDirection = 'RIGHT';
    }

    const isMoving = dx !== 0 || dy !== 0;
    this._player.setAnimation(this._lookingDirection, isMoving);

    // 이동 처리
    if (isMoving) {
      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
      }
      this._player.x += dx * this.MOVE_SPEED * ticker.deltaTime;
      this._player.y += dy * this.MOVE_SPEED * ticker.deltaTime;

      const marginX = this._player.playerWidth / 2;
      const marginY = this._player.playerHeight;
      this._player.x = Math.max(
        marginX,
        Math.min(this._player.x, this._worldWidth - marginX),
      );
      this._player.y = Math.max(
        marginY,
        Math.min(this._player.y, this._worldHeight),
      );

      const payload: MoveRequest = {
        floorId: this._currentFloorId,
        x: this._player.x,
        y: this._player.y,
        direction: this._lookingDirection,
        isMoving: true,
        clientTs: Date.now(),
      };

      this._sendMoveThrottled(payload);
    } else if (this._isPrevMoving) {
      // 멈춘 순간에는 즉시 전송
      this.sendMyPosition(false);
    }
    this._isPrevMoving = isMoving;
  }

  // 위치 전송 헬퍼
  private sendMyPosition(isMoving: boolean) {
    if (this._currentFloorId === MAP_DATA.myRoom.floorId) return;

    const payload: MoveRequest = {
      floorId: this._currentFloorId,
      x: this._player.x,
      y: this._player.y,
      direction: this._lookingDirection,
      isMoving,
      clientTs: Date.now(),
    };
    const { isConnected, sendMove } = useSocketStore.getState();
    if (isConnected) sendMove(payload);
  }

  // 다른 플레이어들 위치 업데이트
  public updateOtherPlayers(moves: MoveBroadcast[]) {
    if (!moves) return;

    // 활성 유저 ID 목록
    const activeUserIds = new Set(moves.map((m) => m.userId));

    this._otherPlayers.forEach((player, userId) => {
      // 현재 화면에 있는 유저 중 명단에 존재하지 않으면 제거
      if (!activeUserIds.has(userId)) {
        this._viewport.removeChild(player);
        player.destroy();
        this._otherPlayers.delete(userId);
        console.log('유저 퇴장 확인 및 제거:', userId);
      }
    });

    moves.forEach((data) => {
      if (data.userId === this._myId) return;

      let otherPlayer = this._otherPlayers.get(data.userId);

      // 없으면 생성
      if (!otherPlayer) {
        const sheetTexture = Assets.get('playerSheet');
        // 닉네임이 없으면 userId로 표시
        otherPlayer = new Player(data.x, data.y, data.userId, sheetTexture);
        this._viewport.addChild(otherPlayer);
        this._otherPlayers.set(data.userId, otherPlayer);
      }

      // 있으면 위치 이동
      if (otherPlayer) {
        otherPlayer.x = data.x;
        otherPlayer.y = data.y;
        otherPlayer.setAnimation(data.direction, data.isMoving);
      }
    });
  }

  public clearOtherPlayers() {
    this._otherPlayers.forEach((player) => {
      this._viewport.removeChild(player);
      player.destroy();
    });
    this._otherPlayers.clear();
  }

  public destroy() {
    useSocketStore.getState().unsubscribeMove();
    if (this._app?.renderer) {
      this._app.ticker.remove(this.update, this);
      this._app.destroy({ removeView: true }, { children: true });
    }
  }
}
