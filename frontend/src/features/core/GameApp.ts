// src/features/core/GameApp.ts
import { Application, Assets, Sprite, Ticker } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import playerMSheetImg from '@/assets/characters/basic_male.png';
import { MAP_DATA } from '../map/mapAssets';
import { NetworkManager } from '../network/NetworkManager';
import { type Direction, Player } from '../player/Player';

import type { FloorType } from '@/types/map.types';
import type {
  MoveRequest,
  MoveResponse,
  PlayerLeaveResponse,
  PlayerState,
} from '@/types/socket.types';

import { palette } from '@/styles/theme.css';

// TODO: 뒤로가기 시 캐릭터 삭제 안 됨
export class GameApp {
  private _app: Application;
  private _viewport!: Viewport;
  private _player!: Player;
  private _keys: { [key: string]: boolean } = {};
  private _lookingDirection: Direction = 'down';
  private _networkManager: NetworkManager;
  private _otherPlayers: Map<string, Player> = new Map();
  private _myId: string = `user_${Math.floor(Math.random() * 10000)}`; //TODO: 로그인 후에는 실제 id로 수정 필요
  private _isPrevMoving: boolean = false;
  private _isDestroyed: boolean = false;
  private _bgSprite: Sprite | null = null;
  private _worldWidth: number = 960;
  private _worldHeight: number = 640;

  // Readonly 상수
  private readonly MOVE_SPEED = 4;

  // GameApp 초기 설정
  constructor() {
    // App 인스턴스만 생성
    this._app = new Application();
    // Network Manager 생성
    this._networkManager = new NetworkManager();
  }

  // Getter
  public get canvas() {
    return this._app.canvas;
  }

  public get playerPosition() {
    return { x: this._player.x, y: this._player.y };
  }

  /**
   * PixiJS Application을 초기화하고 DOM에 연결합니다.
   * @param container Canvas를 붙일 부모 HTML 요소
   */
  public async init(container: HTMLDivElement) {
    if (this._isDestroyed) return;

    // App 초기화
    await this._app.init({
      background: palette.background,
      resizeTo: container,
      antialias: false, // 계단 현상(alias)
      autoDensity: true,
      resolution: window.devicePixelRatio,
    });

    // await하는 동안 destroy()가 호출되었다면 화면 설정 중지
    if (this._isDestroyed) {
      this._app.destroy({ removeView: true }, { children: true });
      return;
    }

    // Canvas를 DOM에 붙이기
    if (container.hasChildNodes()) {
      container.innerHTML = ''; // dev 모드에서 2번 생성되는 것 방지
    }
    container.appendChild(this._app.canvas);

    // 뷰포트 설정
    this.createViewport();

    // 에셋 로드 & 배경 설정
    Assets.add({ alias: 'playerSheet', src: playerMSheetImg });
    await Assets.load('playerSheet');

    // 맵 설정
    await this.changeMap('myRoom');

    // 플레이어 생성
    this.createPlayer();

    // 키보드 입력 감지
    this.addEventHandlers();

    // 서버 연결 및 콜백 등록
    this._networkManager.connect(
      () => {
        console.log(`내 ID: ${this._myId}`);

        this._networkManager.sendJoin({
          id: this._myId,
          nickname: 'Player',
          x: this._player.x,
          y: this._player.y,
          direction: 'down',
          isMoving: false,
        });
      },
      (data) => this.addOtherPlayer(data),
      (data) => this.updateOtherPlayer(data),
      (data) => this.removePlayer(data),
    );

    // 매 프레임마다 'update' 함수 실행 (게임 루프)
    this._app.ticker.add(this.update, this);
  }

  /**
   * 층마다 맵을 변경합니다.
   * @param floor 변경할 층 정보
   * @returns
   */
  public async changeMap(floor: FloorType) {
    const mapConfig = MAP_DATA[floor];
    if (!mapConfig) {
      console.error(`맵 데이터를 찾을 수 없습니다: ${floor}`);
      return;
    }

    // 맵 크기 정보 업데이트 (기본: 1440 * 810)
    this._worldWidth = mapConfig.width ?? 1440;
    this._worldHeight = mapConfig.height ?? 810;

    if (this._viewport) {
      this._viewport.resize(
        this._app.screen.width,
        this._app.screen.height,
        this._worldWidth,
        this._worldHeight,
      );
      this._viewport.clamp({ direction: 'all' });
    }

    // 배경 이미지 로드 및 교체
    const texture = await Assets.load(mapConfig.img);
    if (!this._bgSprite) {
      // 처음 생성일 때
      this._bgSprite = new Sprite(texture);
      this._viewport.addChildAt(this._bgSprite, 0); // 맨 뒤에 추가
    } else {
      this._bgSprite.texture = texture;
    }

    this._bgSprite.width = this._worldWidth;
    this._bgSprite.height = this._worldHeight;

    const screenWidth = this._viewport.screenWidth;
    const screenHeight = this._viewport.screenHeight;

    // 맵이 화면보다 작으면 중앙 이동
    if (this._worldWidth < screenWidth || this._worldHeight < screenHeight) {
      this._viewport.moveCenter(this._worldWidth / 2, this._worldHeight / 2);
    } else {
      // 플레이어가 있으면 플레이어가 중앙에 오도록 이동
      if (this._player) {
        this._viewport.follow(this._player);
      } else {
        this._viewport.moveCenter(this._worldWidth / 2, this._worldHeight / 2);
      }
    }

    // TODO: 맵 변경시 플레이어 위치 초기화 필요
  }

