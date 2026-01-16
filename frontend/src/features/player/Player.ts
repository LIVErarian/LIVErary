import { Container, Graphics, Text } from 'pixi.js';

import { contentFont } from '@/styles/global.css';
import { palette } from '@/styles/theme.css';

export class Player extends Container {
  private _graphics: Graphics;
  private _nicknameText: Text;

  // Readonly 상수
  private readonly WIDTH = 32;
  private readonly HEIGHT = 64;

  constructor(x: number, y: number, nickname: string) {
    super();

    // 초기 좌표 설정
    this.x = x;
    this.y = y;

    // 그래픽 생성
    // TODO: 실제 asset으로 변경
    this._graphics = new Graphics();

    this._graphics.rect(0, 0, this.WIDTH, this.HEIGHT).fill(palette.white);

    this.addChild(this._graphics);

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
    this._nicknameText.x = this.WIDTH / 2;
    this._nicknameText.y = 0;

    this.addChild(this._nicknameText);

    // 기준점을 플레이어 발바닥 중앙으로 설정
    this.pivot.set(this.WIDTH / 2, this.HEIGHT);
  }
}
