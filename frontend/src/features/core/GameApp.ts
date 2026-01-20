// src/features/core/GameApp.ts
import { Application, Assets, Sprite, Ticker } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import playerMSheetImg from '@/assets/characters/basic_male.png';
import basicFloorMap from '@/assets/maps/basic_floor.png';
import { NetworkManager } from '../network/NetworkManager';
import { type Direction, Player } from '../player/Player';

import type {
  MoveRequest,
  MoveResponse,
  PlayerState,
} from '@/types/socket.types';

import { palette } from '@/styles/theme.css';

export class GameApp {
  private _app: Application;
  private _viewport!: Viewport;
  private _player!: Player;
  private _keys: { [key: string]: boolean } = {};
  private _lookingDirection: Direction = 'down';
  private _networkManager: NetworkManager;
  private _otherPlayers: Map<string, Player> = new Map();
  private _myId: string = `user_${Math.floor(Math.random() * 10000)}`; //TODO: 로그인 후에는 실제 id로 수정 필요

  // Readonly 상수
  private readonly WORLD_WIDTH = 960;
  private readonly WORLD_HEIGHT = 640;
  private readonly MOVE_SPEED = 5;

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
    // App 초기화
    await this._app.init({
      background: palette.background,
      resizeTo: container,
      antialias: false, // 계단 현상(alias)
      autoDensity: true,
      resolution: window.devicePixelRatio,
    });

    // Canvas를 DOM에 붙이기
    if (container.hasChildNodes()) {
      container.innerHTML = ''; // dev 모드에서 2번 생성되는 것 방지 (*방어 코드)
    }
    container.appendChild(this._app.canvas);

    // 뷰포트 설정
    this.createViewport();

    // 에셋 로드 & 배경 설정
    await this.loadAssets();

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
    );

    // 매 프레임마다 'update' 함수 실행 (게임 루프)
    this._app.ticker.add(this.update, this);
  }

  /**
   * Viewport를 생성합니다.
   */
  private createViewport() {
    this._viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: this.WORLD_WIDTH,
      worldHeight: this.WORLD_HEIGHT,
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
   * 필요한 asset을 불러옵니다.
   */
  private async loadAssets() {
    // 맵 이미지 불러오기
    const texture = await Assets.load(basicFloorMap);
    const bgSprite = new Sprite(texture);
    bgSprite.width = this.WORLD_WIDTH;
    bgSprite.height = this.WORLD_HEIGHT;
    this._viewport.addChild(bgSprite);

    // 캐릭터 이미지 불러오기
    //TODO: 캐릭터 선택창 추가 후 playerSheet 변경 필요
    Assets.add({ alias: 'playerSheet', src: playerMSheetImg });
    await Assets.load('playerSheet');
  }

  /**
   * Player를 생성합니다.
   */
  private createPlayer() {
    const startX = this.WORLD_WIDTH / 2;
    const startY = this.WORLD_HEIGHT;

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

    if (!isMoving) return;

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
      Math.min(this._player.x, this.WORLD_WIDTH - marginX),
    );
    this._player.y = Math.max(
      marginY,
      Math.min(this._player.y, this.WORLD_HEIGHT),
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
