import {
  AnimatedSprite,
  Container,
  type DestroyOptions,
  Rectangle,
  Text,
  Texture,
} from 'pixi.js';

import { parseSpriteSheet } from '@/game/utils/pixiUtils';

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

  // 보간 이동 관련
  private _startX: number;
  private _startY: number;
  private _targetX: number;
  private _targetY: number;
  private _lerpTime: number = 0;

  // 현재 상태 저장
  private _currentDirection: Direction = 'DOWN';
  private _isMoving: boolean = false;
  private _isSitting: boolean = false;

  // 상수
  private readonly DEFAULT_SCALE_FACTOR = 2;
  private readonly LERP_DURATION = 15;
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

    this.x = x;
    this.y = y;
    this._userId = userId;

    this._startX = x;
    this._startY = y;
    this._targetX = x;
    this._targetY = y;

    // 컨테이너 설정
    this._container = new Container();
    this._container.sortableChildren = true;
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

    // 레이어 초기화
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
        initialParts[part].sitSheetTexture,
        initialParts[part].tint,
      );
    });

    // 닉네임 설정
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

    this._nicknameText.anchor.set(0.5, 1);
    this.updateNicknamePosition();

    this.addChild(this._nicknameText);
    this.setAnimation('DOWN', false);
  }

  public override destroy(options?: DestroyOptions | boolean) {
    // 부모(Container)의 destroy 기능 실행
    super.destroy(options);
  }

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
      walkTextures: {
        DOWN: [Texture.EMPTY],
        LEFT: [Texture.EMPTY],
        RIGHT: [Texture.EMPTY],
        UP: [Texture.EMPTY],
      },
      sitTextures: {
        DOWN: [Texture.EMPTY],
        LEFT: [Texture.EMPTY],
        RIGHT: [Texture.EMPTY],
        UP: [Texture.EMPTY],
      },
    };
  }

  public setPart(
    part: PartType,
    sheetTexture?: Texture,
    sitSheetTexture?: Texture,
    tint?: number,
  ) {
    const layer = this._layers[part];
    if (!layer) return;

    if (sheetTexture) {
      layer.walkTextures = parseSpriteSheet(sheetTexture, 6, 4);

      if (sitSheetTexture) {
        layer.sitTextures = parseSpriteSheet(sitSheetTexture, 1, 4);
      }

      const currentFrame = layer.sprite.currentFrame;
      layer.sprite.textures = layer.walkTextures[this._currentDirection];

      if (this._isMoving && !this._isSitting) {
        layer.sprite.gotoAndPlay(currentFrame);
      } else {
        const stopFrame = this._isSitting ? 0 : 2;
        layer.sprite.gotoAndStop(stopFrame);
      }
    }

    if (tint !== undefined) {
      layer.sprite.tint = tint;
    }
  }

  /**
   * 애니메이션을 설정합니다.
   * @param direction 바라보는 방향
   * @param isMoving 움직이는 중인지
   * @param serverIsSitting 서버에서 받은 앉기 상태
   */
  public setAnimation(
    direction: Direction,
    isMoving: boolean,
    serverIsSitting?: boolean,
  ) {
    this._currentDirection = direction;
    this._isMoving = isMoving;

    // 서버 앉기 상태 동기화
    if (serverIsSitting !== undefined) {
      this._isSitting = serverIsSitting;
    }

    if (isMoving) {
      // 움직이는 중일 때 무조건 서기 상태로 변경
      this._isSitting = false;
      this._isMoving = true;
    } else {
      // 멈춰있을 때
      this._isMoving = false;
    }

    // 앉아있으면 움직임 플래그 강제 해제 (애니메이션 재생 방지)
    if (this._isSitting) isMoving = false;

    (Object.values(this._layers) as CharacterLayer[]).forEach((layer) => {
      let targetTextures: Texture[];

      // 텍스처 선택 로직
      if (this._isSitting) {
        if (
          layer.sitTextures &&
          layer.sitTextures[direction] &&
          layer.sitTextures[direction].length > 0
        ) {
          targetTextures = layer.sitTextures[direction];
        } else {
          targetTextures = layer.walkTextures[direction];
        }
      } else {
        targetTextures = layer.walkTextures[direction];
      }

      if (!targetTextures || targetTextures.length === 0) return;

      if (layer.sprite.textures !== targetTextures) {
        layer.sprite.textures = targetTextures;
      }

      if (layer.sprite.totalFrames > 0) {
        if (this._isSitting) {
          layer.sprite.gotoAndStop(0);
        } else if (isMoving) {
          if (!layer.sprite.playing) layer.sprite.play();
        } else {
          const stopFrame = 2 < layer.sprite.totalFrames ? 2 : 0;
          layer.sprite.gotoAndStop(stopFrame);
        }
      }
    });
  }

  public toggleSit() {
    this._isSitting = !this._isSitting;
    this.setAnimation(this._currentDirection, false);
  }

  public updatePosition(deltaTime: number) {
    if (this._lerpTime >= this.LERP_DURATION) {
      this.x = this._targetX;
      this.y = this._targetY;
      return;
    }

    this._lerpTime += deltaTime;
    const t = Math.min(this._lerpTime / this.LERP_DURATION, 1);

    this.x = this._startX + (this._targetX - this._startX) * t;
    this.y = this._startY + (this._targetY - this._startY) * t;
  }

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

  public setTargetPosition(x: number, y: number) {
    this._startX = this.x;
    this._startY = this.y;
    this._targetX = x;
    this._targetY = y;
    this._lerpTime = 0;

    const dist = Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
    if (dist > 100) {
      this.x = x;
      this.y = y;
      this._startX = x;
      this._startY = y;
      this._lerpTime = this.LERP_DURATION;
    }
  }

  private updateNicknamePosition() {
    this._nicknameText.y = -(this.ACTUAL_HEIGHT * this._scaleFactor) - 5;
  }

  public get isSitting() {
    return this._isSitting;
  }
}
