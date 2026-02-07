import { AnimatedSprite, Container, Rectangle, Text, Texture } from 'pixi.js';

import type {
  CharacterLayer,
  CharacterParts,
  PartType,
} from '@/types/character.types';
import type { Direction } from '@/types/socket.types';

import { contentFont } from '@/styles/global.css.ts';
import { palette } from '@/styles/theme.css.ts';

export class Player extends Container {
  private _layers: Record<PartType, CharacterLayer>;
  private _container: Container;

  private _nicknameText: Text;
  private _userId: string;

  // 보간 이동
  private _startX: number;
  private _startY: number;
  private _targetX: number;
  private _targetY: number;
  private _lerpTime: number = 0; // 현재 이동 시간 누적

  // 현재 상태 저장
  private _currentDirection: Direction = 'DOWN';
  private _isMoving: boolean = false;

  // Readonly 상수
  private readonly FRAME_SIZE = 64;
  private readonly DEFAULT_SCALE_FACTOR = 2;
  private readonly LERP_DURATION = 15; // 프레임 단위 목표 도달 시간
  // 실제 사이즈
  private readonly ACTUAL_WIDTH = 15;
  private readonly ACTUAL_HEIGHT = 24;
  private _scaleFactor = this.DEFAULT_SCALE_FACTOR;

  constructor(
    x: number,
    y: number,
    nickname: string,
    initialParts: CharacterParts,
    userId: string,
    onClickCallback?: (userId: string) => void,
  ) {
    super();

    // 초기 좌표 설정
    this.x = x;
    this.y = y;
    this._userId = userId;

    this._startX = x;
    this._startY = y;
    this._targetX = x;
    this._targetY = y;

    // 캐릭터 컨테이너 생성 (파츠 묶어서 관리)
    this._container = new Container();
    this._container.sortableChildren = true; // z-index 제어 가능하도록

    // 캐릭터 클릭 이벤트를 컨테이너 전체에 걸어줘야 함
    this._container.eventMode = 'static';
    this._container.cursor = 'pointer';
    this._container.hitArea = new Rectangle(
      -this.ACTUAL_WIDTH / 2,
      -this.ACTUAL_HEIGHT * 0.7,
      this.ACTUAL_WIDTH,
      this.ACTUAL_HEIGHT,
    );

    if (onClickCallback) {
      this._container.on('pointerdown', () => onClickCallback(this._userId));
    }

    this.addChild(this._container);

    // 레이어 초기화 (실제 텍스처는 setPart에서 채움)
    this._layers = {
      body: this.createEmptyLayer('body', 0),
      pants: this.createEmptyLayer('pants', 1),
      shirt: this.createEmptyLayer('shirt', 2),
      hair: this.createEmptyLayer('hair', 3),
    } as Record<PartType, CharacterLayer>;

    // 초기 파츠 장착
    (Object.keys(initialParts) as PartType[]).forEach((part) => {
      this.setPart(
        part,
        initialParts[part].sheetTexture,
        initialParts[part].tint,
      );
    });

    // 플레이어 상단에 닉네임 띄우기
    this._nicknameText = new Text({
      text: nickname,
      style: {
        fontFamily: contentFont,
        fontSize: 12,
        fill: palette.white,
        align: 'center',
        stroke: { color: '#000000', width: 2 },
      },
    });

    // 텍스트 위치 설정
    this._nicknameText.anchor.set(0.5, 1);
    this.updateNicknamePosition();

    this.addChild(this._nicknameText);
    this.setAnimation('DOWN', false);
  }

  /**
   * 빈 레이어 객체를 생성하여 컨테이너에 추가
   * @param partName
   * @param zIndex
   * @returns
   */
  private createEmptyLayer(partName: string, zIndex: number): CharacterLayer {
    const sprite = new AnimatedSprite([Texture.EMPTY]);
    sprite.anchor.set(0.5, 0.7);
    sprite.scale.set(this._scaleFactor);
    sprite.zIndex = zIndex;
    sprite.label = partName;
    sprite.animationSpeed = 0.15;

    this._container.addChild(sprite);

    return {
      sprite,
      textures: {
        DOWN: [Texture.EMPTY],
        LEFT: [Texture.EMPTY],
        RIGHT: [Texture.EMPTY],
        UP: [Texture.EMPTY],
      },
    };
  }

  public setPart(part: PartType, sheetTexture?: Texture, tint?: number) {
    const layer = this._layers[part];
    if (!layer) return;

    if (sheetTexture) {
      // 텍스처 자르기
      layer.textures = this.sliceTextures(sheetTexture);
      const currentFrame = layer.sprite.currentFrame;
      layer.sprite.textures = layer.textures[this._currentDirection];

      if (this._isMoving) {
        layer.sprite.gotoAndPlay(currentFrame);
      } else {
        layer.sprite.gotoAndStop(2); // 기본
      }
    }

    if (tint !== undefined) {
      layer.sprite.tint = tint;
    }
  }

