import { AnimatedSprite, Container, Rectangle, Text, Texture } from 'pixi.js';

import type { Direction } from '@/types/socket.types';

import { contentFont } from '@/styles/global.css';
import { palette } from '@/styles/theme.css';

//TODO: 파츠 별로 스프라이트 추가
export class Player extends Container {
  private _character: AnimatedSprite;
  private _nicknameText: Text;

  // 텍스쳐를 잘라내서 보관
  private _textures: Record<Direction, Texture[]> = {
    DOWN: [],
    LEFT: [],
    RIGHT: [],
    UP: [],
  };

  // Readonly 상수
  private readonly FRAME_SIZE = 64;
  private readonly SCALE_FACTOR = 2;
  // 실제 사이즈
  private readonly ACTUAL_WIDTH = 15;
  private readonly ACTUAL_HEIGHT = 24;
  // 시각적 보조 (2배 크기) - graphics 설정을 위함! 추후엔 지워도 됨
  private readonly VISUAL_WIDTH = this.ACTUAL_WIDTH * this.SCALE_FACTOR;
  private readonly VISUAL_HEIGHT = this.ACTUAL_HEIGHT * this.SCALE_FACTOR;

  constructor(x: number, y: number, nickname: string, sheetTexture: Texture) {
    super();

    // 초기 좌표 설정
    this.x = x;
    this.y = y;

    // 텍스처 자르기
    this.sliceTextures(sheetTexture);

    // 초기 이미지 설정
    this._character = new AnimatedSprite(this._textures.DOWN);
    this._character.gotoAndStop(2);

    // 애니메이션 속도 지정
    this._character.animationSpeed = 0.15;
    this._character.scale.set(this.SCALE_FACTOR);
    this._character.anchor.set(0.5, 0.7); // 발바닥 기준

    this._character.x = 0;
    this._character.y = 0;

    this.addChild(this._character);

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
    this._nicknameText.y = -this.VISUAL_HEIGHT - 5; // 머리 끝보다 5px 위

    this.addChild(this._nicknameText);
    this._character.gotoAndStop(2);
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

        this._textures[currentDir].push(frameTexture);
      }
    }
  }

  /**
   * 방향과 움직임 상태에 따라 애니메이션 재생
   * @param direction 이동 방향
   * @param isMoving 이동 중인지 확인
   */
  public setAnimation(direction: Direction, isMoving: boolean) {
    // 현재 재생 중인 텍스처와 이동 방향이 다르다면 재생 중인 텍스쳐를 현재 방향으로 변경
    if (this._character.textures !== this._textures[direction]) {
      this._character.textures = this._textures[direction];
      this._character.play();
    }

    // 움직이는 중이면 재생, 멈추면 정지
    if (isMoving) {
      if (!this._character.playing) this._character.play();
    } else {
      this._character.gotoAndStop(2); // base 프레임으로 변경
    }
  }

  // Getter
  public get playerWidth() {
    return this.VISUAL_WIDTH;
  }

  public get playerHeight() {
    return this.VISUAL_HEIGHT;
  }
}
