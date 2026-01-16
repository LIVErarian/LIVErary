// src/features/core/GameApp.ts
import { Application, Assets, Sprite } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import basicFloorMap from '@/assets/maps/basic_floor.png';
import { Player } from '../player/Player';

import { palette } from '@/styles/theme.css';

export class GameApp {
  private _app: Application;
  private _viewport!: Viewport;
  private _player!: Player;

  // Readonly 상수
  private readonly WORLD_WIDTH = 960;
  private readonly WORLD_HEIGHT = 640;

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

    this.createPlayer();
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
      this._app.destroy({ removeView: true }, { children: true });
    }
  }
}