  /**
   * 방향과 움직임 상태에 따라 애니메이션 재생
   * @param direction 이동 방향
   * @param isMoving 이동 중인지 확인
   */
  public setAnimation(direction: Direction, isMoving: boolean) {
    this._currentDirection = direction;
    this._isMoving = isMoving;

    (Object.values(this._layers) as CharacterLayer[]).forEach((layer) => {
      // 방향에 맞는 텍스처 세트 가져오기
      const targetTextures = layer.textures[direction];

      // 텍스처가 없거나 비어있으면 아무것도 하지 않음 (에러 방지)
      if (!targetTextures || targetTextures.length === 0) return;

      // 텍스처 교체
      if (layer.sprite.textures !== targetTextures) {
        layer.sprite.textures = targetTextures;
      }

      // 재생 로직
      if (layer.sprite.totalFrames > 0) {
        if (isMoving) {
          if (!layer.sprite.playing) layer.sprite.play();
        } else {
          // 멈춤 프레임(2번)이 전체 프레임보다 크면 0번으로 대체
          const stopFrame = 2 < layer.sprite.totalFrames ? 2 : 0;
          layer.sprite.gotoAndStop(stopFrame);
        }
      }
    });
  }

  /**
   * 큰 이미지를 24조각으로 자르는 함수
   * @param baseTexture 하나의 큰 이미지
   */
  private sliceTextures(baseTexture: Texture) {
    const rows = 4;
    const cols = 6;

    const frameWidth = this.FRAME_SIZE;
    const frameHeight = this.FRAME_SIZE;

    const result: Record<Direction, Texture[]> = {
      DOWN: [],
      LEFT: [],
      RIGHT: [],
      UP: [],
    };
    const directions: Direction[] = ['DOWN', 'LEFT', 'RIGHT', 'UP'];

    for (let row = 0; row < rows; row++) {
      const currentDir = directions[row]; // 현재 방향

      for (let col = 0; col < cols; col++) {
        // 사각형 영역 정의
        const rect = new Rectangle(
          col * frameWidth, // 시작점 가로 좌표
          row * frameHeight, // 시작점 세로 좌표
          frameWidth,
          frameHeight,
        );

        // 일부분만 참조해서 Texture 나누기
        const frameTexture = new Texture({
          source: baseTexture.source,
          frame: rect,
        });

        result[currentDir].push(frameTexture);
      }
    }
    return result;
  }

  public updatePosition(deltaTime: number) {
    // 이미 목표에 도착했으면 연산 X
    if (this._lerpTime >= this.LERP_DURATION) {
      // 목표 위치에 정확히 안착
      this.x = this._targetX;
      this.y = this._targetY;
      return;
    }

    // 시간 누적
    this._lerpTime += deltaTime;

    // 진행률 계산 (0.0 ~ 1.0)
    const t = Math.min(this._lerpTime / this.LERP_DURATION, 1);

    // 선형 보간 공식
    this.x = this._startX + (this._targetX - this._startX) * t;
    this.y = this._startY + (this._targetY - this._startY) * t;
  }

  // Getter
  public get playerWidth() {
    return this.ACTUAL_WIDTH * this._scaleFactor;
  }

  public get playerHeight() {
    return this.ACTUAL_HEIGHT * this._scaleFactor;
  }

  public get userId() {
    return this._userId;
  }

  public setScaleFactor(scaleFactor: number) {
    if (scaleFactor <= 0 || this._scaleFactor === scaleFactor) return;
    this._scaleFactor = scaleFactor;

    (Object.values(this._layers) as CharacterLayer[]).forEach((layer) => {
      layer.sprite.scale.set(scaleFactor);
    });

    this.updateNicknamePosition();
  }

  /**
   * 서버에서 새로운 위치 데이터를 받았을 때 호출
   * @param x
   * @param y
   */
  public setTargetPosition(x: number, y: number) {
    //  현재 위치를 '시작점'으로 고정
    this._startX = this.x;
    this._startY = this.y;

    // 새로운 목표 설정
    this._targetX = x;
    this._targetY = y;

    // 시간 초기화
    this._lerpTime = 0;

    // 거리가 너무 멀면 그냥 순간이동 시키기
    const dist = Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
    if (dist > 100) {
      this.x = x;
      this.y = y;
      this._startX = x;
      this._startY = y;
      this._lerpTime = this.LERP_DURATION; // 완료 처리
    }
  }

  private updateNicknamePosition() {
    this._nicknameText.y = -(this.ACTUAL_HEIGHT * this._scaleFactor) - 5;
  }
}
