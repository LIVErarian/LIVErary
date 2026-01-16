// src/features/core/GameApp.ts
import { Application, Assets, Sprite, Ticker } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import basicFloorMap from '@/assets/maps/basic_floor.png';
import { Player } from '../player/Player';

import { palette } from '@/styles/theme.css';

export class GameApp {
  private _app: Application;
  private _viewport!: Viewport;
  private _player!: Player;
  private _keys: { [key: string]: boolean } = {};

  // Readonly 상수
  private readonly WORLD_WIDTH = 960;
  private readonly WORLD_HEIGHT = 640;
  private readonly MOVE_SPEED = 5;

  // GameApp 초기 설정
  constructor() {
    // App 인스턴스만 생성
    this._app = new Application();
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

    // 플레이어 설정
    this.createPlayer();

    // 키보드 입력 감지
    this.addEventHandlers();

    // 매 프레임마다 'update' 함수 실행
    this._app.ticker.add(this.update, this);
  }

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

  // 플레이어 생성
  private createPlayer() {
    // 초기 생성 위치: 화면 중앙
    const centerX = this.WORLD_WIDTH / 2;
    const centerY = this.WORLD_HEIGHT / 2;

    this._player = new Player(centerX, centerY, 'Player');
    this._viewport.addChild(this._player);
    this._viewport.follow(this._player);
  }

  // 키보드 입력 관리
  private addEventHandlers() {
    window.addEventListener('keydown', (e) => {
      this._keys[e.key] = true;
    });
    window.addEventListener('keyup', (e) => {
      this._keys[e.key] = false;
    });
  }

  // 매 프레임 실행되는 게임 루프
  private update(ticker: Ticker) {
    if (!this._player) return;

    // 이동 방향 계산
    let dx = 0;
    let dy = 0;

    // WASD 또는 화살표 키 지원
    if (this._keys['ArrowUp'] || this._keys['w'] || this._keys['W']) dy -= 1;
    if (this._keys['ArrowDown'] || this._keys['s'] || this._keys['S']) dy += 1;
    if (this._keys['ArrowLeft'] || this._keys['a'] || this._keys['A']) dx -= 1;
    if (this._keys['ArrowRight'] || this._keys['d'] || this._keys['D']) dx += 1;

    // 움직임 없으면 종료
    if (dx === 0 && dy === 0) return;

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
    const marginX = this._player.width / 2;
    const marginY = this._player.height;

    this._player.x = Math.max(
      marginX,
      Math.min(this._player.x, this.WORLD_WIDTH - marginX),
    );
    this._player.y = Math.max(
      0,
      Math.min(this._player.y, this.WORLD_HEIGHT - marginY),
    );
  }

  private async loadAssets() {
    const texture = await Assets.load(basicFloorMap);
    const bgSprite = new Sprite(texture);
    bgSprite.width = this.WORLD_WIDTH;
    bgSprite.height = this.WORLD_HEIGHT;
    this._viewport.addChild(bgSprite);
  }

  // 게임 종료 시 정리
  public destroy() {
    // this.app이 없거나 renderer가 아직 준비 안 됐으면 무시
    if (this._app?.renderer) {
      this._app.ticker.remove(this.update, this);
      this._app.destroy({ removeView: true }, { children: true });
    }
  }
}