  /**
   * Viewport를 생성합니다.
   */
  private createViewport() {
    this._viewport = new Viewport({
      screenWidth: this._app.screen.width,
      screenHeight: this._app.screen.height,
      worldWidth: this._worldWidth,
      worldHeight: this._worldHeight,
      events: this._app.renderer.events, // 이벤트 바인딩
    });

    this._viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate()
      .clamp({ direction: 'all' }); // 설정된 월드 크기 내로 제한

    this._app.stage.addChild(this._viewport);
  }

  /**
   * 키보드 입력을 관리합니다.
   */
  private addEventHandlers() {
    window.addEventListener('keydown', (e) => {
      this._keys[e.key] = true;
    });
    window.addEventListener('keyup', (e) => {
      this._keys[e.key] = false;
    });
  }

  /**
   * Player를 생성합니다.
   */
  private createPlayer() {
    const startX = this._worldWidth / 2;
    const startY = this._worldHeight;

    const sheetTexture = Assets.get('playerSheet');

    // Player 생성자에 texture 전달
    this._player = new Player(startX, startY, 'Player', sheetTexture);

    this._viewport.addChild(this._player);
    this._viewport.follow(this._player);
  }

  /**
   * 키보드 이벤트를 감지하고 Player를 이동시킵니다.
   * @param ticker
   * @returns
   */
  private update(ticker: Ticker) {
    if (!this._player) return;

    // 이동 방향 계산
    let dx = 0;
    let dy = 0;

    // WASD 또는 화살표 키 지원
    if (this._keys['ArrowUp'] || this._keys['w'] || this._keys['W']) {
      dy -= 1;
      this._lookingDirection = 'up';
    }
    if (this._keys['ArrowDown'] || this._keys['s'] || this._keys['S']) {
      dy += 1;
      this._lookingDirection = 'down';
    }
    if (this._keys['ArrowLeft'] || this._keys['a'] || this._keys['A']) {
      dx -= 1;
      this._lookingDirection = 'left';
    }
    if (this._keys['ArrowRight'] || this._keys['d'] || this._keys['D']) {
      dx += 1;
      this._lookingDirection = 'right';
    }

    // 움직임 여부
    const isMoving = dx !== 0 || dy !== 0;

    this._player.setAnimation(this._lookingDirection, isMoving);

    if (isMoving) {
      // 대각선 이동 보정
      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
      }

      // 실제 좌표 적용
      this._player.x += dx * this.MOVE_SPEED * ticker.deltaTime;
      this._player.y += dy * this.MOVE_SPEED * ticker.deltaTime;

      // Clamping
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

      // 서버로 내 위치 전송
      const payload: MoveRequest = {
        x: this._player.x,
        y: this._player.y,
        direction: this._lookingDirection,
        isMoving: true,
      };

      if (this._networkManager.isConnected) {
        this._networkManager.sendMove(payload);
      }
    }
    // 움직이다 멈추면 애니메이션 정지
    else if (this._isPrevMoving) {
      const payload: MoveRequest = {
        x: this._player.x,
        y: this._player.y,
        direction: this._lookingDirection,
        isMoving: false,
      };
      if (this._networkManager.isConnected) {
        this._networkManager.sendMove(payload);
      }
    }

    this._isPrevMoving = isMoving;
  }

  /**
   * 나를 제외한 다른 플레이어를 화면에 추가합니다.
   * @param data 새로운 사용자 정보
   * @returns
   */
  public addOtherPlayer(data: PlayerState) {
    // 이미 있는 사람이면 무시
    if (data.id === this._myId || this._otherPlayers.has(data.id)) return;

    console.log(`새로운 유저(${data.nickname}, ${data.id})가 입장했습니다.`);

    // 앞서 로딩한 텍스쳐를 그대로 재활용해서 새로운 Player 생성
    const sheetTexture = Assets.get('playerSheet');
    const otherPlayer = new Player(
      data.x,
      data.y,
      data.nickname || 'Guest',
      sheetTexture,
    );

    this._viewport.addChild(otherPlayer);
    this._otherPlayers.set(data.id, otherPlayer);
  }

  /**
   * 다른 플레이어의 위치를 업데이트합니다.
   * @param data 다른 플레이어의 움직임 정보
   * @returns
   */
  public updateOtherPlayer(data: MoveResponse) {
    if (data.id === this._myId) return;

    const otherPlayer = this._otherPlayers.get(data.id);

    if (otherPlayer) {
      // 위치 동기화
      otherPlayer.x = data.x;
      otherPlayer.y = data.y;

      // 애니메이션 동기화
      otherPlayer.setAnimation(data.direction, data.isMoving);
    }
  }

  /**
   * 퇴장한 플레이어의 id를 받아 퇴장 이벤트를 처리합니다.
   * @param data 플레이어 id
   */
  public removePlayer(data: PlayerLeaveResponse) {
    console.log(`${data.id} 삭제 요청`);
    console.log('현재 접속자 명부:', Array.from(this._otherPlayers.keys()));
    if (this._otherPlayers.has(data.id)) {
      const playerToRemove = this._otherPlayers.get(data.id);
      if (playerToRemove) {
        // 화면에서 제거
        this._viewport.removeChild(playerToRemove);
        // 메모리에서 제거
        this._otherPlayers.delete(data.id);
        playerToRemove.destroy();

        console.log(`${data.id} 삭제 완료`);
      }
    }
  }

  /**
   * 게임 종료시 데이터를 정리합니다.
   */
  public destroy() {
    // 네트워크 연결 종료
    this._networkManager.disconnect();

    // this.app이 없거나 renderer가 아직 준비 안 됐으면 무시
    if (this._app?.renderer) {
      this._app.ticker.remove(this.update, this);
      this._app.destroy({ removeView: true }, { children: true });
    }
  }
}
